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
              'Authentication — OpenIddict 6.x (OAuth 2.0 / OpenID Connect with Authorization Code + PKCE)',
              'Primary Database — PostgreSQL 16 (relational data, configuration, user accounts, OIDC grants)',
              'Time-Series Database — QuestDB 8.2.1 (OHLC candles, market data)',
              'Exchange SDKs — Binance.Net, Coinbase, Coinbase Pro',
              'Infrastructure — Docker Compose (PostgreSQL + QuestDB containers with named volumes)',
              'Storage Management — Tiered storage with automatic archival (Docker volumes → external disk), QuestDB partition management',
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
              'Authentication — Login, Signup, Password Reset, OIDC callback',
              'Dashboard — Home overview and summary metrics',
              'Portfolio — Accounts, Exchanges, and Markets management',
              'Trading — Strategies and Backtester',
              'System — Accounting, Data Manager, Storage Management, Settings, API Tester, Admin (Service Catalog), Documentation'
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
                              ◄── Docker Compose (egibi-network) ──►`
          }
        ]
      },
      {
        id: 'auth-architecture',
        title: 'Authentication Architecture',
        content: [
          {
            type: 'text',
            value: 'Authentication uses OpenIddict as an embedded OIDC 2.0 server within the API. The Angular SPA authenticates via the Authorization Code flow with PKCE (Proof Key for Code Exchange), which is the recommended OAuth flow for public clients.'
          },
          {
            type: 'diagram',
            value: `Angular SPA (localhost:4200)                    .NET API + OpenIddict (localhost:7182)
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
   Authorization: Bearer <token>                 Returns protected data`
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
              'egibi-api — Main ASP.NET Core Web API project (includes OpenIddict OIDC server)',
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
              { column: 'egibi-postgres', type: 'postgres:16-alpine', purpose: 'Application database — users, accounts, strategies, config, OIDC grants' },
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
docker compose down -v        # Stop AND delete all data (re-seeds admin account)
docker compose ps             # Check service status
./backup.sh                   # Backup to ./backups/
./backup.sh /mnt/external     # Backup to external drive
./restore.sh ./backups/egibi-backup_20260203_120000`
          }
        ]
      },
      {
        id: 'tiered-storage',
        title: 'Tiered Storage Architecture',
        content: [
          {
            type: 'text',
            value: 'Egibi uses a two-tier storage model to manage data growth. Recent data lives in Docker volumes (hot/fast) for active querying, while older data is archived to an external disk (cold/large) and can be restored on demand.'
          },
          {
            type: 'diagram',
            value: `Docker Volumes (hot)              External Disk (cold)
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
     └──────── (archive / restore) ─────────┘`
          },
          {
            type: 'heading',
            value: 'How It Works'
          },
          {
            type: 'list',
            items: [
              'QuestDB OHLC table is partitioned by MONTH — each partition is an independent directory of column files',
              'DETACH PARTITION removes a month from active queries but preserves the files; ATTACH PARTITION reverses this instantly',
              'Archival copies detached partition files from the Docker container to the external disk, then cleans up the container',
              'Restoration copies files back into the container and reattaches — data is immediately queryable, no re-import needed',
              'PostgreSQL stays in Docker (small footprint) with compressed pg_dump backups to external disk',
              'Expired OIDC tokens and stale authorizations are periodically pruned to prevent table bloat',
              'All operations are logged to archive-log.json on the external disk for audit trail'
            ]
          },
          {
            type: 'heading',
            value: 'Management Interfaces'
          },
          {
            type: 'list',
            items: [
              'In-App UI — Storage Management page (/storage) with disk gauges, partition tables, config form, and action buttons',
              'CLI Script — egibi-archive.sh for cron-based automatic archival (checks threshold every N hours)',
              'REST API — StorageController endpoints for programmatic access to all storage operations'
            ]
          }
        ]
      }
    ],

    frontend: [
      {
        id: 'auth-ui',
        title: 'Authentication Pages',
        content: [
          {
            type: 'text',
            value: 'All authentication pages render as standalone full-screen layouts (no sidebar or header). The app shell detects auth routes via a reactive isAuthPage() computed signal and conditionally hides the navigation chrome. Each auth page uses the egibi lion logo and shared auth-page styles.'
          },
          {
            type: 'heading',
            value: 'Auth Pages'
          },
          {
            type: 'list',
            items: [
              '/auth/login — Email + password form with visibility toggle, triggers OIDC PKCE flow on success',
              '/auth/signup — Registration with firstName, lastName, email, password + confirm; live password strength indicators',
              '/auth/forgot-password — Email input; always shows success message to prevent email enumeration',
              '/auth/reset-password — Token-based password reset from query params (email + token); validates and sets new password',
              '/auth/callback — OIDC redirect handler; extracts authorization code + state, exchanges for tokens'
            ]
          },
          {
            type: 'heading',
            value: 'Password Requirements (enforced on signup and reset)'
          },
          {
            type: 'list',
            items: [
              'Minimum 8 characters',
              'At least one uppercase letter',
              'At least one lowercase letter',
              'At least one number',
              'At least one special character'
            ]
          },
          {
            type: 'heading',
            value: 'Route Guards'
          },
          {
            type: 'text',
            value: 'All application routes except /auth/* are protected by authGuard (CanActivateFn). If the user is not authenticated, the guard stores the attempted URL in sessionStorage (auth_return_url) and redirects to /auth/login. After successful login, the user is redirected back to their originally requested page.'
          }
        ]
      },
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
              'Tooltips appear on collapsed nav items for accessibility',
              'User menu dropdown in the header bar — displays name, email, and sign out button'
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
            value: 'Authentication Services'
          },
          {
            type: 'list',
            items: [
              'AuthService — Manages OIDC PKCE flow: login, signup, logout, token exchange, silent refresh, session restore',
              'authGuard — CanActivateFn that checks isAuthenticated() and redirects to /auth/login with return URL',
              'authInterceptor — HttpInterceptorFn that attaches Bearer tokens to API requests and handles 401 refresh/logout'
            ]
          },
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
              'ConnectionsService — Service catalog operations (list, create, update, delete exchange/broker/data provider definitions)',
              'AccountsService — Trading account CRUD and create-account flow with credential submission',
              'TestingService — API testing and diagnostics',
              'StorageService — Disk monitoring, QuestDB partition archival/restore, OIDC cleanup, PostgreSQL backup'
            ]
          }
        ]
      },
      {
        id: 'storage-page',
        title: 'Storage Management Page',
        content: [
          {
            type: 'text',
            value: 'The Storage Management page (/storage) provides a full UI for monitoring disk usage, managing QuestDB partition archival, configuring retention policies, and performing database maintenance — all from within the app.'
          },
          {
            type: 'heading',
            value: 'Tabs'
          },
          {
            type: 'list',
            items: [
              'Overview — Disk usage gauges for Docker volume and external disk, threshold warnings, quick action buttons (Archive, Cleanup OIDC, Backup PostgreSQL)',
              'Partitions — Hot partition table with row counts, sizes, date ranges, and checkbox selection for archiving; archived partition table with one-click restore',
              'Backups — PostgreSQL backup list on external disk with create button; auto-prunes old backups per config',
              'Configuration — External disk path, threshold %, hot data retention months, auto-archive interval, max backups, auto-archive toggle',
              'Activity Log — Chronological history of all archive, restore, cleanup, and backup operations with success/failure status'
            ]
          }
        ]
      },
      {
        id: 'admin-service-catalog',
        title: 'Admin — Service Catalog',
        content: [
          {
            type: 'text',
            value: 'The Service Catalog tab in Admin (/admin) provides a management interface for configuring which exchanges, brokers, and data providers are available for users to connect to when creating accounts. Each service entry defines the metadata and required credential fields that drive the dynamic account creation form.'
          },
          {
            type: 'heading',
            value: 'Service Properties'
          },
          {
            type: 'list',
            items: [
              'Name — Display name (e.g., Binance US, Alpaca, Alpha Vantage)',
              'Category — Classification: Crypto Exchange, Stock Broker, Data Provider, or Other',
              'Icon Key — Identifier for service icon rendering (e.g., binance, coinbase, schwab)',
              'Brand Color — Hex color for icon backgrounds and UI accents',
              'Website — Service homepage URL',
              'Default Base URL — Pre-filled API base URL for the connection',
              'Required Fields — Toggle buttons for which credentials the service needs: API Key, API Secret, Passphrase, Username, Password, Base URL',
              'Sort Order — Display ordering within category groups',
              'Is Data Source — Whether the service provides market data'
            ]
          },
          {
            type: 'heading',
            value: 'Seed Data'
          },
          {
            type: 'text',
            value: 'Nine services are pre-configured via DbSetup.cs: Binance US, Coinbase, Coinbase Pro, Kraken (crypto), Charles Schwab, Alpaca, Interactive Brokers (stock), Alpha Vantage, and Polygon.io (data providers). Each includes category, brand color, default API base URL, and required credential field configuration.'
          }
        ]
      },
      {
        id: 'accounts-page',
        title: 'Accounts — Add Account Flow',
        content: [
          {
            type: 'text',
            value: 'The Accounts page (/accounts) uses a multi-step modal wizard for creating new accounts. The wizard is driven by the service catalog — selecting a service pre-fills connection details and dynamically renders only the credential fields that service requires.'
          },
          {
            type: 'heading',
            value: 'Step 1 — Pick a Service'
          },
          {
            type: 'list',
            items: [
              'Card grid grouped by category (Crypto Exchange, Stock Broker, Data Provider)',
              'Search/filter bar to find services by name',
              'Each card shows service icon (brand color), name, and description',
              'Selecting a card pre-fills account name, base URL, and credential label from the Connection template',
              'Custom option (dashed-border card) for unlisted services with manual configuration'
            ]
          },
          {
            type: 'heading',
            value: 'Step 2 — Configure Connection'
          },
          {
            type: 'list',
            items: [
              'Account details section: name, description, account type dropdown',
              'Credentials section: dynamically rendered based on Connection.requiredFields JSON',
              'Password-toggle visibility for secret fields (API keys, secrets, passwords)',
              'Credential label field (e.g., \"Production Keys\", \"Read-Only\")',
              'Security notice badge showing AES-256-GCM encryption',
              'Credentials are submitted as plaintext to the API which encrypts them with the user DEK before storage in UserCredential'
            ]
          },
          {
            type: 'heading',
            value: 'Architecture'
          },
          {
            type: 'list',
            items: [
              'Connection entity = service catalog template (what services are available)',
              'Account entity links to Connection via ConnectionId FK (which service was selected)',
              'UserCredential entity stores encrypted API keys per user per connection',
              'AddAccountModalComponent receives connections and accountTypes as modal inputs',
              'Modal emits CreateAccountRequest on save, parent calls POST /Accounts/create-account'
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
            value: 'The backend follows a standard ASP.NET Core pattern with Controllers, Services, and Entity Framework Core for data access. OpenIddict provides the embedded OIDC server. Swagger/OpenAPI documentation is available at /swagger in development mode.'
          },
          {
            type: 'heading',
            value: 'Authentication Endpoints (AuthorizationController)'
          },
          {
            type: 'list',
            items: [
              'POST /auth/login — Validates credentials (bcrypt), signs in with EgibiCookie scheme, returns user profile',
              'POST /auth/signup — Creates account (password validation, DEK generation), auto-signs in with EgibiCookie',
              'POST /auth/forgot-password — Generates password reset token (SHA-256 hashed before storage, 1-hour expiry)',
              'POST /auth/reset-password — Validates token hash + expiry, updates password hash',
              'GET /connect/authorize — OpenIddict authorization endpoint (auto-approves if EgibiCookie present)',
              'POST /connect/token — OpenIddict token endpoint (authorization_code + PKCE, refresh_token grants)',
              'GET /connect/userinfo — Returns authenticated user claims (sub, email, name)',
              'POST /connect/logout — Signs out of EgibiCookie scheme'
            ]
          },
          {
            type: 'heading',
            value: 'Core Endpoints'
          },
          {
            type: 'list',
            items: [
              'GET /Environment/get-environment — Returns current environment name and tag',
              'Accounts — CRUD operations for trading accounts, POST /Accounts/create-account creates account linked to a service catalog Connection with encrypted credentials',
              'Strategies — CRUD for trading strategy definitions',
              'Backtests — Create, execute, and review backtest results',
              'DataManager — Data provider and import management',
              'Connections — Service catalog management (CRUD for exchange/broker/data provider definitions with category, icon, color, requiredFields)',
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
          },
          {
            type: 'heading',
            value: 'Storage Endpoints (StorageController)'
          },
          {
            type: 'list',
            items: [
              'GET /Storage/status — Disk usage for Docker volume and external disk, threshold status, archived partition count',
              'GET /Storage/config — Current archival configuration (threshold, retention, paths)',
              'PUT /Storage/config — Update archival configuration (persisted in AppConfiguration table)',
              'GET /Storage/partitions — List hot QuestDB partitions and archived partitions on external disk',
              'POST /Storage/archive — Detach + archive eligible partitions to external disk (supports force and specific partition selection)',
              'POST /Storage/restore — Restore an archived partition back into QuestDB (copy + ATTACH PARTITION)',
              'POST /Storage/cleanup — Prune expired OpenIddict tokens and stale authorizations, VACUUM ANALYZE',
              'GET /Storage/backups — List PostgreSQL backup files on external disk',
              'POST /Storage/backup — Create compressed pg_dump backup to external disk (auto-prunes old backups)',
              'GET /Storage/log — Activity log of all archival, restore, cleanup, and backup operations'
            ]
          }
        ]
      },
      {
        id: 'openiddict-config',
        title: 'OpenIddict OIDC Server',
        content: [
          {
            type: 'text',
            value: 'The API embeds a full OpenIddict OIDC 2.0 server that manages client registration, authorization codes, access tokens, and refresh tokens. All OIDC state (applications, authorizations, scopes, tokens) is stored in PostgreSQL via Entity Framework Core.'
          },
          {
            type: 'heading',
            value: 'Server Configuration'
          },
          {
            type: 'list',
            items: [
              'Grant Types — Authorization Code (primary) + Refresh Token',
              'PKCE — Required for all authorization code grants (S256 challenge method)',
              'Client — "egibi-ui" registered as public client (no client_secret) with redirect URI http://localhost:4200/auth/callback',
              'Scopes — openid, email, profile, roles, offline_access',
              'Token Signing — Development ephemeral keys (auto-generated, non-persistent across restarts)',
              'Token Encryption — Development ephemeral keys (production should use persistent certificates)',
              'Consent — Implicit (auto-approved, no consent screen)',
              'Cookie Scheme — "EgibiCookie" with SameSite=None + Secure for cross-origin SPA'
            ]
          },
          {
            type: 'heading',
            value: 'Client Seeding (Program.cs)'
          },
          {
            type: 'text',
            value: 'On startup, the API checks for an existing "egibi-ui" OpenIddict application and creates it if missing. This ensures the OIDC client is always available without manual setup. The admin account (admin@egibi.io) is also seeded at startup with a generated DEK.'
          },
          {
            type: 'heading',
            value: 'EF Core Integration'
          },
          {
            type: 'text',
            value: 'OpenIddict uses EgibiDbContext (UseOpenIddict<int>()) to persist its entities. The tables OpenIddictApplications, OpenIddictAuthorizations, OpenIddictScopes, and OpenIddictTokens are auto-created alongside application entities via CreateTablesAsync() on startup.'
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
            value: 'EgibiDbContext manages all relational entities with code-first migrations against PostgreSQL. A convention in OnModelCreating maps each entity to a table named after its class. Seed data for reference types (ConnectionType, DataFormatType, etc.) is defined in DbSetup.cs. OpenIddict entities are registered via UseOpenIddict<int>().'
          },
          {
            type: 'heading',
            value: 'Entity Inheritance'
          },
          {
            type: 'text',
            value: 'All entities inherit from EntityBase which provides: Id (int PK), Name, Description, Notes, IsActive, CreatedAt, and LastModifiedAt.'
          },
          {
            type: 'heading',
            value: 'Running Migrations'
          },
          {
            type: 'text',
            value: 'Schema changes are managed through EF Core migrations. Migrations can be run from either the .NET CLI or the Visual Studio Package Manager Console. Docker containers must be running before applying migrations since Update-Database connects to PostgreSQL.'
          },
          {
            type: 'heading',
            value: 'Package Manager Console (Visual Studio)'
          },
          {
            type: 'code',
            value: `# Ensure Docker containers are running first
docker compose up -d

# Create a new migration (generates C# migration files — does not require database)
Add-Migration MigrationName -Project egibi-api -StartupProject egibi-api

# Apply pending migrations to the database (requires PostgreSQL to be running)
Update-Database -Project egibi-api -StartupProject egibi-api

# Revert the last migration (if not yet applied to database)
Remove-Migration -Project egibi-api -StartupProject egibi-api

# Revert to a specific migration (rolls back all migrations after it)
Update-Database TargetMigrationName -Project egibi-api -StartupProject egibi-api`
          },
          {
            type: 'heading',
            value: '.NET CLI'
          },
          {
            type: 'code',
            value: `# Run from the egibi-api project directory
cd egibi-api

# Create a new migration
dotnet ef migrations add MigrationName

# Apply pending migrations
dotnet ef database update

# Revert the last migration
dotnet ef migrations remove

# List all migrations and their applied status
dotnet ef migrations list`
          },
          {
            type: 'heading',
            value: 'Migration Workflow'
          },
          {
            type: 'list',
            items: [
              'Add or modify entity classes in Data/Entities/',
              'Update EgibiDbContext if adding a new DbSet or OnModelCreating configuration',
              'Update seed data in Data/DbSetup.cs if the entity requires default records',
              'Run Add-Migration to generate the migration files (inspects the model diff)',
              'Review the generated migration in Migrations/ folder before applying',
              'Run Update-Database to apply the schema change to PostgreSQL',
              'For seed data changes without schema changes, reset containers: docker compose down -v && docker compose up -d'
            ]
          },
          {
            type: 'heading',
            value: 'Prerequisites'
          },
          {
            type: 'list',
            items: [
              'Microsoft.EntityFrameworkCore.Tools NuGet package must be installed (required for PMC commands)',
              'Microsoft.EntityFrameworkCore.Design package must be installed (required for CLI commands)',
              'PostgreSQL container must be running and accessible on localhost:5432 for Update-Database',
              'Add-Migration and Remove-Migration do not require a database connection — they only generate/remove C# files'
            ]
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
            value: 'Authentication & OIDC'
          },
          {
            type: 'list',
            items: [
              'AppUserService — Scoped service for user creation, password validation, reset tokens, and admin seeding',
              'OpenIddict Core — Entity Framework stores for applications, authorizations, scopes, tokens',
              'OpenIddict Server — Authorization Code + PKCE + Refresh Token grants, token endpoint, userinfo endpoint',
              'OpenIddict Validation — Local JWT validation for API endpoints',
              'Cookie Authentication — "EgibiCookie" scheme with SameSite=None for cross-origin SPA flow'
            ]
          },
          {
            type: 'heading',
            value: 'Scoped Services (per-request)'
          },
          {
            type: 'list',
            items: [
              'AppUserService (authentication + user management)',
              'StorageService (disk monitoring, partition archival, OIDC cleanup, PostgreSQL backup)',
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
              'Encryption:MasterKey — Base64-encoded 32-byte key for credential encryption',
              'StorageConfig — Persisted in AppConfiguration table (external disk path, threshold %, retention months, auto-archive settings)'
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
            value: 'The primary database (egibi_app_db on port 5432) stores all relational/configuration data. Tables are named after their entity class names. Extensions: uuid-ossp (UUID generation), pgcrypto (crypto functions). OpenIddict tables are auto-managed by Entity Framework.'
          },
          {
            type: 'heading',
            value: 'User & Authentication Entities'
          },
          {
            type: 'schema',
            rows: [
              { column: 'AppUser', type: 'Entity', purpose: 'Application users — email, bcrypt password hash, encrypted DEK, firstName, lastName, reset token fields' },
              { column: 'UserCredential', type: 'Entity', purpose: 'Encrypted API keys per user per connection (AES-256-GCM via DEK)' },
              { column: 'OpenIddictApplications', type: 'OpenIddict', purpose: 'Registered OIDC clients (egibi-ui public client with PKCE)' },
              { column: 'OpenIddictAuthorizations', type: 'OpenIddict', purpose: 'Active authorization grants linking users to clients' },
              { column: 'OpenIddictScopes', type: 'OpenIddict', purpose: 'Registered OAuth scopes (openid, email, profile, roles, offline_access)' },
              { column: 'OpenIddictTokens', type: 'OpenIddict', purpose: 'Issued access tokens, refresh tokens, and authorization codes' }
            ]
          },
          {
            type: 'heading',
            value: 'Account Entities'
          },
          {
            type: 'schema',
            rows: [
              { column: 'AccountUser', type: 'Entity (legacy)', purpose: 'Original user entity — will merge into AppUser' },
              { column: 'Account', type: 'Entity', purpose: 'Trading accounts linked to a Connection (service) via ConnectionId FK, AppUser via AppUserId FK, and AccountType' },
              { column: 'AccountType', type: 'Reference', purpose: 'Account classification types' },
              { column: 'AccountDetails', type: 'Entity', purpose: 'Extended account info (URL, user reference)' }
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
              { column: 'Connection', type: 'Entity', purpose: 'Service catalog — exchange/broker/data provider definitions with category, iconKey, brand color, website, defaultBaseUrl, requiredFields (JSON), sortOrder for card-based UI picker' },
              { column: 'ConnectionType', type: 'Reference', purpose: 'Connection classification (API, unknown)' },
              { column: 'AppConfiguration', type: 'Entity', purpose: 'General-purpose key-value config store — Name is the config key, Description stores the JSON value (used by StorageService for archival settings)' },
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
              'Partitioned by MONTH — enables time-range queries and partition-level archival to external disk',
              'DETACH/ATTACH PARTITION — partitions older than retention window are detached, archived to external disk, and restored on demand',
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
        id: 'auth-security',
        title: 'Authentication & Session Security',
        content: [
          {
            type: 'text',
            value: 'Egibi uses the OAuth 2.0 Authorization Code flow with PKCE (Proof Key for Code Exchange), which is the industry standard for securing single-page applications. The OIDC server is embedded in the API via OpenIddict, eliminating the need for a separate identity provider.'
          },
          {
            type: 'heading',
            value: 'PKCE Protection'
          },
          {
            type: 'list',
            items: [
              'code_verifier — 64 random base64url characters generated per auth flow, stored in sessionStorage',
              'code_challenge — SHA-256 hash of verifier, sent with authorization request (S256 method)',
              'Token exchange requires the original code_verifier, preventing authorization code interception attacks',
              'Each flow generates a unique state parameter for CSRF protection, validated on callback'
            ]
          },
          {
            type: 'heading',
            value: 'Cookie Security'
          },
          {
            type: 'list',
            items: [
              'Cookie Name — "egibi.auth" (EgibiCookie authentication scheme)',
              'HttpOnly — true (JavaScript cannot access the cookie)',
              'SameSite — None (required for cross-origin SPA at localhost:4200 ↔ API at localhost:7182)',
              'Secure — Always (required when SameSite=None; ensures HTTPS transport)',
              'Expiry — 30-minute sliding window'
            ]
          },
          {
            type: 'heading',
            value: 'Token Management'
          },
          {
            type: 'list',
            items: [
              'Access tokens stored in sessionStorage (cleared when tab closes)',
              'Refresh tokens stored in sessionStorage for silent renewal',
              'Auto-refresh scheduled 60 seconds before access token expiry',
              'HTTP interceptor attaches Bearer token to all API requests (skips /auth/* and /connect/token)',
              '401 responses trigger automatic token refresh; logout on refresh failure',
              'Server-side cleanup — StorageService periodically prunes expired tokens and stale authorizations from PostgreSQL (via /Storage/cleanup or cron)'
            ]
          },
          {
            type: 'heading',
            value: 'Password Security'
          },
          {
            type: 'list',
            items: [
              'Passwords hashed with bcrypt (work factor 12)',
              'Password reset tokens — cryptographically random, SHA-256 hashed before database storage',
              'Reset token expiry — 1 hour from generation',
              'Forgot-password endpoint always returns success to prevent email enumeration',
              'Password complexity enforced on both frontend (live indicators) and backend (server validation)'
            ]
          }
        ]
      },
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
              'CORS restricted to specific origins (localhost:4200) with AllowCredentials for cookie transport',
              'Development uses ephemeral signing/encryption keys — production must use persistent certificates',
              'The old Encryptor.cs (PBKDF2+AES-CBC) is deprecated — use EncryptionService for all new work',
              'Archived data on external disk retains the same security posture — no credentials are stored in QuestDB partitions or pg_dump backups (credentials are encrypted in PostgreSQL)',
              'Storage operations (archive, restore, backup) require authentication via [Authorize] on StorageController'
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
            value: 'Authentication System — OpenIddict OIDC 2.0 server with Authorization Code + PKCE, login/signup/reset UI, route guards, HTTP interceptor, token auto-refresh'
          },
          {
            type: 'status',
            variant: 'done',
            value: 'Storage Management — Tiered storage with QuestDB partition archival to external disk, in-app UI (disk gauges, partition tables, config form, activity log), REST API, OIDC token cleanup, PostgreSQL backup, CLI script with cron support'
          },
          {
            type: 'status',
            variant: 'done',
            value: 'UI Design System — Dual-theme (light/dark), CSS variables, card-based layouts, consistent page headers'
          },
          {
            type: 'status',
            variant: 'done',
            value: 'Sidebar Navigation — Collapsible, SVG logo with theme adaptation, section grouping, mobile responsive, user menu dropdown'
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
          },
          {
            type: 'status',
            variant: 'done',
            value: 'Service Catalog & Account Creation — Admin service catalog CRUD, multi-step account wizard with card-based service picker, dynamic credential forms driven by requiredFields JSON, 9 pre-configured services'
          },
          {
            type: 'status',
            variant: 'done',
            value: 'EF Core Migrations — Proper migration history for schema versioning via Add-Migration / Update-Database, replacing manual CreateTablesAsync()'
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
          },
          {
            type: 'status',
            variant: 'active',
            value: 'Email Service — Password reset tokens currently logged to console; email delivery service pending'
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
            value: 'Production Auth Certificates — Replace ephemeral signing/encryption keys with persistent X.509 certificates'
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
          },
          {
            type: 'status',
            variant: 'planned',
            value: 'Containerized Deployment — Dockerfiles for egibi-api and egibi-ui, Caddy reverse proxy, single-origin architecture for cloud migration (Railway, Hetzner, Azure)'
          }
        ]
      }
    ]
  };

  setActiveTab(tabId: string) {
    this.activeTab = tabId;
  }

  // Last updated timestamp
  lastUpdated = 'February 4, 2026';
}