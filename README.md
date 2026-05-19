# CertChain - Blockchain Certificate Platform

A decentralized application (DApp) for issuing, verifying, and managing tamper-proof certificates on the Ethereum blockchain with IPFS file storage.

## 🎯 Project Overview

CertChain solves the problem of certificate fraud and centralized trust by leveraging blockchain technology. Certificates are issued on-chain, immutable, and instantly verifiable without requiring a central authority. Each certificate can optionally store supporting documents on IPFS for complete decentralization.

### Why Blockchain?

- **Immutability**: Once issued, certificates cannot be altered or forged
- **Decentralization**: No single point of failure or control
- **Transparency**: Anyone can verify certificate authenticity instantly
- **Efficiency**: Eliminates intermediaries and reduces verification time
- **Permanence**: Records persist indefinitely on the blockchain

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (HTML/CSS/JS)                   │
│  - Wallet Connection (MetaMask)                             │
│  - Certificate Issuance Form                                │
│  - Certificate Verification & Preview                       │
│  - Certificate History & PDF Export                         │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP/JSON
┌────────────────────▼────────────────────────────────────────┐
│              Backend API (Express.js)                        │
│  - POST /upload - IPFS file upload via Pinata               │
│  - POST /issue - Issue certificate on-chain                 │
│  - GET /verify/:id - Retrieve certificate data              │
└────────────────────┬────────────────────────────────────────┘
                     │ Web3 RPC
┌────────────────────▼────────────────────────────────────────┐
│         Smart Contract (Solidity 0.8.28)                    │
│  - Certificate.sol on Ethereum/Sepolia                      │
│  - Immutable certificate storage                            │
│  - Event logging for verification                           │
└─────────────────────────────────────────────────────────────┘
                     │ IPFS Gateway
┌────────────────────▼────────────────────────────────────────┐
│              IPFS (via Pinata)                              │
│  - Decentralized file storage                               │
│  - Certificate documents & metadata                         │
└─────────────────────────────────────────────────────────────┘
```

## 📋 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Smart Contracts** | Solidity 0.8.28 | Certificate logic & storage |
| **Blockchain Dev** | Hardhat + Viem | Contract compilation & deployment |
| **Frontend** | HTML5/CSS3/JavaScript | User interface |
| **Web3 Integration** | ethers.js v6 | Blockchain interaction |
| **Backend** | Node.js + Express.js | API server & IPFS integration |
| **File Storage** | IPFS (Pinata) | Decentralized document storage |
| **Wallet** | MetaMask | User authentication & transactions |
| **PDF Export** | jsPDF | Certificate download |

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- MetaMask browser extension
- Sepolia testnet ETH (get from [faucet](https://www.sepoliafaucet.com))
- Pinata account (free tier at [pinata.cloud](https://pinata.cloud))

### Installation

1. **Clone and install dependencies**
   ```bash
   git clone <repository-url>
   cd certificate-project
   npm install
   cd backend && npm install && cd ..
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your values:
   ```env
   # Sepolia RPC endpoint (get free from Alchemy or Infura)
   SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
   
   # Your wallet private key (with 0x prefix)
   SEPOLIA_PRIVATE_KEY=0xYOUR_PRIVATE_KEY
   
   # After deployment, add the contract address
   CONTRACT_ADDRESS=0xYOUR_DEPLOYED_CONTRACT
   
   # Backend RPC connection
   RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
   DEPLOYER_PRIVATE_KEY=0xYOUR_PRIVATE_KEY
   
   # Pinata JWT (get from https://app.pinata.cloud/keys)
   PINATA_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   
   # Etherscan API key (optional, for contract verification)
   ETHERSCAN_API_KEY=YOUR_ETHERSCAN_API_KEY
   ```

3. **Compile smart contracts**
   ```bash
   npm run compile
   ```

4. **Deploy to Sepolia testnet**
   ```bash
   npm run deploy:sepolia
   ```
   
   The contract address will be saved to `.env.deployed`

5. **Start the backend server**
   ```bash
   npm run backend
   ```
   
   Backend runs on `http://localhost:3000`

6. **Open the frontend**
   ```bash
   # Open frontend/index.html in your browser
   # Or use a local server:
   npx http-server frontend
   ```

## 📖 Usage Guide

### Issuing a Certificate

1. **Connect Wallet**
   - Click "Connect Wallet" button
   - Approve MetaMask connection
   - Ensure you're on Sepolia network

2. **Fill Certificate Details**
   - Certificate ID: Unique identifier (e.g., `CERT-2024-001`)
   - Student Name: Full name of certificate recipient
   - Course: Name of completed course
   - Certificate File (optional): PDF or image to store on IPFS

3. **Upload to IPFS (Optional)**
   - Click "Upload to IPFS" if you selected a file
   - Provide your Pinata JWT
   - Wait for upload confirmation

4. **Issue Certificate**
   - Click "Issue Certificate"
   - Approve transaction in MetaMask
   - Wait for blockchain confirmation
   - Certificate is now immutable on-chain

### Verifying a Certificate

1. **Enter Certificate ID**
   - Input the certificate ID in the "Verify Certificate" section
   - Click "Verify"

2. **View Certificate Details**
   - Beautiful certificate preview displays
   - Shows student name, course, issue date
   - IPFS file link (if available)
   - Blockchain verification badge

3. **Download as PDF**
   - Click "Download PDF" to save certificate locally
   - PDF includes all certificate details

### Viewing Certificate History

1. **Load History**
   - Click "Load History" button
   - All certificates issued by your wallet appear
   - Shows certificate count and details

2. **Quick Verify**
   - Click on any certificate to verify it
   - View full details and download PDF

## 🔧 Smart Contract Functions

### `issueCertificate(id, studentName, course, ipfsHash)`
Issues a new certificate on-chain.

**Parameters:**
- `id` (string): Unique certificate identifier
- `studentName` (string): Name of certificate recipient
- `course` (string): Course or achievement name
- `ipfsHash` (string): IPFS hash of certificate document (optional)

**Validation:**
- All fields except ipfsHash must be non-empty
- Certificate ID must be unique (no duplicates)

**Emits:** `CertificateIssued` event

### `verifyCertificate(id)`
Retrieves certificate details from blockchain.

**Returns:**
- `studentName` (string)
- `course` (string)
- `ipfsHash` (string)
- `date` (uint256): Unix timestamp of issuance
- `issuedBy` (address): Issuer's wallet address

### `getCertificatesByIssuer(issuer)`
Gets all certificate IDs issued by a specific address.

**Returns:** Array of certificate IDs

### `certificateExists(id)`
Checks if a certificate exists on-chain.

**Returns:** Boolean

## 📊 API Endpoints

### POST /upload
Uploads a file to IPFS via Pinata.

**Request:**
```bash
curl -X POST http://localhost:3000/upload \
  -F "file=@certificate.pdf"
```

**Response:**
```json
{
  "ipfsHash": "QmXxxx...",
  "url": "https://gateway.pinata.cloud/ipfs/QmXxxx..."
}
```

### POST /issue
Issues a certificate on-chain.

**Request:**
```json
{
  "id": "CERT-2024-001",
  "name": "Jane Doe",
  "course": "Solidity Fundamentals",
  "ipfsHash": "QmXxxx..." // optional
}
```

**Response:**
```json
{
  "success": true,
  "txHash": "0xabc123..."
}
```

### GET /verify/:id
Retrieves certificate data from blockchain.

**Request:**
```bash
curl http://localhost:3000/verify/CERT-2024-001
```

**Response:**
```json
{
  "studentName": "Jane Doe",
  "course": "Solidity Fundamentals",
  "ipfsHash": "QmXxxx...",
  "date": "1704067200",
  "issuedBy": "0x742d35Cc6634C0532925a3b844Bc9e7595f42e0"
}
```

## 🧪 Testing

### Local Testing with Hardhat

1. **Start local Hardhat node**
   ```bash
   npm run node
   ```

2. **Deploy to local network**
   ```bash
   npm run deploy
   ```

3. **Update .env for local testing**
   ```env
   RPC_URL=http://127.0.0.1:8545
   CONTRACT_ADDRESS=0xe7f1725e7734ce288f8367e1bb143e90bb3f0512
   ```

4. **Start backend**
   ```bash
   npm run backend
   ```

5. **Test in browser**
   - Open frontend/index.html
   - MetaMask will auto-connect to local network
   - Test certificate issuance and verification

### Manual Test Cases

**Test 1: Issue Certificate**
- [ ] Connect wallet
- [ ] Fill all required fields
- [ ] Issue certificate
- [ ] Verify transaction on Etherscan

**Test 2: Verify Certificate**
- [ ] Enter valid certificate ID
- [ ] Verify certificate details display correctly
- [ ] Check IPFS link (if file was uploaded)

**Test 3: Certificate History**
- [ ] Load history
- [ ] Verify all issued certificates appear
- [ ] Click on certificate to verify

**Test 4: PDF Export**
- [ ] Verify a certificate
- [ ] Download PDF
- [ ] Check PDF contains all details

**Test 5: Error Handling**
- [ ] Try issuing with empty fields
- [ ] Try issuing duplicate certificate ID
- [ ] Try verifying non-existent certificate
- [ ] Test with wrong network

## 📈 Gas Optimization

The smart contract is optimized for gas efficiency:

- **Storage**: Uses mappings for O(1) lookups
- **Events**: Indexed parameters for efficient filtering
- **Validation**: Early require statements to fail fast
- **Solidity Version**: 0.8.28 with optimizer enabled (200 runs)

**Estimated Gas Usage:**
- `issueCertificate`: ~80,000 - 120,000 gas
- `verifyCertificate`: ~5,000 gas (view function, no cost)
- `getCertificatesByIssuer`: ~5,000 gas (view function, no cost)

## 🔒 Security Considerations

1. **Private Key Management**
   - Never commit `.env` file to version control
   - Use environment variables for sensitive data
   - Rotate keys regularly

2. **Smart Contract Security**
   - Input validation on all parameters
   - No external calls (no reentrancy risk)
   - Immutable certificate records
   - Event logging for audit trail

3. **IPFS Security**
   - Files stored on IPFS are public
   - Use Pinata's pinning service for persistence
   - Consider encrypting sensitive documents

4. **Frontend Security**
   - MetaMask handles private key management
   - No sensitive data stored in browser
   - CORS enabled for backend communication

## 📁 Project Structure

```
certificate-project/
├── contracts/
│   └── Certificate.sol          # Smart contract
├── scripts/
│   └── deploy.js                # Deployment script
├── frontend/
│   └── index.html               # Single-page application
├── backend/
│   ├── server.js                # Express API server
│   └── package.json
├── artifacts/                   # Compiled contracts
├── cache/                       # Hardhat cache
├── .env.example                 # Environment template
├── hardhat.config.ts            # Hardhat configuration
├── package.json                 # Project dependencies
└── README.md                    # This file
```

## 🐛 Troubleshooting

### "Contract not deployed"
- Ensure you've run `npm run deploy:sepolia`
- Check `CONTRACT_ADDRESS` in `.env`
- Verify contract exists on Etherscan

### "MetaMask not connected"
- Install MetaMask extension
- Refresh the page
- Check browser console for errors

### "IPFS upload failed"
- Verify Pinata JWT is valid
- Check file size (max 100MB)
- Ensure Pinata account has available storage

### "Wrong network"
- Switch to Sepolia in MetaMask
- Or use local Hardhat network (Chain ID 31337)

### "Transaction failed"
- Check wallet has sufficient ETH for gas
- Verify contract address is correct
- Check backend is running on port 3000

## 📚 Resources

- [Ethereum Documentation](https://ethereum.org/en/developers/docs/)
- [Solidity Docs](https://docs.soliditylang.org/)
- [Hardhat Documentation](https://hardhat.org/docs)
- [ethers.js Documentation](https://docs.ethers.org/v6/)
- [IPFS Documentation](https://docs.ipfs.tech/)
- [Pinata Documentation](https://docs.pinata.cloud/)
- [MetaMask Documentation](https://docs.metamask.io/)

## 📝 License

MIT License - See LICENSE file for details

## 👥 Team

- **Smart Contract Developer**: Solidity implementation
- **Frontend Developer**: UI/UX and wallet integration
- **Backend Developer**: API and IPFS integration
- **Tester/Documentation**: Testing and documentation

## 🎓 Academic Context

This project is developed as part of a BSc Blockchain Engineering course, demonstrating:
- Smart contract development and deployment
- Web3 integration with frontend applications
- Decentralized application architecture
- Blockchain security best practices
- IPFS integration for decentralized storage

---

**Built with ❤️ on Ethereum & IPFS** | CertChain © 2024
