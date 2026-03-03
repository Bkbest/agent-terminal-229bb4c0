#!/usr/bin/env bash
set -euo pipefail

SERVICE_NAME="agent-terminal"
RUN_USER="bkbest21"
PORT="8080"
API_PORT="8001"
WS_PORT="8001"
LANGGRAPH_HOST='192.168.68.111'

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DIST_DIR="$APP_DIR/dist"

# Check if the specified user exists
if ! id "$RUN_USER" &>/dev/null; then
  echo "User '$RUN_USER' does not exist. Creating user..."
  useradd -m -s /bin/bash "$RUN_USER"
  echo "Created user '$RUN_USER'"
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

echo "Build directory exists: $DIST_DIR"

# Create systemd service file
UNIT_PATH="/etc/systemd/system/${SERVICE_NAME}.service"

sudo tee "$UNIT_PATH" >/dev/null <<EOF
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
Environment="LANGGRAPH_HOST=${LANGGRAPH_HOST}"
Environment="WS_PORT=${WS_PORT}"
ExecStart=/usr/bin/npx --yes serve@latest -s . -l ${PORT}
Restart=always
RestartSec=3
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

# Set proper permissions BEFORE creating the service
echo "Setting permissions..."
chmod 777 "$APP_DIR"
chown -R "$RUN_USER:$RUN_USER" "$APP_DIR"
chmod -R 777 "$APP_DIR"

# Ensure dist directory is specifically accessible
chmod 777 "$DIST_DIR"
chown -R "$RUN_USER:$RUN_USER" "$DIST_DIR"

# Debug: Check permissions
echo "Debug: Checking directory permissions..."
ls -ld "$APP_DIR"
ls -ld "$DIST_DIR"
echo "Testing user access to dist directory..."
if sudo -u "$RUN_USER" test -d "$DIST_DIR" && sudo -u "$RUN_USER" test -r "$DIST_DIR" && sudo -u "$RUN_USER" test -x "$DIST_DIR"; then
  echo "✓ User $RUN_USER has full access to $DIST_DIR"
else
  echo "✗ User $RUN_USER lacks access to $DIST_DIR"
  echo "Testing individual permissions..."
  sudo -u "$RUN_USER" test -d "$DIST_DIR" && echo "  ✓ Directory exists" || echo "  ✗ Directory doesn't exist"
  sudo -u "$RUN_USER" test -r "$DIST_DIR" && echo "  ✓ Readable" || echo "  ✗ Not readable"
  sudo -u "$RUN_USER" test -x "$DIST_DIR" && echo "  ✓ Executable" || echo "  ✗ Not executable"
fi

# Reload systemd, enable and start the service
echo "Reloading systemd daemon..."
sudo systemctl daemon-reload

echo "Enabling service..."
sudo systemctl enable "${SERVICE_NAME}.service"

echo "Starting service..."
# Test service start with better error handling
if sudo systemctl start "${SERVICE_NAME}.service" 2>&1; then
  echo "✓ Service start command executed"
  sleep 3
  if sudo systemctl is-active --quiet "${SERVICE_NAME}.service"; then
    echo "✓ Service is running successfully"
  else
    echo "⚠ Service started but may have stopped"
    echo "Recent logs:"
    sudo journalctl -u "${SERVICE_NAME}.service" --no-pager -n 15
  fi
else
  echo "✗ Service failed to start"
  echo "Service logs:"
  sudo journalctl -u "${SERVICE_NAME}.service" --no-pager -n 15
fi

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
