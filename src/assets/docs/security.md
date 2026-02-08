# Authentication & Session Security

Egibi uses the OAuth 2.0 Authorization Code flow with PKCE (Proof Key for Code Exchange), which is the industry standard for securing single-page applications. The OIDC server is embedded in the API via OpenIddict, eliminating the need for a separate identity provider.

### PKCE Protection

- **code_verifier** — 64 random base64url characters generated per auth flow, stored in sessionStorage
- **code_challenge** — SHA-256 hash of verifier, sent with authorization request (S256 method)
- **Token exchange** requires the original code_verifier, preventing authorization code interception attacks
- **Each flow** generates a unique state parameter for CSRF protection, validated on callback

### Cookie Security

- **Cookie Name** — "egibi.auth" (EgibiCookie authentication scheme)
- **HttpOnly** — true (JavaScript cannot access the cookie)
- **SameSite** — None (required for cross-origin SPA at localhost:4200 ↔ API at localhost:7182)
- **Secure** — Always (required when SameSite=None; ensures HTTPS transport)
- **Expiry** — 30-minute sliding window

### Token Management

- **Access tokens** stored in sessionStorage (cleared when tab closes)
- **Refresh tokens** stored in sessionStorage for silent renewal
- **Auto-refresh** scheduled 60 seconds before access token expiry
- **HTTP interceptor** attaches Bearer token to all API requests (skips /auth/* and /connect/token)
- **401 responses** trigger automatic token refresh; logout on refresh failure
- **Server-side cleanup** — StorageService periodically prunes expired tokens and stale authorizations from PostgreSQL (via /Storage/cleanup or cron)

### Password Security

- **Passwords hashed** with bcrypt (work factor 12)
- **Password reset tokens** — cryptographically random, SHA-256 hashed before database storage
- **Reset token expiry** — 1 hour from generation
- **Forgot-password endpoint** always returns success to prevent email enumeration
- **Password complexity** enforced on both frontend (live indicators) and backend (server validation)

# Credential Encryption Architecture

Egibi uses a two-tier encryption system for storing sensitive credentials (exchange API keys, secrets, passphrases). This ensures that even a full database breach does not expose usable credentials.

<pre class="doc-diagram">MASTER KEY (env var / vault — never in DB)
      │
      ├── encrypts ──► User A DEK (stored in AppUser.EncryptedDataKey)
      │                     │
      │                     ├── encrypts ──► Coinbase API key
      │                     └── encrypts ──► Binance API secret
      │
      └── encrypts ──► User B DEK (stored in AppUser.EncryptedDataKey)
                            │
                            └── encrypts ──► Coinbase API key</pre>

# Encryption Implementation

- **Algorithm** — AES-256-GCM (authenticated encryption with tamper detection)
- **Key Size** — 256-bit (32 bytes) for both master key and per-user DEKs
- **Nonce** — 96-bit random nonce generated per encryption operation
- **Tag** — 128-bit authentication tag appended to ciphertext
- **Storage Format** — Base64 encoded: [nonce (12 bytes) + ciphertext (N bytes) + tag (16 bytes)]
- **Password Hashing** — bcrypt with work factor 12 (for user login passwords)
- **Service** — IEncryptionService / EncryptionService in Services/Security/

### Key Hierarchy

- **Master Key** — Stored in environment variable (EGIBI_MASTER_KEY) or secure vault. Never in database or source control.
- **Per-User DEK** — Random 256-bit key generated at account creation. Encrypted with master key before DB storage.
- **Credential Ciphertext** — Individual API keys/secrets encrypted with user's DEK. Stored in UserCredential table.

### Key Rotation

Master key rotation re-encrypts each user's DEK without touching their individual credentials. A KeyVersion column on both AppUser and UserCredential enables incremental rotation.

# Secrets Management & Master Key

The master encryption key must be generated before first run and stored securely — never in source control. Egibi supports multiple methods for generating and configuring the key.

### Generating a Master Key

Use any of the following methods to generate a cryptographically random 256-bit (32-byte) base64-encoded key:

### Option A — PowerShell (quick)

```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }) -as [byte[]])
```

### Option B — C# Interactive (cryptographically secure)

```csharp
using System.Security.Cryptography;
Console.WriteLine(Convert.ToBase64String(RandomNumberGenerator.GetBytes(32)));
```

### Option C — EncryptionService Static Helper

```csharp
// Call from anywhere in the codebase or a test project:
var key = EncryptionService.GenerateMasterKey();
Console.WriteLine(key);
```

### Local Development

For local development, store the generated key in appsettings.Development.json under Encryption:MasterKey. This file is excluded from source control via .gitignore and will not be committed.

```json
// appsettings.Development.json
{
  "Encryption": {
    "MasterKey": "YOUR_GENERATED_BASE64_KEY_HERE"
  }
}
```

### CI/CD — GitHub Repository Secrets

.NET reads environment variables with __ (double underscore) as the configuration section separator. For example, ENCRYPTION__MASTERKEY maps to Encryption:MasterKey in configuration. Configure these secrets on the egibi/egibi-api GitHub repository:

<table class="doc-table">
<thead><tr><th>Entity / Column</th><th>Type</th><th>Purpose</th></tr></thead>
<tbody>
<tr><td><code>ENCRYPTION__MASTERKEY</code></td><td><span class="doc-badge">string (base64)</span></td><td>AES-256 master encryption key (32 bytes, base64-encoded)</td></tr>
<tr><td><code>CONNECTIONSTRINGS__EGIBIDB</code></td><td><span class="doc-badge">string</span></td><td>PostgreSQL connection string</td></tr>
<tr><td><code>CONNECTIONSTRINGS__QUESTDB</code></td><td><span class="doc-badge">string</span></td><td>QuestDB connection string</td></tr>
<tr><td><code>PLAID__CLIENTID</code></td><td><span class="doc-badge">string</span></td><td>Plaid API client ID</td></tr>
<tr><td><code>PLAID__SECRET</code></td><td><span class="doc-badge">string</span></td><td>Plaid API secret</td></tr>
<tr><td><code>ADMINSEED__DEFAULTPASSWORD</code></td><td><span class="doc-badge">string</span></td><td>Initial admin account password</td></tr>
</tbody>
</table>

### GitHub Actions Example

```yaml
# In your GitHub Actions workflow:
env:
  Encryption__MasterKey: ${{ secrets.ENCRYPTION__MASTERKEY }}
  ConnectionStrings__EgibiDb: ${{ secrets.CONNECTIONSTRINGS__EGIBIDB }}
  ConnectionStrings__QuestDb: ${{ secrets.CONNECTIONSTRINGS__QUESTDB }}
  Plaid__ClientId: ${{ secrets.PLAID__CLIENTID }}
  Plaid__Secret: ${{ secrets.PLAID__SECRET }}
  AdminSeed__DefaultPassword: ${{ secrets.ADMINSEED__DEFAULTPASSWORD }}
```

### Files Excluded from Source Control (.gitignore)

- **appsettings.Development.json** — Local dev secrets (master key, DB passwords, Plaid keys)
- **appsettings.Production.json** — Production secrets and connection strings

# Security Rules

- API endpoints must NEVER return decrypted credentials — show masked versions only (e.g., ••••••XXXX)
- Decrypted keys exist in memory only during active API calls, then are discarded
- EF Core query logging must not capture encrypted field values
- Master key must not appear in appsettings.json (production), source control, or logs
- All API endpoints accepting credentials must enforce HTTPS
- CORS restricted to specific origins (localhost:4200) with AllowCredentials for cookie transport
- Development uses ephemeral signing/encryption keys — production must use persistent certificates
- The old Encryptor.cs (PBKDF2+AES-CBC) has been removed — use EncryptionService for all encryption
- All controllers require [Authorize] — no unauthenticated access to any endpoint except /auth/* and /connect/*
- ExchangeAccount entity no longer contains plaintext Username/Password fields — credentials stored only in encrypted UserCredential
- Connection entity no longer copies ApiKey/ApiSecretKey during create/update — legacy plaintext fields deprecated
- Admin seed password loaded from configuration (AdminSeed:DefaultPassword), not hardcoded
- Upload limit enforced at 100 MB (FormOptions.MultipartBodyLengthLimit) to prevent abuse
- DateTime operations use DateTime.UtcNow consistently (not DateTime.Now.ToUniversalTime())
- Auth interceptor retries the original failed request after successful token refresh
- Archived data on external disk retains the same security posture — no credentials are stored in QuestDB partitions or pg_dump backups (credentials are encrypted in PostgreSQL)
- Storage operations (archive, restore, backup) require authentication via [Authorize] on StorageController
