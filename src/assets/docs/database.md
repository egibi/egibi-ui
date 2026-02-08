# PostgreSQL Schema

The primary database (egibi_app_db on port 5432) stores all relational/configuration data. Tables are named after their entity class names. Extensions: uuid-ossp (UUID generation), pgcrypto (crypto functions). OpenIddict tables are auto-managed by Entity Framework.

### User & Authentication Entities

<table class="doc-table">
<thead><tr><th>Entity / Column</th><th>Type</th><th>Purpose</th></tr></thead>
<tbody>
<tr><td><code>AppUser</code></td><td><span class="doc-badge">Entity</span></td><td>Application users — email, bcrypt password hash, encrypted DEK, firstName, lastName, reset token fields</td></tr>
<tr><td><code>UserCredential</code></td><td><span class="doc-badge">Entity</span></td><td>Encrypted API keys per user per connection (AES-256-GCM via DEK)</td></tr>
<tr><td><code>OpenIddictApplications</code></td><td><span class="doc-badge">OpenIddict</span></td><td>Registered OIDC clients (egibi-ui public client with PKCE)</td></tr>
<tr><td><code>OpenIddictAuthorizations</code></td><td><span class="doc-badge">OpenIddict</span></td><td>Active authorization grants linking users to clients</td></tr>
<tr><td><code>OpenIddictScopes</code></td><td><span class="doc-badge">OpenIddict</span></td><td>Registered OAuth scopes (openid, email, profile, roles, offline_access)</td></tr>
<tr><td><code>OpenIddictTokens</code></td><td><span class="doc-badge">OpenIddict</span></td><td>Issued access tokens, refresh tokens, and authorization codes</td></tr>
</tbody>
</table>

### Account Entities

<table class="doc-table">
<thead><tr><th>Entity / Column</th><th>Type</th><th>Purpose</th></tr></thead>
<tbody>
<tr><td><code>AccountUser</code></td><td><span class="doc-badge">Entity (legacy)</span></td><td>Original user entity — will merge into AppUser</td></tr>
<tr><td><code>Account</code></td><td><span class="doc-badge">Entity</span></td><td>Trading accounts linked to a Connection (service) via ConnectionId FK, AppUser via AppUserId FK, and AccountType</td></tr>
<tr><td><code>AccountType</code></td><td><span class="doc-badge">Reference</span></td><td>Account classification types</td></tr>
<tr><td><code>AccountDetails</code></td><td><span class="doc-badge">Entity</span></td><td>Extended account info (URL, user reference)</td></tr>
<tr><td><code>AccountFeeStructureDetails</code></td><td><span class="doc-badge">Entity</span></td><td>Per-account fee structure — maker/taker fee %, fee schedule type (flat/tiered/volume), linked to Account via AccountId FK</td></tr>
</tbody>
</table>

### Exchange & Market Entities

<table class="doc-table">
<thead><tr><th>Entity / Column</th><th>Type</th><th>Purpose</th></tr></thead>
<tbody>
<tr><td><code>Exchange</code></td><td><span class="doc-badge">Entity</span></td><td>Exchange definitions (Coinbase, Binance, etc.)</td></tr>
<tr><td><code>ExchangeType</code></td><td><span class="doc-badge">Reference</span></td><td>Exchange classification</td></tr>
<tr><td><code>ExchangeAccount</code></td><td><span class="doc-badge">Entity</span></td><td>User accounts on exchanges (volume, balance)</td></tr>
<tr><td><code>ExchangeFeeStructure</code></td><td><span class="doc-badge">Entity</span></td><td>Fee tiers and structures per exchange</td></tr>
<tr><td><code>ExchangeFeeStructureTier</code></td><td><span class="doc-badge">Entity</span></td><td>Individual fee tier definitions</td></tr>
<tr><td><code>Market</code></td><td><span class="doc-badge">Entity</span></td><td>Trading pairs/markets</td></tr>
<tr><td><code>MarketType</code></td><td><span class="doc-badge">Reference</span></td><td>Market classification (spot, futures, etc.)</td></tr>
</tbody>
</table>

### Connection & Data Entities

<table class="doc-table">
<thead><tr><th>Entity / Column</th><th>Type</th><th>Purpose</th></tr></thead>
<tbody>
<tr><td><code>Connection</code></td><td><span class="doc-badge">Entity</span></td><td>Service catalog — exchange/broker/data provider definitions with category, iconKey, brand color, website, defaultBaseUrl, requiredFields (JSON), sortOrder for card-based UI picker</td></tr>
<tr><td><code>ConnectionType</code></td><td><span class="doc-badge">Reference</span></td><td>Connection classification (API, unknown)</td></tr>
<tr><td><code>AppConfiguration</code></td><td><span class="doc-badge">Entity</span></td><td>General-purpose key-value config store — Name is the config key, Description stores the JSON value (used by StorageService for archival settings)</td></tr>
<tr><td><code>DataProvider</code></td><td><span class="doc-badge">Entity</span></td><td>Data source configurations</td></tr>
<tr><td><code>DataProviderType</code></td><td><span class="doc-badge">Reference</span></td><td>Provider type (File, API, Websocket, LLM)</td></tr>
<tr><td><code>DataFormatType</code></td><td><span class="doc-badge">Reference</span></td><td>Data format (OHLC)</td></tr>
<tr><td><code>DataFrequencyType</code></td><td><span class="doc-badge">Reference</span></td><td>Frequency (second, minute, hour, day)</td></tr>
</tbody>
</table>

### Trading Entities

<table class="doc-table">
<thead><tr><th>Entity / Column</th><th>Type</th><th>Purpose</th></tr></thead>
<tbody>
<tr><td><code>Strategy</code></td><td><span class="doc-badge">Entity</span></td><td>Trading strategy definitions — Name, Description, RulesConfiguration (JSONB with indicator conditions, risk params), StrategyClassName (for coded strategies), IsSimple flag, ExchangeAccountId FK, IsActive</td></tr>
<tr><td><code>Backtest</code></td><td><span class="doc-badge">Entity</span></td><td>Backtest runs — StrategyId FK, BacktestStatusId FK, StartDate, EndDate, InitialCapital, summary stats (FinalCapital, TotalReturnPct, TotalTrades, WinRate, MaxDrawdownPct, SharpeRatio), ResultJson (JSONB with equity curve + trade log)</td></tr>
<tr><td><code>BacktestStatus</code></td><td><span class="doc-badge">Reference</span></td><td>Backtest lifecycle states (Pending, Running, Completed, Failed)</td></tr>
</tbody>
</table>

### Reference Data

<table class="doc-table">
<thead><tr><th>Entity / Column</th><th>Type</th><th>Purpose</th></tr></thead>
<tbody>
<tr><td><code>Country</code></td><td><span class="doc-badge">Reference</span></td><td>Country codes and names (seeded from library)</td></tr>
<tr><td><code>TimeZone</code></td><td><span class="doc-badge">Reference</span></td><td>Timezone data (abbreviation, GMT offset, DST)</td></tr>
</tbody>
</table>

# QuestDB (Time-Series)

QuestDB handles high-frequency time-series data via three protocol ports: HTTP API (9000) for schema management and web console, ILP (9009) for high-throughput candle ingestion, and PG wire (8812) for SQL read queries.

### OHLC Table Schema

<table class="doc-table">
<thead><tr><th>Entity / Column</th><th>Type</th><th>Purpose</th></tr></thead>
<tbody>
<tr><td><code>symbol</code></td><td><span class="doc-badge">SYMBOL</span></td><td>Trading pair identifier (e.g., BTC-USD, ETH-USD)</td></tr>
<tr><td><code>source</code></td><td><span class="doc-badge">SYMBOL</span></td><td>Data origin (e.g., binance, coinbase, csv:kaggle-btc)</td></tr>
<tr><td><code>interval</code></td><td><span class="doc-badge">SYMBOL</span></td><td>Candle interval (1m, 5m, 15m, 1h, 4h, 1d, 1w)</td></tr>
<tr><td><code>open</code></td><td><span class="doc-badge">DOUBLE</span></td><td>Opening price</td></tr>
<tr><td><code>high</code></td><td><span class="doc-badge">DOUBLE</span></td><td>High price</td></tr>
<tr><td><code>low</code></td><td><span class="doc-badge">DOUBLE</span></td><td>Low price</td></tr>
<tr><td><code>close</code></td><td><span class="doc-badge">DOUBLE</span></td><td>Closing price</td></tr>
<tr><td><code>volume</code></td><td><span class="doc-badge">DOUBLE</span></td><td>Trading volume</td></tr>
<tr><td><code>trade_count</code></td><td><span class="doc-badge">LONG</span></td><td>Number of trades in the interval</td></tr>
<tr><td><code>timestamp</code></td><td><span class="doc-badge">TIMESTAMP</span></td><td>Candle open time (designated timestamp)</td></tr>
</tbody>
</table>

### Table Configuration

- **Partitioned by MONTH** — enables time-range queries and partition-level archival to external disk
- **DETACH/ATTACH PARTITION** — partitions older than retention window are detached, archived to external disk, and restored on demand
- **WAL mode enabled** — Write-Ahead Log for crash recovery and concurrent access
- **DEDUP UPSERT** on (symbol, source, interval, timestamp) — prevents duplicate candles on re-import
- **SYMBOL columns** for symbol, source, interval — QuestDB optimizes these as indexed enumerations
- **Auto-created** on API startup via OhlcRepository.EnsureTableExistsAsync()

### Access Patterns

- **Writes** — ILP protocol (port 9009) for high-throughput bulk ingestion via net-questdb-client
- **Reads** — PG wire protocol (port 8812) via Npgsql for SQL queries
- **Admin** — HTTP API (port 9000) for schema DDL and web console access
