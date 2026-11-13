#!/usr/bin/env bash
# The Cloudflare Pages build command for pages-stable: `bun run build:site:cloudflare-pages`.
# It builds only a commit whose validated delivery published a manifest, and deploys only the exact
# output CI verified.
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

delivery_evidence_dir=$(mktemp -d "${TMPDIR:-/tmp}/master-design-pages-delivery.XXXXXX")
trap 'rm -rf "$delivery_evidence_dir"' EXIT

# Fail before installing or building if CI published no manifest for this Git commit.
# Only this helper's fixed, validated public metadata is exported; never eval it.
node scripts/pages-site-release.mjs hosted-prepare "$delivery_evidence_dir"
while IFS='=' read -r delivery_env_name delivery_env_value; do
  case "$delivery_env_name" in
    PUBLIC_URL) export "$delivery_env_name=$delivery_env_value" ;;
    *) echo "Unexpected hosted delivery environment field" >&2; exit 1 ;;
  esac
done < "$delivery_evidence_dir/environment"
bun install --frozen-lockfile

bun run build:site
node scripts/pages-site-release.mjs hosted-verify "$delivery_evidence_dir"
