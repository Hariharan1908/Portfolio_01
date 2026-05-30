# 🚀 React Portfolio — AWS EC2 Deployment Guide

Full walkthrough for building a React portfolio with Vite and deploying it on **AWS EC2 (Ubuntu)** behind **Nginx**.

---

## 📁 Project Structure

```
portfolio-aws-ec2/
├── src/
│   ├── App.jsx          ← All React components
│   └── main.jsx         ← Entry point
├── index.html
├── package.json
├── vite.config.js
├── nginx.conf           ← Nginx site config
├── deploy.sh            ← One-command deploy script
└── README.md
```

---

## PART 1 — Local Development

### Step 1 — Prerequisites

Make sure you have these installed locally:

```bash
node --version    # v18+
npm --version     # v9+
git --version
```

If Node isn't installed: https://nodejs.org/

### Step 2 — Set Up the React App

```bash
# Create the project folder and enter it
mkdir portfolio && cd portfolio

# Copy all project files into this folder, then install deps:
npm install

# Start dev server (hot reload at http://localhost:5173)
npm run dev
```

Open `http://localhost:5173` — you should see the portfolio.

### Step 3 — Customise the Content

Edit `src/App.jsx`:
- Change `Alex Johnson` → your name  
- Update `SKILLS`, `PROJECTS`, `EXPERIENCE` arrays  
- Replace social links in the Contact section  
- Swap the initials `AJ` in the avatar

### Step 4 — Build for Production

```bash
npm run build
```

This creates a `dist/` folder with optimised, minified static files ready to serve.

---

## PART 2 — AWS EC2 Setup

### Step 5 — Launch an EC2 Instance

1. Log in to https://console.aws.amazon.com
2. Navigate to **EC2 → Instances → Launch Instance**
3. Configure:
   - **Name**: `portfolio-server`
   - **AMI**: Ubuntu Server 24.04 LTS (Free Tier eligible)
   - **Instance type**: `t2.micro` (Free Tier)
   - **Key pair**: Create new → name it `portfolio-key` → Download `.pem` file  
     ⚠️ Save this file — you can't download it again!
   - **Network settings**: Check ✅ Allow SSH, ✅ Allow HTTP, ✅ Allow HTTPS

4. Click **Launch Instance** and wait ~1 minute for it to start.
5. Note your **Public IPv4 address** from the instance details page.

### Step 6 — Configure Key Permissions

```bash
# On your local machine — restrict .pem permissions (required by SSH)
chmod 400 ~/Downloads/portfolio-key.pem
```

### Step 7 — SSH into Your EC2 Instance

```bash
ssh -i ~/Downloads/portfolio-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

Replace `YOUR_EC2_PUBLIC_IP` with the IP from Step 5.

You should now be inside the Ubuntu server:
```
ubuntu@ip-172-xx-xx-xx:~$
```

---

## PART 3 — Configure the Server

### Step 8 — Update System Packages

```bash
sudo apt update && sudo apt upgrade -y
```

### Step 9 — Install Nginx

```bash
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx   # auto-start on reboot

# Verify — open http://YOUR_EC2_PUBLIC_IP in a browser
# You should see the default Nginx welcome page
```

### Step 10 — Install Node.js (for building on server, optional)

If you want to build on the server itself (vs. uploading the built `dist/`):

```bash
# Install Node via NVM (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
source ~/.bashrc
nvm install 20
node --version   # v20.x.x
```

### Step 11 — Create Web Directory

```bash
sudo mkdir -p /var/www/portfolio/dist
sudo chown -R ubuntu:ubuntu /var/www/portfolio
```

---

## PART 4 — Deploy the App

### Method A — Automated (Recommended)

From your **local machine** (in the project folder):

```bash
# Make deploy script executable
chmod +x deploy.sh

# Run it
./deploy.sh YOUR_EC2_PUBLIC_IP ~/Downloads/portfolio-key.pem
```

This script will:
1. Run `npm run build` locally
2. Upload `dist/` to the server via `rsync`
3. Upload and apply the Nginx config
4. Reload Nginx

Done! Visit `http://YOUR_EC2_PUBLIC_IP` to see your live portfolio. ✅

---

### Method B — Manual Step-by-Step

If you prefer to understand each step:

#### Upload the built files

```bash
# From your local machine
scp -i ~/Downloads/portfolio-key.pem -r dist/ ubuntu@YOUR_EC2_IP:/var/www/portfolio/
```

#### Upload the Nginx config

```bash
scp -i ~/Downloads/portfolio-key.pem nginx.conf ubuntu@YOUR_EC2_IP:/tmp/portfolio.conf
```

#### Configure Nginx (on the server)

```bash
# SSH into server
ssh -i ~/Downloads/portfolio-key.pem ubuntu@YOUR_EC2_IP

# Move config into place
sudo mv /tmp/portfolio.conf /etc/nginx/sites-available/portfolio

# Enable the site
sudo ln -sf /etc/nginx/sites-available/portfolio /etc/nginx/sites-enabled/portfolio

# Disable default site
sudo rm -f /etc/nginx/sites-enabled/default

# Test config syntax
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

Visit `http://YOUR_EC2_IP` — your portfolio should be live!

---

## PART 5 — Optional Enhancements

### Step 12 — Add a Free SSL Certificate (HTTPS)

```bash
# On the server
sudo apt install certbot python3-certbot-nginx -y

# Run certbot (requires a domain name pointing to your EC2 IP)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal test
sudo certbot renew --dry-run
```

After this, your site will be accessible at `https://yourdomain.com`.

### Step 13 — Point a Domain Name

1. Buy a domain at Namecheap, GoDaddy, or use AWS Route 53.
2. Create an **A record** pointing to your EC2 Public IP.
3. Wait 5–30 min for DNS propagation, then run the certbot step above.

### Step 14 — Set Up Automatic Updates via GitHub Actions (CI/CD)

Create `.github/workflows/deploy.yml` in your repo:

```yaml
name: Deploy to EC2

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Node
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install & Build
        run: |
          npm ci
          npm run build

      - name: Deploy via rsync
        uses: burnett01/rsync-deployments@7.0.1
        with:
          switches: -avzr --delete
          path: dist/
          remote_path: /var/www/portfolio/dist/
          remote_host: ${{ secrets.EC2_HOST }}
          remote_user: ubuntu
          remote_key: ${{ secrets.EC2_SSH_KEY }}

      - name: Reload Nginx
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ubuntu
          key: ${{ secrets.EC2_SSH_KEY }}
          script: sudo systemctl reload nginx
```

Add secrets in **GitHub → Settings → Secrets**:
- `EC2_HOST` — your EC2 public IP
- `EC2_SSH_KEY` — contents of your `.pem` file

Now every `git push` to `main` auto-deploys to EC2!

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `Permission denied (publickey)` | Check `.pem` has `chmod 400`, and you're using the right user (`ubuntu` for Ubuntu AMI) |
| Nginx `403 Forbidden` | Check `sudo chown -R ubuntu:ubuntu /var/www/portfolio` and `/var/www/portfolio/dist` exists |
| Site shows Nginx default page | Run `sudo rm /etc/nginx/sites-enabled/default && sudo systemctl reload nginx` |
| Page loads but React routes 404 | Ensure nginx.conf has `try_files $uri $uri/ /index.html;` |
| Port 80 not reachable | Go to EC2 Security Group → Inbound Rules → Add HTTP (port 80) from 0.0.0.0/0 |

---

## Architecture Overview

```
  Browser
     │  HTTP :80
     ▼
  AWS EC2 (Ubuntu)
  ┌─────────────────────────────┐
  │  Nginx (port 80/443)        │
  │  ↓ serves static files      │
  │  /var/www/portfolio/dist/   │
  │  └── index.html             │
  │  └── assets/ (JS, CSS)      │
  └─────────────────────────────┘
```

Since React is a SPA (static files), no Node.js process needs to run on the server — Nginx serves the pre-built files directly. Simple, fast, and cheap (Free Tier eligible).

---

*Built with React + Vite. Deployed on AWS EC2 + Nginx.*




<!-- # React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project. -->
