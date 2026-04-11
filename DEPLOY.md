# Deploying Institutional Event Organizer to an EC2 Ubuntu instance

This guide contains step-by-step commands to deploy the project to an Ubuntu EC2 instance. It covers a containerized deployment using the provided Postgres init scripts and a containerized API.

Prerequisites:
- An Ubuntu EC2 instance with ports 22, 80, 443 open.
- Your domain `institutionaleventorganizer.tech` pointed to the EC2 public IP.

1) Install required system packages (Amazon Linux)

Run the included installer which automates Docker, docker-compose and build steps:

```bash
sudo bash deploy/install.sh
```

The `install.sh` will:
- install Docker and docker-compose
- build the frontend using a Node container
- copy static files into `deploy/nginx/html`
- start the compose stack which includes Postgres, API and Nginx (ports 80/443 exposed)

2) Build and run Postgres + API with Docker Compose

From the repository root on the EC2 instance:

```bash
cd /path/to/Proyecto-01/deploy
docker compose up -d --build
```

This will:
- start Postgres with the SQL init scripts from `backend/database`
- build and start the `api` service (bound to host port `5000`)

3) Build and deploy the frontend (static files)

On the EC2 instance (requires Node/npm):

```bash
cd /path/to/Proyecto-01/frontend
# install Node 18+ and npm if needed
npm ci
npm run build -- --configuration production
sudo mkdir -p /var/www/institutional-frontend
sudo cp -r dist/* /var/www/institutional-frontend/
sudo chown -R www-data:www-data /var/www/institutional-frontend
```

4) Configure Nginx

Copy `deploy/nginx/institutionaleventorganizer.conf` to `/etc/nginx/sites-available/` and enable it:

```bash
sudo cp deploy/nginx/institutionaleventorganizer.conf /etc/nginx/sites-available/institutionaleventorganizer
sudo ln -s /etc/nginx/sites-available/institutionaleventorganizer /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

5) Obtain TLS certificate (Let's Encrypt)

```bash
sudo certbot --nginx -d institutionaleventorganizer.tech -d www.institutionaleventorganizer.tech
```

6) Provide production secrets

- Set Gmail OAuth client credentials and other secrets via environment or a secret manager. When using `docker compose`, set them in a `.env` file used by the compose file or update `deploy/docker-compose.yml` accordingly.

7) Verify

- Frontend: https://institutionaleventorganizer.tech
- API: https://institutionaleventorganizer.tech/api/health (or appropriate endpoint)

Notes and next steps:
- Replace default DB password before production or use RDS.
- For a non-containerized backend, I can prepare a `systemd` unit file.
- If you want CI/CD (GitHub Actions) to build images and push to the EC2 instance, I can add that next.
