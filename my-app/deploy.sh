#!/bin/bash
# =========================================================
#  deploy.sh — Build and sync portfolio to AWS EC2
#  Usage:  ./deploy.sh <EC2_PUBLIC_IP> <PEM_KEY_PATH>
#  Example: ./deploy.sh 54.123.45.67 ~/.ssh/my-key.pem
# =========================================================
set -e

EC2_IP="${1:?Usage: ./deploy.sh <EC2_IP> <PEM_KEY>}"
PEM="${2:?Provide path to your .pem key}"
USER="ubuntu"
REMOTE_DIR="/var/www/portfolio"

echo "▶  Building React app..."
npm run build

echo "▶  Uploading dist/ to EC2..."
rsync -avz --delete -e "ssh -i $PEM -o StrictHostKeyChecking=no" \
  dist/ "$USER@$EC2_IP:$REMOTE_DIR/dist/"

echo "▶  Uploading nginx config..."
scp -i "$PEM" nginx.conf "$USER@$EC2_IP:/tmp/portfolio.conf"

echo "▶  Applying nginx config on server..."
ssh -i "$PEM" "$USER@$EC2_IP" << 'EOF'
  sudo mv /tmp/portfolio.conf /etc/nginx/sites-available/portfolio
  sudo ln -sf /etc/nginx/sites-available/portfolio /etc/nginx/sites-enabled/portfolio
  sudo rm -f /etc/nginx/sites-enabled/default
  sudo nginx -t
  sudo systemctl reload nginx
EOF

echo "✅  Deployment complete!  →  http://$EC2_IP"
