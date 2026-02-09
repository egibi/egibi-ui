# What is Egibi?

Egibi is a multi-asset algorithmic trading platform designed for managing portfolios, executing trading strategies, backtesting, and data management across cryptocurrency and traditional exchanges.

The name "Egibi" references the ancient Babylonian banking house Egibi & Sons, one of the earliest known financial institutions — a fitting namesake for a modern trading platform.

# Technology Stack

- **Frontend** — Angular 21, Bootstrap 5.3.3, AG Grid, Highcharts
- **Backend** — .NET 9 (ASP.NET Core Web API)
- **Authentication** — OpenIddict 5.8 (OAuth 2.0 / OpenID Connect with Authorization Code + PKCE)
- **Primary Database** — PostgreSQL 16 (relational data, configuration, user accounts, OIDC grants)
- **Time-Series Database** — QuestDB 8.2.1 (OHLC candles, market data)
- **Exchange SDKs** — Binance.Net, Coinbase, Coinbase Pro
- **Infrastructure** — Docker Compose (PostgreSQL + QuestDB containers with named volumes)
- **Storage Management** — Tiered storage with automatic archival (Docker volumes → external disk), QuestDB partition management
- **Real-Time** — SignalR (WebSocket hubs for live updates)

# Platform Modules

- **Authentication** — Login, Signup, Password Reset, OIDC callback
- **Dashboard** — Home overview and summary metrics
- **Portfolio** — Accounts, Exchanges, and Markets management
- **Trading** — Strategies and Backtester
- **System** — Accounting, Data Manager, Storage Management, Settings, API Tester, Admin (Service Catalog), Documentation
