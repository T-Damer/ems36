# Deploying ems36.ru

No secrets live in this file or in the repository.

## Where the site runs

Masterhost virtual hosting (Apache), the same account as svnl.pro and astrotrue.ru.

| | |
|---|---|
| Panel | https://cp.masterhost.ru/ → Виртуальный хостинг → u543238 → ems36.ru |
| SSH | `ssh u543238@u543238.ssh.masterhost.ru` (alias `masterhost` in `~/.ssh/config`) |
| Document root | `/home/u543238/ems36.ru/www` |
| Deploy directory | `/home/u543238/deploy/ems36.ru` (`upload/`, `rollback/`, `state/deploy.log`, `state/deployed-revision`) |
| Frontends (DNS) | `90.156.201.30`, `90.156.201.53`, `90.156.201.94`, `90.156.201.106`; no IPv6 |
| Domain and DNS | REG.RU (`ns1.reg.ru`, `ns2.reg.ru`) |

Masterhost cannot build the site (128 MB per process, glibc too old for Node 22), so the build happens in GitHub Actions or on the Mac and only `dist/` is uploaded.

## How a deploy works

A push to `main` runs `.github/workflows/deploy.yml` (a pull request only runs step 1, the build, and never deploys):

1. `npm ci` and `npm run build`.
2. `ops/deploy.sh` rsyncs `dist/` into `deploy/ems36.ru/upload/` (only changed files are sent: the site is ~200 MB, mostly PDFs and videos) and copies the two ops scripts.
3. `ops/install-release.sh` on the server checks the build (`index.html`, `404.html`, `robots.txt`, `sitemap-index.xml`, `.htaccess`, IndexNow key), copies the live site to `rollback/`, syncs the new build into the document root (leaving `.well-known/` alone), requests `http://ems36.ru/` through frontend `90.156.201.94` and restores the previous release if that fails.
4. It records the revision and sends the sitemap URLs whose HTML changed to IndexNow (best effort; a failure does not undo the release).
5. The same build (without `.htaccess`) is published to GitHub Pages as a standby copy, even when the Masterhost steps fail. It serves no one while DNS points at Masterhost; see [Failover to GitHub Pages](#failover-to-github-pages).

Concurrent installs are blocked with `flock`; a second one exits without installing, and `ops/deploy.sh` then fails because the recorded revision differs.

CI logs into Masterhost with its own key (`github-ci-ems36` in `~/.ssh/authorized_keys` on the server). Repository secrets in `T-Damer/ems36`:

- `MASTERHOST_SSH_KEY`: the private ed25519 key;
- `MASTERHOST_KNOWN_HOSTS`: `ssh-keyscan u543238.ssh.masterhost.ru` output.

### Deploying from the Mac

If GitHub Actions is unavailable, `ship` (`~/.local/bin/ship`) runs the same `ops/deploy.sh` from a clean export of a pushed revision, using your own SSH access:

```bash
ship deploy        # deploy HEAD (must already be on origin/main)
ship status
ship log
```

### Rollback

```bash
ssh masterhost "rsync -a --delete --exclude='.well-known/' ~/deploy/ems36.ru/rollback/ ~/ems36.ru/www/"
```

The next successful deploy installs `main` again. To undo a change for good, `git revert` it and push.

## Failover to GitHub Pages

GitHub Pages (`T-Damer/ems36`, custom domain `ems36.ru`, source: GitHub Actions) holds an up-to-date copy of the site. Switching to it is a DNS change at REG.RU and is never automatic.

The menu bar dashboard on the Mac has a **Failover** row (`~/Projects/Personal/services-bar/sections/failover.5m.py`). It turns red ("down") when every Masterhost frontend has failed two checks in a row, five minutes apart, and then offers **Switch DNS to GitHub Pages…**. It also turns orange when the standby deployment fails or falls behind `main`. The switch uses the REG.RU API; set that up once as described in the services-bar README ("Failover"): an alternative API password, this Mac's IP in the allowed ranges, and the Keychain entry.

The switch changes these records (by hand: Домены → ems36.ru → DNS-серверы и управление зоной):

| Name | Masterhost (normal) | GitHub Pages (standby) |
|---|---|---|
| `@` A | `90.156.201.30`, `.53`, `.94`, `.106` | `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` |
| `www` CNAME | `ems36.ru.` | `t-damer.github.io.` |

After switching to GitHub:

1. Visitors follow within the zone TTL (300 s).
2. GitHub needs a valid certificate for ems36.ru. The one it still holds from before the move expires on 2026-12-13 and cannot be renewed while DNS points at Masterhost, so after that date HTTPS fails for up to about an hour after a switch, until GitHub issues a new one. `http://` works meanwhile because "Enforce HTTPS" is off. Check with `gh api repos/T-Damer/ems36/pages --jq .https_certificate`; once its state is `approved`, turn enforcement on with `gh api -X PUT repos/T-Damer/ems36/pages -F https_enforced=true`.
3. Pushes keep updating GitHub Pages. The Masterhost step fails while Masterhost is down; that is expected.
4. IndexNow is not pinged from the standby.

To switch back, wait until the Failover row shows all four Masterhost frontends answering, use **Switch DNS to Masterhost…**, and turn "Enforce HTTPS" off again (`-F https_enforced=false`), so a later failover can serve `http://` while GitHub's certificate is renewed. A Masterhost certificate renewal that falls due during a long failover waits until you switch back, because HTTP validation reaches Masterhost only through DNS.

Keep the `_github-pages-challenge-t-damer` TXT record: it verifies ems36.ru for the GitHub account, so no one else can attach the domain to their own Pages site.

## HTTPS certificate

A free Let's Encrypt certificate for `ems36.ru` and `www.ems36.ru` (90 days, RSA-2048 because the panel rejects EC keys), issued with the `acme.sh` that svnl.pro and astrotrue.ru already use on the account (`~/deploy/acme.sh-src`, shared home `~/deploy/acme`). Masterhost's built-in Let's Encrypt only works when the domain uses Masterhost's name servers, and the zone stays at REG.RU.

Masterhost has no API for installing your own certificate. The upload goes through the panel, so it is done by a browser script on the Mac:

- `~/Projects/Personal/services-bar/plugins/certs.1h.py` (SwiftBar, hourly) checks the live certificate on every frontend. From 30 days before expiry it runs `~/deploy/ems36.ru/renew-certificate.sh` over SSH.
- When a renewed certificate is waiting, it runs `~/Projects/Personal/services-bar/tools/masterhost-ssl-upload.py upload ems36.ru …`. That script uses Microsoft Edge with its own profile, which holds only the panel session (you sign in by hand once; the password is never stored). It fills in «Поддержка SSL → По технологии SNI → Загрузить свой сертификат» and clicks «Применить», and the local key copy is deleted right after.
- If the panel session has expired, the menu offers "Masterhost panel: signed out — sign in…". If the upload fails, the menu keeps the manual steps below. The plugin also checks the session once a day.
- The site entry lives in `~/.config/services-bar/certs.json` (with `"auto_upload": "masterhost"`).

### Manual renewal (fallback)

```bash
ssh masterhost /home/u543238/deploy/ems36.ru/renew-certificate.sh
```

Then, in the menu bar: ems36.ru → "Prepare upload" (the files go to `~/Downloads/ems36.ru-certificate`, and the panel opens). In the panel go to «Сайт ems36.ru → Поддержка SSL → Настроить → По технологии SNI → Загрузить свой сертификат», use «Загрузить .CRT» (`ems36.ru.crt`) and «Загрузить .KEY» (`ems36.ru.key`), then «Применить». After that, "Verify upload" in the menu deletes the local copy. A new certificate takes up to ~15 minutes to reach all frontends.

### First certificate (before DNS points at Masterhost)

HTTP validation cannot pass while DNS still points elsewhere, so the first certificate is issued by DNS validation:

```bash
ssh masterhost /home/u543238/deploy/ems36.ru/renew-certificate.sh dns-start
```

The command prints two TXT records, `_acme-challenge.ems36.ru` and `_acme-challenge.www.ems36.ru`. Add them in REG.RU, wait until `dig +short TXT _acme-challenge.ems36.ru @ns1.reg.ru` shows them, then run:

```bash
ssh masterhost /home/u543238/deploy/ems36.ru/renew-certificate.sh dns-finish
```

Upload the files as above and check every frontend:

```bash
for ip in 90.156.201.30 90.156.201.53 90.156.201.94 90.156.201.106; do
  curl -sS -o /dev/null -w "$ip %{http_code}\n" --resolve "ems36.ru:443:$ip" https://ems36.ru/
done
```

Once DNS points at Masterhost, reissue once by HTTP validation, so that later renewals need no DNS edits, and remove the TXT records:

```bash
ssh masterhost /home/u543238/deploy/ems36.ru/renew-certificate.sh webroot
```

## DNS at REG.RU

| Name | Type | Value |
|---|---|---|
| `@` | A | `90.156.201.30` |
| `@` | A | `90.156.201.53` |
| `@` | A | `90.156.201.94` |
| `@` | A | `90.156.201.106` |
| `www` | CNAME | `ems36.ru.` |
| `_github-pages-challenge-t-damer` | TXT | GitHub domain verification (keep) |

Zone TTL: 300 s, so a [failover](#failover-to-github-pages) reaches visitors within five minutes (`~/Projects/Personal/services-bar/sections/failover.5m.py set-ttl ems36.ru 300`, or the zone settings at REG.RU). Do not use the SSH backend address (`90.156.142.59`). The domain has no mail records.

## Redirects

`public/.htaccess` sends `www` to `https://ems36.ru` and adds missing trailing slashes in one hop. Redirect targets are absolute because Apache sits behind Masterhost's internal `http://` proxy. HTTP → HTTPS and `www` → `ems36.ru` are also switched on in the panel («Переадресация»), but only after HTTPS works on all frontends.

## Change log

- 2026-11-03: ems36.ru was added as a separate site on u543238 (panel site id 1967994, extra site at 60 ₽/month, no DDoS protection); `www.ems36.ru` is its alias. The Masterhost deploy, `.htaccess` and certificate scripts were added. GitHub Pages still serves the site.
- 2026-11-03: first certificate issued by DNS validation and installed in the panel by `masterhost-ssl-upload.py`. DNS at REG.RU switched to the four Masterhost frontends (`www` CNAME `ems36.ru.`, no AAAA), the certificate reissued by HTTP validation (renewals now need no DNS edits), and the panel redirects `www.ems36.ru → ems36.ru` and `HTTP → HTTPS` switched on. ems36.ru is in `~/.config/services-bar/certs.json` with automatic upload. GitHub Pages stays published as a fallback for a day or two.
- 2026-11-03: GitHub Pages unpublished. Its workflows (`actions.yaml`, `indexnow.yaml`), `public/CNAME` and `public/_headers` were removed (the cache header lives in `.htaccess`). Pull requests now run a build-only check in `deploy.yml`.
- 2026-11-03: GitHub Pages re-enabled as a standby: `deploy.yml` publishes every build there too, and the Mac's menu bar dashboard watches both hosts and switches DNS through the REG.RU API on request. See "Failover to GitHub Pages".
