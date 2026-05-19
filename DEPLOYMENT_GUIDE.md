# CertChain Deployment Guide

## Overview

This guide covers deploying CertChain to Sepolia testnet and production environments.

---

## Prerequisites

- Node.js 18+ and npm
- Git
- MetaMask or compatible wallet
- Sepolia testnet ETH (for gas fees)
- Alchemy or Infura account (for RPC endpoint)
- Pinata account (for IPFS)
- Etherscan account (for contract verification)

---

## Step 1: Environment Setup

### 1.1 Get RPC Endpoint

**Option A: Alchemy (Recommended)**
1. Go to [alchemy.com](https://alchemy.com)
2. Sign up and create account
3. Create new app on Sepolia network
4. Copy API key

**Option B: Infura**
1. Go to [infura.io](https://infura.io)
2. Sign up and create account
3. Create new project
4. Select Sepolia network
5. Copy endpoint URL

### 1.2 Get Wallet Private Key

1. Open MetaMask
2. Click account menu → Settings → Security & Privacy
3. Click "Reveal Secret Recovery Phrase"
4. Use a tool to derive private key from seed phrase
5. **NEVER share this key**

### 1.3 Get Pinata JWT

1. Go to [pinata.cloud](https://pinata.cloud)
2. Sign up for free account
3. Go to API Keys section
4. Create new API key
5. Copy JWT token

### 1.4 Get Etherscan API Key

1. Go to [etherscan.io](https://etherscan.io)
2. Sign up for account
3. Go to API Keys
4. Create new API key
5. Copy key

### 1.5 Get Sepolia Testnet ETH

1. Go to [sepoliafaucet.com](https://www.sepoliafaucet.com)
2. Enter your wallet address
3. Request ETH (usually 0.5 ETH)
4. Wait for confirmation

---

## Step 2: Configure Environment

### 2.1 Create .env File

```bash
cp .env.example .env
```

### 2.2 Edit .env with Your Values

```env
# Sepolia RPC endpoint
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY

# Your wallet private key (with 0x prefix)
SEPOLIA_PRIVATE_KEY=0xYOUR_PRIVATE_KEY

# Will be filled after deployment
CONTRACT_ADDRESS=

# Backend RPC connection (same as SEPOLIA_RPC_URL)
RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY

# Same private key for backend transactions
DEPLOYER_PRIVATE_KEY=0xYOUR_PRIVATE_KEY

# Pinata JWT for IPFS uploads
PINATA_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Etherscan API key (optional, for contract verification)
ETHERSCAN_API_KEY=YOUR_ETHERSCAN_API_KEY
```

### 2.3 Verify Configuration

```bash
# Check that .env is not committed
cat .gitignore | grep .env

# Verify environment variables are loaded
node -e "require('dotenv').config(); console.log(process.env.SEPOLIA_RPC_URL)"
```

---

## Step 3: Compile Smart Contract

### 3.1 Install Dependencies

```bash
npm install
cd backend && npm install && cd ..
```

### 3.2 Compile Contract

```bash
npm run compile
```

**Expected Output:**
```
✅ Compiled successfully
```

### 3.3 Verify Compilation

```bash
ls -la artifacts/contracts/Certificate.sol/Certificate.json
```

---

## Step 4: Deploy to Sepolia

### 4.1 Deploy Contract

```bash
npm run deploy:sepolia
```

**Expected Output:**
```
Deploying to sepolia with account: 0x...
Transaction hash: 0x...
Waiting for confirmation...
✅ Certificate deployed to: 0x...
📝 Address saved to .env.deployed
```

### 4.2 Verify Deployment

```bash
cat .env.deployed
```

Should show:
```
CONTRACT_ADDRESS=0x...
NETWORK=sepolia
```

### 4.3 Update .env

Copy the contract address from `.env.deployed` to `.env`:

```env
CONTRACT_ADDRESS=0x... # Copy from .env.deployed
```

### 4.4 Verify on Etherscan

1. Go to [sepolia.etherscan.io](https://sepolia.etherscan.io)
2. Search for your contract address
3. Verify contract details
4. (Optional) Verify source code for transparency

---

## Step 5: Start Backend Server

### 5.1 Start Server

```bash
npm run backend
```

**Expected Output:**
```
✅ Backend running on http://localhost:3000
📝 Contract Address: 0x...
🔗 RPC URL: https://eth-sepolia.g.alchemy.com/v2/...
```

### 5.2 Test Backend

```bash
# Health check
curl http://localhost:3000/health

# Expected response
{"status":"ok","timestamp":"2024-01-01T00:00:00.000Z"}
```

### 5.3 Keep Backend Running

For development, keep terminal open. For production, use process manager:

```bash
# Using PM2
npm install -g pm2
pm2 start backend/server.js --name "certchain-backend"
pm2 save
pm2 startup
```

---

## Step 6: Deploy Frontend

### 6.1 Update Frontend Configuration

Edit `frontend/index.html` and verify contract addresses:

```javascript
const CONTRACT_ADDRESSES = {
  31337: "0xe7f1725e7734ce288f8367e1bb143e90bb3f0512",  // Local
  11155111: "0x...", // Update with your Sepolia address
};
```

### 6.2 Serve Frontend Locally

```bash
# Option 1: Using http-server
npx http-server frontend

# Option 2: Using Python
cd frontend && python -m http.server 8000

# Option 3: Using Node.js
npm install -g serve
serve frontend
```

### 6.3 Access Frontend

Open browser and go to:
- `http://localhost:8080` (http-server)
- `http://localhost:8000` (Python)
- `http://localhost:3000` (serve)

### 6.4 Test Frontend

1. Connect MetaMask wallet
2. Ensure you're on Sepolia network
3. Try issuing a test certificate
4. Verify certificate
5. Download PDF

---

## Step 7: Production Deployment

### 7.1 Deploy Backend to Cloud

**Option A: Heroku**

```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create app
heroku create certchain-backend

# Set environment variables
heroku config:set SEPOLIA_RPC_URL=https://...
heroku config:set DEPLOYER_PRIVATE_KEY=0x...
heroku config:set CONTRACT_ADDRESS=0x...
heroku config:set PINATA_JWT=eyJ...

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

**Option B: AWS EC2**

```bash
# SSH into instance
ssh -i key.pem ec2-user@instance-ip

# Install Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Clone repository
git clone <repo-url>
cd certificate-project

# Install dependencies
npm install
cd backend && npm install && cd ..

# Create .env file
nano .env
# Paste environment variables

# Install PM2
npm install -g pm2

# Start backend
pm2 start backend/server.js --name "certchain"
pm2 save
pm2 startup

# Configure nginx as reverse proxy
sudo yum install -y nginx
sudo systemctl start nginx
```

### 7.2 Deploy Frontend to Cloud

**Option A: Vercel**

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Follow prompts
```

**Option B: Netlify**

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=frontend
```

**Option C: AWS S3 + CloudFront**

```bash
# Upload to S3
aws s3 sync frontend/ s3://your-bucket-name/

# Create CloudFront distribution
# Point to S3 bucket
# Enable HTTPS
```

### 7.3 Configure Domain

1. Purchase domain (GoDaddy, Namecheap, etc.)
2. Point DNS to your hosting provider
3. Enable HTTPS/SSL certificate
4. Update CORS in backend for your domain

---

## Step 8: Verification Checklist

### Smart Contract
- [ ] Contract deployed to Sepolia
- [ ] Contract address saved in .env
- [ ] Contract verified on Etherscan
- [ ] Can issue certificates
- [ ] Can verify certificates

### Backend
- [ ] Backend running on port 3000
- [ ] Health check endpoint working
- [ ] IPFS upload working
- [ ] Certificate issuance working
- [ ] Certificate verification working
- [ ] Error handling working

### Frontend
- [ ] Frontend loads without errors
- [ ] MetaMask connection working
- [ ] Can connect to Sepolia network
- [ ] Can issue certificates
- [ ] Can verify certificates
- [ ] PDF export working
- [ ] Responsive on mobile

### Security
- [ ] .env file not committed to git
- [ ] Private keys not exposed
- [ ] HTTPS enabled (production)
- [ ] CORS configured correctly
- [ ] Input validation working

---

## Troubleshooting

### Deployment Issues

**Error: "Invalid private key"**
- Ensure private key has 0x prefix
- Ensure private key is 64 hex characters
- Check for extra spaces or newlines

**Error: "Contract not deployed"**
- Verify deployment completed successfully
- Check .env.deployed file
- Verify contract address on Etherscan

**Error: "Insufficient funds"**
- Get more Sepolia ETH from faucet
- Check wallet balance on Etherscan
- Ensure using correct wallet

### Backend Issues

**Error: "PINATA_JWT not set"**
- Add PINATA_JWT to .env
- Restart backend server
- Verify JWT is valid

**Error: "Contract not found"**
- Verify CONTRACT_ADDRESS in .env
- Ensure contract is deployed
- Check RPC_URL is correct

**Error: "Network error"**
- Check RPC_URL is accessible
- Verify internet connection
- Check Alchemy/Infura status

### Frontend Issues

**Error: "MetaMask not connected"**
- Install MetaMask extension
- Refresh page
- Check browser console for errors

**Error: "Wrong network"**
- Switch to Sepolia in MetaMask
- Verify network ID is 11155111
- Check contract address for network

**Error: "Transaction failed"**
- Check wallet has sufficient ETH
- Verify contract address
- Check backend is running

---

## Monitoring

### Backend Monitoring

```bash
# View logs
pm2 logs certchain-backend

# Monitor resources
pm2 monit

# Check status
pm2 status
```

### Contract Monitoring

1. Go to [sepolia.etherscan.io](https://sepolia.etherscan.io)
2. Search for contract address
3. View transactions and events
4. Monitor gas usage

### IPFS Monitoring

1. Go to [pinata.cloud](https://pinata.cloud)
2. View uploaded files
3. Check storage usage
4. Monitor API usage

---

## Maintenance

### Regular Tasks

- [ ] Monitor backend logs
- [ ] Check contract events
- [ ] Verify IPFS files are accessible
- [ ] Update dependencies monthly
- [ ] Backup private keys securely
- [ ] Monitor gas prices

### Updates

```bash
# Update dependencies
npm update

# Update Node.js
nvm install 20
nvm use 20

# Restart backend
pm2 restart certchain-backend
```

---

## Rollback Procedure

If deployment fails:

1. **Revert code changes**
   ```bash
   git revert <commit-hash>
   git push
   ```

2. **Redeploy previous version**
   ```bash
   npm run deploy:sepolia
   ```

3. **Restart backend**
   ```bash
   pm2 restart certchain-backend
   ```

---

## Support

For deployment issues:
1. Check error messages carefully
2. Review logs and console output
3. Verify all environment variables
4. Check blockchain explorer (Etherscan)
5. Test endpoints with curl

---

**Last Updated**: 2024  
**Version**: 1.0.0  
**Status**: Production Ready
