#!/usr/bin/env bash
# Installs a built site on Masterhost. CI (and ops/deploy.sh) rsync `dist/` into
# UPLOAD_DIR first; this checks it, keeps the current site as a rollback copy,
# publishes the new one and rolls back if the site does not answer.
set -Eeuo pipefail

umask 022

readonly REVISION="${1:?Usage: install-release.sh <revision>}"
readonly DEPLOY_ROOT="${HOME}/deploy/ems36.ru"
readonly UPLOAD_DIR="${DEPLOY_ROOT}/upload"
readonly STATE_DIR="${DEPLOY_ROOT}/state"
readonly ROLLBACK_DIR="${DEPLOY_ROOT}/rollback"
readonly WEB_ROOT="${HOME}/ems36.ru/www"
readonly LOG_FILE="${STATE_DIR}/deploy.log"
readonly REVISION_FILE="${STATE_DIR}/deployed-revision"
readonly SITE_HOST="ems36.ru"
# One of the Masterhost frontends: the check must not depend on public DNS.
readonly HEALTH_IP="90.156.201.94"
# Public by design: search engines fetch https://ems36.ru/<key>.txt to verify it.
readonly INDEXNOW_KEY="4f1a1c67614643f8b8d6ce380c049e1c"

mkdir -p "${STATE_DIR}" "${ROLLBACK_DIR}"
exec 9>"${STATE_DIR}/deploy.lock"
flock -n 9 || exit 0

exec >>"${LOG_FILE}" 2>&1
printf '\n[%s] Installing %s\n' "$(date --iso-8601=seconds)" "${REVISION}"

# The site directory is created by adding ems36.ru in the Masterhost panel.
test -d "${WEB_ROOT}"
for f in index.html 404.html robots.txt sitemap-index.xml .htaccess "${INDEXNOW_KEY}.txt"; do
  test -s "${UPLOAD_DIR}/${f}"
done

# Prints the sitemap URLs whose HTML differs between the previous release
# (rollback copy) and the installed one.
changed_urls() {
  local sitemap_urls html path url
  sitemap_urls="$(cat "${WEB_ROOT}"/sitemap-[0-9]*.xml | grep -o '<loc>[^<]*' | sed 's/^<loc>//')"
  while IFS= read -r html; do
    path="${html#"${WEB_ROOT}"/}"
    if [[ -f "${ROLLBACK_DIR}/${path}" ]] && cmp -s "${html}" "${ROLLBACK_DIR}/${path}"; then
      continue
    fi
    path="${path%index.html}"
    url="https://${SITE_HOST}/${path}"
    if grep -qxF "${url}" <<<"${sitemap_urls}"; then
      printf '%s\n' "${url}"
    fi
  done < <(find "${WEB_ROOT}" -name '*.html' -not -path "${WEB_ROOT}/.well-known/*" | sort)
}

submit_indexnow() {
  local -a urls
  local json status
  mapfile -t urls < <(changed_urls)
  if [[ "${#urls[@]}" -eq 0 ]]; then
    printf '[%s] IndexNow: no changed pages\n' "$(date --iso-8601=seconds)"
    return 0
  fi
  json="$(printf '"%s",' "${urls[@]}")"
  json="{\"host\":\"${SITE_HOST}\",\"key\":\"${INDEXNOW_KEY}\",\"keyLocation\":\"https://${SITE_HOST}/${INDEXNOW_KEY}.txt\",\"urlList\":[${json%,}]}"
  status="$(curl --silent --show-error --max-time 20 --output /dev/null --write-out '%{http_code}' \
    --header 'Content-Type: application/json; charset=utf-8' --data "${json}" \
    https://api.indexnow.org/indexnow)"
  printf '[%s] IndexNow: HTTP %s for %s URL(s):\n' "$(date --iso-8601=seconds)" "${status}" "${#urls[@]}"
  printf '  %s\n' "${urls[@]}"
  [[ "${status}" == 200 || "${status}" == 202 ]]
}

ROLLBACK_READY=0
restore_previous_release() {
  local status=$?
  if [[ "${ROLLBACK_READY}" -eq 1 ]]; then
    printf '[%s] Installation failed; restoring previous release\n' "$(date --iso-8601=seconds)"
    rsync -a --delete --exclude='.well-known/' "${ROLLBACK_DIR}/" "${WEB_ROOT}/"
  fi
  exit "${status}"
}
trap restore_previous_release ERR

rsync -a --delete --exclude='.well-known/' "${WEB_ROOT}/" "${ROLLBACK_DIR}/"
ROLLBACK_READY=1
rsync -a --delete --exclude='.well-known/' "${UPLOAD_DIR}/" "${WEB_ROOT}/"

# -L follows the panel's HTTP → HTTPS redirect once it is on; both ports go to
# the same frontend.
HEALTH_BODY="$(mktemp "${STATE_DIR}/health.XXXXXX")"
curl --fail --silent --show-error --location --max-time 20 \
  --resolve "${SITE_HOST}:80:${HEALTH_IP}" --resolve "${SITE_HOST}:443:${HEALTH_IP}" \
  -o "${HEALTH_BODY}" "http://${SITE_HOST}/"
grep -q 'ЭлеваторМельСервис' "${HEALTH_BODY}"
rm -f "${HEALTH_BODY}"

ROLLBACK_READY=0
printf '%s\n' "${REVISION}" >"${REVISION_FILE}"
printf '[%s] Installation completed\n' "$(date --iso-8601=seconds)"

# Best effort: a failed ping must not fail or roll back the release.
submit_indexnow || printf '[%s] IndexNow: submission failed\n' "$(date --iso-8601=seconds)"
