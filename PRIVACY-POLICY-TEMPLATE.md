# Privacy Policy Template for Cially Instances

> **README FOR HOSTS / SERVER OWNERS:**
> This document is a **template** designed for independent hosts, server owners, or organizations running their own instance of **Cially** (including the Discord Bot, Next.js Web Dashboard, and PocketBase backend). 
> 
> **IMPORTANT DISCLAIMER:** The authors, contributors, and maintainers of the open-source **Cially** project do **not** host, collect, store, process, or have access to any data generated or processed by your self-hosted instance. The individual or entity running the instance (the **"Host"** or **"Data Controller"**) is solely responsible for legal compliance, data security, and user privacy. 
> 
> Please review and replace all bracketed placeholders (e.g., `[Host Name / Organization]`, `[Contact Email]`) before publishing this policy to your users.

---

**Last Updated:** `August 5, 2026`  
**Effective Date:** `August 5, 2026`

This Privacy Policy explains how **`[Host Name / Organization / Server Name]`** ("we," "us," or "our") collects, uses, stores, and protects information when you interact with our hosted instance of **Cially**—which includes our Cially Discord Bot, Web Dashboard, and underlying database infrastructure (collectively, the "Service").

By inviting our Cially Bot to your Discord server, interacting in a Discord server where our Cially Bot is active, or logging into our Cially Web Dashboard, you consent to the data practices described in this Privacy Policy.

---

## 1. Roles and Responsibilities (Open-Source Architecture)

Cially is open-source software built using a **Next.js** dashboard, a **Discord Bot API** integration, and a **PocketBase** backend database.

* **We (`[Host Name / Organization]`) are the Data Controller:** We own and operate the database, hosting servers, and bot instance. We determine how data is collected, stored, and managed.
* **The Cially Project Maintainers are NOT Responsible:** The developers and contributors of the Cially open-source repository are software licensors only. They do not operate our servers, do not receive any telemetry or user data from our instance, and assume no liability for data handling.
* **Discord Inc. is an Independent Platform:** Our Service integrates with Discord. Your interactions on Discord are also subject to [Discord’s Terms of Service](https://discord.com/terms) and [Discord’s Privacy Policy](https://discord.com/privacy).

---

## 2. Information We Collect

We collect only the structured data necessary to calculate server analytics, render visual dashboards, and manage server engagement.

### A. Summary of Collected Data Categories

| Category | Specific Data Points Collected | Source | Purpose |
| :--- | :--- | :--- | :--- |
| **User Identifiers** | Discord User ID (Snowflake), username, display name, avatar hash/URL | Discord API | Identifying users on leaderboards, and resolving IDs to readable names. |
| **Server (Guild) Metadata** | Server ID, server name, icon URL, total member counts | Discord API | Categorizing analytics per server and rendering dashboard headers. |
| **Channel & Role Metadata** | Channel IDs, channel names, role IDs, role hierarchy | Discord API | Displaying channel-specific activity trends and managing dashboard permissions. |
| **Message Analytics** | Timestamps of sent messages, message frequency per channel/user | Discord Gateway | Calculating chat activity trends, leaderboards, and heatmaps. *(We do **not** store raw message content).* |
| **Voice Analytics** | Voice channel join/leave timestamps, duration spent in voice | Discord Gateway | Calculating voice engagement metrics and activity leaderboards. |
| **Growth & Retention** | Member join/leave timestamps, invite code attribution | Discord Gateway | Tracking community growth, retention rates, and invite effectiveness. |
| **Dashboard Preferences** | Theme settings, custom view configurations, selected date ranges | Web Dashboard | Personalizing the web dashboard user experience. |

> **Note on Message Content:** Our Cially Bot is designed for statistical analysis and **does not log, store, or process the textual content of your Discord messages** unless explicitly enabled by a custom modification made by the server administrator.

---

## 3. How We Use Your Information

We use the collected information strictly for the operation and enhancement of the Service:

1. **Rendering Server Analytics:** To calculate engagement metrics, voice activity durations, channel traffic, and growth trends displayed on the Cially Web Dashboard.
2. **Entity Resolution:** To synchronize numerical Discord IDs stored in our PocketBase database with human-readable usernames, role names, and channel names.
4. **System Maintenance & Security:** To monitor bot uptime, prevent API rate-limiting, and protect our database against unauthorized access or abuse.

---

## 4. How Data is Stored and Protected

* **Database Infrastructure:** All analytics and user identifiers are stored in our **PocketBase** database hosted on our private infrastructure at `[Insert Server Location / Provider, e.g., dedicated Linux servers in City, Country / AWS / Hetzner]`.
* **Access Restrictiveness:** Access to the underlying PocketBase database and administration panel is strictly restricted to authorized system administrators of `[Host Name / Organization]`.
* **Security Controls:** We employ industry-standard encryption in transit (HTTPS/TLS for the Web Dashboard and secure API tokens for the Discord Bot) and implement database-level access rules to safeguard stored metrics.

---

## 5. Data Sharing and Disclosure

We do **not** sell, rent, lease, or monetize your personal information. Information is disclosed only under the following limited circumstances:

* **Server Administrators & Members:** Depending on the privacy configuration set by your Discord server's owner, analytics leaderboards and activity metrics may be visible to members or administrators of that specific Discord server via the Web Dashboard.
* **Service Providers:** We may use third-party cloud infrastructure providers (e.g., hosting providers) to run our server instance. These providers process data solely on our behalf and under confidentiality obligations.
* **Legal Requirements:** We may disclose data if required by applicable law, regulation, legal process, or lawful governmental request.

---

## 6. Data Retention

* **Active Engagement:** We retain server and user analytics for as long as our Cially Bot is installed on your Discord server and as necessary to provide historical trend analysis (e.g., 30-day, 90-day).
* **Bot Removal & Server Deletion:** If our Cially Bot is removed from a Discord server, or if a server administrator requests deletion, we will purge or anonymize the associated server analytics from our PocketBase database within `[Insert Number, e.g., 30]` days, unless retention is required by law.
* **4-Weeks Rule**: Data such as total messages sent per hour/day/week, detailed voice-channel stats & more get purged every 4 weeks to comply with Discord's Retention Rules. Only data such as the total amount of messages, attachments etc. ever sent remains forever in the database. 

---

## 7. Your Privacy Rights (GDPR / CCPA Compliance)

Depending on your jurisdiction, you may have the following rights regarding your data:

* **Right of Access:** You may request an export of the data records we hold associated with your Discord User ID.
* **Right to Erasure ("Right to be Forgotten"):** You may request that we delete your individual user activity records from our PocketBase database. You can do it on your own by using the `/privacy-settings` Discord command
* **Right to Rectification:** Since Cially mirrors Discord profile data (usernames, avatars), updating your profile on Discord will automatically update your display data on the Cially dashboard upon the next sync cycle.
* **Server-Wide Opt-Out:** Server owners may terminate all data collection immediately by kicking or removing the Cially Bot from their Discord server.

To exercise any of these rights, please contact us using the information below. We will ask for your Discord User ID and may require verification through Discord to confirm your identity before processing requests.

---

## 8. Contact Information

If you have questions, data deletion requests, or concerns regarding this Privacy Policy or our hosted Cially instance, please contact us:

* **Host / Controller Name:** `[Host Name / Organization]`
* **Contact Email:** `[Insert Email Address, e.g., privacy@yourdomain.com]`
* **Support Discord Server:** `[Insert Discord Invite Link]`
* **Website / Dashboard URL:** `[Insert Dashboard URL, e.g., https://cially.yourdomain.com]`

---
*This Privacy Policy template was made for independent Cially deployments based on the Cially open-source architecture (Next.js, Discord Bot, PocketBase). Altering the source-code might break certain terms of this document. We advise you to use the original & latest version of Cially as we try our best to stay compliant with Discord's ToS.*
