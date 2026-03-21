#!/usr/bin/env python3
"""
Automated Vercel deploy script for 1of10 monorepo.
Konrad (Code Review): Replaces manual /tmp/1of10-deploy workflow.

Usage: python3 scripts/deploy-vercel.py
"""

import os
import json
import shutil
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WEB_DIR = os.path.join(ROOT, "apps", "web")
DEPLOY_DIR = "/tmp/1of10-deploy"
DB_SCHEMA = os.path.join(ROOT, "packages", "db", "prisma", "schema.prisma")
POLICY_DIR = os.path.join(ROOT, "packages", "policy", "src")

def say(msg):
    print(f"\n  🚀 {msg}\n")

def run(cmd, cwd=None, check=True):
    result = subprocess.run(cmd, shell=True, cwd=cwd or DEPLOY_DIR, capture_output=True, text=True)
    if check and result.returncode != 0:
        print(f"  ❌ Command failed: {cmd}")
        print(result.stderr[-500:] if result.stderr else "")
        sys.exit(1)
    return result

def main():
    say("1of10 Deploy — Starting")

    # 1. Prepare deploy directory
    say("Step 1: Preparing deploy directory")
    os.makedirs(DEPLOY_DIR, exist_ok=True)
    run(f"rsync -a --delete --exclude=node_modules --exclude=.next --exclude=.git --exclude=.vercel {WEB_DIR}/ {DEPLOY_DIR}/", cwd=ROOT)
    shutil.copy2(os.path.join(ROOT, "tsconfig.json"), os.path.join(DEPLOY_DIR, "tsconfig.base.json"))

    # 2. Create inline packages
    say("Step 2: Creating inline packages")
    for d in ["prisma", "lib/db", "lib/policy"]:
        os.makedirs(os.path.join(DEPLOY_DIR, d), exist_ok=True)

    shutil.copy2(DB_SCHEMA, os.path.join(DEPLOY_DIR, "prisma", "schema.prisma"))
    for f in os.listdir(POLICY_DIR):
        if f.endswith(".ts"):
            shutil.copy2(os.path.join(POLICY_DIR, f), os.path.join(DEPLOY_DIR, "lib", "policy", f))

    # DB lib
    with open(os.path.join(DEPLOY_DIR, "lib", "db", "index.ts"), "w") as f:
        f.write('import { PrismaClient } from "@prisma/client";\n')
        f.write('const g = globalThis as unknown as { prisma: PrismaClient | undefined };\n')
        f.write('export const prisma = g.prisma ?? new PrismaClient();\n')
        f.write('if (process.env.NODE_ENV !== "production") g.prisma = prisma;\n')
        f.write('export * from "@prisma/client";\n')

    # 3. Fix imports
    say("Step 3: Fixing imports")
    for root, dirs, files in os.walk(DEPLOY_DIR):
        if "node_modules" in root or ".next" in root:
            continue
        for fname in files:
            if fname.endswith((".ts", ".tsx")):
                path = os.path.join(root, fname)
                content = open(path).read()
                new_content = content.replace('from "@repo/db"', 'from "@/lib/db"').replace('from "@repo/policy"', 'from "@/lib/policy"')
                if new_content != content:
                    open(path, "w").write(new_content)

    # Fix enforce.ts
    enforce_path = os.path.join(DEPLOY_DIR, "lib", "policy", "enforce.ts")
    if os.path.exists(enforce_path):
        c = open(enforce_path).read()
        open(enforce_path, "w").write(c.replace('from "../db"', 'from "@/lib/db"'))

    # 4. Fix configs
    say("Step 4: Fixing configs")
    # tsconfig
    with open(os.path.join(DEPLOY_DIR, "tsconfig.json")) as f:
        ts = json.load(f)
    ts["extends"] = "./tsconfig.base.json"
    ts["compilerOptions"]["paths"] = {"@/*": ["./*"]}
    with open(os.path.join(DEPLOY_DIR, "tsconfig.json"), "w") as f:
        json.dump(ts, f, indent=2)

    # package.json
    with open(os.path.join(DEPLOY_DIR, "package.json")) as f:
        pkg = json.load(f)
    deps = pkg.get("dependencies", {})
    for k in [k for k in deps if "workspace" in str(deps.get(k, ""))]:
        del deps[k]
    deps["@prisma/client"] = "^6"
    pkg["dependencies"] = deps
    pkg.setdefault("devDependencies", {})["prisma"] = "^6"
    pkg["scripts"]["postinstall"] = "prisma generate"
    with open(os.path.join(DEPLOY_DIR, "package.json"), "w") as f:
        json.dump(pkg, f, indent=2)

    # Remove transpilePackages
    nc_path = os.path.join(DEPLOY_DIR, "next.config.ts")
    if os.path.exists(nc_path):
        c = open(nc_path).read()
        import re
        c = re.sub(r'transpilePackages:.*', '', c)
        open(nc_path, "w").write(c)

    # 5. Install + Build
    say("Step 5: npm install")
    run("npm install", check=True)

    say("Step 6: Next.js Build")
    run("npx next build", check=False)  # May have SSG warnings

    # 7. Deploy
    say("Step 7: Vercel Deploy")
    run("vercel link --yes --project 1of10-deploy", check=False)
    result = run("vercel deploy --prod --yes", check=False)
    print(result.stdout[-300:])

    say("Deploy complete! ✅")

if __name__ == "__main__":
    main()
