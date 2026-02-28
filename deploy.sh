#!/usr/bin/env bash
set -euo pipefail

SERVICE_NAME="agent-terminal"
RUN_USER="bkbest21"
PORT="8080"
API_PORT="8001"
WS_PORT="8001"

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DIST_DIR="$APP_DIR/dist"

# Check if running as root or with sudo
if [[ "$(id -un)" != "root" ]]; then
  echo "This script must be run as root (use sudo)"
  exit 1
fi

# Install Node.js dependencies
echo "Installing Node.js dependencies..."
cd "$APP_DIR"
sudo -u "$RUN_USER" npm install

# Build the application
echo "Building the application..."
sudo -u "$RUN_USER" npm run build

# Check if build was successful
if [[ ! -d "$DIST_DIR" ]]; then
  echo "Build failed: dist directory not found"
  exit 1
fi

# Install serve package globally for serving the built app
echo "Installing serve package..."
sudo -u "$RUN_USER" npm install -g serve

# Create systemd service file
UNIT_PATH="/etc/systemd/system/${SERVICE_NAME}.service"

cat > "$UNIT_PATH" <<EOF
[Unit]
Description=${SERVICE_NAME} - Vite React Application
After=network.target research-agent.service
Requires=research-agent.service

[Service]
Type=simple
User=${RUN_USER}
WorkingDirectory=${DIST_DIR}
Environment="PORT=${PORT}"
Environment="API_PORT=${API_PORT}"
Environment="WS_PORT=${WS_PORT}"
ExecStart=/usr/bin/npx serve -s . -l ${PORT}
Restart=always
RestartSec=3
StandardOutput=journal
StandardError=journal

# Security settings
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=${DIST_DIR}

[Install]
WantedBy=multi-user.target
EOF

# Set proper permissions
chown -R "$RUN_USER:$RUN_USER" "$APP_DIR"
chmod -R 755 "$APP_DIR"

# Reload systemd, enable and start the service
echo "Reloading systemd daemon..."
systemctl daemon-reload

echo "Enabling service..."
systemctl enable "${SERVICE_NAME}.service"

echo "Starting service..."
systemctl start "${SERVICE_NAME}.service"

echo ""
echo "=========================================="
echo "Deployment completed successfully!"
echo "=========================================="
echo "Service: ${SERVICE_NAME}.service"
echo "User: ${RUN_USER}"
echo "Frontend Port: ${PORT}"
echo "API Port: ${API_PORT}"
echo "WebSocket Port: ${WS_PORT}"
echo "App Directory: ${APP_DIR}"
echo "Build Directory: ${DIST_DIR}"
echo ""
echo "Service management commands:"
echo "  Status: sudo systemctl status ${SERVICE_NAME}.service"
echo "  Logs: sudo journalctl -u ${SERVICE_NAME}.service -f"
echo "  Restart: sudo systemctl restart ${SERVICE_NAME}.service"
echo "  Stop: sudo systemctl stop ${SERVICE_NAME}.service"
echo "  Start: sudo systemctl start ${SERVICE_NAME}.service"
echo ""
echo "To view the app, open: http://$(hostname -I | awk '{print $1}'):${PORT}"
echo "=========================================="
