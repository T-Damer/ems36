#!/usr/bin/env bash
# Checks the URLs that must never break: the documentation pages (printed as
# QR codes on equipment nameplates), every PDF under /files/, and the redirects
# that lead to them (http → https, www → ems36.ru, missing trailing slash, query
# string kept). Each variant must end on the canonical https://ems36.ru URL.
#
#   ops/check-urls.sh                   # through public DNS
#   ops/check-urls.sh 90.156.201.94     # one frontend (or a GitHub Pages IP)
#
# PDFs are listed from FILES_DIR (default: public/files in the checkout).
# Extra paths, e.g. the exact URL on the nameplates, go in ops/plate-urls.txt.
set -Euo pipefail

readonly HOST="ems36.ru"
readonly IP="${1:-}"
readonly HERE="$(cd "$(dirname "$0")" && pwd)"
readonly FILES_DIR="${FILES_DIR:-${HERE}/../public/files}"
PAGES=(/documents/ /documents/passport-examples/ /documents/exp-manual/ /documents/permitting-docs/)
if [[ -f "${HERE}/plate-urls.txt" ]]; then
  while read -r path; do
    [[ -n "${path}" && "${path}" != \#* ]] && PAGES+=("${path}")
  done <"${HERE}/plate-urls.txt"
fi

pin=()
if [[ -n "${IP}" ]]; then
  for name in "${HOST}" "www.${HOST}"; do
    pin+=(--resolve "${name}:80:${IP}" --resolve "${name}:443:${IP}")
  done
fi

failures=0
checked=0

# check <url> <expected final url> [<expected redirects>] [<expected type>] [<expected size>]
check() {
  local url="$1" want="$2" hops="${3:-}" type="${4:-}" size="${5:-}" got
  checked=$((checked + 1))
  got="$(curl -sS -L -o /dev/null --max-time 30 ${pin[@]+"${pin[@]}"} \
    -w '%{http_code} %{num_redirects} %{size_download} %{url_effective} %{content_type}' "${url}" 2>&1)"
  read -r code n bytes final ctype <<<"${got}"
  local why=""
  [[ "${code}" == 200 ]] || why+=" status ${code}"
  [[ "${final}" == "${want}" ]] || why+=" ended at ${final}"
  [[ -z "${hops}" || "${n}" == "${hops}" ]] || why+=" ${n} redirects, expected ${hops}"
  [[ -z "${type}" || "${ctype}" == "${type}"* ]] || why+=" type ${ctype}"
  [[ -z "${size}" || "${bytes}" == "${size}" ]] || why+=" ${bytes} bytes, expected ${size}"
  if [[ -n "${why}" ]]; then
    failures=$((failures + 1))
    printf 'FAIL %s:%s\n' "${url}" "${why}"
  fi
}

# NFC, as git stores the names and the site links them: macOS may keep a
# checkout's file names decomposed (й as и + U+0306), which the server lacks.
encode() {
  python3 -c 'import sys, unicodedata, urllib.parse
print(urllib.parse.quote(unicodedata.normalize("NFC", sys.argv[1])))' "$1"
}

for page in "${PAGES[@]}"; do
  canonical="https://${HOST}${page}"
  bare="${page%/}"
  check "${canonical}" "${canonical}" 0
  check "https://${HOST}${bare}" "${canonical}" 1
  check "http://${HOST}${bare}" "${canonical}"
  check "http://www.${HOST}${page}" "${canonical}"
  check "https://www.${HOST}${bare}" "${canonical}"
  check "https://${HOST}${bare}?src=qr" "${canonical}?src=qr" 1
done

pdfs=0
if [[ -d "${FILES_DIR}" ]]; then
  while IFS= read -r -d '' file; do
    path="$(encode "/files/${file#"${FILES_DIR}"/}")"
    size="$(wc -c <"${file}" | tr -d ' ')"
    check "https://${HOST}${path}" "https://${HOST}${path}" 0 application/pdf "${size}"
    check "http://www.${HOST}${path}" "https://${HOST}${path}" "" application/pdf "${size}"
    pdfs=$((pdfs + 1))
  done < <(find "${FILES_DIR}" -type f -name '*.pdf' -print0)
else
  printf 'warning: %s not found, PDFs not checked\n' "${FILES_DIR}"
fi

missing="$(curl -s -o /dev/null --max-time 30 ${pin[@]+"${pin[@]}"} -w '%{http_code}' "https://${HOST}/no-such-page/")"
checked=$((checked + 1))
if [[ "${missing}" != 404 ]]; then
  failures=$((failures + 1))
  printf 'FAIL https://%s/no-such-page/: status %s, expected 404\n' "${HOST}" "${missing}"
fi

printf '%s: %d checks (%d pages, %d PDFs), %d failed\n' \
  "${IP:-public DNS}" "${checked}" "${#PAGES[@]}" "${pdfs}" "${failures}"
((failures == 0))
