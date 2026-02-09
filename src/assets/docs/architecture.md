# System Architecture

<pre class="doc-diagram">┌──────────────┐     HTTP/JSON      ┌──────────────────┐
│              │ ◄────────────────► │                  │
│  Angular 21  │     SignalR/WS     │  .NET 9 Web API  │
│  (egibi-ui)  │ ◄────────────────► │  (egibi-api)     │
│              │     OIDC/PKCE      │  + OpenIddict     │
│  Port: 4200  │ ◄────────────────► │  Port: 5000      │
└──────────────┘                    └────────┬─────────┘
                                             │
                                    ┌────────┴─────────┐
                                    │                  │
                              ┌─────┴─────┐      ┌────┴──────┐
                              │PostgreSQL │      │ QuestDB   │
                              │Port: 5432 │      │HTTP: 9000 │
                              │           │      │ILP:  9009 │
                              │Config,    │      │PG:   8812 │
                              │Users,     │      │           │
                              │OIDC,      │      │OHLC,      │
                              │Entities   │      │Time-series│
                              └───────────┘      └───────────┘
                              ◄── Docker Compose (egibi-network) ──►</pre>

# Authentication Architecture

Authentication uses OpenIddict as an embedded OIDC 2.0 server within the API. The Angular SPA authenticates via the Authorization Code flow with PKCE (Proof Key for Code Exchange), which is the recommended OAuth flow for public clients.

<pre class="doc-diagram">Angular SPA (localhost:4200)                    .NET API + OpenIddict (localhost:7182)
─────────────────────────────                    ────────────────────────────────────
1. User enters credentials
   on /auth/login
        │
        ▼
2. POST /auth/login ─────────────────────────► Validates bcrypt hash
   (withCredentials: true)                     Sets EgibiCookie (SameSite=None)
        │                                      ◄──── 200 OK + Set-Cookie
        ▼
3. Generate PKCE pair:
   code_verifier  (64 random chars)
   code_challenge (SHA-256 hash)
   Store verifier in sessionStorage
        │
        ▼
4. Redirect to /connect/authorize ────────────► OpenIddict sees EgibiCookie
   ?client_id=egibi-ui                         Auto-approves (ConsentType=Implicit)
   &code_challenge=...                         Generates authorization code
   &code_challenge_method=S256                 ◄──── 302 → /auth/callback?code=ABC
   &response_type=code
   &redirect_uri=.../auth/callback
   &state=CSRF_TOKEN
        │
        ▼
5. /auth/callback extracts
   code + state from URL
   Validates state matches
        │
        ▼
6. POST /connect/token ──────────────────────► OpenIddict validates:
   grant_type=authorization_code                 • code is valid
   code=ABC                                      • code_verifier matches challenge
   code_verifier=...                             • redirect_uri matches
   client_id=egibi-ui                           Issues access_token + refresh_token
        │                                       ◄──── 200 OK + tokens
        ▼
7. Store tokens in sessionStorage
   Schedule auto-refresh (expires_in - 60s)
   Redirect to requested page
        │
        ▼
8. All API requests include ──────────────────► OpenIddict validates JWT
   Authorization: Bearer &lt;token&gt;                 Returns protected data</pre>

# Solution Structure

The API solution root also serves as the Docker infrastructure root. Solution-level files include docker-compose.yml, backup/restore scripts, and the .env configuration:

- **docker-compose.yml** — PostgreSQL 16 + QuestDB 8.2.1 with named volumes, health checks, and bridge network
- **.env.example / .env** — Environment variables for Docker (ports, passwords, backup paths)
- **backup.sh / backup.ps1** — Cross-platform database backup to timestamped folders (external drive support)
- **restore.sh** — Restore from backup with interactive confirmation
- **db/postgres/init/01-init.sql** — PostgreSQL init script (uuid-ossp, pgcrypto extensions)
- **db/questdb/init/01-ohlc.sql** — QuestDB OHLC schema reference

### Solution Projects

- **egibi-api** — Main ASP.NET Core Web API project (includes OpenIddict OIDC server)
- **EgibiBinanceUsSdk** — Binance US exchange integration library
- **EgibiCoinbaseSdk** — Coinbase exchange integration library
- **EgibiCoreLibrary** — Shared core utilities and models
- **EgibiGeoDateTimeDataLibrary** — Geographic and timezone data management
- **EgibiQuestDB** — QuestDB time-series database client (PG wire protocol)
- **EgibiStrategyLibrary** — Trading strategy definitions and execution

# Runtime Environment Configuration

The UI uses a runtime environment system instead of compile-time Angular environment files. On startup, the UI queries the API's GET /Environment/get-environment endpoint to determine the current environment (Development, Production, etc.).

- **Single UI build works for all environments** — no fileReplacements needed
- **Environment determined by the API's ASPNETCORE_ENVIRONMENT variable**
- **.NET automatically merges** appsettings.json with appsettings.{Environment}.json
- **EnvironmentService (Angular)** loads config via APP_INITIALIZER at startup
- **Graceful fallback** to "Offline" mode if API is unreachable
- **Environment indicator** displayed in sidebar footer (badge or pulsing dot)

### Configuration Files

- **appsettings.json** — Base config (connection strings placeholders, QuestDb section, EgibiEnvironment, Encryption placeholder) — safe to commit
- **appsettings.Development.json** — Dev overrides with real secrets (master key, DB passwords, Plaid keys) — excluded from source control via .gitignore
- **appsettings.Production.json** — Prod overrides (EgibiEnvironment: PROD, external DB connections) — excluded from source control via .gitignore
- **.gitignore** — Prevents appsettings.Development.json and appsettings.Production.json from being committed

# Docker Infrastructure

Local development uses Docker Compose to run PostgreSQL and QuestDB as persistent containers. The infrastructure files live at the API solution root so docker compose up -d and dotnet run happen from the same directory.

### Services

<table class="doc-table">
<thead><tr><th>Entity / Column</th><th>Type</th><th>Purpose</th></tr></thead>
<tbody>
<tr><td><code>egibi-postgres</code></td><td><span class="doc-badge">postgres:16-alpine</span></td><td>Application database — users, accounts, strategies, config, OIDC grants</td></tr>
<tr><td><code>egibi-questdb</code></td><td><span class="doc-badge">questdb/questdb:8.2.1</span></td><td>Time-series database — OHLC candles, market data</td></tr>
</tbody>
</table>

### Key Features

- **Named volumes** (egibi-postgres-data, egibi-questdb-data) — data survives container restarts
- **Health checks** on both services with configurable intervals
- **Bridge network** (egibi-network) for inter-container communication
- **Dev-tuned PostgreSQL** settings (shared_buffers=256MB, work_mem=16MB)
- **QuestDB telemetry** disabled, worker count tuned for local dev
- **Init script** creates uuid-ossp and pgcrypto extensions on first start
- **Backup/restore scripts** support external drive exports with timestamped folders and manifest.json

### Common Commands

```
docker compose up -d          # Start all services
docker compose down           # Stop (data persists in volumes)
docker compose down -v        # Stop AND delete all data (re-seeds admin account)
docker compose ps             # Check service status
./backup.sh                   # Backup to ./backups/
./backup.sh /mnt/external     # Backup to external drive
./restore.sh ./backups/egibi-backup_20260203_120000
```

# Tiered Storage Architecture

Egibi uses a two-tier storage model to manage data growth. Recent data lives in Docker volumes (hot/fast) for active querying, while older data is archived to an external disk (cold/large) and can be restored on demand.

<pre class="doc-diagram">Docker Volumes (hot)              External Disk (cold)
┌────────────────────┐           ┌────────────────────────────┐
│  QuestDB OHLC      │           │  questdb-archive/          │
│  ├── 2025-12/ ◄ active        │  ├── ohlc_2025-01/         │
│  ├── 2025-11/ ◄ active        │  ├── ohlc_2025-02/         │
│  ├── ...                       │  └── ...                    │
│  └── 2025-07/ ◄ active        │                            │
│                    │           │  postgres-archive/         │
│  PostgreSQL        │           │  └── egibi_pg_backup_*.gz  │
│  (users, config,   │           │                            │
│   OIDC, strategies)│           │  archive-log.json          │
└────────────────────┘           └────────────────────────────┘
     ▲                                      ▲
     │         StorageService               │
     └──────── (archive / restore) ─────────┘</pre>

### How It Works

- **QuestDB OHLC table** is partitioned by MONTH — each partition is an independent directory of column files
- **DETACH PARTITION** removes a month from active queries but preserves the files; ATTACH PARTITION reverses this instantly
- **Archival** copies detached partition files from the Docker container to the external disk, then cleans up the container
- **Restoration** copies files back into the container and reattaches — data is immediately queryable, no re-import needed
- **PostgreSQL** stays in Docker (small footprint) with compressed pg_dump backups to external disk
- **Expired OIDC tokens** and stale authorizations are periodically pruned to prevent table bloat
- **All operations** are logged to archive-log.json on the external disk for audit trail

### Management Interfaces

- **In-App UI** — Storage Management page (/storage) with disk gauges, partition tables, config form, and action buttons
- **CLI Script** — egibi-archive.sh for cron-based automatic archival (checks threshold every N hours)
- **REST API** — StorageController endpoints for programmatic access to all storage operations
