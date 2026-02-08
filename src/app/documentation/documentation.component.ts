import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';

interface DocSection {
  id: string;
  title: string;
  content: DocBlock[];
}

interface DocBlock {
  type: 'text' | 'heading' | 'list' | 'schema' | 'code' | 'status' | 'diagram' | 'endpoint';
  value?: string;
  items?: string[];
  rows?: SchemaRow[];
  endpoints?: EndpointRow[];
  language?: string;
  variant?: 'done' | 'active' | 'planned' | 'info' | 'warning';
}

interface SchemaRow {
  column: string;
  type: string;
  purpose: string;
}

interface EndpointRow {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
  params?: string;
}

@Component({
  selector: 'documentation',
  standalone: true,
  imports: [CommonModule, NgbNavModule],
  templateUrl: './documentation.component.html',
  styleUrl: './documentation.component.scss'
})
export class DocumentationComponent {
  activeTab = 'overview';
  showScrollTop = false;

  @HostListener('window:scroll')
  onWindowScroll() {
    this.showScrollTop = window.scrollY > 400;
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  tabs: { id: string; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: 'overview' },
    { id: 'architecture', label: 'Architecture', icon: 'architecture' },
    { id: 'frontend', label: 'Frontend (UI)', icon: 'frontend' },
    { id: 'backend', label: 'Backend (API)', icon: 'backend' },
    { id: 'database', label: 'Database', icon: 'database' },
    { id: 'security', label: 'Security', icon: 'security' },
    { id: 'api', label: 'API Reference', icon: 'api' },
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
              'Authentication — OpenIddict 5.8 (OAuth 2.0 / OpenID Connect with Authorization Code + PKCE)',
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
              'appsettings.json — Base config (connection strings placeholders, QuestDb section, EgibiEnvironment, Encryption placeholder) — safe to commit',
              'appsettings.Development.json — Dev overrides with real secrets (master key, DB passwords, Plaid keys) — excluded from source control via .gitignore',
              'appsettings.Production.json — Prod overrides (EgibiEnvironment: PROD, external DB connections) — excluded from source control via .gitignore',
              '.gitignore — Prevents appsettings.Development.json and appsettings.Production.json from being committed'
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
              'StrategiesService — CRUD operations for trading strategies, backtest execution, data verification, coverage queries, available symbols',
              'BacktesterService — Legacy backtest management; new backtests run via StrategiesService',
              'DataProviderService — CRUD for data provider configurations',
              'ConnectionsService — Service catalog operations (list, create, update, delete exchange/broker/data provider definitions)',
              'AccountsService — Trading account CRUD, create-account flow with credential submission, account detail retrieval, credential/fee updates, connection testing',
              'TestingService — API testing and diagnostics',
              'StorageService — Disk monitoring, QuestDB partition archival/restore, OIDC cleanup, PostgreSQL backup'
            ]
          }
        ]
      },
      {
        id: 'strategies-ui',
        title: 'Strategies & Backtesting UI',
        content: [
          {
            type: 'text',
            value: 'The Strategies module (/strategies) provides a complete workflow for creating, managing, and backtesting trading strategies. The module consists of several components working together: a strategies list grid, strategy detail page with integrated backtesting, and a visual strategy builder.'
          },
          {
            type: 'heading',
            value: 'Strategy List (/strategies)'
          },
          {
            type: 'list',
            items: [
              'StrategiesGridComponent — AG Grid displaying all strategies with columns for name, description, symbol, interval, status, and backtest count',
              'Grid actions — Edit (navigates to /strategies/:id), Delete with confirmation modal',
              'New Strategy button — Navigates to /strategies/new which opens the strategy builder in create mode'
            ]
          },
          {
            type: 'heading',
            value: 'Strategy Detail (/strategies/:id)'
          },
          {
            type: 'list',
            items: [
              'StrategyDetailComponent — Parent container that loads strategy data and manages tab navigation',
              'Strategy Builder tab — Visual form for editing the strategy configuration (data source, entry/exit rules, risk management)',
              'Backtest Config tab — Configure and launch backtests with data verification pre-check',
              'Backtest Results tab — View detailed results including equity curve, trade log, and performance metrics',
              'Backtest History — Table of past backtests with summary stats, click to view full results'
            ]
          },
          {
            type: 'heading',
            value: 'Strategy Builder (StrategyBuilderComponent)'
          },
          {
            type: 'list',
            items: [
              'Data Source tab — Exchange account selector (optional for backtest-only), symbol input with QuestDB autocomplete, data source name, interval dropdown',
              'Entry & Exit Rules tab — Visual condition builder with indicator dropdowns, period inputs, operator selectors; add/remove conditions dynamically',
              'Risk Management tab — Stop-loss %, take-profit %, and position size % inputs with slider controls',
              'Independent error handling — Each API call (exchange accounts, available symbols, data coverage) fails gracefully without blocking the entire form',
              'Create/Update mode — Detected from route param (\"new\" vs numeric ID)'
            ]
          },
          {
            type: 'heading',
            value: 'Backtest Configuration (BacktestConfigComponent)'
          },
          {
            type: 'list',
            items: [
              'Date range picker — Start and end dates for the backtest period',
              'Initial capital input — Starting portfolio value',
              'Verify Data button — Calls POST /api/strategies/verify-data before running',
              'Color-coded status badges — Green ✓ (fully covered), Blue ↓ (auto-fetch available), Yellow ⚠ (partial, no fetcher), Red ✗ (no data)',
              'Run Backtest button — Disabled when status is NoData, enabled for all other statuses'
            ]
          },
          {
            type: 'heading',
            value: 'Backtest Results (BacktestResultsComponent)'
          },
          {
            type: 'list',
            items: [
              'Summary cards — Total return %, final capital, total trades, win rate, max drawdown, Sharpe ratio, profit factor',
              'Equity curve chart — Highcharts time-series showing portfolio value over the backtest period',
              'Trade log table — Entry/exit dates, prices, return %, PnL for each trade',
              'Export capability — Download results as JSON'
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
      },
      {
        id: 'account-detail-page',
        title: 'Account Detail Page',
        content: [
          {
            type: 'text',
            value: 'The Account Detail page (/accounts/:id) provides a comprehensive tabbed interface for viewing and managing a single account. The parent AccountComponent loads account data and passes it down to tab section components via @Input bindings.'
          },
          {
            type: 'heading',
            value: 'General Tab (GeneralComponent)'
          },
          {
            type: 'list',
            items: [
              'Editable fields — Account name, description, notes, account type (dropdown), active toggle',
              'Read-only metadata sidebar — Account ID, service name with brand color dot, category, created date, last modified date, service website link',
              'Reactive form with dirty tracking — Save and Cancel buttons only enabled when form has changes',
              'Calls PUT /Accounts/update-account on save'
            ]
          },
          {
            type: 'heading',
            value: 'API Tab (ApiComponent)'
          },
          {
            type: 'list',
            items: [
              'Base URL field — editable endpoint URL for the service connection',
              'Stored credentials read-only view — displays masked API key, masked API secret, passphrase indicator, username indicator, label, permissions, last used timestamp',
              'Edit mode — clears sensitive fields for re-entry, dynamically shows fields based on requiredFields from the Connection template',
              'Password-toggle visibility for secret fields, autocomplete disabled',
              'Calls PUT /Accounts/update-credentials on save — only non-empty fields are sent for re-encryption'
            ]
          },
          {
            type: 'heading',
            value: 'Fees Tab (FeesComponent)'
          },
          {
            type: 'list',
            items: [
              'Fee structure form — maker fee %, taker fee %, fee schedule type (flat, tiered, volume-based), notes',
              'Fee schedule type selector with radio-style options',
              'Reactive form with dirty tracking and cancel/reset support',
              'Calls PUT /Accounts/update-fees on save — creates or updates the AccountFeeStructureDetails record'
            ]
          },
          {
            type: 'heading',
            value: 'Status Tab (StatusComponent)'
          },
          {
            type: 'list',
            items: [
              'Connection details display — service name with brand color dot, base URL, credential status badge (Configured / Not configured)',
              'Test Connection button — sends POST /Accounts/test-connection to validate API connectivity',
              'Test results panel — shows success/failure status, HTTP status code, response time in ms, message, and timestamp',
              'Disabled state when no base URL is configured (prompts user to set it in the API tab)'
            ]
          },
          {
            type: 'heading',
            value: 'Architecture'
          },
          {
            type: 'list',
            items: [
              'AccountComponent (parent) loads AccountDetailResponse from GET /Accounts/get-account-detail and passes it to all child tab components',
              'Each tab component receives [account] as @Input and emits (saved) event to trigger parent reload',
              'ngbNav (ng-bootstrap) manages tab navigation with lazy-rendered content panels',
              'Status badge in page header shows Active/Inactive state'
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
              'Accounts — CRUD operations for trading accounts, POST /Accounts/create-account creates account linked to a service catalog Connection with encrypted credentials, GET /Accounts/get-account-detail returns full account with connection metadata + credential summary + fees, PUT /Accounts/update-account updates general properties, PUT /Accounts/update-credentials re-encrypts credential fields, PUT /Accounts/update-fees creates or updates fee structure, POST /Accounts/test-connection validates API connectivity',
              'Strategies — RESTful CRUD at /api/strategies, integrated backtest execution via BacktestExecutionService + IMarketDataService, data verification, coverage queries',
              'Backtests — Legacy CRUD at /Backtester; new backtests created via /api/strategies/{id}/backtest',
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
        id: 'strategy-system',
        title: 'Strategy System & Backtesting',
        content: [
          {
            type: 'text',
            value: 'The strategy system supports two modes: simple (UI-created) strategies with visual indicator-based rules, and code-only strategies implementing the IStrategy interface. The backtesting engine uses IMarketDataService for data access, enabling automatic gap-filling from exchanges during backtest execution.'
          },
          {
            type: 'heading',
            value: 'Strategy Configuration (JSON Schema)'
          },
          {
            type: 'text',
            value: 'UI-created strategies store their configuration in the Strategy.RulesConfiguration JSONB column. The configuration includes data source settings (symbol, source, interval), entry/exit conditions with indicator comparisons, and risk management parameters.'
          },
          {
            type: 'code',
            value: `{
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
}`
          },
          {
            type: 'heading',
            value: 'Available Indicators'
          },
          {
            type: 'list',
            items: [
              'PRICE — Raw closing price (no parameters)',
              'SMA — Simple Moving Average (configurable period, default 20)',
              'EMA — Exponential Moving Average (configurable period, default 20)',
              'RSI — Relative Strength Index using Wilder smoothing (configurable period, default 14)',
              'MACD — MACD Line (EMA12 - EMA26)',
              'MACD_SIGNAL — MACD Signal Line (EMA9 of MACD)',
              'MACD_HIST — MACD Histogram (MACD - Signal)',
              'BBANDS_UPPER — Bollinger Upper Band (configurable period, default 20, 2σ)',
              'BBANDS_MIDDLE — Bollinger Middle Band (SMA)',
              'BBANDS_LOWER — Bollinger Lower Band'
            ]
          },
          {
            type: 'heading',
            value: 'Condition Operators'
          },
          {
            type: 'list',
            items: [
              'GREATER_THAN — Left value > right value',
              'LESS_THAN — Left value < right value',
              'CROSSES_ABOVE — Left crosses from below to above right (previous bar below, current bar above)',
              'CROSSES_BELOW — Left crosses from above to below right',
              'EQUALS — Left value equals right value (with floating point tolerance)'
            ]
          },
          {
            type: 'heading',
            value: 'Backtest Execution Flow'
          },
          {
            type: 'diagram',
            value: `POST /api/strategies/{id}/backtest
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
                └── Full ResultJson (equity curve + trades)`
          },
          {
            type: 'heading',
            value: 'Result Metrics'
          },
          {
            type: 'list',
            items: [
              'Total Return % — (finalCapital - initialCapital) / initialCapital × 100',
              'Total Trades — Number of completed round-trip trades',
              'Win Rate — Percentage of profitable trades',
              'Max Drawdown % — Largest peak-to-trough decline in equity',
              'Sharpe Ratio — Risk-adjusted return (annualized)',
              'Profit Factor — Gross profit / gross loss',
              'Equity Curve — Array of { date, equity } for charting',
              'Trade Log — Array of { entryDate, exitDate, entryPrice, exitPrice, returnPct, pnl }'
            ]
          },
          {
            type: 'heading',
            value: 'Data Verification'
          },
          {
            type: 'text',
            value: 'Before running a backtest, the verify-data endpoint checks QuestDB for existing coverage and reports a status code. The UI displays color-coded badges: green (✓ FullyCovered), blue (↓ PartialWithFetch/FetchRequired — auto-download available), yellow (⚠ PartialCoverage — no fetcher, use what exists), red (✗ NoData — cannot run). Backtests are only blocked when status is NoData.'
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
              'DataManagerService, StrategiesService, BacktesterService, BacktestExecutionService',
              'ExchangesService, MarketsService, ExchangeAccountsService (all three now properly registered in DI)',
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
              'Encryption:MasterKey — Base64-encoded 32-byte key loaded from appsettings.Development.json (local) or environment variable (CI/CD). Never in source control.',
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
              { column: 'AccountDetails', type: 'Entity', purpose: 'Extended account info (URL, user reference)' },
              { column: 'AccountFeeStructureDetails', type: 'Entity', purpose: 'Per-account fee structure — maker/taker fee %, fee schedule type (flat/tiered/volume), linked to Account via AccountId FK' }
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
              { column: 'Strategy', type: 'Entity', purpose: 'Trading strategy definitions — Name, Description, RulesConfiguration (JSONB with indicator conditions, risk params), StrategyClassName (for coded strategies), IsSimple flag, ExchangeAccountId FK, IsActive' },
              { column: 'Backtest', type: 'Entity', purpose: 'Backtest runs — StrategyId FK, BacktestStatusId FK, StartDate, EndDate, InitialCapital, summary stats (FinalCapital, TotalReturnPct, TotalTrades, WinRate, MaxDrawdownPct, SharpeRatio), ResultJson (JSONB with equity curve + trade log)' },
              { column: 'BacktestStatus', type: 'Reference', purpose: 'Backtest lifecycle states (Pending, Running, Completed, Failed)' }
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
        id: 'secrets-management',
        title: 'Secrets Management & Master Key',
        content: [
          {
            type: 'text',
            value: 'The master encryption key must be generated before first run and stored securely — never in source control. Egibi supports multiple methods for generating and configuring the key.'
          },
          {
            type: 'heading',
            value: 'Generating a Master Key'
          },
          {
            type: 'text',
            value: 'Use any of the following methods to generate a cryptographically random 256-bit (32-byte) base64-encoded key:'
          },
          {
            type: 'heading',
            value: 'Option A — PowerShell (quick)'
          },
          {
            type: 'code',
            value: '[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }) -as [byte[]])'
          },
          {
            type: 'heading',
            value: 'Option B — C# Interactive (cryptographically secure)'
          },
          {
            type: 'code',
            value: `using System.Security.Cryptography;
Console.WriteLine(Convert.ToBase64String(RandomNumberGenerator.GetBytes(32)));`
          },
          {
            type: 'heading',
            value: 'Option C — EncryptionService Static Helper'
          },
          {
            type: 'code',
            value: `// Call from anywhere in the codebase or a test project:
var key = EncryptionService.GenerateMasterKey();
Console.WriteLine(key);`
          },
          {
            type: 'heading',
            value: 'Local Development'
          },
          {
            type: 'text',
            value: 'For local development, store the generated key in appsettings.Development.json under Encryption:MasterKey. This file is excluded from source control via .gitignore and will not be committed.'
          },
          {
            type: 'code',
            value: `// appsettings.Development.json
{
  "Encryption": {
    "MasterKey": "YOUR_GENERATED_BASE64_KEY_HERE"
  }
}`
          },
          {
            type: 'heading',
            value: 'CI/CD — GitHub Repository Secrets'
          },
          {
            type: 'text',
            value: '.NET reads environment variables with __ (double underscore) as the configuration section separator. For example, ENCRYPTION__MASTERKEY maps to Encryption:MasterKey in configuration. Configure these secrets on the egibi/egibi-api GitHub repository:'
          },
          {
            type: 'schema',
            rows: [
              { column: 'ENCRYPTION__MASTERKEY', type: 'string (base64)', purpose: 'AES-256 master encryption key (32 bytes, base64-encoded)' },
              { column: 'CONNECTIONSTRINGS__EGIBIDB', type: 'string', purpose: 'PostgreSQL connection string' },
              { column: 'CONNECTIONSTRINGS__QUESTDB', type: 'string', purpose: 'QuestDB connection string' },
              { column: 'PLAID__CLIENTID', type: 'string', purpose: 'Plaid API client ID' },
              { column: 'PLAID__SECRET', type: 'string', purpose: 'Plaid API secret' },
              { column: 'ADMINSEED__DEFAULTPASSWORD', type: 'string', purpose: 'Initial admin account password' }
            ]
          },
          {
            type: 'heading',
            value: 'GitHub Actions Example'
          },
          {
            type: 'code',
            value: `# In your GitHub Actions workflow:
env:
  Encryption__MasterKey: \${{ secrets.ENCRYPTION__MASTERKEY }}
  ConnectionStrings__EgibiDb: \${{ secrets.CONNECTIONSTRINGS__EGIBIDB }}
  ConnectionStrings__QuestDb: \${{ secrets.CONNECTIONSTRINGS__QUESTDB }}
  Plaid__ClientId: \${{ secrets.PLAID__CLIENTID }}
  Plaid__Secret: \${{ secrets.PLAID__SECRET }}
  AdminSeed__DefaultPassword: \${{ secrets.ADMINSEED__DEFAULTPASSWORD }}`
          },
          {
            type: 'heading',
            value: 'Files Excluded from Source Control (.gitignore)'
          },
          {
            type: 'list',
            items: [
              'appsettings.Development.json — Local dev secrets (master key, DB passwords, Plaid keys)',
              'appsettings.Production.json — Production secrets and connection strings'
            ]
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
              'The old Encryptor.cs (PBKDF2+AES-CBC) has been removed — use EncryptionService for all encryption',
              'All controllers require [Authorize] — no unauthenticated access to any endpoint except /auth/* and /connect/*',
              'ExchangeAccount entity no longer contains plaintext Username/Password fields — credentials stored only in encrypted UserCredential',
              'Connection entity no longer copies ApiKey/ApiSecretKey during create/update — legacy plaintext fields deprecated',
              'Admin seed password loaded from configuration (AdminSeed:DefaultPassword), not hardcoded',
              'Upload limit enforced at 100 MB (FormOptions.MultipartBodyLengthLimit) to prevent abuse',
              'DateTime operations use DateTime.UtcNow consistently (not DateTime.Now.ToUniversalTime())',
              'Auth interceptor retries the original failed request after successful token refresh',
              'Archived data on external disk retains the same security posture — no credentials are stored in QuestDB partitions or pg_dump backups (credentials are encrypted in PostgreSQL)',
              'Storage operations (archive, restore, backup) require authentication via [Authorize] on StorageController'
            ]
          }
        ]
      }
    ],

    api: [
      {
        id: 'api-overview',
        title: 'API Overview',
        content: [
          {
            type: 'text',
            value: 'The Egibi API is a .NET 8 ASP.NET Core Web API running on port 5000 (HTTP) / 7182 (HTTPS). All endpoints return a standardized RequestResponse wrapper unless otherwise noted. Swagger UI is available in Development mode at /swagger.'
          },
          {
            type: 'text',
            value: 'Protected endpoints require a Bearer token obtained via the Authorization Code + PKCE flow. The OpenIddict OIDC endpoints (/connect/*) and auth endpoints (/auth/*) are public.'
          },
          {
            type: 'heading',
            value: 'Response Format'
          },
          {
            type: 'code',
            value: `{
  "responseData": <T>,    // Payload (object, array, or null)
  "isSuccess": true,       // Operation result
  "message": "..."         // Status message
}`
          }
        ]
      },
      {
        id: 'api-auth',
        title: 'Authentication & Authorization',
        content: [
          {
            type: 'text',
            value: 'OpenIddict OIDC endpoints handle the OAuth 2.0 token lifecycle. The /auth/* endpoints provide the custom login, signup, and password reset flows that integrate with the OIDC server.'
          },
          {
            type: 'heading',
            value: 'OIDC Endpoints'
          },
          {
            type: 'endpoint',
            endpoints: [
              { method: 'GET', path: '/connect/authorize', description: 'Initiate authorization code flow', params: 'client_id, code_challenge, code_challenge_method, response_type, redirect_uri, state' },
              { method: 'POST', path: '/connect/authorize', description: 'Authorization code flow (form post)' },
              { method: 'POST', path: '/connect/token', description: 'Exchange authorization code for tokens', params: 'grant_type, code, code_verifier, client_id, redirect_uri' },
              { method: 'GET', path: '/connect/userinfo', description: 'Get authenticated user claims' },
              { method: 'POST', path: '/connect/logout', description: 'Revoke tokens and end session' }
            ]
          },
          {
            type: 'heading',
            value: 'Auth Endpoints'
          },
          {
            type: 'endpoint',
            endpoints: [
              { method: 'POST', path: '/auth/login', description: 'Validate credentials and set auth cookie', params: 'Body: { email, password }' },
              { method: 'POST', path: '/auth/signup', description: 'Register a new user account', params: 'Body: { email, password, confirmPassword }' },
              { method: 'POST', path: '/auth/forgot-password', description: 'Request a password reset token', params: 'Body: { email }' },
              { method: 'POST', path: '/auth/reset-password', description: 'Reset password using token', params: 'Body: { token, email, newPassword }' }
            ]
          }
        ]
      },
      {
        id: 'api-accounts',
        title: 'Accounts',
        content: [
          {
            type: 'text',
            value: 'Manage trading accounts, credentials, fees, and connection testing. Accounts are linked to a connection (service) and account type.'
          },
          {
            type: 'endpoint',
            endpoints: [
              { method: 'GET', path: '/Accounts/get-accounts', description: 'List all accounts' },
              { method: 'GET', path: '/Accounts/get-account', description: 'Get account by ID', params: 'id (query)' },
              { method: 'GET', path: '/Accounts/get-account-detail', description: 'Get full account detail (general, credentials, fees)', params: 'id (query)' },
              { method: 'GET', path: '/Accounts/get-account-types', description: 'List available account types' },
              { method: 'POST', path: '/Accounts/create-account', description: 'Create a new account', params: 'Body: CreateAccountRequest' },
              { method: 'POST', path: '/Accounts/save-account', description: 'Save/update an account', params: 'Body: Account' },
              { method: 'POST', path: '/Accounts/save-account-details', description: 'Save extended account details', params: 'Body: AccountDetails' },
              { method: 'PUT', path: '/Accounts/update-account', description: 'Update account properties', params: 'Body: UpdateAccountRequest' },
              { method: 'PUT', path: '/Accounts/update-credentials', description: 'Update account API credentials', params: 'Body: UpdateCredentialsRequest' },
              { method: 'PUT', path: '/Accounts/update-fees', description: 'Update account fee structure', params: 'Body: UpdateAccountFeesRequest' },
              { method: 'POST', path: '/Accounts/test-connection', description: 'Test account API connectivity', params: 'accountId (query)' },
              { method: 'DELETE', path: '/Accounts/delete-account', description: 'Delete a single account', params: 'id (query)' },
              { method: 'DELETE', path: '/Accounts/delete-accounts', description: 'Delete multiple accounts', params: 'ids (query)' }
            ]
          }
        ]
      },
      {
        id: 'api-connections',
        title: 'Connections (Services)',
        content: [
          {
            type: 'text',
            value: 'Connections represent configured exchange or broker services (e.g., Binance, Coinbase). Managed via the Admin service catalog.'
          },
          {
            type: 'endpoint',
            endpoints: [
              { method: 'GET', path: '/Connections/get-connections', description: 'List all connections' },
              { method: 'GET', path: '/Connections/get-connection', description: 'Get connection by ID', params: 'connectionId (query)' },
              { method: 'GET', path: '/Connections/get-connection-types', description: 'List connection types' },
              { method: 'POST', path: '/Connections/save-connection', description: 'Create or update a connection', params: 'Body: Connection' },
              { method: 'DELETE', path: '/Connections/delete-connection', description: 'Delete a single connection', params: 'id (query)' },
              { method: 'DELETE', path: '/Connections/delete-connections', description: 'Delete multiple connections', params: 'connectionIds (query)' }
            ]
          }
        ]
      },
      {
        id: 'api-exchanges',
        title: 'Exchanges',
        content: [
          {
            type: 'text',
            value: 'Exchange definitions and exchange account management.'
          },
          {
            type: 'heading',
            value: 'Exchanges'
          },
          {
            type: 'endpoint',
            endpoints: [
              { method: 'GET', path: '/Exchanges/get-exchanges', description: 'List all exchanges' },
              { method: 'GET', path: '/Exchanges/get-exchange', description: 'Get exchange by ID', params: 'id (query)' },
              { method: 'GET', path: '/Exchanges/get-exchange-types', description: 'List exchange types' },
              { method: 'POST', path: '/Exchanges/save-exchange', description: 'Create or update an exchange', params: 'Body: Exchange' },
              { method: 'DELETE', path: '/Exchanges/delete-exchange', description: 'Delete a single exchange', params: 'id (query)' },
              { method: 'DELETE', path: '/Exchanges/delete-exchanges', description: 'Delete multiple exchanges', params: 'ids (query)' }
            ]
          },
          {
            type: 'heading',
            value: 'Exchange Accounts'
          },
          {
            type: 'endpoint',
            endpoints: [
              { method: 'GET', path: '/ExchangeAccounts/get-exchange-accounts', description: 'List all exchange accounts' },
              { method: 'GET', path: '/ExchangeAccounts/get-exchange-account', description: 'Get exchange account by ID', params: 'id (query)' }
            ]
          }
        ]
      },
      {
        id: 'api-markets',
        title: 'Markets',
        content: [
          {
            type: 'text',
            value: 'Trading pairs and market definitions.'
          },
          {
            type: 'endpoint',
            endpoints: [
              { method: 'GET', path: '/Markets/get-markets', description: 'List all markets' },
              { method: 'GET', path: '/Markets/get-market', description: 'Get market by ID', params: 'id (query)' },
              { method: 'POST', path: '/Markets/save-market', description: 'Create or update a market', params: 'Body: Market' },
              { method: 'DELETE', path: '/Markets/delete-market', description: 'Delete a single market', params: 'id (query)' },
              { method: 'DELETE', path: '/Markets/delete-markets', description: 'Delete multiple markets', params: 'ids (query)' }
            ]
          }
        ]
      },
      {
        id: 'api-strategies',
        title: 'Strategies & Backtesting',
        content: [
          {
            type: 'text',
            value: 'RESTful strategy management with integrated backtesting. The StrategiesController handles strategy CRUD, backtest execution via BacktestExecutionService, data verification, and coverage queries. Backtests are executed using IMarketDataService which auto-fetches missing candles from exchanges.'
          },
          {
            type: 'heading',
            value: 'Strategy CRUD'
          },
          {
            type: 'endpoint',
            endpoints: [
              { method: 'GET', path: '/api/strategies', description: 'List all strategies with backtest counts' },
              { method: 'GET', path: '/api/strategies/{id}', description: 'Get strategy by ID with configuration', params: 'id (route)' },
              { method: 'POST', path: '/api/strategies', description: 'Create a new strategy', params: 'Body: { name, description, configuration }' },
              { method: 'PUT', path: '/api/strategies/{id}', description: 'Update an existing strategy', params: 'Body: { name, description, configuration }' },
              { method: 'DELETE', path: '/api/strategies/{id}', description: 'Delete strategy and all associated backtests', params: 'id (route)' }
            ]
          },
          {
            type: 'heading',
            value: 'Backtest Execution'
          },
          {
            type: 'endpoint',
            endpoints: [
              { method: 'POST', path: '/api/strategies/{id}/backtest', description: 'Run backtest — fetches candles via IMarketDataService (auto-fills gaps), runs SimpleBacktestEngine, saves results', params: 'Body: { name, startDate, endDate, initialCapital }' },
              { method: 'GET', path: '/api/strategies/{id}/backtests', description: 'Get backtest history for a strategy (summary stats)', params: 'id (route)' },
              { method: 'GET', path: '/api/strategies/backtests/{backtestId}', description: 'Get full backtest result including equity curve and trade log', params: 'backtestId (route)' }
            ]
          },
          {
            type: 'heading',
            value: 'Data Verification'
          },
          {
            type: 'endpoint',
            endpoints: [
              { method: 'POST', path: '/api/strategies/verify-data', description: 'Check data availability before running a backtest — returns coverage status and whether auto-fetch can fill gaps', params: 'Body: { symbol, source, interval, startDate, endDate }' },
              { method: 'GET', path: '/api/strategies/data-coverage', description: 'Get all stored data coverage grouped by symbol/source/interval' },
              { method: 'GET', path: '/api/strategies/available-symbols', description: 'List distinct symbols available in QuestDB' }
            ]
          },
          {
            type: 'heading',
            value: 'Verification Status Codes'
          },
          {
            type: 'list',
            items: [
              'FullyCovered — All requested data exists in QuestDB, backtest can run immediately',
              'PartialWithFetch — Some data in QuestDB, gaps can be auto-fetched from exchange (e.g., Binance)',
              'FetchRequired — No data in QuestDB but a fetcher is available for the source, full download needed',
              'PartialCoverage — Some data exists but no fetcher available for the source, backtest will use available data only',
              'NoData — No data and no fetcher available, backtest cannot run'
            ]
          }
        ]
      },
      {
        id: 'api-backtester',
        title: 'Backtester (Legacy)',
        content: [
          {
            type: 'text',
            value: 'Legacy backtest management endpoints. New backtests should be created via the Strategies controller (/api/strategies/{id}/backtest). These endpoints remain for backward compatibility with the standalone backtester grid.'
          },
          {
            type: 'endpoint',
            endpoints: [
              { method: 'GET', path: '/Backtester/get-backtests', description: 'List all backtests' },
              { method: 'GET', path: '/Backtester/get-backtest', description: 'Get backtest by ID', params: 'backtestId (query)' },
              { method: 'GET', path: '/Backtester/get-data-sources', description: 'List available data sources for backtesting' },
              { method: 'POST', path: '/Backtester/save-backtest', description: 'Create or update a backtest', params: 'Body: Backtest' },
              { method: 'POST', path: '/Backtester/run-backtest', description: 'Execute a backtest' },
              { method: 'POST', path: '/Backtester/upload-historical-data-file', description: 'Upload historical data file', params: 'Form: IFormFile' },
              { method: 'DELETE', path: '/Backtester/delete-backtest', description: 'Delete a single backtest', params: 'backtestId (query)' },
              { method: 'DELETE', path: '/Backtester/delete-backtests', description: 'Delete multiple backtests', params: 'backtestIds (query)' }
            ]
          }
        ]
      },
      {
        id: 'api-market-data',
        title: 'Market Data',
        content: [
          {
            type: 'text',
            value: 'OHLC candle data retrieval from QuestDB, symbol listings, data coverage, and fetcher information.'
          },
          {
            type: 'endpoint',
            endpoints: [
              { method: 'POST', path: '/MarketData/get-candles', description: 'Retrieve OHLC candles for a symbol', params: 'Body: MarketDataRequest' },
              { method: 'POST', path: '/MarketData/import-candles', description: 'Import candle data', params: 'Body: List<Candle>' },
              { method: 'GET', path: '/MarketData/get-symbols', description: 'List all available symbols' },
              { method: 'GET', path: '/MarketData/get-source-summaries', description: 'Get data source summaries for a symbol', params: 'symbol (query)' },
              { method: 'GET', path: '/MarketData/get-coverage', description: 'Get data coverage information', params: 'symbol, source, interval (query)' },
              { method: 'GET', path: '/MarketData/get-fetchers', description: 'List available data fetchers' }
            ]
          }
        ]
      },
      {
        id: 'api-data-manager',
        title: 'Data Manager',
        content: [
          {
            type: 'text',
            value: 'Data provider management, file uploads, and QuestDB table operations.'
          },
          {
            type: 'heading',
            value: 'Data Providers'
          },
          {
            type: 'endpoint',
            endpoints: [
              { method: 'GET', path: '/DataManager/get-data-providers', description: 'List all data providers' },
              { method: 'GET', path: '/DataManager/get-data-provider', description: 'Get data provider by ID', params: 'id (query)' },
              { method: 'GET', path: '/DataManager/get-data-provider-types', description: 'List data provider types' },
              { method: 'GET', path: '/DataManager/get-data-frequency-types', description: 'List data frequency types' },
              { method: 'GET', path: '/DataManager/get-data-format-types', description: 'List data format types' },
              { method: 'POST', path: '/DataManager/save-data-provider', description: 'Create or update a data provider', params: 'Body: DataProvider' },
              { method: 'DELETE', path: '/DataManager/delete-data-provider', description: 'Delete a data provider', params: 'id (query)' }
            ]
          },
          {
            type: 'heading',
            value: 'QuestDB Operations'
          },
          {
            type: 'endpoint',
            endpoints: [
              { method: 'GET', path: '/DataManager/get-questdb-tables', description: 'List all QuestDB tables' },
              { method: 'POST', path: '/DataManager/create-questdb-table', description: 'Create a new QuestDB table', params: 'Body: QuestDbTable' },
              { method: 'POST', path: '/DataManager/drop-questdb-table', description: 'Drop a QuestDB table', params: 'tableName (query)' },
              { method: 'POST', path: '/DataManager/drop-file', description: 'Upload a data file', params: 'Form: IFormFile' }
            ]
          }
        ]
      },
      {
        id: 'api-storage',
        title: 'Storage Management',
        content: [
          {
            type: 'text',
            value: 'Tiered storage operations including partition archival/restoration, PostgreSQL backups, and OIDC token cleanup.'
          },
          {
            type: 'endpoint',
            endpoints: [
              { method: 'GET', path: '/Storage/config', description: 'Get storage configuration' },
              { method: 'PUT', path: '/Storage/config', description: 'Update storage configuration', params: 'Body: StorageConfig' },
              { method: 'GET', path: '/Storage/status', description: 'Get disk usage and storage status' },
              { method: 'GET', path: '/Storage/partitions', description: 'List QuestDB partitions with archive status' },
              { method: 'POST', path: '/Storage/archive', description: 'Archive partitions to external disk', params: 'Body: ArchiveRequest' },
              { method: 'POST', path: '/Storage/restore', description: 'Restore partition from external disk', params: 'Body: RestoreRequest' },
              { method: 'POST', path: '/Storage/cleanup', description: 'Prune expired OIDC tokens' },
              { method: 'GET', path: '/Storage/backups', description: 'List available PostgreSQL backups' },
              { method: 'POST', path: '/Storage/backup', description: 'Create a PostgreSQL backup' },
              { method: 'GET', path: '/Storage/log', description: 'Get archive activity log', params: 'limit (query, default: 50)' }
            ]
          }
        ]
      },
      {
        id: 'api-config',
        title: 'Configuration & Settings',
        content: [
          {
            type: 'text',
            value: 'Entity type management (reference tables), account user administration, and geographic/timezone data.'
          },
          {
            type: 'heading',
            value: 'Entity Types'
          },
          {
            type: 'endpoint',
            endpoints: [
              { method: 'GET', path: '/AppConfigurations/get-entity-type-tables', description: 'List all entity type tables' },
              { method: 'GET', path: '/AppConfigurations/get-entity-type-records', description: 'Get records for an entity type table', params: 'tableName (query)' },
              { method: 'POST', path: '/AppConfigurations/save-entity-type', description: 'Create or update an entity type', params: 'Body: EntityType' },
              { method: 'POST', path: '/AppConfigurations/delete-entity-type', description: 'Delete an entity type', params: 'Body: EntityType' }
            ]
          },
          {
            type: 'heading',
            value: 'Account Users'
          },
          {
            type: 'endpoint',
            endpoints: [
              { method: 'GET', path: '/AppConfigurations/get-account-users', description: 'List all account users' },
              { method: 'POST', path: '/AppConfigurations/save-account-user', description: 'Create or update an account user', params: 'Body: AccountUser' },
              { method: 'POST', path: '/AppConfigurations/delete-account-user', description: 'Delete an account user', params: 'Body: AccountUser' }
            ]
          },
          {
            type: 'heading',
            value: 'Reference Data'
          },
          {
            type: 'endpoint',
            endpoints: [
              { method: 'GET', path: '/AppConfigurations/get-country-data', description: 'Get all country records' },
              { method: 'GET', path: '/AppConfigurations/get-timezone-data', description: 'Get all timezone records' }
            ]
          }
        ]
      },
      {
        id: 'api-system',
        title: 'System & Diagnostics',
        content: [
          {
            type: 'text',
            value: 'Environment detection, API connectivity testing, and server time.'
          },
          {
            type: 'endpoint',
            endpoints: [
              { method: 'GET', path: '/Environment/get-environment', description: 'Get runtime environment info (DEV/PROD)' },
              { method: 'GET', path: '/ApiTester/test-connection', description: 'Test API connectivity' },
              { method: 'GET', path: '/ApiTester/get-server-time', description: 'Get current server time' }
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
          },
          {
            type: 'status',
            variant: 'done',
            value: 'Account Detail Page — Tabbed account management UI (/accounts/:id) with General (editable properties + metadata sidebar), API (base URL + credential read/edit with masked display), Fees (maker/taker % + schedule type), and Status (connection testing with response metrics) tabs'
          },
          {
            type: 'status',
            variant: 'done',
            value: 'Strategy Builder — Visual strategy creation UI with tabbed configuration (Data Source, Entry & Exit Rules, Risk Management), indicator-based condition builder, QuestDB symbol autocomplete, independent error handling per API call'
          },
          {
            type: 'status',
            variant: 'done',
            value: 'Backtest Engine — BacktestExecutionService with IMarketDataService integration (auto-fetches missing data from exchanges), SimpleBacktestEngine with indicator calculations (SMA, EMA, RSI, MACD, Bollinger Bands), condition evaluation with crossover detection, stop-loss/take-profit/position sizing'
          },
          {
            type: 'status',
            variant: 'done',
            value: 'Backtest Results — Full result storage in PostgreSQL (summary stats + JSONB equity curve and trade log), backtest history grid per strategy, detailed result view with performance metrics'
          },
          {
            type: 'status',
            variant: 'done',
            value: 'Data Verification — Pre-backtest data availability check via verify-data endpoint, color-coded UI status badges (FullyCovered, PartialWithFetch, FetchRequired, PartialCoverage, NoData), coverage and available-symbols queries'
          },
          {
            type: 'status',
            variant: 'done',
            value: 'Strategies API — RESTful /api/strategies controller with full CRUD, integrated backtest execution (POST /{id}/backtest), backtest history, cascade delete (strategy + all backtests)'
          },
          {
            type: 'status',
            variant: 'done',
            value: 'Security Audit & Hardening — Removed hardcoded secrets from appsettings (master key, DB passwords), added .gitignore for sensitive config files, added [Authorize] to all 11 controllers, removed plaintext credential fields from ExchangeAccount entity, removed legacy dead code (Encryptor.cs, ConfigOptions.cs, OverviewService.cs), fixed async delete bug in ExchangeAccountsService, enforced 100 MB upload limit, consistent UTC datetime usage'
          },
          {
            type: 'status',
            variant: 'done',
            value: 'Secrets Management — Master key generation (PowerShell, C# Interactive, EncryptionService.GenerateMasterKey()), GitHub repository secrets for CI/CD, environment variable mapping (double-underscore convention), .gitignore exclusion of appsettings.Development.json and appsettings.Production.json'
          },
          {
            type: 'status',
            variant: 'done',
            value: 'Auth Token Refresh — Replaced setTimeout-based refresh with timestamp tracking (isTokenExpiringSoon()), added refresh deduplication to prevent concurrent refresh requests, interceptor now retries original failed request after successful token refresh'
          },
          {
            type: 'status',
            variant: 'done',
            value: 'Environment-Based API URLs — Frontend services use environment.apiUrl (configurable per environment) instead of hardcoded localhost URLs, production CORS policy configurable via Cors:AllowedOrigins'
          },
          {
            type: 'status',
            variant: 'done',
            value: 'Credential Storage — EncryptionService registered in Program.cs DI, Connection entity legacy plaintext fields deprecated, credentials stored exclusively in encrypted UserCredential via per-user DEK'
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
            value: 'AppUser Migration — Consolidating AccountUser into AppUser entity'
          },
          {
            type: 'status',
            variant: 'active',
            value: 'Email Service — Password reset tokens currently logged to console; email delivery service pending'
          },
          {
            type: 'status',
            variant: 'active',
            value: 'Remaining UI Service URL Migration — 19 Angular services still use hardcoded localhost URLs; migrating to environment.apiUrl pattern'
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
  lastUpdated = 'February 8, 2026';
}