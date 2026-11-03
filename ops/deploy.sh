#!/usr/bin/env bash
# Production deploy to Masterhost: build (unless dist/ is already built), rsync
# dist/ to the upload directory (only changed files travel), then run
# ops/install-release.sh there. Used by .github/workflows/deploy.yml and by
# `ship deploy` (~/.local/bin/ship) on the owner's Mac, which runs it from a
# clean `git archive` export with REVISION set. SSH goes to the `masterhost`
# host alias (~/.ssh/config; CI writes its own).
set -Eeuo pipefail

readonly REVISION="${REVISION:?REVISION is the commit being deployed}"
readonly SSH_TARGET="${EMS36_SSH_TARGET:-masterhost}"
readonly DEPLOY_DIR="/home/u543238/deploy/ems36.ru"
SSH_OPTS=(-o BatchMode=yes -o ConnectTimeout=15)  # no readonly: macOS bash 3.2 runs this

if [[ ! -s dist/index.html ]]; then
  npm ci
  npm run build
fi
for f in index.html 404.html robots.txt sitemap-index.xml .htaccess; do
  test -s "dist/${f}"
done

ssh "${SSH_OPTS[@]}" "${SSH_TARGET}" "mkdir -p -m 700 ${DEPLOY_DIR}"
rsync -rlt --checksum --delete --compress --chmod=D755,F644 \
  --exclude='.DS_Store' --exclude='._*' \
  -e "ssh ${SSH_OPTS[*]}" dist/ "${SSH_TARGET}:${DEPLOY_DIR}/upload/"
scp "${SSH_OPTS[@]}" ops/install-release.sh ops/renew-certificate.sh "${SSH_TARGET}:${DEPLOY_DIR}/"
# install-release.sh logs to state/deploy.log and exits 0 without installing when
# another deploy holds its lock, so success is the recorded revision.
ssh "${SSH_OPTS[@]}" "${SSH_TARGET}" "
  chmod 700 ${DEPLOY_DIR}/install-release.sh ${DEPLOY_DIR}/renew-certificate.sh &&
  ${DEPLOY_DIR}/install-release.sh '${REVISION}'
  status=\$?
  sed -n '/Installing ${REVISION}/,\$p' ${DEPLOY_DIR}/state/deploy.log
  test \$status -eq 0 && test \"\$(cat ${DEPLOY_DIR}/state/deployed-revision)\" = '${REVISION}'
"
echo "Production revision: ${REVISION}"
