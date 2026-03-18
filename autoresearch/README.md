# Autoresearch — Autonomous Improvement Loop

A tiny, CPU-only system that tries to improve the 1of10 codebase automatically.
Inspired by Andrej Karpathy's autoresearch pattern, but adapted for a TypeScript/Next.js web app.

## What It Does

1. Reads instructions from `program.md`
2. Runs evaluation (smoke test → build → code-size metric)
3. Tries one small, safe code change
4. If the score improves or stays equal with simpler code → keeps it
5. If the score drops or something breaks → reverts instantly
6. Logs everything in `results.tsv`

## Safe Edit Area

Only these files can be modified by the autonomous loop:

- `packages/policy/src/mappings.ts` — Agent-to-RiskClass mappings
- `packages/policy/src/enforce.ts` — Policy enforcement logic
- `packages/policy/src/risk-classes.ts` — RiskClass enum

Everything else (payment, auth, deployment, DB) is off-limits.

## How to Run

### 1. Record a baseline (no code changes)
```bash
node autoresearch/run.mjs baseline
```

### 2. Simulate an experiment (dry run)
```bash
node autoresearch/run.mjs dry-run
```

### 3. Run one real experiment
```bash
node autoresearch/run.mjs single
```

### 4. Run a loop of experiments
```bash
node autoresearch/run.mjs loop
```

### 5. See previous results
```bash
node autoresearch/run.mjs replay
```

## How to Change the Edit Area

Edit `config.json` → `safe_edit_paths` array. Add or remove file paths.

## How to Roll Everything Back

```bash
git checkout main
git branch -D autoresearch/*
```

Or to revert a single experiment:
```bash
git log --oneline | head -5  # find the commit
git revert <commit-hash>
```

## Scoring (0–100)

| Component | Points | Condition |
|-----------|--------|-----------|
| Smoke test | 40 | Policy files exist, correct exports, no security downgrade |
| Build | 30 | `next build` succeeds |
| Simplicity | 0–30 | Fewer lines = more points (200 lines = 30pts, 320+ lines = 0pts) |

## Safety Guarantees

- First run is always baseline-only
- One change at a time
- Automatic revert on failure
- Never auto-pushes to remote
- Never edits files outside the approved list
- Hard timeout per evaluation (default: 120s)
- Max experiment count (default: 10)
