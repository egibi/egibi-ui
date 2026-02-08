import { Injectable, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, forkJoin, of } from "rxjs";
import { map, catchError } from "rxjs/operators";
import { RequestResponse } from "../request-response";
import { environment } from "../../environments/environment";

// =============================================
// INTERFACES
// =============================================

export interface WizardMarket {
  id: string;
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
}

export interface WizardExchange {
  id: string;
  name: string;
  description: string;
  marketId: string;
  iconKey: string;
  color: string;
  website: string;
  defaultBaseUrl: string;
  requiredFields: string[];
  enabled: boolean;
}

export interface WizardDataSource {
  id: string;
  name: string;
  description: string;
  type: "exchange_api" | "third_party" | "file_upload";
  linkedExchangeId?: string;
  website: string;
  enabled: boolean;
}

export interface WizardState {
  currentStep: number;
  markets: WizardMarket[];
  exchanges: WizardExchange[];
  dataSources: WizardDataSource[];
}

// =============================================
// SERVICE
// =============================================

@Injectable({
  providedIn: "root",
})
export class SetupWizardService {
  private readonly DISMISSED_KEY = "egibi-setup-wizard-dismissed";
  private readonly COMPLETED_KEY = "egibi-setup-wizard-completed";
  private readonly apiBaseUrl = `${environment.apiUrl}`;

  // State
  private _visible = signal(false);
  private _saving = signal(false);

  visible = this._visible.asReadonly();
  saving = this._saving.asReadonly();

  constructor(private http: HttpClient) {}

  // =============================================
  // VISIBILITY
  // =============================================

  /** Check if wizard should be shown (not dismissed and not completed) */
  shouldShow(): boolean {
    return !localStorage.getItem(this.DISMISSED_KEY) && !localStorage.getItem(this.COMPLETED_KEY);
  }

  show(): void {
    this._visible.set(true);
  }

  dismiss(): void {
    localStorage.setItem(this.DISMISSED_KEY, new Date().toISOString());
    this._visible.set(false);
  }

  complete(): void {
    localStorage.setItem(this.COMPLETED_KEY, new Date().toISOString());
    this._visible.set(false);
  }

  /** Reset wizard state (allows it to show again) */
  reset(): void {
    localStorage.removeItem(this.DISMISSED_KEY);
    localStorage.removeItem(this.COMPLETED_KEY);
  }

  // =============================================
  // DEFAULT DATA
  // =============================================

  getDefaultMarkets(): WizardMarket[] {
    return [
      {
        id: "crypto",
        name: "Cryptocurrency",
        description: "Bitcoin, Ethereum, and other digital assets",
        icon: "bitcoin",
        enabled: false,
      },
      {
        id: "stocks",
        name: "Stocks & Equities",
        description: "US and international stock markets",
        icon: "trending-up",
        enabled: false,
      },
      {
        id: "forex",
        name: "Forex",
        description: "Foreign exchange currency pairs",
        icon: "globe",
        enabled: false,
      },
      {
        id: "commodities",
        name: "Commodities",
        description: "Gold, oil, agricultural products, and more",
        icon: "diamond",
        enabled: false,
      },
    ];
  }

  getDefaultExchanges(): WizardExchange[] {
    return [
      // Crypto
      {
        id: "binance",
        name: "Binance",
        description: "World's largest crypto exchange by volume",
        marketId: "crypto",
        iconKey: "binance",
        color: "#F0B90B",
        website: "https://www.binance.com",
        defaultBaseUrl: "https://api.binance.com",
        requiredFields: ["api_key", "api_secret"],
        enabled: false,
      },
      {
        id: "binance-us",
        name: "Binance US",
        description: "US-regulated Binance exchange",
        marketId: "crypto",
        iconKey: "binance",
        color: "#F0B90B",
        website: "https://www.binance.us",
        defaultBaseUrl: "https://api.binance.us",
        requiredFields: ["api_key", "api_secret"],
        enabled: false,
      },
      {
        id: "coinbase",
        name: "Coinbase Advanced",
        description: "US-based exchange with advanced trading",
        marketId: "crypto",
        iconKey: "coinbase",
        color: "#0052FF",
        website: "https://www.coinbase.com",
        defaultBaseUrl: "https://api.coinbase.com",
        requiredFields: ["api_key", "api_secret"],
        enabled: false,
      },
      {
        id: "kraken",
        name: "Kraken",
        description: "Established crypto exchange with wide asset support",
        marketId: "crypto",
        iconKey: "kraken",
        color: "#7B61FF",
        website: "https://www.kraken.com",
        defaultBaseUrl: "https://api.kraken.com",
        requiredFields: ["api_key", "api_secret"],
        enabled: false,
      },
      {
        id: "bybit",
        name: "Bybit",
        description: "Derivatives and spot crypto exchange",
        marketId: "crypto",
        iconKey: "bybit",
        color: "#F7A600",
        website: "https://www.bybit.com",
        defaultBaseUrl: "https://api.bybit.com",
        requiredFields: ["api_key", "api_secret"],
        enabled: false,
      },
      {
        id: "kucoin",
        name: "KuCoin",
        description: "Global crypto exchange with wide altcoin selection",
        marketId: "crypto",
        iconKey: "kucoin",
        color: "#23AF91",
        website: "https://www.kucoin.com",
        defaultBaseUrl: "https://api.kucoin.com",
        requiredFields: ["api_key", "api_secret", "passphrase"],
        enabled: false,
      },

      // Stocks
      {
        id: "alpaca",
        name: "Alpaca",
        description: "Commission-free stock trading API",
        marketId: "stocks",
        iconKey: "alpaca",
        color: "#FFDC00",
        website: "https://alpaca.markets",
        defaultBaseUrl: "https://paper-api.alpaca.markets",
        requiredFields: ["api_key", "api_secret"],
        enabled: false,
      },
      {
        id: "ibkr",
        name: "Interactive Brokers",
        description: "Professional-grade brokerage with global market access",
        marketId: "stocks",
        iconKey: "ibkr",
        color: "#DC143C",
        website: "https://www.interactivebrokers.com",
        defaultBaseUrl: "https://localhost:5000",
        requiredFields: ["username", "password"],
        enabled: false,
      },
      {
        id: "schwab",
        name: "Charles Schwab",
        description: "Full-service brokerage and trading platform",
        marketId: "stocks",
        iconKey: "schwab",
        color: "#00A0DF",
        website: "https://www.schwab.com",
        defaultBaseUrl: "https://api.schwabapi.com",
        requiredFields: ["api_key", "api_secret"],
        enabled: false,
      },

      // Forex
      {
        id: "oanda",
        name: "OANDA",
        description: "Major forex broker with comprehensive API",
        marketId: "forex",
        iconKey: "oanda",
        color: "#003D6B",
        website: "https://www.oanda.com",
        defaultBaseUrl: "https://api-fxpractice.oanda.com",
        requiredFields: ["api_key"],
        enabled: false,
      },
      {
        id: "forex-com",
        name: "FOREX.com",
        description: "Leading retail forex trading platform",
        marketId: "forex",
        iconKey: "forex",
        color: "#1E3A5F",
        website: "https://www.forex.com",
        defaultBaseUrl: "https://api.forex.com",
        requiredFields: ["username", "password", "api_key"],
        enabled: false,
      },

      // Commodities
      {
        id: "tradier",
        name: "Tradier",
        description: "Brokerage API for equities and options",
        marketId: "commodities",
        iconKey: "tradier",
        color: "#00BF6F",
        website: "https://www.tradier.com",
        defaultBaseUrl: "https://api.tradier.com",
        requiredFields: ["api_key"],
        enabled: false,
      },
    ];
  }

  getDefaultDataSources(): WizardDataSource[] {
    return [
      // Exchange-linked (auto-populated based on selected exchanges)
      {
        id: "ds-binance",
        name: "Binance Market Data",
        description: "Real-time and historical OHLCV from Binance API",
        type: "exchange_api",
        linkedExchangeId: "binance",
        website: "https://www.binance.com",
        enabled: false,
      },
      {
        id: "ds-binance-us",
        name: "Binance US Market Data",
        description: "Real-time and historical OHLCV from Binance US API",
        type: "exchange_api",
        linkedExchangeId: "binance-us",
        website: "https://www.binance.us",
        enabled: false,
      },
      {
        id: "ds-coinbase",
        name: "Coinbase Market Data",
        description: "Real-time and historical OHLCV from Coinbase API",
        type: "exchange_api",
        linkedExchangeId: "coinbase",
        website: "https://www.coinbase.com",
        enabled: false,
      },
      {
        id: "ds-kraken",
        name: "Kraken Market Data",
        description: "Real-time and historical OHLCV from Kraken API",
        type: "exchange_api",
        linkedExchangeId: "kraken",
        website: "https://www.kraken.com",
        enabled: false,
      },
      {
        id: "ds-alpaca",
        name: "Alpaca Market Data",
        description: "Free and premium stock market data via Alpaca",
        type: "exchange_api",
        linkedExchangeId: "alpaca",
        website: "https://alpaca.markets",
        enabled: false,
      },

      // Third-party data providers
      {
        id: "ds-alpha-vantage",
        name: "Alpha Vantage",
        description: "Free/premium API for stocks, forex, and crypto data",
        type: "third_party",
        website: "https://www.alphavantage.co",
        enabled: false,
      },
      {
        id: "ds-polygon",
        name: "Polygon.io",
        description: "Real-time and historical market data for stocks, options, forex, and crypto",
        type: "third_party",
        website: "https://polygon.io",
        enabled: false,
      },
      {
        id: "ds-tiingo",
        name: "Tiingo",
        description: "Financial data API with end-of-day and intraday data",
        type: "third_party",
        website: "https://www.tiingo.com",
        enabled: false,
      },

      // File upload
      {
        id: "ds-csv-upload",
        name: "CSV / File Upload",
        description: "Upload your own historical data files (CSV, TSV)",
        type: "file_upload",
        website: "",
        enabled: false,
      },
    ];
  }

  // =============================================
  // SAVE TO BACKEND
  // =============================================

  /** Save wizard selections to the backend via existing APIs */
  saveSelections(state: WizardState): Observable<boolean> {
    this._saving.set(true);

    const enabledMarkets = state.markets.filter((m) => m.enabled);
    const enabledExchanges = state.exchanges.filter((e) => e.enabled);
    const enabledDataSources = state.dataSources.filter((d) => d.enabled);

    const calls: Observable<any>[] = [];

    // Save markets
    for (const market of enabledMarkets) {
      calls.push(
        this.http
          .post<RequestResponse>(`${this.apiBaseUrl}/Markets/save-market`, {
            id: 0,
            name: market.name,
            description: market.description,
            isActive: true,
          })
          .pipe(catchError(() => of(null))),
      );
    }

    // Save exchanges as Connection entries (service catalog)
    for (const exchange of enabledExchanges) {
      calls.push(
        this.http
          .post<RequestResponse>(`${this.apiBaseUrl}/Connections/save-connection`, {
            id: 0,
            name: exchange.name,
            description: exchange.description,
            category: this.mapMarketToCategory(exchange.marketId),
            iconKey: exchange.iconKey,
            color: exchange.color,
            website: exchange.website,
            defaultBaseUrl: exchange.defaultBaseUrl,
            requiredFields: JSON.stringify(exchange.requiredFields),
            isDataSource: enabledDataSources.some((ds) => ds.linkedExchangeId === exchange.id),
            connectionTypeId: 2,
            isActive: true,
            sortOrder: enabledExchanges.indexOf(exchange) + 1,
          })
          .pipe(catchError(() => of(null))),
      );
    }

    // Save third-party data sources as Connection entries
    for (const ds of enabledDataSources.filter((d) => d.type === "third_party")) {
      calls.push(
        this.http
          .post<RequestResponse>(`${this.apiBaseUrl}/Connections/save-connection`, {
            id: 0,
            name: ds.name,
            description: ds.description,
            category: "data_provider",
            iconKey: ds.id.replace("ds-", ""),
            color: "#6C757D",
            website: ds.website,
            defaultBaseUrl: "",
            requiredFields: JSON.stringify(["api_key"]),
            isDataSource: true,
            connectionTypeId: 2,
            isActive: true,
            sortOrder: 100,
          })
          .pipe(catchError(() => of(null))),
      );
    }

    if (calls.length === 0) {
      this._saving.set(false);
      return of(true);
    }

    return forkJoin(calls).pipe(
      map(() => {
        this._saving.set(false);
        return true;
      }),
      catchError(() => {
        this._saving.set(false);
        return of(false);
      }),
    );
  }

  private mapMarketToCategory(marketId: string): string {
    switch (marketId) {
      case "crypto":
        return "crypto_exchange";
      case "stocks":
        return "stock_broker";
      case "forex":
      case "commodities":
        return "other";
      default:
        return "other";
    }
  }
}
