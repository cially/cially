# Setting up Cially with Pangolin

✅**What this will cover.**

Depending on how you want to set this up, you could do it via the traditional method of a reverse proxy or using a Newt. Whilst we will cover both, it is recommended to use a Newt so you do not expose the direct ports and it's all routed via Pangolin. You can do a local resource without a Newt but you should do some extra security hardening.

❌**What this will not cover.**

Setting up Pangolin as a whole, you should read the [documentation](https://docs.digpangolin.com) on how to setup Pangolin and read up how it works before reading this guide. How to setup a VPS, DNS records or how to setup Cially itself initially. 

### The changes we need to make to the `docker-compose.yaml` file.

First of all, we will remove all `ports` entries as these are no longer required if we are using a Newt. If we are not using a Newt and only using a Local site, skip this.

Initially our `docker-compose.yaml` file would look like this:
```
services:
  cially-bot:
    image: ghcr.io/cially/bot:2.0.0-beta.5
    container_name: cially-bot
    restart: unless-stopped
    env_file:
      - .env
    ports:
      - "3001:3001"
    depends_on:
      - pocketbase
      - cially-web
    networks:
      - cially-network

  cially-web:
    image: ghcr.io/cially/web:2.0.0-beta.5
    container_name: cially-web
    restart: unless-stopped
    env_file:
      - .env
    ports:
      - "3000:3000"
    depends_on:
      - pocketbase
    networks:
      - cially-network

  pocketbase:
    image: ghcr.io/cially/pocketbase:2.0.0-beta.5
    container_name: cially-pocketbase
    restart: unless-stopped
    env_file:
      - .env
    volumes:
      - pocketbase-data:/pb/pb_data
    ports:
      - "8090:8090"
    networks:
      - cially-network

networks:
  cially-network:
    driver: bridge

volumes:
  pocketbase-data:
```
It will instead look like this:

```
services:
  cially-bot:
    image: ghcr.io/cially/bot:2.0.0-beta.5
    container_name: cially-bot
    restart: unless-stopped
    env_file:
      - .env
    depends_on:
      - pocketbase
      - cially-web
    networks:
      - cially-network

  cially-web:
    image: ghcr.io/cially/web:2.0.0-beta.5
    container_name: cially-web
    restart: unless-stopped
    env_file:
      - .env
    depends_on:
      - pocketbase
    networks:
      - cially-network

  pocketbase:
    image: ghcr.io/cially/pocketbase:2.0.0-beta.5
    container_name: cially-pocketbase
    restart: unless-stopped
    env_file:
      - .env
    volumes:
      - pocketbase-data:/pb/pb_data
    networks:
      - cially-network

networks:
  cially-network:
    driver: bridge

volumes:
  pocketbase-data:
```

We will instead be exposing `cially-web` and `pocketbase` through the Newt with two resources(with some security hardening). We will also need to retreive our Newt config via Pangolin.

### Setup a site for Cially.

1. Log into your Pangolin instance and create a new site under your chosen organization.
<img width="1846" height="220" alt="image" src="https://github.com/user-attachments/assets/810ff903-dde9-4b85-9f1a-fff321d5d025" />

2. Create your site with your choosen settings (again this is up to you, I recommend a Newt Tunnel). If you are not using a Newt, skip to creating a resource for Cially and just create a local site for your host.
<img width="1571" height="551" alt="image" src="https://github.com/user-attachments/assets/e399f578-5eed-4043-9332-fee5301ab868" />
Since we are using Docker Compose already, let's grab the Docker config to make things easier!
<img width="1543" height="479" alt="image" src="https://github.com/user-attachments/assets/1f5e2ab8-47bb-41a9-a2a2-94eed27f0b8f" />

You will get the below output. Add this to your `docker-compose.yaml` file.
```
newt:
    image: fosrl/newt
    container_name: newt
    restart: unless-stopped
    environment:
      - PANGOLIN_ENDPOINT=YOURPANGOLINENTRYPOINT.HERE
      - NEWT_ID=YOURNEWTID
      - NEWT_SECRET=YOURNEWTSECRET
    networks:
      - cially-network
```

It should look like this:

```
services:
  cially-bot:
    image: ghcr.io/cially/bot:2.0.0-beta.5
    container_name: cially-bot
    restart: unless-stopped
    env_file:
      - .env
    depends_on:
      - pocketbase
      - cially-web
    networks:
      - cially-network

  cially-web:
    image: ghcr.io/cially/web:2.0.0-beta.5
    container_name: cially-web
    restart: unless-stopped
    env_file:
      - .env
    depends_on:
      - pocketbase
    networks:
      - cially-network

  pocketbase:
    image: ghcr.io/cially/pocketbase:2.0.0-beta.5
    container_name: cially-pocketbase
    restart: unless-stopped
    env_file:
      - .env
    volumes:
      - pocketbase-data:/pb/pb_data
    networks:
      - cially-network
  newt:
    image: fosrl/newt
    container_name: newt
    restart: unless-stopped
    environment:
      - PANGOLIN_ENDPOINT=SOMEENDPOINT.HERE
      - NEWT_ID=SOMEIDHERE
      - NEWT_SECRET=SOMESECRETHERE
    networks:
      - cially-network

networks:
  cially-network:
    driver: bridge

volumes:
  pocketbase-data:
```

3. You can now do `docker compose up -d`!

4. The newt will come online when you save the new site (remember to check the I have copied the configuration) and once it's online, it should show online in Pangolin.

<img width="1032" height="580" alt="{4E313986-17B4-4C95-A3B7-C991B82DBD7B}" src="https://github.com/user-attachments/assets/02e0128c-6efa-40dd-94b8-94ad04211144" />

### Creating the resources so Cially works!

Cially needs two resources created in Pangolin. One for `cially-web` and another for `pocketbase`. `pocketbase` should have some security hardening to prevent unauthorized access which is super simple to do.

1. Log into Pangolin and select resource and then the Add Resource button.
<img width="1842" height="203" alt="image" src="https://github.com/user-attachments/assets/4f4079c1-49e5-438f-b33a-91456bcd456f" />

2. Choose the correct site for Cially (the Newt tunnel you used in your `docker-compose.yaml` file. Leave the resource type as a HTTPS Resource and finally choose the domain and sub-domain you want to use.
   
<img width="1546" height="819" alt="image" src="https://github.com/user-attachments/assets/9be1b37e-c46a-40b8-a7dc-a73a9defed19" />
(NOTE, if you DO NOT have a domain and the sub-domain setup in your DNS records, do NOT attempt to do this as you will likely get rate limited for an hour if it fails multiple times).

3. Once you have created the resource, setup the authentication tab to your liking (for public dashboards, you will need to turn this off).

4. Under the Proxy tab, we will do `cially-web` first so the web front is exposed. In IP / Hostname type `cially-web` and enter port 3001. As it is a http resource we will leave the method as http. Hit Save Targets once you're done.

<img width="1556" height="227" alt="{0B309AB9-71DF-4A4C-8229-67D3BF5FAA80}" src="https://github.com/user-attachments/assets/cfee9ec6-3980-49cd-b6c3-da153de62a7a" />

5. Create a second new resource for `pocketbase` but with `pocketbase` your port is going to be 8090 and your hostname for this resource is `pocketbase`.

### Extra hardening tips

To protect the Admin dashboard for `pocketbase` (we should hopefully never need access to this directly) setup a Rule to deny `_/`. This will still allow Cially to talk to `pocketbase` even for logging into Cially and public access. If you outright deny external access to `pocketbase` you will break Cially.

<img width="1080" height="354" alt="{1C053BDC-F2E9-4996-9F42-098727BCC2DE}" src="https://github.com/user-attachments/assets/dc2b751a-fda0-4350-a844-89be6a67a3a4" />


