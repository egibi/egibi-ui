# Privacy Policy

<div class="doc-meta" style="margin-bottom: 1.5rem; color: #6c757d; font-size: 0.9rem;">
  <p><strong>Effective Date:</strong> February 8, 2026 &nbsp;|&nbsp; <strong>Last Updated:</strong> February 8, 2026</p>
</div>

Egibi LLC ("Egibi," "we," "us," or "our") operates the Egibi platform, a multi-asset algorithmic trading application accessible via web browser. This Privacy Policy explains how we collect, use, store, and protect your personal information when you use our services.

By creating an account or using the Egibi platform, you consent to the data practices described in this policy.

## 1. Information We Collect

### 1.1 Information You Provide Directly

- **Account Information:** First name, last name, email address, and password when you register for an account.
- **Exchange API Credentials:** API keys, API secrets, passphrases, and related credentials you provide to connect your cryptocurrency exchange accounts (e.g., Binance, Coinbase, Kraken).
- **Account Configuration:** Exchange account names, descriptions, fee structures, and trading preferences you configure within the platform.

### 1.2 Information Collected Through Third-Party Services

- **Banking Information via Plaid:** When you choose to link a bank account as a funding source, we use Plaid Inc. ("Plaid") to securely connect to your financial institution. Through Plaid, we access your account and routing numbers (Auth product) and account balances (Balance product). Plaid's use of your data is governed by [Plaid's Privacy Policy](https://plaid.com/legal/#end-user-privacy-policy).
- **Banking Information via Mercury:** If you connect a Mercury business bank account, we access account balances and account identifiers through Mercury's API using your authorized credentials.

### 1.3 Information Collected Automatically

- **Usage Data:** We may collect information about how you interact with the platform, including pages visited, features used, and actions taken.
- **Authentication Data:** Login timestamps, session tokens, and token refresh activity for security and session management purposes.

## 2. How We Use Your Information

We use your information solely to provide and improve the Egibi platform:

- **Provide Services:** Execute your configured trading strategies, run backtests, display account balances, and manage exchange connections.
- **Authenticate and Secure Your Account:** Verify your identity, manage sessions, and protect against unauthorized access.
- **Connect to Exchanges:** Use your API credentials to communicate with cryptocurrency exchanges on your behalf for data retrieval and trade execution.
- **Connect to Funding Sources:** Use Plaid and Mercury integrations to retrieve bank account information you have authorized.
- **Improve the Platform:** Analyze usage patterns in aggregate to improve features, fix bugs, and enhance performance.
- **Communicate with You:** Send service-related notifications, security alerts, or respond to your inquiries.

## 3. How We Protect Your Information

We implement security measures designed to protect your personal and financial data:

- **Encryption at Rest:** Exchange API credentials are encrypted using AES-256-GCM with per-user data encryption keys (DEK). Each user's DEK is itself encrypted with a master key that is never stored in the database.
- **Encryption in Transit:** All data transmitted between your browser and our servers is encrypted via TLS 1.2 or higher.
- **Password Security:** User passwords are hashed using bcrypt with a work factor of 12. We never store plaintext passwords.
- **Access Controls:** All API endpoints enforce authentication and user-scoped data access. You can only access your own data.
- **Infrastructure Security:** Database access is restricted to application servers only, with no public exposure. Firewalls and network segmentation are in place.

For more detail on our security practices, please review our [Information Security Policy](/documentation) available within the platform.

## 4. Data Sharing and Disclosure

We do not sell, rent, or trade your personal information. We share your data only in the following circumstances:

- **Plaid:** When you initiate a bank account connection, your banking credentials are transmitted to and processed by Plaid to retrieve account information. We receive only the account and routing numbers and balance data — Plaid does not share your bank login credentials with us.
- **Cryptocurrency Exchanges:** Your API credentials are transmitted directly to the respective exchange APIs to execute the actions you have authorized (retrieving balances, placing trades, etc.).
- **Mercury:** Your authorized Mercury credentials are used to retrieve business bank account information.
- **Legal Requirements:** We may disclose your information if required to do so by law, regulation, legal process, or governmental request.
- **Protection of Rights:** We may disclose information to protect the rights, property, or safety of Egibi, our users, or others.

## 5. Data Retention

- **Account Data:** We retain your account information for as long as your account is active. If you delete your account, we will delete or anonymize your personal data within 30 days, except as required by law.
- **Exchange Credentials:** Encrypted API credentials are retained while the associated exchange account is active in your profile. When you remove an exchange account, the associated credentials are deleted.
- **Plaid Tokens:** Plaid access tokens are retained while the linked bank account remains connected. When you disconnect a funding source, the associated token is revoked and deleted.
- **Backtest and Strategy Data:** Historical backtest results and strategy configurations are retained as part of your account data and are deleted when your account is deleted.

## 6. Your Rights and Choices

You have the following rights regarding your personal data:

- **Access:** You may request a copy of the personal data we hold about you.
- **Correction:** You may update or correct your account information at any time through the platform.
- **Deletion:** You may request deletion of your account and associated data by contacting us.
- **Credential Revocation:** You may remove exchange API credentials or disconnect funding sources at any time through the platform.
- **Withdraw Consent:** You may withdraw your consent to data processing by deleting your account. Note that withdrawing consent will result in loss of access to platform services.

To exercise any of these rights, contact us at the address provided in Section 10.

## 7. Children's Privacy

Egibi is not intended for use by individuals under the age of 18. We do not knowingly collect personal information from minors. If we become aware that we have collected data from a minor, we will take steps to delete that information promptly.

## 8. Third-Party Links and Services

The Egibi platform integrates with third-party services (Plaid, Mercury, cryptocurrency exchanges). Each of these services has its own privacy policy governing their handling of your data. We encourage you to review their privacy policies. Egibi is not responsible for the privacy practices of third-party services.

## 9. Changes to This Policy

We may update this Privacy Policy from time to time. If we make material changes, we will notify you through the platform or by email prior to the changes taking effect. The "Last Updated" date at the top of this policy indicates when it was most recently revised. Your continued use of the platform after changes are posted constitutes your acceptance of the updated policy.

## 10. Contact Information

If you have questions about this Privacy Policy or wish to exercise your data rights, contact us at:

**Egibi LLC**
7154 Burning Tree Ct
Mobile, AL 36695
Email: admin@egibi.io

---

**Egibi LLC**
Last Updated: February 8, 2026
