import { Routes } from "@angular/router";
import { ConnectionsComponent } from "./connections/connections.component";
import { StrategiesComponent } from "./strategies/strategies.component";
import { HomeComponent } from "./home/home.component";
import { BacktesterComponent } from "./backtester/backtester.component";
import { ApiTesterComponent } from "./api-tester/api-tester.component";
import { BacktestComponent } from "./backtester/backtest/backtest.component";
import { DataManagerComponent } from "./data-manager/data-manager.component";
import { DataProviderComponent } from "./data-manager/data-provider/data-provider.component";
import { ServiceConfigurationsComponent } from "./service-configurations/service-configurations.component";
import { AdminComponent } from "./admin/admin.component";
import { ExchangesComponent } from "./exchanges/exchanges.component";
import { MarketsComponent } from "./markets/markets.component";
import { AccountingComponent } from "./accounting/accounting.component";
import { ExchangeComponent } from "./exchanges/exchange/exchange.component";
import { Exchange } from "./_models/exchange.model";
import { AccountsComponent } from "./accounts/accounts.component";
import { AccountComponent } from "./accounts/account/account.component";

export const routes: Routes = [
  {
    path: "",
    component: HomeComponent,
  },
  {
    path: "home",
    component: HomeComponent,
  },
  {
    path: "accounts",
    component: AccountsComponent,
  },
  {
    path: "account",
    component: AccountComponent,
  },
  {
    path: "exchanges",
    component: ExchangesComponent,
  },
  {
    path: "exchanges/exchange/:id",
    component: ExchangeComponent,
  },
  {
    path: "exchanges/exchange",
    component: ExchangeComponent,
  },
  {
    path: "markets",
    component: MarketsComponent,
  },
  {
    path: "connections",
    component: ConnectionsComponent,
  },
  {
    path: "data-manager",
    component: DataManagerComponent,
  },
  {
    path: "data-manager/data-provider/:id",
    component: DataProviderComponent,
  },
  {
    path: "strategies",
    component: StrategiesComponent,
  },
  {
    path: "backtester",
    component: BacktesterComponent,
  },
  {
    path: "backtester/backtest/:id",
    component: BacktestComponent,
  },
  {
    path: "api-tester",
    component: ApiTesterComponent,
  },
  {
    path: "service-configs",
    component: ServiceConfigurationsComponent,
  },
  {
    path: "accounting",
    component: AccountingComponent,
  },
  {
    path: "admin",
    component: AdminComponent,
  },
];
