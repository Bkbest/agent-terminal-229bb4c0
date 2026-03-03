# Agent Terminal

A web-based terminal interface built with React, TypeScript, and Vite.

## Technologies Used

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Installation on Raspbian/Debian OS

This application has been tested on Raspberry Pi OS (Raspbian/Debian-based systems).

### Prerequisites

Ensure your system is up to date:

```bash
sudo apt update && sudo apt upgrade -y
```

### Install Node.js and npm

Install Node.js (version 18 or higher) and npm:

```bash
# Install Node.js and npm
sudo apt install -y nodejs npm

# Verify installation
node --version
npm --version
```

### Clone and Setup the Application

```bash
# Clone the repository
git clone <YOUR_REPOSITORY_URL>
cd agent-terminal

## Deployment with systemd

The application includes a `deploy.sh` script that automatically sets up a systemd service for production deployment.

### Running the Deployment Script

```bash
# Make the script executable
chmod +x deploy.sh

# Run the deployment script
sudo ./deploy.sh
```

### Configuration in deploy.sh

Before running the deployment script, you can customize the following variables at the top of `deploy.sh`:

```bash
SERVICE_NAME="agent-terminal"      # Name of the systemd service
RUN_USER="bkbest21"                # User to run the service (will be created if doesn't exist)
PORT="8080"                        # Frontend port
API_PORT="8001"                    # Backend API port
WS_PORT="8001"                     # WebSocket port
LANGGRAPH_HOST='192.168.68.111'    # Backend host IP
```

**To change the port and user:**

1. Edit the `deploy.sh` file
2. Modify the variables at the top:
   - Change `RUN_USER` to your desired username
   - Change `PORT` to your desired frontend port
   - Change `API_PORT` to your desired API port
   - Change `WS_PORT` to your desired WebSocket port
   - Change `LANGGRAPH_HOST` to your backend host IP
3. Save the file and run `sudo ./deploy.sh`

## Service Management

Once deployed, you can manage the service using systemctl commands:

### Check Service Status

```bash
sudo systemctl status agent-terminal.service
```

### View Service Logs

```bash
# View recent logs
sudo journalctl -u agent-terminal.service -n 50

# Follow logs in real-time
sudo journalctl -u agent-terminal.service -f
```

### Start/Stop/Restart Service

```bash
# Start the service
sudo systemctl start agent-terminal.service

# Stop the service
sudo systemctl stop agent-terminal.service

# Restart the service
sudo systemctl restart agent-terminal.service

# Enable service to start on boot
sudo systemctl enable agent-terminal.service

# Disable service from starting on boot
sudo systemctl disable agent-terminal.service
```

### Reload systemd Configuration

If you modify the service file manually:

```bash
sudo systemctl daemon-reload
sudo systemctl restart agent-terminal.service
```

## Development

For local development:

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Accessing the Application

After deployment, access the application at:

```
http://<YOUR_PI_IP_ADDRESS>:8080
```

Find your Pi's IP address:
```bash
hostname -I
```

## Troubleshooting

### Check Service Status
```bash
sudo systemctl status agent-terminal.service
```

### Check Logs for Errors
```bash
sudo journalctl -u agent-terminal.service -n 100
```

### Verify Port is in Use
```bash
sudo netstat -tlnp | grep 8080
```

### Check File Permissions
```bash
ls -la /path/to/agent-terminal/
```

### Restart the Service
```bash
sudo systemctl restart agent-terminal.service
```
