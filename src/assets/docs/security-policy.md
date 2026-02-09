# Information Security Policy

<div class="doc-meta" style="margin-bottom: 1.5rem; color: #6c757d; font-size: 0.9rem;">
  <p><strong>Document Version:</strong> 1.0 &nbsp;|&nbsp; <strong>Effective Date:</strong> February 8, 2026 &nbsp;|&nbsp; <strong>Last Reviewed:</strong> February 8, 2026</p>
  <p><strong>Classification:</strong> Internal / Confidential</p>
</div>

## 1. Purpose

This policy establishes the information security framework for Egibi LLC. It defines the controls, procedures, and responsibilities we use to protect sensitive data, including user financial information, API credentials, and system infrastructure. The goal is to identify, mitigate, and continuously monitor security risks relevant to our business as an algorithmic trading platform.

## 2. Scope

This policy applies to all systems, data, and operations managed by Egibi LLC, including:

- The Egibi API (backend services, databases, and infrastructure)
- The Egibi web application (frontend client)
- Third-party integrations (Plaid, Mercury, cryptocurrency exchanges)
- All user data processed or stored by the platform
- Development environments, source code repositories, and CI/CD pipelines

## 3. Roles and Responsibilities

**Managing Member (Adam Hubbard):** Responsible for the overall security posture of Egibi LLC, including policy creation, enforcement, risk assessment, incident response, and vendor security evaluation. As sole member, all security decisions and oversight flow through this role.

## 4. Risk Identification and Assessment

### 4.1 Risk Categories

Egibi identifies and tracks risks across the following categories:

- **Data Security:** Unauthorized access to user financial data, API keys, or personally identifiable information (PII)
- **Infrastructure Security:** Compromise of servers, databases, or cloud resources
- **Application Security:** Vulnerabilities in the API or web application (injection attacks, authentication bypass, etc.)
- **Third-Party Risk:** Security failures at integrated services (Plaid, exchanges, banking partners)
- **Operational Risk:** Data loss due to hardware failure, misconfiguration, or human error

### 4.2 Risk Assessment Process

1. Identify assets and their sensitivity (user data, credentials, infrastructure)
2. Evaluate threats and vulnerabilities applicable to each asset
3. Assess the likelihood and potential impact of each identified risk
4. Assign a risk rating (High, Medium, Low) and determine appropriate controls
5. Document findings and review at least annually or after significant changes

## 5. Data Protection Controls

### 5.1 Encryption

- All data in transit is encrypted via TLS 1.2 or higher
- User API credentials (exchange keys) are encrypted at rest using AES-256-GCM with per-user data encryption keys (DEK)
- Database connections use encrypted channels
- Sensitive configuration values (connection strings, API secrets) are stored in environment variables or secure vaults, never in source code

### 5.2 Access Control

- User authentication is handled via OpenIddict with OAuth 2.0 / OpenID Connect
- All API endpoints enforce authentication and user-scoped data access (users can only access their own data)
- Administrative access to production infrastructure requires multi-factor authentication (MFA)
- Principle of least privilege is applied to all system and service accounts

### 5.3 Credential Management

- Exchange API credentials are encrypted immediately upon receipt and never stored in plaintext
- Plaid access tokens are stored securely and scoped to the minimum required permissions (Auth, Balance)
- All secrets and tokens are rotated on a defined schedule or immediately upon suspected compromise

## 6. Infrastructure Security

- Production servers are hardened with minimal installed software and disabled unnecessary services
- Database access is restricted to application servers only (no public exposure)
- Firewalls and network segmentation limit lateral movement between services
- System and application logs are collected and retained for security monitoring and incident investigation
- Operating systems and dependencies are kept up to date with security patches

## 7. Application Security

- Input validation and parameterized queries are used throughout the API to prevent injection attacks
- CORS policies restrict cross-origin access to authorized domains
- Rate limiting is applied to authentication endpoints to prevent brute-force attacks
- Source code is maintained in version-controlled repositories (GitHub) with branch protection rules
- Dependencies are monitored for known vulnerabilities and updated promptly

## 8. Third-Party Risk Management

Egibi integrates with external services that handle sensitive financial data. Each integration is evaluated for security posture before adoption:

- **Plaid:** SOC 2 Type II certified. Used for bank account verification and balance checks. Access scoped to Auth and Balance products only.
- **Mercury:** Used for business banking. Access restricted to authorized account holders with MFA.
- **Cryptocurrency Exchanges (Binance, Coinbase, Kraken):** API keys are configured with minimum required permissions. Withdrawal permissions are disabled where possible.

Vendor security posture is reviewed annually or when material changes occur to the integration.

## 9. Incident Response

### 9.1 Incident Classification

<table class="doc-table">
  <thead>
    <tr>
      <th>Severity</th>
      <th>Description</th>
      <th>Response Time</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Critical</strong></td>
      <td>Active breach, data exfiltration, or compromise of user funds</td>
      <td>Immediate</td>
    </tr>
    <tr>
      <td><strong>High</strong></td>
      <td>Vulnerability actively being exploited or imminent threat</td>
      <td>Within 4 hours</td>
    </tr>
    <tr>
      <td><strong>Medium</strong></td>
      <td>Vulnerability identified but not yet exploited</td>
      <td>Within 24 hours</td>
    </tr>
    <tr>
      <td><strong>Low</strong></td>
      <td>Minor security issue with limited impact</td>
      <td>Within 7 days</td>
    </tr>
  </tbody>
</table>

### 9.2 Response Procedures

1. **Contain:** Isolate affected systems to prevent further damage
2. **Assess:** Determine scope and impact of the incident
3. **Remediate:** Patch vulnerabilities, revoke compromised credentials, and restore services
4. **Notify:** Inform affected users and relevant authorities as required by law
5. **Document:** Record incident details, timeline, root cause, and corrective actions
6. **Review:** Conduct post-incident review and update controls to prevent recurrence

## 10. Business Continuity and Disaster Recovery

- Database backups are performed on a regular schedule and stored in a separate location from production
- Backup restoration is tested periodically to verify data integrity
- Critical configuration and infrastructure are documented to enable rapid rebuilding
- Recovery time objectives (RTO) and recovery point objectives (RPO) are defined for core services

## 11. Security Monitoring

- Application and system logs are reviewed for anomalous activity
- Failed authentication attempts are tracked and trigger alerts at defined thresholds
- API usage patterns are monitored for abuse or unauthorized access attempts
- Dependency vulnerability scanning is integrated into the development workflow

## 12. Policy Review and Updates

This policy is reviewed at least annually or whenever a significant change occurs to Egibi's systems, integrations, or business operations. Updates are documented in the Document Control table above.

## 13. Regulatory Awareness

Egibi LLC operates with awareness of applicable regulations and industry standards, including state data breach notification laws and financial data handling requirements. As the platform grows, compliance obligations will be reassessed and this policy will be updated accordingly.

---

**Adam Hubbard**
Managing Member, Egibi LLC
Date: February 8, 2026
