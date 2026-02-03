import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface EgibiEnvironment {
  name: string;
  tag: string;
}

@Injectable({
  providedIn: 'root'
})
export class EnvironmentService {
  
  private readonly apiBaseUrl = 'https://localhost:7182/Environment';
  
  private _environment = signal<EgibiEnvironment>({ name: 'Loading...', tag: '...' });
  private _isProduction = signal<boolean>(false);
  private _loaded = signal<boolean>(false);

  /** Current environment info */
  environment = this._environment.asReadonly();
  
  /** Whether the API is running in production mode */
  isProduction = this._isProduction.asReadonly();
  
  /** Whether the environment has been loaded from the API */
  loaded = this._loaded.asReadonly();

  constructor(private http: HttpClient) {}

  /** 
   * Load environment info from the API.
   * Called during app initialization via APP_INITIALIZER.
   */
  async load(): Promise<void> {
    try {
      const env = await firstValueFrom(
        this.http.get<EgibiEnvironment>(`${this.apiBaseUrl}/get-environment`)
      );
      this._environment.set(env);
      this._isProduction.set(env.tag === 'PROD');
      this._loaded.set(true);
    } catch (error) {
      console.warn('Could not load environment from API, defaulting to unknown.', error);
      this._environment.set({ name: 'Offline', tag: 'OFF' });
      this._loaded.set(true);
    }
  }
}
