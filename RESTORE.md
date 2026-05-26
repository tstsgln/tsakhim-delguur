# Backup & Restore

## How backups work

- **What:** `data/app.db` is snapshotted nightly using SQLite's WAL-safe `.backup`, gzipped, encrypted with [age](https://age-encryption.org/), and committed to the private repo [`tstsgln/tsetseglen-backups`](https://github.com/tstsgln/tsetseglen-backups).
- **When:** 03:00 Ulaanbaatar (19:00 UTC), daily, via `cron` on the VPS.
- **Retention:** last 30 days.
- **Encryption recipient:** `age1e34jewe7j4dxc8kg52n3tqa4clgxah3v065v2jrmsp2kat7kqy0sfe2kgr`
- **Private key location:** `C:\Users\codes\secrets\tsetseglen-age-key.txt` (local only — **back this up to a password manager**).

## Restore procedure

### Prerequisites

- `age` installed locally (`winget install FiloSottile.age`)
- `gh` CLI authenticated as `tstsgln`
- The age private key file

### Steps

1. **List available backups:**
   ```powershell
   gh api repos/tstsgln/tsetseglen-backups/contents/backups --jq '.[].name'
   ```

2. **Download the backup you want (replace TIMESTAMP):**
   ```powershell
   $name = "TIMESTAMP.db.gz.age"
   gh api repos/tstsgln/tsetseglen-backups/contents/backups/$name --jq '.download_url' | %{ iwr $_ -OutFile $name }
   ```

3. **Decrypt:**
   ```powershell
   age -d -i C:\Users\codes\secrets\tsetseglen-age-key.txt -o restored.db.gz $name
   ```

4. **Decompress:**
   ```powershell
   $gz = [IO.File]::OpenRead("restored.db.gz")
   $out = [IO.File]::Create("restored.db")
   $s = New-Object IO.Compression.GZipStream($gz,[IO.Compression.CompressionMode]::Decompress)
   $s.CopyTo($out); $s.Close(); $out.Close(); $gz.Close()
   ```

5. **Verify integrity** (requires sqlite3 CLI):
   ```
   sqlite3 restored.db "PRAGMA integrity_check;"
   ```
   Should output `ok`.

6. **Deploy to VPS** (if doing a full restore):
   ```bash
   # 1. Stop the app
   ssh -i ~/.ssh/vps_key root@38.180.146.147 "pm2 stop tsetseglen"

   # 2. Back up the current (broken) DB just in case
   ssh -i ~/.ssh/vps_key root@38.180.146.147 \
     "mv /var/www/tsakhim-delguur/data/app.db /var/www/tsakhim-delguur/data/app.db.broken-$(date +%s)"

   # 3. Upload the restored DB
   scp -i ~/.ssh/vps_key restored.db root@38.180.146.147:/var/www/tsakhim-delguur/data/app.db

   # 4. Remove stale WAL/SHM files (they belong to the old DB)
   ssh -i ~/.ssh/vps_key root@38.180.146.147 \
     "rm -f /var/www/tsakhim-delguur/data/app.db-wal /var/www/tsakhim-delguur/data/app.db-shm"

   # 5. Start the app
   ssh -i ~/.ssh/vps_key root@38.180.146.147 "pm2 start tsetseglen"
   ```

## Health checks

- **See recent backup runs:** `ssh -i ~/.ssh/vps_key root@38.180.146.147 "tail -20 /opt/tsetseglen-backup/backup.log"`
- **See cron output:** `ssh -i ~/.ssh/vps_key root@38.180.146.147 "tail /opt/tsetseglen-backup/cron.log"`
- **List backups on GitHub:** [github.com/tstsgln/tsetseglen-backups/tree/main/backups](https://github.com/tstsgln/tsetseglen-backups/tree/main/backups)

If the latest commit on the backup repo is more than 24h old, something is broken — SSH in and run `/opt/tsetseglen-backup/backup.sh` manually to see the error.

## Future: switching to Backblaze B2

When traffic grows, swap the destination (GitHub push) for a B2 upload. Only the last step of `/opt/tsetseglen-backup/backup.sh` changes; the snapshot + encrypt steps stay identical, so the age private key remains valid for all old backups.
