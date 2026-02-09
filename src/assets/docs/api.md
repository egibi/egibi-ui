# API Overview

The Egibi API is a .NET 9 ASP.NET Core Web API running on port 5000 (HTTP) / 7182 (HTTPS). All endpoints return a standardized RequestResponse wrapper unless otherwise noted. Swagger UI is available in Development mode at /swagger.

Protected endpoints require a Bearer token obtained via the Authorization Code + PKCE flow. The OpenIddict OIDC endpoints (/connect/*) and auth endpoints (/auth/*) are public.

### Response Format

```json
{
  "responseData": "<T>",
  "isSuccess": true,
  "message": "..."
}
```

# Authentication & Authorization

OpenIddict OIDC endpoints handle the OAuth 2.0 token lifecycle. The /auth/* endpoints provide the custom login, signup, and password reset flows that integrate with the OIDC server.

### OIDC Endpoints

<table class="doc-table endpoint-table">
<thead><tr><th>Method</th><th>Endpoint</th><th>Description</th><th>Parameters</th></tr></thead>
<tbody>
<tr><td><span class="method-badge method-get">GET</span></td><td><code>/connect/authorize</code></td><td>Initiate authorization code flow</td><td><span class="endpoint-params">client_id, code_challenge, code_challenge_method, response_type, redirect_uri, state</span></td></tr>
<tr><td><span class="method-badge method-post">POST</span></td><td><code>/connect/authorize</code></td><td>Authorization code flow (form post)</td><td><span class="endpoint-params none">—</span></td></tr>
<tr><td><span class="method-badge method-post">POST</span></td><td><code>/connect/token</code></td><td>Exchange authorization code for tokens</td><td><span class="endpoint-params">grant_type, code, code_verifier, client_id, redirect_uri</span></td></tr>
<tr><td><span class="method-badge method-get">GET</span></td><td><code>/connect/userinfo</code></td><td>Get authenticated user claims</td><td><span class="endpoint-params none">—</span></td></tr>
<tr><td><span class="method-badge method-post">POST</span></td><td><code>/connect/logout</code></td><td>Revoke tokens and end session</td><td><span class="endpoint-params none">—</span></td></tr>
</tbody>
</table>

### Auth Endpoints

<table class="doc-table endpoint-table">
<thead><tr><th>Method</th><th>Endpoint</th><th>Description</th><th>Parameters</th></tr></thead>
<tbody>
<tr><td><span class="method-badge method-post">POST</span></td><td><code>/auth/login</code></td><td>Validate credentials and set auth cookie</td><td><span class="endpoint-params">Body: { email, password }</span></td></tr>
<tr><td><span class="method-badge method-post">POST</span></td><td><code>/auth/signup</code></td><td>Register a new user account</td><td><span class="endpoint-params">Body: { email, password, confirmPassword }</span></td></tr>
<tr><td><span class="method-badge method-post">POST</span></td><td><code>/auth/forgot-password</code></td><td>Request a password reset token</td><td><span class="endpoint-params">Body: { email }</span></td></tr>
<tr><td><span class="method-badge method-post">POST</span></td><td><code>/auth/reset-password</code></td><td>Reset password using token</td><td><span class="endpoint-params">Body: { token, email, newPassword }</span></td></tr>
</tbody>
</table>

# Accounts

Manage trading accounts, credentials, fees, and connection testing. Accounts are linked to a connection (service) and account type.

<table class="doc-table endpoint-table">
<thead><tr><th>Method</th><th>Endpoint</th><th>Description</th><th>Parameters</th></tr></thead>
<tbody>
<tr><td><span class="method-badge method-get">GET</span></td><td><code>/Accounts/get-accounts</code></td><td>List all accounts</td><td><span class="endpoint-params none">—</span></td></tr>
<tr><td><span class="method-badge method-get">GET</span></td><td><code>/Accounts/get-account</code></td><td>Get account by ID</td><td><span class="endpoint-params">id (query)</span></td></tr>
<tr><td><span class="method-badge method-get">GET</span></td><td><code>/Accounts/get-account-detail</code></td><td>Get full account detail (general, credentials, fees)</td><td><span class="endpoint-params">id (query)</span></td></tr>
<tr><td><span class="method-badge method-get">GET</span></td><td><code>/Accounts/get-account-types</code></td><td>List available account types</td><td><span class="endpoint-params none">—</span></td></tr>
<tr><td><span class="method-badge method-post">POST</span></td><td><code>/Accounts/create-account</code></td><td>Create a new account</td><td><span class="endpoint-params">Body: CreateAccountRequest</span></td></tr>
<tr><td><span class="method-badge method-post">POST</span></td><td><code>/Accounts/save-account</code></td><td>Save/update an account</td><td><span class="endpoint-params">Body: Account</span></td></tr>
<tr><td><span class="method-badge method-post">POST</span></td><td><code>/Accounts/save-account-details</code></td><td>Save extended account details</td><td><span class="endpoint-params">Body: AccountDetails</span></td></tr>
<tr><td><span class="method-badge method-put">PUT</span></td><td><code>/Accounts/update-account</code></td><td>Update account properties</td><td><span class="endpoint-params">Body: UpdateAccountRequest</span></td></tr>
<tr><td><span class="method-badge method-put">PUT</span></td><td><code>/Accounts/update-credentials</code></td><td>Update account API credentials</td><td><span class="endpoint-params">Body: UpdateCredentialsRequest</span></td></tr>
<tr><td><span class="method-badge method-put">PUT</span></td><td><code>/Accounts/update-fees</code></td><td>Update account fee structure</td><td><span class="endpoint-params">Body: UpdateAccountFeesRequest</span></td></tr>
<tr><td><span class="method-badge method-post">POST</span></td><td><code>/Accounts/test-connection</code></td><td>Test account API connectivity</td><td><span class="endpoint-params">accountId (query)</span></td></tr>
<tr><td><span class="method-badge method-delete">DELETE</span></td><td><code>/Accounts/delete-account</code></td><td>Delete a single account</td><td><span class="endpoint-params">id (query)</span></td></tr>
<tr><td><span class="method-badge method-delete">DELETE</span></td><td><code>/Accounts/delete-accounts</code></td><td>Delete multiple accounts</td><td><span class="endpoint-params">ids (query)</span></td></tr>
</tbody>
</table>

# Connections (Services)

Connections represent configured exchange or broker services (e.g., Binance, Coinbase). Managed via the Admin service catalog.

<table class="doc-table endpoint-table">
<thead><tr><th>Method</th><th>Endpoint</th><th>Description</th><th>Parameters</th></tr></thead>
<tbody>
<tr><td><span class="method-badge method-get">GET</span></td><td><code>/Connections/get-connections</code></td><td>List all connections</td><td><span class="endpoint-params none">—</span></td></tr>
<tr><td><span class="method-badge method-get">GET</span></td><td><code>/Connections/get-connection</code></td><td>Get connection by ID</td><td><span class="endpoint-params">connectionId (query)</span></td></tr>
<tr><td><span class="method-badge method-get">GET</span></td><td><code>/Connections/get-connection-types</code></td><td>List connection types</td><td><span class="endpoint-params none">—</span></td></tr>
<tr><td><span class="method-badge method-post">POST</span></td><td><code>/Connections/save-connection</code></td><td>Create or update a connection</td><td><span class="endpoint-params">Body: Connection</span></td></tr>
<tr><td><span class="method-badge method-delete">DELETE</span></td><td><code>/Connections/delete-connection</code></td><td>Delete a single connection</td><td><span class="endpoint-params">id (query)</span></td></tr>
<tr><td><span class="method-badge method-delete">DELETE</span></td><td><code>/Connections/delete-connections</code></td><td>Delete multiple connections</td><td><span class="endpoint-params">connectionIds (query)</span></td></tr>
</tbody>
</table>

# Exchanges

Exchange definitions and exchange account management.

### Exchanges

<table class="doc-table endpoint-table">
<thead><tr><th>Method</th><th>Endpoint</th><th>Description</th><th>Parameters</th></tr></thead>
<tbody>
<tr><td><span class="method-badge method-get">GET</span></td><td><code>/Exchanges/get-exchanges</code></td><td>List all exchanges</td><td><span class="endpoint-params none">—</span></td></tr>
<tr><td><span class="method-badge method-get">GET</span></td><td><code>/Exchanges/get-exchange</code></td><td>Get exchange by ID</td><td><span class="endpoint-params">id (query)</span></td></tr>
<tr><td><span class="method-badge method-get">GET</span></td><td><code>/Exchanges/get-exchange-types</code></td><td>List exchange types</td><td><span class="endpoint-params none">—</span></td></tr>
<tr><td><span class="method-badge method-post">POST</span></td><td><code>/Exchanges/save-exchange</code></td><td>Create or update an exchange</td><td><span class="endpoint-params">Body: Exchange</span></td></tr>
<tr><td><span class="method-badge method-delete">DELETE</span></td><td><code>/Exchanges/delete-exchange</code></td><td>Delete a single exchange</td><td><span class="endpoint-params">id (query)</span></td></tr>
<tr><td><span class="method-badge method-delete">DELETE</span></td><td><code>/Exchanges/delete-exchanges</code></td><td>Delete multiple exchanges</td><td><span class="endpoint-params">ids (query)</span></td></tr>
</tbody>
</table>

### Exchange Accounts

<table class="doc-table endpoint-table">
<thead><tr><th>Method</th><th>Endpoint</th><th>Description</th><th>Parameters</th></tr></thead>
<tbody>
<tr><td><span class="method-badge method-get">GET</span></td><td><code>/ExchangeAccounts/get-exchange-accounts</code></td><td>List all exchange accounts</td><td><span class="endpoint-params none">—</span></td></tr>
<tr><td><span class="method-badge method-get">GET</span></td><td><code>/ExchangeAccounts/get-exchange-account</code></td><td>Get exchange account by ID</td><td><span class="endpoint-params">id (query)</span></td></tr>
</tbody>
</table>

# Markets

Trading pairs and market definitions.

<table class="doc-table endpoint-table">
<thead><tr><th>Method</th><th>Endpoint</th><th>Description</th><th>Parameters</th></tr></thead>
<tbody>
<tr><td><span class="method-badge method-get">GET</span></td><td><code>/Markets/get-markets</code></td><td>List all markets</td><td><span class="endpoint-params none">—</span></td></tr>
<tr><td><span class="method-badge method-get">GET</span></td><td><code>/Markets/get-market</code></td><td>Get market by ID</td><td><span class="endpoint-params">id (query)</span></td></tr>
<tr><td><span class="method-badge method-post">POST</span></td><td><code>/Markets/save-market</code></td><td>Create or update a market</td><td><span class="endpoint-params">Body: Market</span></td></tr>
<tr><td><span class="method-badge method-delete">DELETE</span></td><td><code>/Markets/delete-market</code></td><td>Delete a single market</td><td><span class="endpoint-params">id (query)</span></td></tr>
<tr><td><span class="method-badge method-delete">DELETE</span></td><td><code>/Markets/delete-markets</code></td><td>Delete multiple markets</td><td><span class="endpoint-params">ids (query)</span></td></tr>
</tbody>
</table>

# Strategies & Backtesting

RESTful strategy management with integrated backtesting. The StrategiesController handles strategy CRUD, backtest execution via BacktestExecutionService, data verification, and coverage queries. Backtests are executed using IMarketDataService which auto-fetches missing candles from exchanges.

### Strategy CRUD

<table class="doc-table endpoint-table">
<thead><tr><th>Method</th><th>Endpoint</th><th>Description</th><th>Parameters</th></tr></thead>
<tbody>
<tr><td><span class="method-badge method-get">GET</span></td><td><code>/api/strategies</code></td><td>List all strategies with backtest counts</td><td><span class="endpoint-params none">—</span></td></tr>
<tr><td><span class="method-badge method-get">GET</span></td><td><code>/api/strategies/{id}</code></td><td>Get strategy by ID with configuration</td><td><span class="endpoint-params">id (route)</span></td></tr>
<tr><td><span class="method-badge method-post">POST</span></td><td><code>/api/strategies</code></td><td>Create a new strategy</td><td><span class="endpoint-params">Body: { name, description, configuration }</span></td></tr>
<tr><td><span class="method-badge method-put">PUT</span></td><td><code>/api/strategies/{id}</code></td><td>Update an existing strategy</td><td><span class="endpoint-params">Body: { name, description, configuration }</span></td></tr>
<tr><td><span class="method-badge method-delete">DELETE</span></td><td><code>/api/strategies/{id}</code></td><td>Delete strategy and all associated backtests</td><td><span class="endpoint-params">id (route)</span></td></tr>
</tbody>
</table>

### Backtest Execution

<table class="doc-table endpoint-table">
<thead><tr><th>Method</th><th>Endpoint</th><th>Description</th><th>Parameters</th></tr></thead>
<tbody>
<tr><td><span class="method-badge method-post">POST</span></td><td><code>/api/strategies/{id}/backtest</code></td><td>Run backtest — fetches candles via IMarketDataService (auto-fills gaps), runs SimpleBacktestEngine, saves results</td><td><span class="endpoint-params">Body: { name, startDate, endDate, initialCapital }</span></td></tr>
<tr><td><span class="method-badge method-get">GET</span></td><td><code>/api/strategies/{id}/backtests</code></td><td>Get backtest history for a strategy (summary stats)</td><td><span class="endpoint-params">id (route)</span></td></tr>
<tr><td><span class="method-badge method-get">GET</span></td><td><code>/api/strategies/backtests/{backtestId}</code></td><td>Get full backtest result including equity curve and trade log</td><td><span class="endpoint-params">backtestId (route)</span></td></tr>
</tbody>
</table>

### Data Verification

<table class="doc-table endpoint-table">
<thead><tr><th>Method</th><th>Endpoint</th><th>Description</th><th>Parameters</th></tr></thead>
<tbody>
<tr><td><span class="method-badge method-post">POST</span></td><td><code>/api/strategies/verify-data</code></td><td>Check data availability before running a backtest — returns coverage status and whether auto-fetch can fill gaps</td><td><span class="endpoint-params">Body: { symbol, source, interval, startDate, endDate }</span></td></tr>
<tr><td><span class="method-badge method-get">GET</span></td><td><code>/api/strategies/data-coverage</code></td><td>Get all stored data coverage grouped by symbol/source/interval</td><td><span class="endpoint-params none">—</span></td></tr>
<tr><td><span class="method-badge method-get">GET</span></td><td><code>/api/strategies/available-symbols</code></td><td>List distinct symbols available in QuestDB</td><td><span class="endpoint-params none">—</span></td></tr>
</tbody>
</table>

### Verification Status Codes

- **FullyCovered** — All requested data exists in QuestDB, backtest can run immediately
- **PartialWithFetch** — Some data in QuestDB, gaps can be auto-fetched from exchange (e.g., Binance)
- **FetchRequired** — No data in QuestDB but a fetcher is available for the source, full download needed
- **PartialCoverage** — Some data exists but no fetcher available for the source, backtest will use available data only
- **NoData** — No data and no fetcher available, backtest cannot run

# Backtester (Legacy)

Legacy backtest management endpoints. New backtests should be created via the Strategies controller (/api/strategies/{id}/backtest). These endpoints remain for backward compatibility with the standalone backtester grid.

<table class="doc-table endpoint-table">
<thead><tr><th>Method</th><th>Endpoint</th><th>Description</th><th>Parameters</th></tr></thead>
<tbody>
<tr><td><span class="method-badge method-get">GET</span></td><td><code>/Backtester/get-backtests</code></td><td>List all backtests</td><td><span class="endpoint-params none">—</span></td></tr>
<tr><td><span class="method-badge method-get">GET</span></td><td><code>/Backtester/get-backtest</code></td><td>Get backtest by ID</td><td><span class="endpoint-params">backtestId (query)</span></td></tr>
<tr><td><span class="method-badge method-get">GET</span></td><td><code>/Backtester/get-data-sources</code></td><td>List available data sources for backtesting</td><td><span class="endpoint-params none">—</span></td></tr>
<tr><td><span class="method-badge method-post">POST</span></td><td><code>/Backtester/save-backtest</code></td><td>Create or update a backtest</td><td><span class="endpoint-params">Body: Backtest</span></td></tr>
<tr><td><span class="method-badge method-post">POST</span></td><td><code>/Backtester/run-backtest</code></td><td>Execute a backtest</td><td><span class="endpoint-params none">—</span></td></tr>
<tr><td><span class="method-badge method-post">POST</span></td><td><code>/Backtester/upload-historical-data-file</code></td><td>Upload historical data file</td><td><span class="endpoint-params">Form: IFormFile</span></td></tr>
<tr><td><span class="method-badge method-delete">DELETE</span></td><td><code>/Backtester/delete-backtest</code></td><td>Delete a single backtest</td><td><span class="endpoint-params">backtestId (query)</span></td></tr>
<tr><td><span class="method-badge method-delete">DELETE</span></td><td><code>/Backtester/delete-backtests</code></td><td>Delete multiple backtests</td><td><span class="endpoint-params">backtestIds (query)</span></td></tr>
</tbody>
</table>

# Market Data

OHLC candle data retrieval from QuestDB, symbol listings, data coverage, and fetcher information.

<table class="doc-table endpoint-table">
<thead><tr><th>Method</th><th>Endpoint</th><th>Description</th><th>Parameters</th></tr></thead>
<tbody>
<tr><td><span class="method-badge method-post">POST</span></td><td><code>/MarketData/get-candles</code></td><td>Retrieve OHLC candles for a symbol</td><td><span class="endpoint-params">Body: MarketDataRequest</span></td></tr>
<tr><td><span class="method-badge method-post">POST</span></td><td><code>/MarketData/import-candles</code></td><td>Import candle data</td><td><span class="endpoint-params">Body: List&lt;Candle&gt;</span></td></tr>
<tr><td><span class="method-badge method-get">GET</span></td><td><code>/MarketData/get-symbols</code></td><td>List all available symbols</td><td><span class="endpoint-params none">—</span></td></tr>
<tr><td><span class="method-badge method-get">GET</span></td><td><code>/MarketData/get-source-summaries</code></td><td>Get data source summaries for a symbol</td><td><span class="endpoint-params">symbol (query)</span></td></tr>
<tr><td><span class="method-badge method-get">GET</span></td><td><code>/MarketData/get-coverage</code></td><td>Get data coverage information</td><td><span class="endpoint-params">symbol, source, interval (query)</span></td></tr>
<tr><td><span class="method-badge method-get">GET</span></td><td><code>/MarketData/get-fetchers</code></td><td>List available data fetchers</td><td><span class="endpoint-params none">—</span></td></tr>
</tbody>
</table>

# Data Manager

Data provider management, file uploads, and QuestDB table operations.

### Data Providers

<table class="doc-table endpoint-table">
<thead><tr><th>Method</th><th>Endpoint</th><th>Description</th><th>Parameters</th></tr></thead>
<tbody>
<tr><td><span class="method-badge method-get">GET</span></td><td><code>/DataManager/get-data-providers</code></td><td>List all data providers</td><td><span class="endpoint-params none">—</span></td></tr>
<tr><td><span class="method-badge method-get">GET</span></td><td><code>/DataManager/get-data-provider</code></td><td>Get data provider by ID</td><td><span class="endpoint-params">id (query)</span></td></tr>
<tr><td><span class="method-badge method-get">GET</span></td><td><code>/DataManager/get-data-provider-types</code></td><td>List data provider types</td><td><span class="endpoint-params none">—</span></td></tr>
<tr><td><span class="method-badge method-get">GET</span></td><td><code>/DataManager/get-data-frequency-types</code></td><td>List data frequency types</td><td><span class="endpoint-params none">—</span></td></tr>
<tr><td><span class="method-badge method-get">GET</span></td><td><code>/DataManager/get-data-format-types</code></td><td>List data format types</td><td><span class="endpoint-params none">—</span></td></tr>
<tr><td><span class="method-badge method-post">POST</span></td><td><code>/DataManager/save-data-provider</code></td><td>Create or update a data provider</td><td><span class="endpoint-params">Body: DataProvider</span></td></tr>
<tr><td><span class="method-badge method-delete">DELETE</span></td><td><code>/DataManager/delete-data-provider</code></td><td>Delete a data provider</td><td><span class="endpoint-params">id (query)</span></td></tr>
</tbody>
</table>

### QuestDB Operations

<table class="doc-table endpoint-table">
<thead><tr><th>Method</th><th>Endpoint</th><th>Description</th><th>Parameters</th></tr></thead>
<tbody>
<tr><td><span class="method-badge method-get">GET</span></td><td><code>/DataManager/get-questdb-tables</code></td><td>List all QuestDB tables</td><td><span class="endpoint-params none">—</span></td></tr>
<tr><td><span class="method-badge method-post">POST</span></td><td><code>/DataManager/create-questdb-table</code></td><td>Create a new QuestDB table</td><td><span class="endpoint-params">Body: QuestDbTable</span></td></tr>
<tr><td><span class="method-badge method-post">POST</span></td><td><code>/DataManager/drop-questdb-table</code></td><td>Drop a QuestDB table</td><td><span class="endpoint-params">tableName (query)</span></td></tr>
<tr><td><span class="method-badge method-post">POST</span></td><td><code>/DataManager/drop-file</code></td><td>Upload a data file</td><td><span class="endpoint-params">Form: IFormFile</span></td></tr>
</tbody>
</table>

# Storage Management

Tiered storage operations including partition archival/restoration, PostgreSQL backups, and OIDC token cleanup.

<table class="doc-table endpoint-table">
<thead><tr><th>Method</th><th>Endpoint</th><th>Description</th><th>Parameters</th></tr></thead>
<tbody>
<tr><td><span class="method-badge method-get">GET</span></td><td><code>/Storage/config</code></td><td>Get storage configuration</td><td><span class="endpoint-params none">—</span></td></tr>
<tr><td><span class="method-badge method-put">PUT</span></td><td><code>/Storage/config</code></td><td>Update storage configuration</td><td><span class="endpoint-params">Body: StorageConfig</span></td></tr>
<tr><td><span class="method-badge method-get">GET</span></td><td><code>/Storage/status</code></td><td>Get disk usage and storage status</td><td><span class="endpoint-params none">—</span></td></tr>
<tr><td><span class="method-badge method-get">GET</span></td><td><code>/Storage/partitions</code></td><td>List QuestDB partitions with archive status</td><td><span class="endpoint-params none">—</span></td></tr>
<tr><td><span class="method-badge method-post">POST</span></td><td><code>/Storage/archive</code></td><td>Archive partitions to external disk</td><td><span class="endpoint-params">Body: ArchiveRequest</span></td></tr>
<tr><td><span class="method-badge method-post">POST</span></td><td><code>/Storage/restore</code></td><td>Restore partition from external disk</td><td><span class="endpoint-params">Body: RestoreRequest</span></td></tr>
<tr><td><span class="method-badge method-post">POST</span></td><td><code>/Storage/cleanup</code></td><td>Prune expired OIDC tokens</td><td><span class="endpoint-params none">—</span></td></tr>
<tr><td><span class="method-badge method-get">GET</span></td><td><code>/Storage/backups</code></td><td>List available PostgreSQL backups</td><td><span class="endpoint-params none">—</span></td></tr>
<tr><td><span class="method-badge method-post">POST</span></td><td><code>/Storage/backup</code></td><td>Create a PostgreSQL backup</td><td><span class="endpoint-params none">—</span></td></tr>
<tr><td><span class="method-badge method-get">GET</span></td><td><code>/Storage/log</code></td><td>Get archive activity log</td><td><span class="endpoint-params">limit (query, default: 50)</span></td></tr>
</tbody>
</table>

# Configuration & Settings

Entity type management (reference tables), account user administration, and geographic/timezone data.

### Entity Types

<table class="doc-table endpoint-table">
<thead><tr><th>Method</th><th>Endpoint</th><th>Description</th><th>Parameters</th></tr></thead>
<tbody>
<tr><td><span class="method-badge method-get">GET</span></td><td><code>/AppConfigurations/get-entity-type-tables</code></td><td>List all entity type tables</td><td><span class="endpoint-params none">—</span></td></tr>
<tr><td><span class="method-badge method-get">GET</span></td><td><code>/AppConfigurations/get-entity-type-records</code></td><td>Get records for an entity type table</td><td><span class="endpoint-params">tableName (query)</span></td></tr>
<tr><td><span class="method-badge method-post">POST</span></td><td><code>/AppConfigurations/save-entity-type</code></td><td>Create or update an entity type</td><td><span class="endpoint-params">Body: EntityType</span></td></tr>
<tr><td><span class="method-badge method-post">POST</span></td><td><code>/AppConfigurations/delete-entity-type</code></td><td>Delete an entity type</td><td><span class="endpoint-params">Body: EntityType</span></td></tr>
</tbody>
</table>

### Account Users

<table class="doc-table endpoint-table">
<thead><tr><th>Method</th><th>Endpoint</th><th>Description</th><th>Parameters</th></tr></thead>
<tbody>
<tr><td><span class="method-badge method-get">GET</span></td><td><code>/AppConfigurations/get-account-users</code></td><td>List all account users</td><td><span class="endpoint-params none">—</span></td></tr>
<tr><td><span class="method-badge method-post">POST</span></td><td><code>/AppConfigurations/save-account-user</code></td><td>Create or update an account user</td><td><span class="endpoint-params">Body: AccountUser</span></td></tr>
<tr><td><span class="method-badge method-post">POST</span></td><td><code>/AppConfigurations/delete-account-user</code></td><td>Delete an account user</td><td><span class="endpoint-params">Body: AccountUser</span></td></tr>
</tbody>
</table>

### Reference Data

<table class="doc-table endpoint-table">
<thead><tr><th>Method</th><th>Endpoint</th><th>Description</th><th>Parameters</th></tr></thead>
<tbody>
<tr><td><span class="method-badge method-get">GET</span></td><td><code>/AppConfigurations/get-country-data</code></td><td>Get all country records</td><td><span class="endpoint-params none">—</span></td></tr>
<tr><td><span class="method-badge method-get">GET</span></td><td><code>/AppConfigurations/get-timezone-data</code></td><td>Get all timezone records</td><td><span class="endpoint-params none">—</span></td></tr>
</tbody>
</table>

# System & Diagnostics

Environment detection, API connectivity testing, and server time.

<table class="doc-table endpoint-table">
<thead><tr><th>Method</th><th>Endpoint</th><th>Description</th><th>Parameters</th></tr></thead>
<tbody>
<tr><td><span class="method-badge method-get">GET</span></td><td><code>/Environment/get-environment</code></td><td>Get runtime environment info (DEV/PROD)</td><td><span class="endpoint-params none">—</span></td></tr>
<tr><td><span class="method-badge method-get">GET</span></td><td><code>/ApiTester/test-connection</code></td><td>Test API connectivity</td><td><span class="endpoint-params none">—</span></td></tr>
<tr><td><span class="method-badge method-get">GET</span></td><td><code>/ApiTester/get-server-time</code></td><td>Get current server time</td><td><span class="endpoint-params none">—</span></td></tr>
</tbody>
</table>
