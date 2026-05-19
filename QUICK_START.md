# CertChain - Quick Start Guide

Get CertChain running in 5 minutes!

---

## Option 1: Local Development (Fastest)

### Step 1: Install Dependencies
```bash
npm install
cd backend && npm install && cd ..
```

### Step 2: Start Hardhat Node
```bash
npm run node
```
Keep this terminal open.

### Step 3: Deploy Contract (New Terminal)
```bash
npm run deploy
```

### Step 4: Start Backend (New Terminal)
```bash
npm run backend
```

### Step 5: Open Frontend
```bash
# Open in browser
open frontend/index.html

# Or use a local server
npx http-server frontend
```

### Step 6: Connect MetaMask
1. Open MetaMask
2. Add local network (Hardhat)
   - Network Name: Hardhat
   - RPC URL: http://127.0.0.1:8545
   - Chain ID: 31337
3. Click "Connect Wallet" in app
4. Approve in MetaMask

### Step 7: Test It!
1. Fill certificate form
2. Click "Issue Certificate"
3. Approve in MetaMask
4. Verify certificate
5. Download PDF

---

## Option 2: Sepolia Testnet

### Prerequisites
- MetaMask with Sepolia network
- Sepolia ETH from [faucet](https://www.sepoliafaucet.com)
- Alchemy/Infura account for RPC

### Step 1: Configure .env
```bash
cp .env.example .env
```

Edit `.env`:
```env
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
SEPOLIA_PRIVATE_KEY=0xYOUR_PRIVATE_KEY
RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
DEPLOYER_PRIVATE_KEY=0xYOUR_PRIVATE_KEY
PINATA_JWT=eyJhbGc...
```

### Step 2: Deploy to Sepolia
```bash
npm run compile
npm run deploy:sepolia
```

### Step 3: Update .env
Copy contract address from output to `.env`:
```env
CONTRACT_ADDRESS=0x...
```

### Step 4: Start Backend
```bash
npm run backend
```

### Step 5: Open Frontend
```bash
open frontend/index.html
```

### Step 6: Connect MetaMask
1. Switch to Sepolia network
2. Click "Connect Wallet"
3. Approve in MetaMask

### Step 7: Test It!
1. Fill certificate form
2. Click "Issue Certificate"
3. Approve in MetaMask
4. Wait for confirmation
5. Verify certificate

---

## Common Commands

```bash
# Compile contracts
npm run compile

# Deploy to local Hardhat
npm run deploy

# Deploy to Sepolia testnet
npm run deploy:sepolia

# Start local Hardhat node
npm run node

# Start backend API
npm run backend

# Run tests
npm test

# Serve frontend
npx http-server frontend
```

---

## Troubleshooting

### MetaMask Not Connecting?
- Install MetaMask extension
- Refresh page
- Check browser console for errors

### Backend Connection Error?
- Ensure Hardhat node is running: `npm run node`
- Ensure backend is running: `npm run backend`
- Check RPC_URL in .env

### Contract Not Deployed?
- Run: `npm run deploy` (local) or `npm run deploy:sepolia` (testnet)
- Check .env.deployed file
- Verify contract address in .env

### IPFS Upload Failed?
- Add PINATA_JWT to .env
- Check Pinata account has storage
- Verify file size < 100MB

---

## Next Steps

1. **Read Full Documentation**
   - [README.md](README.md) - Complete overview
   - [REQUIREMENTS.md](REQUIREMENTS.md) - Detailed requirements
   - [API_DOCUMENTATION.md](API_DOCUMENTATION.md) - API reference

2. **Understand Architecture**
   - [ARCHITECTURE.md](ARCHITECTURE.md) - System design

3. **Deploy to Production**
   - [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Production setup

4. **Run Tests**
   - [TESTING_GUIDE.md](TESTING_GUIDE.md) - Testing procedures

---

## Project Structure

```
certificate-project/
├── contracts/
│   └── Certificate.sol          # Smart contract
├── scripts/
│   └── deploy.js                # Deployment script
├── frontend/
│   └── index.html               # Web interface
├── backend/
│   ├── server.js                # API server
│   └── package.json
├── test/
│   └── Certificate.test.js      # Tests
├── artifacts/                   # Compiled contracts
├── .env.example                 # Environment template
├── hardhat.config.ts            # Hardhat config
├── package.json                 # Dependencies
└── README.md                    # Full documentation
```

---

## Key Features

✅ **Issue Certificates** - Create tamper-proof certificates on blockchain  
✅ **Verify Instantly** - Check authenticity without intermediaries  
✅ **IPFS Storage** - Store documents decentralized  
✅ **PDF Export** - Download certificates as PDFs  
✅ **MetaMask Integration** - Seamless wallet connection  
✅ **Beautiful UI** - Modern dark theme interface  
✅ **Mobile Friendly** - Works on all devices  

---

## Support

- Check [README.md](README.md) for detailed documentation
- Review [TESTING_GUIDE.md](TESTING_GUIDE.md) for testing help
- See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for deployment issues
- Check [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for API help

---

**Ready to go!** 🚀

Start with Option 1 for quick local testing, then move to Option 2 for testnet deployment.
