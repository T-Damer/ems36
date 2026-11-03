#!/usr/bin/env bash
# Issues or renews the Let's Encrypt certificate for ems36.ru and www.ems36.ru on
# Masterhost and exports it for upload in the panel (no API for custom
# certificates). RSA-2048: the panel rejects EC keys.
#
#   renew-certificate.sh              renew when due (exit 0), or issue by HTTP-01
#   renew-certificate.sh dns-start    first issue while DNS still points elsewhere:
#                                     prints the _acme-challenge TXT records to add
#   renew-certificate.sh dns-finish   after the TXT records are live: issue
#   renew-certificate.sh webroot      once DNS points at Masterhost: reissue by
#                                     HTTP-01 so later renewals need no DNS edits
set -Eeuo pipefail

umask 077

readonly MODE="${1:-renew}"
readonly ACME_SH="${HOME}/deploy/acme.sh-src/acme.sh"
readonly ACME_HOME="${HOME}/deploy/acme"
readonly CERT_HOME="${ACME_HOME}/certs"
readonly CERT_DIR="${CERT_HOME}/ems36.ru"
readonly WEB_ROOT="${HOME}/ems36.ru/www"
readonly EXPORT_DIR="${HOME}/deploy/ems36.ru/certificate-upload"
readonly DNS_MANUAL="--yes-I-know-dns-manual-mode-enough-go-ahead-please"

test -x "${ACME_SH}" || {
  printf 'acme.sh not found: %s\n' "${ACME_SH}" >&2
  exit 1
}

acme() {
  "${ACME_SH}" --server letsencrypt --home "${ACME_HOME}" --config-home "${ACME_HOME}" \
    --cert-home "${CERT_HOME}" "$@"
}

case "${MODE}" in
  dns-start)
    # acme.sh exits non-zero after printing the records it waits for.
    acme --issue --keylength 2048 -d ems36.ru -d www.ems36.ru --dns "${DNS_MANUAL}" || true
    exit 0
    ;;
  dns-finish)
    acme --renew -d ems36.ru "${DNS_MANUAL}"
    ;;
  webroot)
    test -d "${WEB_ROOT}"
    acme --issue --force --keylength 2048 -d ems36.ru -d www.ems36.ru -w "${WEB_ROOT}"
    ;;
  renew)
    test -d "${WEB_ROOT}"
    if [[ -f "${CERT_DIR}/ems36.ru.conf" ]]; then
      # Only ems36.ru: the acme home is shared with svnl.pro and astrotrue.ru,
      # whose own scripts renew and export theirs. Exit 2 = not due yet.
      acme --renew -d ems36.ru || { status=$?; [[ "${status}" -eq 2 ]] || exit "${status}"; }
    else
      acme --issue --keylength 2048 -d ems36.ru -d www.ems36.ru -w "${WEB_ROOT}"
    fi
    ;;
  *)
    printf 'Unknown mode: %s\n' "${MODE}" >&2
    exit 64
    ;;
esac

test -s "${CERT_DIR}/fullchain.cer"
test -s "${CERT_DIR}/ems36.ru.cer"
test -s "${CERT_DIR}/ems36.ru.key"
test -s "${CERT_DIR}/ca.cer"

readonly CERT_PUBLIC_KEY="$(openssl x509 -in "${CERT_DIR}/ems36.ru.cer" -pubkey -noout | openssl sha256)"
readonly PRIVATE_PUBLIC_KEY="$(openssl pkey -in "${CERT_DIR}/ems36.ru.key" -pubout | openssl sha256)"
[[ "${CERT_PUBLIC_KEY}" == "${PRIVATE_PUBLIC_KEY}" ]]
openssl verify -CAfile "${CERT_DIR}/ca.cer" "${CERT_DIR}/ems36.ru.cer"

install -m 700 -d "${EXPORT_DIR}"
install -m 600 "${CERT_DIR}/fullchain.cer" "${EXPORT_DIR}/ems36.ru.crt"
install -m 600 "${CERT_DIR}/ems36.ru.key" "${EXPORT_DIR}/ems36.ru.key"

openssl x509 -in "${EXPORT_DIR}/ems36.ru.crt" -noout -subject -issuer -dates -ext subjectAltName
printf '\nUpload these files through the Masterhost UI:\n%s\n%s\n' \
  "${EXPORT_DIR}/ems36.ru.crt" \
  "${EXPORT_DIR}/ems36.ru.key"
