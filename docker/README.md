# 🪸 How to run
### 🚀 Initial Setup
1. Go to the [Discord Developer Portal](https://discord.com/developers/applications) and create a **new Application**.  
2. Open the **Bot** section and enable all **Privileged Gateway Intents** (see the example image below).  
   ![image](https://github.com/user-attachments/assets/6b22ba34-cac4-4483-a9bb-2921224616cc)  
3. Invite your bot to your Discord server.  
4. Give the bot **View Channel** and **View Message History** permissions on every channel you want it to track.  
5. *Optional:* Grant the bot **Manage Server** permissions if you also want it to track Vanity URL usage.

---

### 🐳 Docker Setup

> [!TIP]
> Are you using **Pangolin**? Check the **pangolin-setup** file in the same directory!

1. **Complete the initial setup** steps above first.  
2. Download or copy the `docker-compose.yaml` file from the `docker` folder.  
3. Download or copy the `.env.example` file from the same folder and place it in the **same directory** as `docker-compose.yaml`.  
4. Rename `.env.example` to `.env`.  
5. Open `.env` and update the values for `TOKEN`, `CLIENT_ID`, and `POCKETBASE_URL`.  
   - Use your real PocketBase URL (not a local/internal one).  
   - Example: `http://your-domain:8090/`  
6. Run the following command to start everything:  
   ```bash
   docker compose up
7. **Optional**: In case you change your pocketbase port, make sure to update your application URL in the pocketbase Dashboard.
<img width="1907" height="480" alt="image" src="https://github.com/user-attachments/assets/79e31185-fbb6-4b33-8a50-8fef53743f39" />
9. Success! The dashboard should be up and running! 

------------

> [!TIP]
> If forget your Cially Password, you can use the `/reset-account` command on your Discord Server. Only Server Owners can use that!

> [!CAUTION]
> Only the events that happened while the bot is up and running are being tracked and displayed on the dashboard! Older events (such as older messages) or events that happened while the bot was offline for whatever reason are NOT being tracked. Therefore, the data will be inaccurate unless the bot is running without any downtimes 24/7. There is an option to retrieve older messages in the *Messages* page

------------
