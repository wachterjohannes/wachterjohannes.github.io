#!/usr/bin/env bash
# Tell IndexNow (Bing, Yandex, Seznam, Naver) which pages changed in this push.
# Only posts and shorts that changed, plus the start page, and only URLs that answer 200.
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

live=()
for u in $(printf '%s\n' "${urls[@]}" | sort -u); do
  for try in 1 2 3 4 5 6; do
    code=$(curl -s -o /dev/null -w '%{http_code}' -L "$u" || true)
    [ "$code" = "200" ] && { live+=("$u"); break; }
    sleep 10
  done
done

if [ "${#live[@]}" -eq 0 ]; then echo "No live URLs to submit"; exit 0; fi
list=$(printf '"%s",' "${live[@]}"); list="[${list%,}]"
echo "Submitting: $list"
curl -s -o /dev/null -w 'IndexNow answered %{http_code}\n' -X POST https://api.indexnow.org/indexnow \
  -H 'Content-Type: application/json; charset=utf-8' \
  -d "{\"host\":\"$HOST\",\"key\":\"$KEY\",\"keyLocation\":\"https://$HOST/$KEY.txt\",\"urlList\":$list}"
