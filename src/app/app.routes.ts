import { Routes } from "@angular/router";
import { ConnectionsComponent } from "./connections/connections.component";
import { StrategiesComponent } from "./strategies/strategies.component";
import { HomeComponent } from "./home/home.component";
import { BacktesterComponent } from "./backtester/backtester.component";
import { ApiTesterComponent } from "./api-tester/api-tester.component";
import { BacktestViewComponent } from "./backtester/backtest-view/backtest-view.component";

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
    path: "connections",
    component: ConnectionsComponent
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
    component: BacktestViewComponent
  },
  {
    path: "api-tester",
    component: ApiTesterComponent
  },
];
