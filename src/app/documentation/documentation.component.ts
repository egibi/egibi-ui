import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';

interface DocSection {
  id: string;
  title: string;
  content: DocBlock[];
}

interface DocBlock {
  type: 'text' | 'heading' | 'list' | 'schema' | 'code' | 'status' | 'diagram';
  value?: string;
  items?: string[];
  rows?: SchemaRow[];
  language?: string;
  variant?: 'done' | 'active' | 'planned' | 'info' | 'warning';
}

interface SchemaRow {
  column: string;
  type: string;
  purpose: string;
}

@Component({
  selector: 'app-documentation',
  standalone: true,
  imports: [CommonModule, NgbNavModule],
  templateUrl: './documentation.component.html',
  styleUrl: './documentation.component.scss'
})
export class DocumentationComponent {
  activeTab = 'overview';

  tabs: { id: string; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: 'overview' },
    { id: 'architecture', label: 'Architecture', icon: 'architecture' },
    { id: 'frontend', label: 'Frontend (UI)', icon: 'frontend' },
    { id: 'backend', label: 'Backend (API)', icon: 'backend' },
    { id: 'database', label: 'Database', icon: 'database' },
    { id: 'security', label: 'Security', icon: 'security' },
    { id: 'status', label: 'Build Status', icon: 'status' }
  ];

  sections: Record<string, DocSection[]> = {
    overview: [
      {
        id: 'what-is-egibi',
        title: 'What is Egibi?',
        content: [
          {
            type: 'text',
            value: 'Egibi is a multi-asset algorithmic trading platform designed for managing portfolios, executing trading strategies, backtesting, and data management across cryptocurrency and traditional exchanges.'
          },
          {
            type: 'text',
            value: 'The name "Egibi" references the ancient Babylonian banking house Egibi & Sons, one of the earliest known financial institutions — a fitting namesake for a modern trading platform.'
          }
        ]
      },
      {
        id: 'tech-stack',
        title: 'Technology Stack',
        content: [
          {
            type: 'list',
            items: [
              'Frontend — Angular 19, Bootstrap 5.3.3, AG Grid, Highcharts',
              'Backend — .NET 8 (ASP.NET Core Web API)',
              'Primary Database — PostgreSQL 16 (relational data, configuration, user accounts)',
              'Time-Series Database — QuestDB 8.2.1 (OHLC candles, market data)',
              'Exchange SDKs — Binance.Net, Coinbase, Coinbase Pro',
              'Infrastructure — Docker Compose (PostgreSQL + QuestDB containers with named volumes)',
              'Real-Time — SignalR (WebSocket hubs for live updates)'
            ]
          }
        ]
      },
      {
        id: 'platform-modules',
        title: 'Platform Modules',
        content: [
          {
            type: 'list',
            items: [
              'Dashboard — Home overview and summary metrics',
              'Portfolio — Accounts, Exchanges, and Markets management',
              'Trading — Strategies and Backtester',
              'System — Accounting, Data Manager, Settings, API Tester, Admin, Documentation'
            ]
          }
        ]
      }
    ],

    architecture: [
      {
        id: 'system-architecture',
        title: 'System Architecture',
        content: [
          {
            type: 'diagram',
            value: `┌──────────────┐     HTTP/JSON      ┌──────────────────┐
│              │ ◄────────────────► │                  │
│  Angular 19  │     SignalR/WS     │  .NET 8 Web API  │
│  (egibi-ui)  │ ◄────────────────► │  (egibi-api)     │
│              │                    │                  │
│  Port: 4200  │                    │  Port: 5000      │
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
                              │Entities   │      │OHLC,      │
                              │           │      │Time-series│
                              └───────────┘      └───────────┘
                              ◄── Docker Compose (egibi-network) ──►`
          }
        ]
      },
      {
        id: 'project-structure',
        title: 'Solution Structure',
        content: [
          {
            type: 'text',
            value: 'The API solution root also serves as the Docker infrastructure root. Solution-level files include docker-compose.yml, backup/restore scripts, and the .env configuration:'
          },
          {
            type: 'list',
            items: [
              'docker-compose.yml — PostgreSQL 16 + QuestDB 8.2.1 with named volumes, health checks, and bridge network',
              '.env.example / .env — Environment variables for Docker (ports, passwords, backup paths)',
              'backup.sh / backup.ps1 — Cross-platform database backup to timestamped folders (external drive support)',
              'restore.sh — Restore from backup with interactive confirmation',
              'db/postgres/init/01-init.sql — PostgreSQL init script (uuid-ossp, pgcrypto extensions)',
              'db/questdb/init/01-ohlc.sql — QuestDB OHLC schema reference'
            ]
          },
          {
            type: 'heading',
            value: 'Solution Projects'
          },
          {
            type: 'list',
            items: [
              'egibi-api — Main ASP.NET Core Web API project',
              'EgibiBinanceUsSdk — Binance US exchange integration library',
              'EgibiCoinbaseSdk — Coinbase exchange integration library',
              'EgibiCoreLibrary — Shared core utilities and models',
              'EgibiGeoDateTimeDataLibrary — Geographic and timezone data management',
              'EgibiQuestDB — QuestDB time-series database client (PG wire protocol)',
              'EgibiStrategyLibrary — Trading strategy definitions and execution',
              'egibi-connections-manager — Standalone Angular app for connection management'
            ]
          }
        ]
      },
      {
        id: 'runtime-environment',
        title: 'Runtime Environment Configuration',
        content: [
          {
            type: 'text',
            value: 'The UI uses a runtime environment system instead of compile-time Angular environment files. On startup, the UI queries the API\'s GET /Environment/get-environment endpoint to determine the current environment (Development, Production, etc.).'
          },
          {
            type: 'list',
            items: [
              'Single UI build works for all environments — no fileReplacements needed',
              'Environment determined by the API\'s ASPNETCORE_ENVIRONMENT variable',
              '.NET automatically merges appsettings.json with appsettings.{Environment}.json',
              'EnvironmentService (Angular) loads config via APP_INITIALIZER at startup',
              'Graceful fallback to "Offline" mode if API is unreachable',
              'Environment indicator displayed in sidebar footer (badge or pulsing dot)'
            ]
          },
          {
            type: 'heading',
            value: 'Configuration Files'
          },
          {
            type: 'list',
            items: [
              'appsettings.json — Base config (connection strings, QuestDb section, EgibiEnvironment, Encryption)',
              'appsettings.Development.json — Dev overrides (local PostgreSQL/QuestDB, EgibiEnvironment: DEV)',
              'appsettings.Production.json — Prod overrides (EgibiEnvironment: PROD, external DB connections)'
            ]
          }
        ]
      },
      {
        id: 'docker-infrastructure',
        title: 'Docker Infrastructure',
        content: [
          {
            type: 'text',
            value: 'Local development uses Docker Compose to run PostgreSQL and QuestDB as persistent containers. The infrastructure files live at the API solution root so docker compose up -d and dotnet run happen from the same directory.'
          },
          {
            type: 'heading',
            value: 'Services'
          },
          {
            type: 'schema',
            rows: [
              { column: 'egibi-postgres', type: 'postgres:16-alpine', purpose: 'Application database — users, accounts, strategies, config' },
              { column: 'egibi-questdb', type: 'questdb/questdb:8.2.1', purpose: 'Time-series database — OHLC candles, market data' }
            ]
          },
          {
            type: 'heading',
            value: 'Key Features'
          },
          {
            type: 'list',
            items: [
              'Named volumes (egibi-postgres-data, egibi-questdb-data) — data survives container restarts',
              'Health checks on both services with configurable intervals',
              'Bridge network (egibi-network) for inter-container communication',
              'Dev-tuned PostgreSQL settings (shared_buffers=256MB, work_mem=16MB)',
              'QuestDB telemetry disabled, worker count tuned for local dev',
              'Init script creates uuid-ossp and pgcrypto extensions on first start',
              'Backup/restore scripts support external drive exports with timestamped folders and manifest.json'
            ]
          },
          {
            type: 'heading',
            value: 'Common Commands'
          },
          {
            type: 'code',
            value: `docker compose up -d          # Start all services
docker compose down           # Stop (data persists in volumes)
docker compose down -v        # Stop AND delete all data
docker compose ps             # Check service status
./backup.sh                   # Backup to ./backups/
./backup.sh /mnt/external     # Backup to external drive
./restore.sh ./backups/egibi-backup_20260203_120000`
          }
        ]
      }
    ],

    frontend: [
      {
        id: 'design-system',
        title: 'Design System',
        content: [
          {
            type: 'text',
            value: 'The UI follows a dual-theme design system with CSS custom properties defined in styles.scss. The light theme draws from Wealthfolio\'s clean aesthetic, while the dark theme uses a Gathermed-inspired palette with deep backgrounds and teal (#1fb8a2) accents.'
          },
          {
            type: 'heading',
            value: 'Page Layout Pattern'
          },
          {
            type: 'list',
            items: [
              'Container: space-y-6 wrapper for consistent vertical spacing',
              'Page Header: page-header with page-title and page-subtitle',
              'Content Cards: Bootstrap card with card-header (title + description) and card-body',
              'Data Grids: AG Grid wrapped in card components with theme-aware styling',
              'Modals: Standardized create/edit/delete modal templates per entity'
            ]
          },
          {
            type: 'heading',
            value: 'Theme Variables'
          },
          {
            type: 'text',
            value: 'All colors use HSL values via CSS custom properties (e.g., --egibi-primary, --egibi-card, --egibi-border). Components reference these variables to automatically adapt between light and dark themes. Theme toggle is in the sidebar footer.'
          }
        ]
      },
      {
        id: 'sidebar-navigation',
        title: 'Sidebar & Navigation',
        content: [
          {
            type: 'list',
            items: [
              'Collapsible sidebar with expanded (260px) and collapsed (64px) states',
              'State persisted to localStorage across sessions',
              'SVG logo with inline viewBox cropping — shows lion + wordmark when expanded, lion only when collapsed',
              'Logo uses currentColor for automatic theme adaptation',
              'Section-grouped navigation: Dashboard, Portfolio, Trading, System',
              'Mobile-responsive with overlay mode on screens < 992px',
              'Tooltips appear on collapsed nav items for accessibility'
            ]
          },
          {
            type: 'heading',
            value: 'Breadcrumb Navigation'
          },
          {
            type: 'text',
            value: 'BreadcrumbService builds hierarchical navigation paths (e.g., "Dashboard › Portfolio › Accounts") from route configuration. Routes are mapped to section groups (Portfolio, Trading, System) with clickable parent links. Breadcrumbs replace redundant page titles across all pages.'
          }
        ]
      },
      {
        id: 'key-services',
        title: 'Key Angular Services',
        content: [
          {
            type: 'heading',
            value: 'Core Services'
          },
          {
            type: 'list',
            items: [
              'ThemeService — Manages light/dark mode toggle, persists to localStorage, applies data-theme attribute',
              'EnvironmentService — Loads runtime environment config from API with signals (environment(), isProduction(), loaded())',
              'BreadcrumbService — Builds hierarchical breadcrumbs from route config with section grouping (Portfolio, Trading, System)',
              'ToastService — Application-wide toast notification management',
              'EgibiSharedService — Shared utilities and common functions'
            ]
          },
          {
            type: 'heading',
            value: 'Visualization Services'
          },
          {
            type: 'list',
            items: [
              'AgGridThemeService — Theme-aware AG Grid configuration, syncs grid appearance with light/dark mode',
              'HighchartsThemeService — Highcharts theme configuration matching current theme colors',
              'FileDropService — File drag-and-drop handling for data imports'
            ]
          },
          {
            type: 'heading',
            value: 'Domain Services'
          },
          {
            type: 'list',
            items: [
              'StrategiesService — CRUD operations for trading strategies',
              'BacktesterService — Manages backtests and their execution state',
              'DataProviderService — CRUD for data provider configurations',
              'TestingService — API testing and diagnostics'
            ]
          }
        ]
      }
    ],

    backend: [
      {
        id: 'api-structure',
        title: 'API Structure',
        content: [
          {
            type: 'text',
            value: 'The backend follows a standard ASP.NET Core pattern with Controllers, Services, and Entity Framework Core for data access. Swagger/OpenAPI documentation is available at /swagger in development mode.'
          },
          {
            type: 'heading',
            value: 'Core Endpoints'
          },
          {
            type: 'list',
            items: [
              'GET /Environment/get-environment — Returns current environment name and tag',
              'Accounts — CRUD operations for trading accounts',
              'Strategies — CRUD for trading strategy definitions',
              'Backtests — Create, execute, and review backtest results',
              'DataManager — Data provider and import management',
              'Connections — Manage exchange/API connection definitions',
              'Exchanges — Exchange metadata and fee structures',
              'ExchangeAccounts — User accounts on exchanges',
              'Markets — Trading pairs and market definitions',
              'AppConfigurations — Application configuration management',
              'ApiTester — API connectivity testing and diagnostics'
            ]
          },
          {
            type: 'heading',
            value: 'Market Data Endpoints'
          },
          {
            type: 'list',
            items: [
              'POST /MarketData/get-candles — Retrieve OHLC candles (auto-fetches gaps from exchange if fetcher available)',
              'GET /MarketData/get-symbols — List all symbols with data in QuestDB',
              'GET /MarketData/get-source-summaries — Coverage info grouped by source, symbol, and interval',
              'GET /MarketData/get-coverage — Date range coverage for a specific symbol/source/interval',
              'GET /MarketData/get-fetchers — List registered exchange fetcher names',
              'POST /MarketData/import-candles — Bulk import candles from CSV/file sources'
            ]
          }
        ]
      },
      {
        id: 'market-data-layer',
        title: 'Market Data Layer',
        content: [
          {
            type: 'text',
            value: 'The market data system uses a two-database approach: PostgreSQL for application state and QuestDB for time-series OHLC candle data. The architecture follows a cache-first pattern — check QuestDB for existing data, identify gaps, fetch from exchange, store, then return the complete dataset.'
          },
          {
            type: 'heading',
            value: 'Architecture'
          },
          {
            type: 'list',
            items: [
              'MarketData/Models/MarketDataModels.cs — Candle, CoverageInfo, MarketDataRequest/Result, SourceSummary, DataGap, Intervals',
              'MarketData/Repositories/IOhlcRepository + OhlcRepository — PG wire reads (port 8812), ILP writes (port 9009), coverage queries, bulk inserts',
              'MarketData/Fetchers/IMarketDataFetcher + BinanceFetcher — Exchange abstraction, Binance US klines API, auto-pagination (1000/page), 100ms rate limiting',
              'MarketData/Services/IMarketDataService + MarketDataService — Orchestrator with gap detection, fetcher discovery via IEnumerable<IMarketDataFetcher>',
              'Configuration/QuestDbOptions — Config binding for HttpUrl, IlpHost, IlpPort'
            ]
          },
          {
            type: 'heading',
            value: 'Data Flow'
          },
          {
            type: 'diagram',
            value: `UI Request (symbol, source, interval, date range)
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
      └──► OhlcRepository.GetCandlesAsync()       ◄── Return complete dataset via PG wire (port 8812)`
          },
          {
            type: 'heading',
            value: 'Adding New Fetchers'
          },
          {
            type: 'text',
            value: 'Create a new class implementing IMarketDataFetcher (e.g., CoinbaseFetcher.cs), register it as AddSingleton<IMarketDataFetcher, CoinbaseFetcher>() in Program.cs, and MarketDataService auto-discovers it. File imports set source manually (e.g., "csv:kaggle-btc") with no fetcher needed.'
          }
        ]
      },
      {
        id: 'entity-framework',
        title: 'Entity Framework Core',
        content: [
          {
            type: 'text',
            value: 'EgibiDbContext manages all relational entities with code-first migrations against PostgreSQL. A convention in OnModelCreating maps each entity to a table named after its class. Seed data for reference types (ConnectionType, DataFormatType, etc.) is defined in DbSetup.cs.'
          },
          {
            type: 'heading',
            value: 'Entity Inheritance'
          },
          {
            type: 'text',
            value: 'All entities inherit from EntityBase which provides: Id (int PK), Name, Description, Notes, IsActive, CreatedAt, and LastModifiedAt.'
          }
        ]
      },
      {
        id: 'service-registration',
        title: 'Service Registration (Program.cs)',
        content: [
          {
            type: 'text',
            value: 'All services are registered in Program.cs with appropriate lifetimes. Environment-specific branching selects connection strings for PostgreSQL and QuestDB.'
          },
          {
            type: 'heading',
            value: 'Scoped Services (per-request)'
          },
          {
            type: 'list',
            items: [
              'DataManagerService, StrategiesService, BacktesterService',
              'ExchangesService, MarketsService, ExchangeAccountsService',
              'AppConfigurationsService, AccountsService',
              'QuestDbService (legacy SDK), TestingService, GeoDateTimeDataService'
            ]
          },
          {
            type: 'heading',
            value: 'Singleton Services'
          },
          {
            type: 'list',
            items: [
              'IOhlcRepository → OhlcRepository — QuestDB OHLC data access',
              'IMarketDataFetcher → BinanceFetcher — Exchange data fetching (HttpClient via AddHttpClient)',
              'IMarketDataService → MarketDataService — Market data orchestration with gap detection'
            ]
          },
          {
            type: 'heading',
            value: 'Configuration Bindings'
          },
          {
            type: 'list',
            items: [
              'QuestDbOptions — Bound from "QuestDb" config section (HttpUrl, IlpHost, IlpPort)',
              'EgibiEnvironment — Name and Tag for runtime environment identification',
              'Encryption:MasterKey — Base64-encoded 32-byte key for credential encryption (DI pending)'
            ]
          }
        ]
      }
    ],

    database: [
      {
        id: 'postgresql-schema',
        title: 'PostgreSQL Schema',
        content: [
          {
            type: 'text',
            value: 'The primary database (egibi_app_db on port 5432) stores all relational/configuration data. Tables are named after their entity class names. Extensions: uuid-ossp (UUID generation), pgcrypto (crypto functions).'
          },
          {
            type: 'heading',
            value: 'User & Account Entities'
          },
          {
            type: 'schema',
            rows: [
              { column: 'AppUser', type: 'Entity', purpose: 'Application users with auth (email, password hash, encrypted DEK)' },
              { column: 'AccountUser', type: 'Entity (legacy)', purpose: 'Original user entity — will merge into AppUser' },
              { column: 'Account', type: 'Entity', purpose: 'Trading accounts linked to users and account types' },
              { column: 'AccountType', type: 'Reference', purpose: 'Account classification types' },
              { column: 'AccountDetails', type: 'Entity', purpose: 'Extended account info (URL, user reference)' },
              { column: 'UserCredential', type: 'Entity', purpose: 'Encrypted API keys per user per connection (AES-256-GCM via DEK)' }
            ]
          },
          {
            type: 'heading',
            value: 'Exchange & Market Entities'
          },
          {
            type: 'schema',
            rows: [
              { column: 'Exchange', type: 'Entity', purpose: 'Exchange definitions (Coinbase, Binance, etc.)' },
              { column: 'ExchangeType', type: 'Reference', purpose: 'Exchange classification' },
              { column: 'ExchangeAccount', type: 'Entity', purpose: 'User accounts on exchanges (volume, balance)' },
              { column: 'ExchangeFeeStructure', type: 'Entity', purpose: 'Fee tiers and structures per exchange' },
              { column: 'ExchangeFeeStructureTier', type: 'Entity', purpose: 'Individual fee tier definitions' },
              { column: 'Market', type: 'Entity', purpose: 'Trading pairs/markets' },
              { column: 'MarketType', type: 'Reference', purpose: 'Market classification (spot, futures, etc.)' }
            ]
          },
          {
            type: 'heading',
            value: 'Connection & Data Entities'
          },
          {
            type: 'schema',
            rows: [
              { column: 'Connection', type: 'Entity', purpose: 'External service connection definitions (base URL, type)' },
              { column: 'ConnectionType', type: 'Reference', purpose: 'Connection classification (API, unknown)' },
              { column: 'DataProvider', type: 'Entity', purpose: 'Data source configurations' },
              { column: 'DataProviderType', type: 'Reference', purpose: 'Provider type (File, API, Websocket, LLM)' },
              { column: 'DataFormatType', type: 'Reference', purpose: 'Data format (OHLC)' },
              { column: 'DataFrequencyType', type: 'Reference', purpose: 'Frequency (second, minute, hour, day)' }
            ]
          },
          {
            type: 'heading',
            value: 'Trading Entities'
          },
          {
            type: 'schema',
            rows: [
              { column: 'Strategy', type: 'Entity', purpose: 'Trading strategy definitions' },
              { column: 'Backtest', type: 'Entity', purpose: 'Backtest configurations and results' }
            ]
          },
          {
            type: 'heading',
            value: 'Reference Data'
          },
          {
            type: 'schema',
            rows: [
              { column: 'Country', type: 'Reference', purpose: 'Country codes and names (seeded from library)' },
              { column: 'TimeZone', type: 'Reference', purpose: 'Timezone data (abbreviation, GMT offset, DST)' }
            ]
          }
        ]
      },
      {
        id: 'questdb',
        title: 'QuestDB (Time-Series)',
        content: [
          {
            type: 'text',
            value: 'QuestDB handles high-frequency time-series data via three protocol ports: HTTP API (9000) for schema management and web console, ILP (9009) for high-throughput candle ingestion, and PG wire (8812) for SQL read queries.'
          },
          {
            type: 'heading',
            value: 'OHLC Table Schema'
          },
          {
            type: 'schema',
            rows: [
              { column: 'symbol', type: 'SYMBOL', purpose: 'Trading pair identifier (e.g., BTC-USD, ETH-USD)' },
              { column: 'source', type: 'SYMBOL', purpose: 'Data origin (e.g., binance, coinbase, csv:kaggle-btc)' },
              { column: 'interval', type: 'SYMBOL', purpose: 'Candle interval (1m, 5m, 15m, 1h, 4h, 1d, 1w)' },
              { column: 'open', type: 'DOUBLE', purpose: 'Opening price' },
              { column: 'high', type: 'DOUBLE', purpose: 'High price' },
              { column: 'low', type: 'DOUBLE', purpose: 'Low price' },
              { column: 'close', type: 'DOUBLE', purpose: 'Closing price' },
              { column: 'volume', type: 'DOUBLE', purpose: 'Trading volume' },
              { column: 'trade_count', type: 'LONG', purpose: 'Number of trades in the interval' },
              { column: 'timestamp', type: 'TIMESTAMP', purpose: 'Candle open time (designated timestamp)' }
            ]
          },
          {
            type: 'heading',
            value: 'Table Configuration'
          },
          {
            type: 'list',
            items: [
              'Partitioned by MONTH — efficient time-range queries and data lifecycle management',
              'WAL mode enabled — Write-Ahead Log for crash recovery and concurrent access',
              'DEDUP UPSERT on (symbol, source, interval, timestamp) — prevents duplicate candles on re-import',
              'SYMBOL columns for symbol, source, interval — QuestDB optimizes these as indexed enumerations',
              'Auto-created on API startup via OhlcRepository.EnsureTableExistsAsync()'
            ]
          },
          {
            type: 'heading',
            value: 'Access Patterns'
          },
          {
            type: 'list',
            items: [
              'Writes — ILP protocol (port 9009) for high-throughput bulk ingestion via net-questdb-client',
              'Reads — PG wire protocol (port 8812) via Npgsql for SQL queries',
              'Admin — HTTP API (port 9000) for schema DDL and web console access'
            ]
          }
        ]
      }
    ],

    security: [
      {
        id: 'encryption-overview',
        title: 'Credential Encryption Architecture',
        content: [
          {
            type: 'text',
            value: 'Egibi uses a two-tier encryption system for storing sensitive credentials (exchange API keys, secrets, passphrases). This ensures that even a full database breach does not expose usable credentials.'
          },
          {
            type: 'diagram',
            value: `MASTER KEY (env var / vault — never in DB)
      │
      ├── encrypts ──► User A DEK (stored in AppUser.EncryptedDataKey)
      │                     │
      │                     ├── encrypts ──► Coinbase API key
      │                     └── encrypts ──► Binance API secret
      │
      └── encrypts ──► User B DEK (stored in AppUser.EncryptedDataKey)
                            │
                            └── encrypts ──► Coinbase API key`
          }
        ]
      },
      {
        id: 'encryption-details',
        title: 'Encryption Implementation',
        content: [
          {
            type: 'list',
            items: [
              'Algorithm — AES-256-GCM (authenticated encryption with tamper detection)',
              'Key Size — 256-bit (32 bytes) for both master key and per-user DEKs',
              'Nonce — 96-bit random nonce generated per encryption operation',
              'Tag — 128-bit authentication tag appended to ciphertext',
              'Storage Format — Base64 encoded: [nonce (12 bytes) + ciphertext (N bytes) + tag (16 bytes)]',
              'Password Hashing — bcrypt with work factor 12 (for user login passwords)',
              'Service — IEncryptionService / EncryptionService in Services/Security/'
            ]
          },
          {
            type: 'heading',
            value: 'Key Hierarchy'
          },
          {
            type: 'list',
            items: [
              'Master Key — Stored in environment variable (EGIBI_MASTER_KEY) or secure vault. Never in database or source control.',
              'Per-User DEK — Random 256-bit key generated at account creation. Encrypted with master key before DB storage.',
              'Credential Ciphertext — Individual API keys/secrets encrypted with user\'s DEK. Stored in UserCredential table.'
            ]
          },
          {
            type: 'heading',
            value: 'Key Rotation'
          },
          {
            type: 'text',
            value: 'Master key rotation re-encrypts each user\'s DEK without touching their individual credentials. A KeyVersion column on both AppUser and UserCredential enables incremental rotation.'
          }
        ]
      },
      {
        id: 'security-rules',
        title: 'Security Rules',
        content: [
          {
            type: 'list',
            items: [
              'API endpoints must NEVER return decrypted credentials — show masked versions only (e.g., ••••••XXXX)',
              'Decrypted keys exist in memory only during active API calls, then are discarded',
              'EF Core query logging must not capture encrypted field values',
              'Master key must not appear in appsettings.json (production), source control, or logs',
              'All API endpoints accepting credentials must enforce HTTPS',
              'The old Encryptor.cs (PBKDF2+AES-CBC) is deprecated — use EncryptionService for all new work'
            ]
          }
        ]
      }
    ],

    status: [
      {
        id: 'completed',
        title: 'Completed',
        content: [
          {
            type: 'status',
            variant: 'done',
            value: 'UI Design System — Dual-theme (light/dark), CSS variables, card-based layouts, consistent page headers'
          },
          {
            type: 'status',
            variant: 'done',
            value: 'Sidebar Navigation — Collapsible, SVG logo with theme adaptation, section grouping, mobile responsive'
          },
          {
            type: 'status',
            variant: 'done',
            value: 'Breadcrumb Navigation — Hierarchical breadcrumbs with section grouping replacing redundant page titles'
          },
          {
            type: 'status',
            variant: 'done',
            value: 'Runtime Environment Config — API-driven environment detection replacing compile-time Angular environments'
          },
          {
            type: 'status',
            variant: 'done',
            value: 'Page Modernization — Strategies, Backtester, Data Manager, Settings, Accounts pages updated to card-based layout'
          },
          {
            type: 'status',
            variant: 'done',
            value: 'AG Grid Theming — Theme-aware data grids with custom styling across all grid components'
          },
          {
            type: 'status',
            variant: 'done',
            value: 'Encryption Architecture — IEncryptionService, AES-256-GCM, per-user DEK schema, AppUser + UserCredential entities'
          },
          {
            type: 'status',
            variant: 'done',
            value: 'Market Data Layer — QuestDB OHLC storage, BinanceFetcher with auto-pagination, cache-first data flow with gap detection'
          },
          {
            type: 'status',
            variant: 'done',
            value: 'Docker Infrastructure — PostgreSQL 16 + QuestDB 8.2.1 containers, named volumes, backup/restore scripts'
          },
          {
            type: 'status',
            variant: 'done',
            value: 'Documentation Page — In-app living documentation (this page)'
          }
        ]
      },
      {
        id: 'in-progress',
        title: 'In Progress',
        content: [
          {
            type: 'status',
            variant: 'active',
            value: 'Credential Storage — Integrating EncryptionService into Program.cs DI, migrating Connection API keys to UserCredential'
          },
          {
            type: 'status',
            variant: 'active',
            value: 'AppUser Migration — Consolidating AccountUser into AppUser entity'
          }
        ]
      },
      {
        id: 'planned',
        title: 'Planned',
        content: [
          {
            type: 'status',
            variant: 'planned',
            value: 'Authentication System — User login/registration with JWT tokens, session management'
          },
          {
            type: 'status',
            variant: 'planned',
            value: 'Strategy Execution Engine — Live trading strategy execution with exchange SDK integration'
          },
          {
            type: 'status',
            variant: 'planned',
            value: 'Dashboard Widgets — Portfolio summary, P&L charts, active strategy status'
          },
          {
            type: 'status',
            variant: 'planned',
            value: 'Additional Exchange Fetchers — Coinbase, Alpaca, and other data sources for market data ingestion'
          }
        ]
      }
    ]
  };

  setActiveTab(tabId: string) {
    this.activeTab = tabId;
  }

  // Last updated timestamp
  lastUpdated = 'February 3, 2026';
}