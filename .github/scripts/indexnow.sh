#!/usr/bin/env bash
# Tell IndexNow (Bing, Yandex, Seznam, Naver) which pages changed in this push.
# Candidates come from the git diff, then are intersected with the live sitemap, so drafts,
# unlisted posts and cross-posts (which the sitemap filter excludes) are never submitted.
set -euo pipefail
HOST=johanneswachter.dev
KEY=7654ecd0c09a419cac9aa5401cab1598
BEFORE="${1:-}"
AFTER="${2:-HEAD}"
if [ -z "$BEFORE" ] || [ "$BEFORE" = "0000000000000000000000000000000000000000" ]; then BEFORE="$AFTER^"; fi

urls=("https://$HOST/")
while read -r f; do
  case "$f" in
    src/content/posts/*.md) urls+=("https://$HOST/blog/$(basename "$f" .md)/") ;;
    src/content/shorts/*.md) urls+=("https://$HOST/shorts/$(basename "$f" .md)/") ;;
    src/pages/about.astro) urls+=("https://$HOST/about/") ;;
  esac
done < <(git diff --name-only --diff-filter=AM "$BEFORE" "$AFTER")

fetch_sitemap() { curl -sL "https://$HOST/sitemap-0.xml" | grep -o '<loc>[^<]*</loc>' | sed 's/<[^>]*>//g' || true; }

live=()
for u in $(printf '%s\n' "${urls[@]}" | sort -u); do
  # Only URLs the sitemap lists and that answer 200. Pages may lag behind the deploy, so retry.
  ok=""
  for try in 1 2 3 4 5 6; do
    code=$(curl -s -o /dev/null -w '%{http_code}' -L "$u" || true)
    if [ "$code" = "200" ] && fetch_sitemap | grep -qxF "$u"; then ok=1; break; fi
    sleep 10
  done
  if [ -n "$ok" ]; then live+=("$u"); else echo "Skipped (not live or not in sitemap): $u"; fi
done

if [ "${#live[@]}" -eq 0 ]; then echo "No live URLs to submit"; exit 0; fi
list=$(printf '"%s",' "${live[@]}"); list="[${list%,}]"
echo "Submitting: $list"
curl -s -o /dev/null -w 'IndexNow answered %{http_code}\n' -X POST https://api.indexnow.org/indexnow \
  -H 'Content-Type: application/json; charset=utf-8' \
  -d "{\"host\":\"$HOST\",\"key\":\"$KEY\",\"keyLocation\":\"https://$HOST/$KEY.txt\",\"urlList\":$list}"
