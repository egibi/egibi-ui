import { Routes } from "@angular/router";
import { authGuard } from "./auth/auth.guard";

// Auth pages (public)
import { LoginComponent } from "./auth/login/login.component";
import { SignupComponent } from "./auth/signup/signup.component";
import { ForgotPasswordComponent } from "./auth/forgot-password/forgot-password.component";
import { ResetPasswordComponent } from "./auth/reset-password/reset-password.component";
import { AuthCallbackComponent } from "./auth/callback/auth-callback.component";

// App pages (protected)
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
import { AccountsComponent } from "./accounts/accounts.component";
import { AccountComponent } from "./accounts/account/account.component";
import { AppConfigurationComponent } from "./app-configuration/app-configuration.component";
import { DocumentationComponent } from "./documentation/documentation.component";
import { StorageComponent } from "./storage/storage.component";

export const routes: Routes = [
  // =============================================
  // AUTH ROUTES (public — no guard)
  // =============================================
  {
    path: "auth/login",
    component: LoginComponent,
  },
  {
    path: "auth/signup",
    component: SignupComponent,
  },
  {
    path: "auth/forgot-password",
    component: ForgotPasswordComponent,
  },
  {
    path: "auth/reset-password",
    component: ResetPasswordComponent,
  },
  {
    path: "auth/callback",
    component: AuthCallbackComponent,
  },

  // =============================================
  // PROTECTED ROUTES (require authentication)
  // =============================================
  {
    path: "",
    component: HomeComponent,
    canActivate: [authGuard],
  },
  {
    path: "documentation",
    component: DocumentationComponent,
    canActivate: [authGuard],
  },
  {
    path: "app-configuration",
    component: AppConfigurationComponent,
    canActivate: [authGuard],
  },
  {
    path: "home",
    component: HomeComponent,
    canActivate: [authGuard],
  },
  {
    path: "accounts",
    component: AccountsComponent,
    canActivate: [authGuard],
  },
  {
    path: "accounts/account/:id",
    component: AccountComponent,
    canActivate: [authGuard],
  },
  {
    path: "account",
    component: AccountComponent,
    canActivate: [authGuard],
  },
  {
    path: "account/create",
    component: AccountComponent,
    canActivate: [authGuard],
  },
  {
    path: "exchanges",
    component: ExchangesComponent,
    canActivate: [authGuard],
  },
  {
    path: "exchanges/exchange/:id",
    component: ExchangeComponent,
    canActivate: [authGuard],
  },
  {
    path: "exchanges/exchange",
    component: ExchangeComponent,
    canActivate: [authGuard],
  },
  {
    path: "markets",
    component: MarketsComponent,
    canActivate: [authGuard],
  },
  {
    path: "data-manager",
    component: DataManagerComponent,
    canActivate: [authGuard],
  },
  {
    path: "data-manager/data-provider/:id",
    component: DataProviderComponent,
    canActivate: [authGuard],
  },
  {
    path: "strategies",
    component: StrategiesComponent,
    canActivate: [authGuard],
  },
  {
    path: "backtester",
    component: BacktesterComponent,
    canActivate: [authGuard],
  },
  {
    path: "backtester/backtest/:id",
    component: BacktestComponent,
    canActivate: [authGuard],
  },
  {
    path: "api-tester",
    component: ApiTesterComponent,
    canActivate: [authGuard],
  },
  {
    path: "service-configs",
    component: ServiceConfigurationsComponent,
    canActivate: [authGuard],
  },
  {
    path: "accounting",
    component: AccountingComponent,
    canActivate: [authGuard],
  },
  {
    path: "admin",
    component: AdminComponent,
    canActivate: [authGuard],
  },
  {
    path: 'storage',
    component: StorageComponent,
    title: 'Storage - Egibi',
    canActivate: [authGuard],
  },

  // Catch-all → login
  {
    path: "**",
    redirectTo: "auth/login",
  }
];
