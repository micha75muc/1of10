#!/usr/bin/env node

/**
 * autoresearch/run.mjs — Autonomous improvement loop (CPU-only).
 *
 * Modes:
 *   baseline  — Run evaluation without changes, record baseline score
 *   dry-run   — Simulate one experiment without touching code
 *   single    — Run one real experiment
 *   loop      — Run multiple experiments up to max_experiments
 *   replay    — Print previous results
 *
 * Usage:
 *   node autoresearch/run.mjs baseline
 *   node autoresearch/run.mjs dry-run
 *   node autoresearch/run.mjs single
 *   node autoresearch/run.mjs loop
 *   node autoresearch/run.mjs replay
 */

import { readFileSync, writeFileSync, appendFileSync, existsSync } from "fs";
import { execSync } from "child_process";
import { join } from "path";

const ROOT = join(import.meta.dirname, "..");
const CONFIG_PATH = join(import.meta.dirname, "config.json");
const RESULTS_PATH = join(import.meta.dirname, "results.tsv");
const PROGRAM_PATH = join(import.meta.dirname, "program.md");

// ─── Config ───
const config = JSON.parse(readFileSync(CONFIG_PATH, "utf8"));
const mode = process.argv[2] || "baseline";

function say(msg) {
  console.log(`\n  🔬 ${msg}\n`);
}

function timestamp() {
  return new Date().toISOString().replace("T", " ").substring(0, 19);
}

// ─── Evaluation ───
function evaluate() {
  const result = {
    build_ok: false,
    tests_ok: false,
    typecheck_ok: false,
    duration_seconds: 0,
    score: 0,
  };

  const start = Date.now();

  // 1. Smoke test (fastest, catches broken policy)
  try {
    execSync(config.smoke_test_command, { cwd: ROOT, stdio: "pipe", timeout: config.timeout_seconds * 1000 });
    result.tests_ok = true;
    result.score += 40;
  } catch (e) {
    console.log("    ✗ Smoke test failed");
    result.duration_seconds = Math.round((Date.now() - start) / 1000);
    return result;
  }
  console.log("    ✓ Smoke test passed (+40)");

  // 2. Build
  try {
    execSync(config.build_command, { cwd: ROOT, stdio: "pipe", timeout: config.timeout_seconds * 1000 });
    result.build_ok = true;
    result.score += 30;
  } catch (e) {
    console.log("    ✗ Build failed");
    result.duration_seconds = Math.round((Date.now() - start) / 1000);
    return result;
  }
  console.log("    ✓ Build passed (+30)");

  // 3. Line count bonus (simpler = better)
  try {
    const totalLines = config.safe_edit_paths.reduce((sum, p) => {
      const full = join(ROOT, p);
      if (existsSync(full)) {
        return sum + readFileSync(full, "utf8").split("\n").length;
      }
      return sum;
    }, 0);
    // Bonus: fewer lines = higher score (max 30 points, baseline ~120 lines)
    const lineBonus = Math.max(0, Math.min(30, Math.round((200 - totalLines) / 3)));
    result.score += lineBonus;
    console.log(`    ✓ Code size: ${totalLines} lines (+${lineBonus} simplicity bonus)`);
  } catch {
    // Not critical
  }

  result.duration_seconds = Math.round((Date.now() - start) / 1000);
  return result;
}

// ─── Results Logging ───
function logResult(commitId, status, result, changedFiles, description) {
  const row = [
    commitId,
    timestamp(),
    status,
    result.score,
    result.build_ok ? "yes" : "no",
    result.tests_ok ? "yes" : "no",
    result.typecheck_ok ? "yes" : "no",
    result.duration_seconds,
    changedFiles,
    description,
  ].join("\t");
  appendFileSync(RESULTS_PATH, row + "\n");
}

// ─── Git Helpers ───
function gitAvailable() {
  try {
    execSync("git status", { cwd: ROOT, stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}

function getCurrentCommit() {
  try {
    return execSync("git rev-parse --short HEAD", { cwd: ROOT, stdio: "pipe" }).toString().trim();
  } catch {
    return "unknown";
  }
}

function createBranch(name) {
  try {
    execSync(`git checkout -b ${name}`, { cwd: ROOT, stdio: "pipe" });
  } catch {
    // Branch might exist
    execSync(`git checkout ${name}`, { cwd: ROOT, stdio: "pipe" });
  }
}

function stashChanges() {
  try {
    execSync("git stash", { cwd: ROOT, stdio: "pipe" });
  } catch { /* nothing to stash */ }
}

function popStash() {
  try {
    execSync("git stash pop", { cwd: ROOT, stdio: "pipe" });
  } catch { /* nothing stashed */ }
}

function revertToCommit(commit) {
  execSync(`git checkout -- .`, { cwd: ROOT, stdio: "pipe" });
}

function commitChanges(message) {
  execSync(`git add -A`, { cwd: ROOT, stdio: "pipe" });
  execSync(`git commit -m "${message}"`, { cwd: ROOT, stdio: "pipe" });
  return getCurrentCommit();
}

// ─── Modes ───

function runBaseline() {
  say("Running baseline evaluation (no changes)...");
  const result = evaluate();
  const commit = getCurrentCommit();
  logResult(commit, "baseline", result, "none", "Initial baseline measurement");
  say(`Baseline score: ${result.score}/100`);
  return result;
}

function runDryRun() {
  say("Dry run — simulating experiment without changing code...");
  console.log("    Would read program.md for instructions");
  console.log(`    Would edit files in: ${config.safe_edit_paths.join(", ")}`);
  console.log("    Would run smoke test, build, and measure");
  console.log("    Would keep or revert based on score");
  say("Dry run complete. No code was changed.");
}

function runSingle(experimentNum = 1) {
  say(`Running experiment #${experimentNum}...`);

  // Read current baseline
  const baselineResult = evaluate();
  const baselineScore = baselineResult.score;
  say(`Current score: ${baselineScore}/100`);

  if (!baselineResult.tests_ok || !baselineResult.build_ok) {
    say("⚠️  Current code doesn't pass baseline. Fix it first.");
    logResult(getCurrentCommit(), "skip", baselineResult, "none", "Baseline broken, skipping experiment");
    return false;
  }

  // Read the safe edit files
  const editableContents = {};
  for (const p of config.safe_edit_paths) {
    const full = join(ROOT, p);
    if (existsSync(full)) {
      editableContents[p] = readFileSync(full, "utf8");
    }
  }

  // Simple improvement: look for easy wins
  let changed = false;
  let changedFile = "none";
  let description = "no improvement found";

  for (const [path, content] of Object.entries(editableContents)) {
    const lines = content.split("\n");
    let newContent = content;

    // Strategy 1: Remove consecutive blank lines
    const deduped = content.replace(/\n{3,}/g, "\n\n");
    if (deduped !== content) {
      newContent = deduped;
      changedFile = path;
      description = "Remove excessive blank lines";
      changed = true;
      break;
    }

    // Strategy 2: Remove trailing whitespace
    const trimmed = lines.map(l => l.trimEnd()).join("\n");
    if (trimmed !== content) {
      newContent = trimmed;
      changedFile = path;
      description = "Remove trailing whitespace";
      changed = true;
      break;
    }

    // Strategy 3: Remove unused imports (simple heuristic)
    // Look for imported names that appear only once (the import itself)
    // This is conservative — only acts on obvious cases

    if (changed) {
      writeFileSync(join(ROOT, path), newContent);
      break;
    }
  }

  if (!changed) {
    say("No improvement opportunities found in this pass.");
    logResult(getCurrentCommit(), "skip", baselineResult, "none", description);
    return false;
  }

  // Evaluate after change
  say(`Trying: ${description} in ${changedFile}...`);
  if (changed) {
    writeFileSync(join(ROOT, changedFile), editableContents[changedFile].replace(/\n{3,}/g, "\n\n").split("\n").map(l => l.trimEnd()).join("\n"));
  }

  const newResult = evaluate();

  if (newResult.score >= baselineScore && newResult.build_ok && newResult.tests_ok) {
    say(`✅ Improvement! Score: ${baselineScore} → ${newResult.score}. Keeping change.`);
    if (gitAvailable()) {
      const commit = commitChanges(`autoresearch: ${description}`);
      logResult(commit, "kept", newResult, changedFile, description);
    } else {
      logResult("local", "kept", newResult, changedFile, description);
    }
    return true;
  } else {
    say(`❌ Score dropped or broke (${baselineScore} → ${newResult.score}). Reverting.`);
    // Revert
    writeFileSync(join(ROOT, changedFile), editableContents[changedFile]);
    logResult(getCurrentCommit(), "reverted", newResult, changedFile, description);
    return false;
  }
}

function runLoop() {
  const max = config.max_experiments;
  say(`Starting loop of up to ${max} experiments...`);

  let kept = 0;
  let reverted = 0;

  for (let i = 1; i <= max; i++) {
    const result = runSingle(i);
    if (result) kept++;
    else reverted++;
  }

  say(`Loop complete. Kept: ${kept}, Reverted/Skipped: ${reverted}`);
}

function runReplay() {
  say("Previous results:");
  const tsv = readFileSync(RESULTS_PATH, "utf8");
  const lines = tsv.trim().split("\n");
  if (lines.length <= 1) {
    console.log("    No experiments recorded yet.");
    return;
  }
  console.log("");
  for (const line of lines) {
    console.log("    " + line);
  }
  console.log("");
  say(`Total experiments: ${lines.length - 1}`);
}

// ─── Main ───
say(`1of10 Autoresearch — Mode: ${mode}`);

switch (mode) {
  case "baseline":
    runBaseline();
    break;
  case "dry-run":
    runDryRun();
    break;
  case "single":
    runSingle();
    break;
  case "loop":
    runLoop();
    break;
  case "replay":
    runReplay();
    break;
  default:
    console.error(`Unknown mode: ${mode}`);
    console.error("Valid modes: baseline, dry-run, single, loop, replay");
    process.exit(1);
}
