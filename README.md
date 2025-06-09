<p align="center">
<img src="https://github.com/user-attachments/assets/196fe635-3d81-46ae-92c3-f34296ce02c0">
</p>

# 🪼 Cially
**Cially** is a powerful, open-source dashboard designed to provide in-depth insights, real-time analytics, and detailed statistics for your Discord server. Monitor member activity, track engagement trends, and make data-driven decisions with ease. 

Perfect for community managers, moderators, and server admins looking to optimize their Discord communities!

## 🐚 Features
- [x] Shows the name, description, icon and current members
- [x] Shows if the server is in an outage
- [x] Shows if a server is Discord Partnered
- [x] Shows the creation date of your server
- [x] Shows the owner of the server
- [x] Shows the number of channels, roles & bans
- [x] Shows the Vanity URL and the total uses
- [x] Shows Message Data
  - [x] Messages sent per hour
  - [x] Messages sent per day
  - [x] Messages sent per week
  - [x] Total Messages Ever Sent
  - [x] Tota Media (Photos/Videos) ever sent
  - [x] Total Message Deletions
  - [x] Total Message Edits
- [x] Shows Activity Data
  - [x] Most Active Channels
  - [x] Most Active Users
  - [x] Most Active Hours
  - [x] Total Online/Idle/Offline Members
- [x] User Search Page
  - [x] Shows how many times the user has left/joined the server
  - [x] Shows average message length
  - [x] Shows the number of total invites created
  - [x] Shows the total amount of messages ever sent by them
  - [x] Shows the channel they are most active on
  - [x] Shows when their account was created
- [x] Beautiful User Friendly UI
- [x] Responsive for every device
- [ ] More Features to come in the future...

## 🐟 Screenshots
![image](https://github.com/user-attachments/assets/aaa15308-971c-4e19-9808-25a000272a30)
![image](https://github.com/user-attachments/assets/9c9d3b57-63bc-4491-9913-47e6fc37e3a5)
![image](https://github.com/user-attachments/assets/f4cc2b4d-6378-4a85-8ddb-043d5c3ea792)
![image](https://github.com/user-attachments/assets/e80c31b4-3ca2-4e96-9953-326cedcd061b)

## 🐠 How it works
Cially Dashboard is powered by a Discord Bot, a full-stack Next.js application, and Pocketbase as the backend. The Discord Bot actively listens to all events happening on your server and logs them to the database via its own API.
The web application then retrieves this data from the database to display detailed insights and information to the user. Since the database stores data using IDs (for users, channels, etc.), the website communicates directly with the bot to resolve these IDs into human-readable names and to fetch the most up-to-date information on demand.
All ongoing synchronization and data enrichment—such as resolving names or syncing recent activity—is handled seamlessly between the bot and the website.

## 🪸 How to run
### Initial Setup
1. Go to [Discord Developer Portal](https://discord.com/developers/applications) and create a new Application
2. Go to `Bot` Section and enable all the of `Privileged Gateway Intents` as shown in the picture bellow
![image](https://github.com/user-attachments/assets/6b22ba34-cac4-4483-a9bb-2921224616cc)
3. Invite the Bot to your Discord Server
4. Give it permissions to `View Channel` & `View Message History` on every channel you want the bot to track
> [!TIP]
> **OPTIONAL** Give the bot `Manage Server` permission if you want it to track Vanity URL Uses
5. Once you got PocketBase up and running, go to Settings -> Import -> Load from JSON file
![image](https://github.com/user-attachments/assets/0e499018-39b7-4057-9eac-70b92deb83d8)
6. Upload the pb_schema json file that can be found in the `/pocketbase` directory
7. Review Changes and then apply them
> [!WARNING]  
> Do not change anything in the database if you don't know what you are doing! Changing a small detail might break the dashboard

### Docker Setup
1. Download or copy the [docker-compose.yaml](./docker-compose.yaml) and [example.env](./example.env) files from the repository.
2. (Optional) Ensure the `pb_migrations` directory is located at `./pocketbase/pb_migrations` relative to the `docker-compose.yaml` file on your host machine. This directory will be mounted to `/pocketbase/pb_migrations` inside the container to automatically create the needed collections.
3. Edit the docker-compose.yaml file and replace the environment variables in the .env with your own values.
4. Run `docker compose up -d` to start the services.
5. Make sure to follow the initial setup instructions regarding Pocketbase/Discord Bot Setup.
6. Success! The dashboard should be up and running! Make sure to let the bot store some data first before checking your servers! 

### Manual Setup
#### Pocketbase Instance
1. Install [Pocketbase 0.26.0](https://github.com/pocketbase/pocketbase/releases/tag/v0.26.6)
2. Run `./pocketbase serve` to start the backend
3. Open the URL displayed on your terminal and create an admin account
4. Then follow the *Initial Setup* instructions that can be found above

#### Discord Bot
1. Clone the `/cially-bot` directory where you want the Bot Code to run on.
2. Rename `.env.example` file to `.env` and replace each value. There are instructions for each variable so you will know what to change
4. Make sure to follow the *Initial Setup* instructions that can be found above

#### Website
1. Clone the `./cially-webserver` directory where you want the Website Code to run on
2. Rename `.env.example` file to `.env` and replace each value. There are instructions for each variable so you will know what to change
3. Run `npm run build` to build the website. 

> [!TIP]
> If you are using a VPS (or any other kind of machine to run all the services 24/7) you should use Docker for easier setup. Manual installation is not really suggested for beginners.

And that's it! Once a new message is being detected by the bot for the first time, everything should start to work automatically! All you need to do is go to your Dashboard Page, paste your Server ID and all the data will be displayed!

> [!CAUTION]
> Only the events that happened while the bot is up and running are being tracked and displayed on the dashboard! Older events (such as older messages) or events that happened while the bot was offline for whatever reason are NOT being tracked. Therefore, the data will be inaccurate unless the bot is running without any downtimes 24/7

## 🦭 Support & Security
If you have any questions or if you discover a security vulnerability within Cially, please join my [Discord Server](https://discord.gg/TNzPwhRvXH) and let me know! I will try to assist you as soon as possible!
Please do not publish publicly security vulnerabilities. 

## 🍤 Contributing
Please open a PR for new features or issues you managed to fix! However keep the following in mind:
- Do not open pull requests regarding minor issues such as grammatical errors. Open an issue instead
- Do not sumbit "troll" or "spam" requests
- Do not rewrite a big part of the project in a single pull request

## 📜 License
This project is licensed under the [Attribution-NonCommercial-NoDerivs 2.0 License](https://creativecommons.org/licenses/by-nc-nd/2.0/deed.en)
### You are free to:
- **Share** — copy and redistribute the material in any medium or format
- **Adapt** — remix, transform, and build upon the material
The licensor cannot revoke these freedoms as long as you follow the license terms.
### Under the following terms:
- **Attribution** — You must give appropriate credit , provide a link to the license, and indicate if changes were made . You may do so in any reasonable manner, but not in any way that suggests the licensor endorses you or your use.
- **NonCommercial** — You may not use the material for commercial purposes .
-** No additional restrictions** — You may not apply legal terms or technological measures that legally restrict others from doing anything the license permits.

### Created by [Skell](https://github.com/skellgreco)! Please leave a ⭐ if you like this project and want to see more features!
