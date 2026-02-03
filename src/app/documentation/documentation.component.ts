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
              'Primary Database — PostgreSQL (relational data, configuration, user accounts)',
              'Time-Series Database — QuestDB (market data, OHLC candles)',
              'Exchange SDKs — Binance.Net, Coinbase, Coinbase Pro',
              'Containerization — Docker (database services)'
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
              'System — Accounting, Data Manager, Settings, API Tester, Admin'
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
│  Angular 19  │                    │  .NET 8 Web API  │
│  (egibi-ui)  │                    │  (egibi-api)     │
│              │                    │                  │
│  Port: 4200  │                    │  Port: 5000      │
└──────────────┘                    └────────┬─────────┘
                                             │
                                    ┌────────┴─────────┐
                                    │                  │
                              ┌─────┴─────┐      ┌────┴──────┐
                              │PostgreSQL │      │ QuestDB   │
                              │Port: 5432 │      │ Port: 9009│
                              │           │      │           │
                              │Config,    │      │OHLC,      │
                              │Users,     │      │Time-series│
                              │Entities   │      │Market data│
                              └───────────┘      └───────────┘`
          }
        ]
      },
      {
        id: 'project-structure',
        title: 'Solution Structure',
        content: [
          {
            type: 'text',
            value: 'The .NET solution contains several projects beyond the main API:'
          },
          {
            type: 'list',
            items: [
              'egibi-api — Main ASP.NET Core Web API project',
              'EgibiBinanceUsSdk — Binance US exchange integration library',
              'EgibiCoinbaseSdk — Coinbase exchange integration library',
              'EgibiCoreLibrary — Shared core utilities and models',
              'EgibiGeoDateTimeDataLibrary — Geographic and timezone data management',
              'EgibiQuestDbSdk — QuestDB time-series database client',
              'EgibiStrategyLibrary — Trading strategy definitions and execution'
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
          }
        ]
      },
      {
        id: 'key-services',
        title: 'Key Angular Services',
        content: [
          {
            type: 'list',
            items: [
              'ThemeService — Manages light/dark mode toggle, persists to localStorage, applies data-theme attribute',
              'EnvironmentService — Loads runtime environment config from API with signals (environment(), isProduction(), loaded())',
              'StrategiesService — CRUD operations for trading strategies',
              'BacktesterService — Manages backtests and their execution state',
              'DataProviderService — CRUD for data provider configurations'
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
            value: 'Key Endpoints'
          },
          {
            type: 'list',
            items: [
              'GET /Environment/get-environment — Returns current environment name and tag',
              'Accounts — CRUD operations for trading accounts',
              'Strategies — CRUD for trading strategy definitions',
              'Backtests — Create, execute, and review backtest results',
              'DataProviders — Manage external data source configurations',
              'Connections — Manage exchange/API connection definitions',
              'Exchanges — Exchange metadata and fee structures'
            ]
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
        id: 'configuration',
        title: 'Configuration',
        content: [
          {
            type: 'list',
            items: [
              'appsettings.json — Base configuration (connection strings, EgibiEnvironment)',
              'appsettings.Development.json — Dev overrides (local PostgreSQL, environment tag "DEV")',
              'appsettings.Production.json — Prod overrides (environment tag "PROD", external DB connection)',
              'ConfigOptions — Legacy config class with EncryptionPassword (being replaced by EncryptionService)',
              'Encryption:MasterKey — New secure key config, read from env var or appsettings'
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
            value: 'The primary database stores all relational/configuration data. Tables are named after their entity class names. Key entity groups:'
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
              { column: 'UserCredential', type: 'Entity', purpose: 'Encrypted API keys per user per connection' }
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
            value: 'QuestDB handles high-frequency time-series data (OHLC candles, tick data, market data) via the ILP (InfluxDB Line Protocol) on port 9009. The EgibiQuestDbSdk project wraps the client library.'
          },
          {
            type: 'status',
            variant: 'info',
            value: 'QuestDB schema details will be documented as market data ingestion is implemented.'
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
            value: 'Credential Storage — Integrating EncryptionService into Program.cs, migrating Connection API keys to UserCredential'
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
            value: 'Breadcrumb Navigation — Hierarchical breadcrumbs replacing redundant page titles'
          },
          {
            type: 'status',
            variant: 'planned',
            value: 'Market Data Ingestion — QuestDB integration for OHLC candle storage and retrieval'
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
