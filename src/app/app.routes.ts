import { Routes } from "@angular/router";
import { ConnectionsComponent } from "./connections/connections.component";
import { StrategiesComponent } from "./strategies/strategies.component";
import { HomeComponent } from "./home/home.component";
import { BacktesterComponent } from "./backtester/backtester.component";
import { ApiTesterComponent } from "./api-tester/api-tester.component";
import { BacktestComponent } from "./backtester/backtest/backtest.component";
import { DataManagerComponent } from "./data-manager/data-manager.component";
import { DataProviderComponent } from "./data-manager/data-provider/data-provider.component";
import { ConfigurationComponent } from "./configuration/configuration.component";
import { AdminComponent } from "./admin/admin.component";
import { ExchangesComponent } from "./exchanges/exchanges.component";
import { MarketsComponent } from "./markets/markets.component";

export const routes: Routes = [
  {
    path: "",
    component: HomeComponent
  },
  {
    path: "home",
    component: HomeComponent
  },
  {
    path: "exchanges",
    component: ExchangesComponent
  },
  {
    path: "markets",
    component: MarketsComponent
  },
  {
    path: "connections",
    component: ConnectionsComponent
  },
  {
    path: "data-manager",
    component: DataManagerComponent
  },
  {
    path:"data-manager/data-provider/:id",
    component:DataProviderComponent
  },
  {
    path: "strategies",
    component: StrategiesComponent
  },  
  {
    path: "backtester",
    component: BacktesterComponent
  },
  {
    path: "backtester/backtest/:id",
    component: BacktestComponent
  },
  {
    path: "api-tester",
    component: ApiTesterComponent
  },
  {
    path: "configuration",
    component: ConfigurationComponent
  },
  {
    path: "admin",
    component: AdminComponent
  }
];
