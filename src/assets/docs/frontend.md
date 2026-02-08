# Authentication Pages

All authentication pages render as standalone full-screen layouts (no sidebar or header). The app shell detects auth routes via a reactive isAuthPage() computed signal and conditionally hides the navigation chrome. Each auth page uses the egibi lion logo and shared auth-page styles.

### Auth Pages

- **/auth/login** — Email + password form with visibility toggle, triggers OIDC PKCE flow on success
- **/auth/signup** — Registration with firstName, lastName, email, password + confirm; live password strength indicators
- **/auth/forgot-password** — Email input; always shows success message to prevent email enumeration
- **/auth/reset-password** — Token-based password reset from query params (email + token); validates and sets new password
- **/auth/callback** — OIDC redirect handler; extracts authorization code + state, exchanges for tokens

### Password Requirements (enforced on signup and reset)

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

### Route Guards

All application routes except /auth/* are protected by authGuard (CanActivateFn). If the user is not authenticated, the guard stores the attempted URL in sessionStorage (auth_return_url) and redirects to /auth/login. After successful login, the user is redirected back to their originally requested page.

# Design System

The UI follows a dual-theme design system with CSS custom properties defined in styles.scss. The light theme draws from Wealthfolio's clean aesthetic, while the dark theme uses a Gathermed-inspired palette with deep backgrounds and teal (#1fb8a2) accents.

### Page Layout Pattern

- **Container** — space-y-6 wrapper for consistent vertical spacing
- **Page Header** — page-header with page-title and page-subtitle
- **Content Cards** — Bootstrap card with card-header (title + description) and card-body
- **Data Grids** — AG Grid wrapped in card components with theme-aware styling
- **Modals** — Standardized create/edit/delete modal templates per entity

### Theme Variables

All colors use HSL values via CSS custom properties (e.g., --egibi-primary, --egibi-card, --egibi-border). Components reference these variables to automatically adapt between light and dark themes. Theme toggle is in the sidebar footer.

# Sidebar & Navigation

- **Collapsible sidebar** with expanded (260px) and collapsed (64px) states
- **State persisted** to localStorage across sessions
- **SVG logo** with inline viewBox cropping — shows lion + wordmark when expanded, lion only when collapsed
- **Logo uses currentColor** for automatic theme adaptation
- **Section-grouped navigation** — Dashboard, Portfolio, Trading, System
- **Mobile-responsive** with overlay mode on screens < 992px
- **Tooltips** appear on collapsed nav items for accessibility
- **User menu dropdown** in the header bar — displays name, email, and sign out button

### Breadcrumb Navigation

BreadcrumbService builds hierarchical navigation paths (e.g., "Dashboard › Portfolio › Accounts") from route configuration. Routes are mapped to section groups (Portfolio, Trading, System) with clickable parent links. Breadcrumbs replace redundant page titles across all pages.

# Key Angular Services

### Authentication Services

- **AuthService** — Manages OIDC PKCE flow: login, signup, logout, token exchange, silent refresh, session restore
- **authGuard** — CanActivateFn that checks isAuthenticated() and redirects to /auth/login with return URL
- **authInterceptor** — HttpInterceptorFn that attaches Bearer tokens to API requests and handles 401 refresh/logout

### Core Services

- **ThemeService** — Manages light/dark mode toggle, persists to localStorage, applies data-theme attribute
- **EnvironmentService** — Loads runtime environment config from API with signals (environment(), isProduction(), loaded())
- **BreadcrumbService** — Builds hierarchical breadcrumbs from route config with section grouping (Portfolio, Trading, System)
- **ToastService** — Application-wide toast notification management
- **EgibiSharedService** — Shared utilities and common functions

### Visualization Services

- **AgGridThemeService** — Theme-aware AG Grid configuration, syncs grid appearance with light/dark mode
- **HighchartsThemeService** — Highcharts theme configuration matching current theme colors
- **FileDropService** — File drag-and-drop handling for data imports

### Domain Services

- **StrategiesService** — CRUD operations for trading strategies, backtest execution, data verification, coverage queries, available symbols
- **BacktesterService** — Legacy backtest management; new backtests run via StrategiesService
- **DataProviderService** — CRUD for data provider configurations
- **ConnectionsService** — Service catalog operations (list, create, update, delete exchange/broker/data provider definitions)
- **AccountsService** — Trading account CRUD, create-account flow with credential submission, account detail retrieval, credential/fee updates, connection testing
- **TestingService** — API testing and diagnostics
- **StorageService** — Disk monitoring, QuestDB partition archival/restore, OIDC cleanup, PostgreSQL backup

# Strategies & Backtesting UI

The Strategies module (/strategies) provides a complete workflow for creating, managing, and backtesting trading strategies. The module consists of several components working together: a strategies list grid, strategy detail page with integrated backtesting, and a visual strategy builder.

### Strategy List (/strategies)

- **StrategiesGridComponent** — AG Grid displaying all strategies with columns for name, description, symbol, interval, status, and backtest count
- **Grid actions** — Edit (navigates to /strategies/:id), Delete with confirmation modal
- **New Strategy button** — Navigates to /strategies/new which opens the strategy builder in create mode

### Strategy Detail (/strategies/:id)

- **StrategyDetailComponent** — Parent container that loads strategy data and manages tab navigation
- **Strategy Builder tab** — Visual form for editing the strategy configuration (data source, entry/exit rules, risk management)
- **Backtest Config tab** — Configure and launch backtests with data verification pre-check
- **Backtest Results tab** — View detailed results including equity curve, trade log, and performance metrics
- **Backtest History** — Table of past backtests with summary stats, click to view full results

### Strategy Builder (StrategyBuilderComponent)

- **Data Source tab** — Exchange account selector (optional for backtest-only), symbol input with QuestDB autocomplete, data source name, interval dropdown
- **Entry & Exit Rules tab** — Visual condition builder with indicator dropdowns, period inputs, operator selectors; add/remove conditions dynamically
- **Risk Management tab** — Stop-loss %, take-profit %, and position size % inputs with slider controls
- **Independent error handling** — Each API call (exchange accounts, available symbols, data coverage) fails gracefully without blocking the entire form
- **Create/Update mode** — Detected from route param ("new" vs numeric ID)

### Backtest Configuration (BacktestConfigComponent)

- **Date range picker** — Start and end dates for the backtest period
- **Initial capital input** — Starting portfolio value
- **Verify Data button** — Calls POST /api/strategies/verify-data before running
- **Color-coded status badges** — Green ✓ (fully covered), Blue ↓ (auto-fetch available), Yellow ⚠ (partial, no fetcher), Red ✗ (no data)
- **Run Backtest button** — Disabled when status is NoData, enabled for all other statuses

### Backtest Results (BacktestResultsComponent)

- **Summary cards** — Total return %, final capital, total trades, win rate, max drawdown, Sharpe ratio, profit factor
- **Equity curve chart** — Highcharts time-series showing portfolio value over the backtest period
- **Trade log table** — Entry/exit dates, prices, return %, PnL for each trade
- **Export capability** — Download results as JSON

# Storage Management Page

The Storage Management page (/storage) provides a full UI for monitoring disk usage, managing QuestDB partition archival, configuring retention policies, and performing database maintenance — all from within the app.

### Tabs

- **Overview** — Disk usage gauges for Docker volume and external disk, threshold warnings, quick action buttons (Archive, Cleanup OIDC, Backup PostgreSQL)
- **Partitions** — Hot partition table with row counts, sizes, date ranges, and checkbox selection for archiving; archived partition table with one-click restore
- **Backups** — PostgreSQL backup list on external disk with create button; auto-prunes old backups per config
- **Configuration** — External disk path, threshold %, hot data retention months, auto-archive interval, max backups, auto-archive toggle
- **Activity Log** — Chronological history of all archive, restore, cleanup, and backup operations with success/failure status

# Admin — Service Catalog

The Service Catalog tab in Admin (/admin) provides a management interface for configuring which exchanges, brokers, and data providers are available for users to connect to when creating accounts. Each service entry defines the metadata and required credential fields that drive the dynamic account creation form.

### Service Properties

- **Name** — Display name (e.g., Binance US, Alpaca, Alpha Vantage)
- **Category** — Classification: Crypto Exchange, Stock Broker, Data Provider, or Other
- **Icon Key** — Identifier for service icon rendering (e.g., binance, coinbase, schwab)
- **Brand Color** — Hex color for icon backgrounds and UI accents
- **Website** — Service homepage URL
- **Default Base URL** — Pre-filled API base URL for the connection
- **Required Fields** — Toggle buttons for which credentials the service needs: API Key, API Secret, Passphrase, Username, Password, Base URL
- **Sort Order** — Display ordering within category groups
- **Is Data Source** — Whether the service provides market data

### Seed Data

Nine services are pre-configured via DbSetup.cs: Binance US, Coinbase, Coinbase Pro, Kraken (crypto), Charles Schwab, Alpaca, Interactive Brokers (stock), Alpha Vantage, and Polygon.io (data providers). Each includes category, brand color, default API base URL, and required credential field configuration.

# Accounts — Add Account Flow

The Accounts page (/accounts) uses a multi-step modal wizard for creating new accounts. The wizard is driven by the service catalog — selecting a service pre-fills connection details and dynamically renders only the credential fields that service requires.

### Step 1 — Pick a Service

- **Card grid** grouped by category (Crypto Exchange, Stock Broker, Data Provider)
- **Search/filter bar** to find services by name
- **Each card** shows service icon (brand color), name, and description
- **Selecting a card** pre-fills account name, base URL, and credential label from the Connection template
- **Custom option** (dashed-border card) for unlisted services with manual configuration

### Step 2 — Configure Connection

- **Account details section** — name, description, account type dropdown
- **Credentials section** — dynamically rendered based on Connection.requiredFields JSON
- **Password-toggle visibility** for secret fields (API keys, secrets, passwords)
- **Credential label field** (e.g., "Production Keys", "Read-Only")
- **Security notice badge** showing AES-256-GCM encryption
- **Credentials are submitted** as plaintext to the API which encrypts them with the user DEK before storage in UserCredential

### Architecture

- **Connection entity** = service catalog template (what services are available)
- **Account entity** links to Connection via ConnectionId FK (which service was selected)
- **UserCredential entity** stores encrypted API keys per user per connection
- **AddAccountModalComponent** receives connections and accountTypes as modal inputs
- **Modal emits** CreateAccountRequest on save, parent calls POST /Accounts/create-account

# Account Detail Page

The Account Detail page (/accounts/:id) provides a comprehensive tabbed interface for viewing and managing a single account. The parent AccountComponent loads account data and passes it down to tab section components via @Input bindings.

### General Tab (GeneralComponent)

- **Editable fields** — Account name, description, notes, account type (dropdown), active toggle
- **Read-only metadata sidebar** — Account ID, service name with brand color dot, category, created date, last modified date, service website link
- **Reactive form** with dirty tracking — Save and Cancel buttons only enabled when form has changes
- **Calls** PUT /Accounts/update-account on save

### API Tab (ApiComponent)

- **Base URL field** — editable endpoint URL for the service connection
- **Stored credentials read-only view** — displays masked API key, masked API secret, passphrase indicator, username indicator, label, permissions, last used timestamp
- **Edit mode** — clears sensitive fields for re-entry, dynamically shows fields based on requiredFields from the Connection template
- **Password-toggle visibility** for secret fields, autocomplete disabled
- **Calls** PUT /Accounts/update-credentials on save — only non-empty fields are sent for re-encryption

### Fees Tab (FeesComponent)

- **Fee structure form** — maker fee %, taker fee %, fee schedule type (flat, tiered, volume-based), notes
- **Fee schedule type selector** with radio-style options
- **Reactive form** with dirty tracking and cancel/reset support
- **Calls** PUT /Accounts/update-fees on save — creates or updates the AccountFeeStructureDetails record

### Status Tab (StatusComponent)

- **Connection details display** — service name with brand color dot, base URL, credential status badge (Configured / Not configured)
- **Test Connection button** — sends POST /Accounts/test-connection to validate API connectivity
- **Test results panel** — shows success/failure status, HTTP status code, response time in ms, message, and timestamp
- **Disabled state** when no base URL is configured (prompts user to set it in the API tab)

### Architecture

- **AccountComponent (parent)** loads AccountDetailResponse from GET /Accounts/get-account-detail and passes it to all child tab components
- **Each tab component** receives [account] as @Input and emits (saved) event to trigger parent reload
- **ngbNav (ng-bootstrap)** manages tab navigation with lazy-rendered content panels
- **Status badge** in page header shows Active/Inactive state
