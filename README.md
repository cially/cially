<p align="center">
<img src="https://github.com/user-attachments/assets/5ab1d84b-3dc4-44d7-928e-4bdbd0d02853">
  <a href='https://github.com/shivamkapasia0' target="_blank"><img alt='' src='https://img.shields.io/badge/_Version 2.0 Beta-100000?style=flat&logo=&logoColor=white&labelColor=000000&color=393938'/></a>

</p>

# 🪼 Cially
**Cially** is a powerful, open-source dashboard designed to provide in-depth insights, real-time analytics, and detailed statistics for your Discord server. Monitor member activity, track engagement trends, and make data-driven decisions with ease. 

Perfect for community managers, moderators, and server admins looking to optimize their Discord communities!

## 🐚 Features
- [x] Basic Server Data
- [x] Message Analytics
- [x] Growth Metrics
- [x] Activity Insights
- [x] User Search Page
- [x] UI & Customization

More details in our [Documentation](https://cially.org/guide/1-introduction/features/)

## 🐟 Screenshots
![image](https://github.com/user-attachments/assets/ab6b48c6-eec3-4e53-8623-5d564a181f92)
![image](https://github.com/user-attachments/assets/d2224fbd-a2a0-4059-b9b2-35bca2f05048)
![image](https://github.com/user-attachments/assets/ced4ead0-69a2-4284-94c8-1c75b3a833e7)
![image](https://github.com/user-attachments/assets/c3d1e137-0381-4528-9a77-0c759ebb6ff2)

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
1. Download or copy the [docker-compose.yaml](./docker-compose.yaml) file from the repository.
2. (Optional) Ensure the `pb_migrations` directory is located at `./pocketbase/pb_migrations` relative to the `docker-compose.yaml` file on your host machine. This directory will be mounted to `/pocketbase/pb_migrations` inside the container to automatically create the needed collections.
3. Edit the docker-compose.yaml file and replace the environment variables with your own values.
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
