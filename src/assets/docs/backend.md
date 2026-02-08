# API Structure

The backend follows a standard ASP.NET Core pattern with Controllers, Services, and Entity Framework Core for data access. OpenIddict provides the embedded OIDC server. Swagger/OpenAPI documentation is available at /swagger in development mode.

### Authentication Endpoints (AuthorizationController)

- **POST /auth/login** — Validates credentials (bcrypt), signs in with EgibiCookie scheme, returns user profile
- **POST /auth/signup** — Creates account (password validation, DEK generation), auto-signs in with EgibiCookie
- **POST /auth/forgot-password** — Generates password reset token (SHA-256 hashed before storage, 1-hour expiry)
- **POST /auth/reset-password** — Validates token hash + expiry, updates password hash
- **GET /connect/authorize** — OpenIddict authorization endpoint (auto-approves if EgibiCookie present)
- **POST /connect/token** — OpenIddict token endpoint (authorization_code + PKCE, refresh_token grants)
- **GET /connect/userinfo** — Returns authenticated user claims (sub, email, name)
- **POST /connect/logout** — Signs out of EgibiCookie scheme

### Core Endpoints

- **GET /Environment/get-environment** — Returns current environment name and tag
- **Accounts** — CRUD operations for trading accounts, POST /Accounts/create-account creates account linked to a service catalog Connection with encrypted credentials, GET /Accounts/get-account-detail returns full account with connection metadata + credential summary + fees, PUT /Accounts/update-account updates general properties, PUT /Accounts/update-credentials re-encrypts credential fields, PUT /Accounts/update-fees creates or updates fee structure, POST /Accounts/test-connection validates API connectivity
- **Strategies** — RESTful CRUD at /api/strategies, integrated backtest execution via BacktestExecutionService + IMarketDataService, data verification, coverage queries
- **Backtests** — Legacy CRUD at /Backtester; new backtests created via /api/strategies/{id}/backtest
- **DataManager** — Data provider and import management
- **Connections** — Service catalog management (CRUD for exchange/broker/data provider definitions with category, icon, color, requiredFields)
- **Exchanges** — Exchange metadata and fee structures
- **ExchangeAccounts** — User accounts on exchanges
- **Markets** — Trading pairs and market definitions
- **AppConfigurations** — Application configuration management
- **ApiTester** — API connectivity testing and diagnostics

### Market Data Endpoints

- **POST /MarketData/get-candles** — Retrieve OHLC candles (auto-fetches gaps from exchange if fetcher available)
- **GET /MarketData/get-symbols** — List all symbols with data in QuestDB
- **GET /MarketData/get-source-summaries** — Coverage info grouped by source, symbol, and interval
- **GET /MarketData/get-coverage** — Date range coverage for a specific symbol/source/interval
- **GET /MarketData/get-fetchers** — List registered exchange fetcher names
- **POST /MarketData/import-candles** — Bulk import candles from CSV/file sources

### Storage Endpoints (StorageController)

- **GET /Storage/status** — Disk usage for Docker volume and external disk, threshold status, archived partition count
- **GET /Storage/config** — Current archival configuration (threshold, retention, paths)
- **PUT /Storage/config** — Update archival configuration (persisted in AppConfiguration table)
- **GET /Storage/partitions** — List hot QuestDB partitions and archived partitions on external disk
- **POST /Storage/archive** — Detach + archive eligible partitions to external disk (supports force and specific partition selection)
- **POST /Storage/restore** — Restore an archived partition back into QuestDB (copy + ATTACH PARTITION)
- **POST /Storage/cleanup** — Prune expired OpenIddict tokens and stale authorizations, VACUUM ANALYZE
- **GET /Storage/backups** — List PostgreSQL backup files on external disk
- **POST /Storage/backup** — Create compressed pg_dump backup to external disk (auto-prunes old backups)
- **GET /Storage/log** — Activity log of all archival, restore, cleanup, and backup operations

# OpenIddict OIDC Server

The API embeds a full OpenIddict OIDC 2.0 server that manages client registration, authorization codes, access tokens, and refresh tokens. All OIDC state (applications, authorizations, scopes, tokens) is stored in PostgreSQL via Entity Framework Core.

### Server Configuration

- **Grant Types** — Authorization Code (primary) + Refresh Token
- **PKCE** — Required for all authorization code grants (S256 challenge method)
- **Client** — "egibi-ui" registered as public client (no client_secret) with redirect URI http://localhost:4200/auth/callback
- **Scopes** — openid, email, profile, roles, offline_access
- **Token Signing** — Development ephemeral keys (auto-generated, non-persistent across restarts)
- **Token Encryption** — Development ephemeral keys (production should use persistent certificates)
- **Consent** — Implicit (auto-approved, no consent screen)
- **Cookie Scheme** — "EgibiCookie" with SameSite=None + Secure for cross-origin SPA

### Client Seeding (Program.cs)

On startup, the API checks for an existing "egibi-ui" OpenIddict application and creates it if missing. This ensures the OIDC client is always available without manual setup. The admin account (admin@egibi.io) is also seeded at startup with a generated DEK.

### EF Core Integration

OpenIddict uses EgibiDbContext (UseOpenIddict&lt;int&gt;()) to persist its entities. The tables OpenIddictApplications, OpenIddictAuthorizations, OpenIddictScopes, and OpenIddictTokens are auto-created alongside application entities via CreateTablesAsync() on startup.

# Market Data Layer

The market data system uses a two-database approach: PostgreSQL for application state and QuestDB for time-series OHLC candle data. The architecture follows a cache-first pattern — check QuestDB for existing data, identify gaps, fetch from exchange, store, then return the complete dataset.

### Architecture

- **MarketData/Models/MarketDataModels.cs** — Candle, CoverageInfo, MarketDataRequest/Result, SourceSummary, DataGap, Intervals
- **MarketData/Repositories/IOhlcRepository + OhlcRepository** — PG wire reads (port 8812), ILP writes (port 9009), coverage queries, bulk inserts
- **MarketData/Fetchers/IMarketDataFetcher + BinanceFetcher** — Exchange abstraction, Binance US klines API, auto-pagination (1000/page), 100ms rate limiting
- **MarketData/Services/IMarketDataService + MarketDataService** — Orchestrator with gap detection, fetcher discovery via IEnumerable&lt;IMarketDataFetcher&gt;
- **Configuration/QuestDbOptions** — Config binding for HttpUrl, IlpHost, IlpPort

### Data Flow

<pre class="doc-diagram">UI Request (symbol, source, interval, date range)
      │
      ▼
MarketDataService.GetCandlesAsync()
      │
      ├──► OhlcRepository.GetCoverageAsync()     ◄── Check what's in QuestDB
      │
      ├──► Gap Detection                          ◄── Compare coverage to request
      │
      ├──► BinanceFetcher.FetchAsync()            ◄── Fetch missing data from exchange
      │         (auto-pagination, rate limiting)
      │
      ├──► OhlcRepository.InsertCandlesAsync()    ◄── Store via ILP (port 9009)
      │
      └──► OhlcRepository.GetCandlesAsync()       ◄── Return complete dataset via PG wire (port 8812)</pre>

### Adding New Fetchers

Create a new class implementing IMarketDataFetcher (e.g., CoinbaseFetcher.cs), register it as AddSingleton&lt;IMarketDataFetcher, CoinbaseFetcher&gt;() in Program.cs, and MarketDataService auto-discovers it. File imports set source manually (e.g., "csv:kaggle-btc") with no fetcher needed.

# Strategy System & Backtesting

The strategy system supports two modes: simple (UI-created) strategies with visual indicator-based rules, and code-only strategies implementing the IStrategy interface. The backtesting engine uses IMarketDataService for data access, enabling automatic gap-filling from exchanges during backtest execution.

### Strategy Configuration (JSON Schema)

UI-created strategies store their configuration in the Strategy.RulesConfiguration JSONB column. The configuration includes data source settings (symbol, source, interval), entry/exit conditions with indicator comparisons, and risk management parameters.

```json
{
  "symbol": "BTC-USD",
  "source": "binance",
  "interval": "1h",
  "entryConditions": [
    { "leftIndicator": "SMA", "leftPeriod": 10, "operator": "CROSSES_ABOVE", "rightIndicator": "SMA", "rightPeriod": 50 }
  ],
  "exitConditions": [
    { "leftIndicator": "RSI", "leftPeriod": 14, "operator": "GREATER_THAN", "rightIndicator": "PRICE", "rightValue": 70 }
  ],
  "stopLossPct": 2.0,
  "takeProfitPct": 5.0,
  "positionSizePct": 10.0
}
```

### Available Indicators

- **PRICE** — Raw closing price (no parameters)
- **SMA** — Simple Moving Average (configurable period, default 20)
- **EMA** — Exponential Moving Average (configurable period, default 20)
- **RSI** — Relative Strength Index using Wilder smoothing (configurable period, default 14)
- **MACD** — MACD Line (EMA12 - EMA26)
- **MACD_SIGNAL** — MACD Signal Line (EMA9 of MACD)
- **MACD_HIST** — MACD Histogram (MACD - Signal)
- **BBANDS_UPPER** — Bollinger Upper Band (configurable period, default 20, 2σ)
- **BBANDS_MIDDLE** — Bollinger Middle Band (SMA)
- **BBANDS_LOWER** — Bollinger Lower Band

### Condition Operators

- **GREATER_THAN** — Left value > right value
- **LESS_THAN** — Left value < right value
- **CROSSES_ABOVE** — Left crosses from below to above right (previous bar below, current bar above)
- **CROSSES_BELOW** — Left crosses from above to below right
- **EQUALS** — Left value equals right value (with floating point tolerance)

### Backtest Execution Flow

<pre class="doc-diagram">POST /api/strategies/{id}/backtest
      │
      ▼
BacktestExecutionService.ExecuteAsync()
      │
      ├──► Load Strategy from PostgreSQL
      │
      ├──► Parse RulesConfiguration JSON
      │
      ├──► IMarketDataService.GetCandlesAsync()
      │         ├── Check QuestDB cache
      │         ├── Detect gaps
      │         ├── BinanceFetcher auto-fills missing data
      │         └── Return complete dataset
      │
      ├──► IndicatorCalculator
      │         ├── SMA, EMA, RSI
      │         ├── MACD (line, signal, histogram)
      │         └── Bollinger Bands (upper, middle, lower)
      │
      ├──► SimpleBacktestEngine.Run()
      │         ├── Evaluate entry conditions per bar
      │         ├── Evaluate exit conditions per bar
      │         ├── Apply stop-loss / take-profit
      │         ├── Track positions and equity curve
      │         └── Generate trade log
      │
      └──► Save to PostgreSQL
                ├── Summary stats (denormalized columns)
                └── Full ResultJson (equity curve + trades)</pre>

### Result Metrics

- **Total Return %** — (finalCapital - initialCapital) / initialCapital × 100
- **Total Trades** — Number of completed round-trip trades
- **Win Rate** — Percentage of profitable trades
- **Max Drawdown %** — Largest peak-to-trough decline in equity
- **Sharpe Ratio** — Risk-adjusted return (annualized)
- **Profit Factor** — Gross profit / gross loss
- **Equity Curve** — Array of { date, equity } for charting
- **Trade Log** — Array of { entryDate, exitDate, entryPrice, exitPrice, returnPct, pnl }

### Data Verification

Before running a backtest, the verify-data endpoint checks QuestDB for existing coverage and reports a status code. The UI displays color-coded badges: green (✓ FullyCovered), blue (↓ PartialWithFetch/FetchRequired — auto-download available), yellow (⚠ PartialCoverage — no fetcher, use what exists), red (✗ NoData — cannot run). Backtests are only blocked when status is NoData.

# Entity Framework Core

EgibiDbContext manages all relational entities with code-first migrations against PostgreSQL. A convention in OnModelCreating maps each entity to a table named after its class. Seed data for reference types (ConnectionType, DataFormatType, etc.) is defined in DbSetup.cs. OpenIddict entities are registered via UseOpenIddict&lt;int&gt;().

### Entity Inheritance

All entities inherit from EntityBase which provides: Id (int PK), Name, Description, Notes, IsActive, CreatedAt, and LastModifiedAt.

### Running Migrations

Schema changes are managed through EF Core migrations. Migrations can be run from either the .NET CLI or the Visual Studio Package Manager Console. Docker containers must be running before applying migrations since Update-Database connects to PostgreSQL.

### Package Manager Console (Visual Studio)

```
# Ensure Docker containers are running first
docker compose up -d

# Create a new migration (generates C# migration files — does not require database)
Add-Migration MigrationName -Project egibi-api -StartupProject egibi-api

# Apply pending migrations to the database (requires PostgreSQL to be running)
Update-Database -Project egibi-api -StartupProject egibi-api

# Revert the last migration (if not yet applied to database)
Remove-Migration -Project egibi-api -StartupProject egibi-api

# Revert to a specific migration (rolls back all migrations after it)
Update-Database TargetMigrationName -Project egibi-api -StartupProject egibi-api
```

### .NET CLI

```
# Run from the egibi-api project directory
cd egibi-api

# Create a new migration
dotnet ef migrations add MigrationName

# Apply pending migrations
dotnet ef database update

# Revert the last migration
dotnet ef migrations remove

# List all migrations and their applied status
dotnet ef migrations list
```

### Migration Workflow

- Add or modify entity classes in Data/Entities/
- Update EgibiDbContext if adding a new DbSet or OnModelCreating configuration
- Update seed data in Data/DbSetup.cs if the entity requires default records
- Run Add-Migration to generate the migration files (inspects the model diff)
- Review the generated migration in Migrations/ folder before applying
- Run Update-Database to apply the schema change to PostgreSQL
- For seed data changes without schema changes, reset containers: `docker compose down -v && docker compose up -d`

### Prerequisites

- **Microsoft.EntityFrameworkCore.Tools** NuGet package must be installed (required for PMC commands)
- **Microsoft.EntityFrameworkCore.Design** package must be installed (required for CLI commands)
- **PostgreSQL container** must be running and accessible on localhost:5432 for Update-Database
- **Add-Migration and Remove-Migration** do not require a database connection — they only generate/remove C# files

# Service Registration (Program.cs)

All services are registered in Program.cs with appropriate lifetimes. Environment-specific branching selects connection strings for PostgreSQL and QuestDB.

### Authentication & OIDC

- **AppUserService** — Scoped service for user creation, password validation, reset tokens, and admin seeding
- **OpenIddict Core** — Entity Framework stores for applications, authorizations, scopes, tokens
- **OpenIddict Server** — Authorization Code + PKCE + Refresh Token grants, token endpoint, userinfo endpoint
- **OpenIddict Validation** — Local JWT validation for API endpoints
- **Cookie Authentication** — "EgibiCookie" scheme with SameSite=None for cross-origin SPA flow

### Scoped Services (per-request)

- **AppUserService** (authentication + user management)
- **StorageService** (disk monitoring, partition archival, OIDC cleanup, PostgreSQL backup)
- **DataManagerService, StrategiesService, BacktesterService, BacktestExecutionService**
- **ExchangesService, MarketsService, ExchangeAccountsService** (all three now properly registered in DI)
- **AppConfigurationsService, AccountsService**
- **QuestDbService** (legacy SDK), TestingService, GeoDateTimeDataService

### Singleton Services

- **IOhlcRepository → OhlcRepository** — QuestDB OHLC data access
- **IMarketDataFetcher → BinanceFetcher** — Exchange data fetching (HttpClient via AddHttpClient)
- **IMarketDataService → MarketDataService** — Market data orchestration with gap detection

### Configuration Bindings

- **QuestDbOptions** — Bound from "QuestDb" config section (HttpUrl, IlpHost, IlpPort)
- **EgibiEnvironment** — Name and Tag for runtime environment identification
- **Encryption:MasterKey** — Base64-encoded 32-byte key loaded from appsettings.Development.json (local) or environment variable (CI/CD). Never in source control.
- **StorageConfig** — Persisted in AppConfiguration table (external disk path, threshold %, retention months, auto-archive settings)
