# CertChain Architecture & Design Document

## 1. System Architecture Overview

CertChain is a three-tier decentralized application (DApp) that combines blockchain, IPFS, and traditional web technologies.

```
┌─────────────────────────────────────────────────────────────────┐
│                         PRESENTATION LAYER                      │
│                    Frontend (HTML/CSS/JavaScript)               │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ • Wallet Connection (MetaMask)                           │  │
│  │ • Certificate Issuance Form                              │  │
│  │ • Certificate Verification & Preview                     │  │
│  │ • Certificate History & PDF Export                       │  │
│  │ • Responsive UI (Desktop & Mobile)                       │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────┬─────────────────────────────────────┘
                             │ HTTP/JSON
┌────────────────────────────▼─────────────────────────────────────┐
│                      APPLICATION LAYER                           │
│                  Backend API (Express.js)                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ • POST /upload - IPFS file upload via Pinata             │  │
│  │ • POST /issue - Issue certificate on-chain              │  │
│  │ • GET /verify/:id - Retrieve certificate data            │  │
│  │ • Error handling & validation                            │  │
│  │ • CORS support                                           │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────┬─────────────────────────────────────┘
                             │ Web3 RPC
┌────────────────────────────▼─────────────────────────────────────┐
│                      BLOCKCHAIN LAYER                            │
│              Smart Contract (Solidity 0.8.28)                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ • Certificate.sol on Ethereum/Sepolia                    │  │
│  │ • Immutable certificate storage                          │  │
│  │ • Event logging for audit trail                          │  │
│  │ • Input validation & security checks                     │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────┬─────────────────────────────────────┘
                             │ IPFS Gateway
┌────────────────────────────▼─────────────────────────────────────┐
│                      STORAGE LAYER                               │
│                    IPFS (via Pinata)                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ • Decentralized file storage                             │  │
│  │ • Certificate documents & metadata                       │  │
│  │ • Content-addressed storage (IPFS hash)                  │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Component Architecture

### 2.1 Frontend Components

```
frontend/index.html
├── Navigation Bar
│   ├── Brand Logo
│   └── Network Status Indicator
├── Hero Section
│   ├── Title & Description
│   └── Feature Stats
├── Wallet Card
│   ├── Connect Button
│   ├── Connection Status
│   └── Address Display
├── Issue Certificate Card
│   ├── Form Inputs (ID, Name, Course)
│   ├── File Upload Area
│   ├── IPFS Upload Button
│   └── Issue Button
├── Verify Certificate Card
│   ├── Certificate ID Input
│   ├── Verify Button
│   └── Certificate Preview
│       ├── Student Name
│       ├── Course Name
│       ├── Issue Date
│       ├── Certificate ID
│       ├── IPFS Link
│       └── PDF Download Button
├── Certificate History Card
│   ├── Load History Button
│   └── Certificate List
│       ├── Certificate ID
│       ├── Student Name
│       ├── Course
│       └── Issue Date
└── Footer
    └── Links & Copyright
```

### 2.2 Backend Components

```
backend/server.js
├── Express App Setup
│   ├── CORS Configuration
│   ├── JSON Parser
│   └── Multer File Upload
├── Environment Configuration
│   ├── Load .env variables
│   ├── Initialize ethers.js
│   └── Load contract ABI
├── Route Handlers
│   ├── POST /upload
│   │   ├── File validation
│   │   ├── IPFS upload
│   │   └── Response formatting
│   ├── POST /issue
│   │   ├── Input validation
│   │   ├── Contract call
│   │   └── Transaction confirmation
│   ├── GET /verify/:id
│   │   ├── Contract query
│   │   ├── Data formatting
│   │   └── Error handling
│   └── GET /health
│       └── Status check
└── Error Handling
    ├── Try-catch blocks
    ├── Error messages
    └── HTTP status codes
```

### 2.3 Smart Contract Components

```
Certificate.sol
├── Data Structures
│   ├── Cert struct
│   │   ├── studentName
│   │   ├── course
│   │   ├── ipfsHash
│   │   ├── date
│   │   └── issuedBy
│   └── Mappings
│       ├── certificates (ID → Cert)
│       └── issuedBy (Address → IDs)
├── Events
│   └── CertificateIssued
│       ├── id (indexed)
│       ├── studentName
│       ├── course
│       ├── issuedBy (indexed)
│       └── date
├── Functions
│   ├── issueCertificate()
│   │   ├── Input validation
│   │   ├── Duplicate check
│   │   ├── Storage
│   │   └── Event emission
│   ├── verifyCertificate()
│   │   └── Data retrieval
│   ├── getCertificatesByIssuer()
│   │   └── History retrieval
│   └── certificateExists()
│       └── Existence check
└── Security
    ├── Input validation
    ├── Require statements
    └── No external calls
```

---

## 3. Data Flow Diagrams

### 3.1 Certificate Issuance Flow

```
User (Frontend)
    │
    ├─ 1. Fill certificate form
    │   └─ ID, Name, Course, File (optional)
    │
    ├─ 2. [Optional] Upload file to IPFS
    │   │
    │   └─ Backend: POST /upload
    │       │
    │       ├─ Validate file
    │       ├─ Upload to Pinata
    │       └─ Return IPFS hash
    │
    ├─ 3. Issue certificate
    │   │
    │   └─ Frontend: Call MetaMask
    │       │
    │       └─ Backend: POST /issue
    │           │
    │           ├─ Validate inputs
    │           ├─ Call contract.issueCertificate()
    │           ├─ Wait for confirmation
    │           └─ Return tx hash
    │
    └─ 4. Display success
        └─ Show transaction hash
```

### 3.2 Certificate Verification Flow

```
User (Frontend)
    │
    ├─ 1. Enter certificate ID
    │
    ├─ 2. Click verify
    │   │
    │   └─ Backend: GET /verify/:id
    │       │
    │       ├─ Query blockchain
    │       ├─ Call contract.verifyCertificate()
    │       └─ Return certificate data
    │
    ├─ 3. Display certificate preview
    │   ├─ Student name
    │   ├─ Course name
    │   ├─ Issue date
    │   ├─ Certificate ID
    │   ├─ IPFS link
    │   └─ Blockchain badge
    │
    └─ 4. [Optional] Download PDF
        └─ Generate PDF with jsPDF
```

### 3.3 File Upload to IPFS Flow

```
User (Frontend)
    │
    ├─ 1. Select file
    │
    ├─ 2. Click "Upload to IPFS"
    │   │
    │   └─ Frontend: POST /upload
    │       │
    │       ├─ Validate file
    │       ├─ Send to backend
    │       │
    │       └─ Backend: uploadToIPFS()
    │           │
    │           ├─ Create FormData
    │           ├─ Add Pinata JWT
    │           ├─ POST to Pinata API
    │           └─ Return IPFS hash
    │
    ├─ 3. Display IPFS hash
    │
    └─ 4. Use hash in certificate issuance
```

---

## 4. Database Schema

### 4.1 On-Chain Storage (Smart Contract)

**Certificates Mapping**
```
mapping(string => Cert) certificates

Key: Certificate ID (string)
Value: Cert struct
  - studentName: string
  - course: string
  - ipfsHash: string
  - date: uint256 (Unix timestamp)
  - issuedBy: address
```

**IssuedBy Mapping**
```
mapping(address => string[]) issuedBy

Key: Issuer address
Value: Array of certificate IDs
```

### 4.2 IPFS Storage

**File Structure**
```
IPFS Hash (CID)
└── Certificate Document
    ├── Filename: certificate.pdf
    ├── Content-Type: application/pdf
    └── Size: Variable
```

### 4.3 Frontend Storage

**LocalStorage (Optional)**
```
{
  "lastVerifiedCert": "CERT-2024-001",
  "walletAddress": "0x...",
  "networkId": "11155111"
}
```

---

## 5. Security Architecture

### 5.1 Smart Contract Security

```
Input Validation
├── Non-empty checks
│   ├── ID cannot be empty
│   ├── Name cannot be empty
│   └── Course cannot be empty
├── Uniqueness checks
│   └── Certificate ID must be unique
└── Type validation
    └── String length validation

State Management
├── Immutable records
│   └── Once issued, cannot be modified
├── Proper access control
│   └── Anyone can issue (public function)
└── Event logging
    └── All issuances logged for audit

No Reentrancy
├── No external calls
├── No delegatecall
└── No untrusted contract interaction
```

### 5.2 Backend Security

```
Environment Variables
├── Private keys in .env
├── Never hardcoded
└── Never logged

Input Validation
├── File type validation
├── File size limits
└── Parameter validation

Error Handling
├── Generic error messages
├── No sensitive data in errors
└── Proper HTTP status codes

CORS Configuration
├── Configured for frontend origin
├── Credentials handling
└── Preflight requests
```

### 5.3 Frontend Security

```
Wallet Security
├── MetaMask handles keys
├── No key storage in browser
└── User controls transactions

Data Validation
├── Input sanitization
├── File type checking
└── Size validation

HTTPS
├── Required for production
├── SSL/TLS certificates
└── Secure communication
```

---

## 6. Scalability Considerations

### 6.1 Smart Contract Scalability

**Current Limitations**
- String-based certificate IDs (no auto-increment)
- Linear search for issuer history
- No pagination support

**Future Improvements**
- Batch certificate issuance
- Indexed searches
- Pagination support
- Certificate revocation

### 6.2 Backend Scalability

**Current Setup**
- Single Express server
- In-memory processing
- No caching

**Production Improvements**
- Load balancing
- Redis caching
- Database for metadata
- Queue system for uploads

### 6.3 Frontend Scalability

**Current Setup**
- Single-page application
- Client-side rendering
- No server-side caching

**Production Improvements**
- CDN for static assets
- Service workers for offline
- Progressive Web App (PWA)
- Lazy loading

---

## 7. Performance Optimization

### 7.1 Smart Contract Optimization

```solidity
// Efficient storage
mapping(string => Cert) certificates;  // O(1) lookup

// Indexed events for filtering
event CertificateIssued(
  string indexed id,
  address indexed issuedBy,
  ...
);

// View functions (no gas cost)
function verifyCertificate() public view { ... }
```

### 7.2 Backend Optimization

```javascript
// Efficient file handling
multer.memoryStorage()  // No disk I/O

// Async/await for concurrency
async function uploadToIPFS() { ... }

// Connection pooling
ethers.JsonRpcProvider()  // Reusable provider
```

### 7.3 Frontend Optimization

```javascript
// Lazy loading
<script type="module">
  import { ethers } from "https://esm.sh/ethers@6";
</script>

// Event delegation
document.addEventListener('click', handler);

// Debouncing for inputs
function debounce(fn, delay) { ... }
```

---

## 8. Deployment Architecture

### 8.1 Development Environment

```
Local Machine
├── Hardhat Local Node (Chain ID 31337)
├── Backend Server (localhost:3000)
├── Frontend (localhost:8000)
└── MetaMask (Local Network)
```

### 8.2 Testnet Environment

```
Sepolia Testnet
├── Smart Contract (0x...)
├── Backend Server (Cloud VM)
├── Frontend (CDN/Static Hosting)
└── MetaMask (Sepolia Network)
```

### 8.3 Production Environment

```
Ethereum Mainnet
├── Smart Contract (0x...)
├── Backend Server (Load Balanced)
├── Frontend (CDN/Static Hosting)
├── Database (Metadata)
└── MetaMask (Mainnet)
```

---

## 9. Integration Points

### 9.1 Frontend ↔ Backend

```
HTTP/JSON
├── POST /upload
│   ├── Request: multipart/form-data
│   └── Response: { ipfsHash, url }
├── POST /issue
│   ├── Request: { id, name, course, ipfsHash }
│   └── Response: { success, txHash }
└── GET /verify/:id
    ├── Request: URL parameter
    └── Response: { studentName, course, ... }
```

### 9.2 Backend ↔ Blockchain

```
ethers.js
├── Provider (read-only)
│   └── publicClient.readContract()
├── Signer (write operations)
│   └── walletClient.writeContract()
└── Contract ABI
    └── artifact.abi
```

### 9.3 Backend ↔ IPFS

```
Pinata API
├── Authentication: Bearer JWT
├── Endpoint: https://api.pinata.cloud/pinning/pinFileToIPFS
├── Request: multipart/form-data
└── Response: { IpfsHash, ... }
```

### 9.4 Frontend ↔ Blockchain

```
MetaMask (ethers.js)
├── BrowserProvider
│   └── window.ethereum
├── Wallet Connection
│   └── eth_requestAccounts
├── Contract Interaction
│   └── eth_call / eth_sendTransaction
└── Network Switching
    └── wallet_switchEthereumChain
```

---

## 10. Error Handling Strategy

### 10.1 Smart Contract Errors

```solidity
require(bytes(_id).length > 0, "ID cannot be empty");
require(bytes(certificates[_id].studentName).length == 0, 
        "Certificate ID already exists");
```

### 10.2 Backend Errors

```javascript
try {
  // Operation
} catch (err) {
  res.status(500).json({ error: err.message });
}
```

### 10.3 Frontend Errors

```javascript
try {
  // Operation
} catch (err) {
  setStatus("errorElement", err.message, "error");
}
```

---

## 11. Monitoring & Logging

### 11.1 Backend Logging

```javascript
console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
console.log(`✅ Backend running on http://localhost:3000`);
```

### 11.2 Blockchain Monitoring

- Etherscan for transaction tracking
- Event logs for audit trail
- Gas usage monitoring

### 11.3 IPFS Monitoring

- Pinata dashboard for file status
- Gateway availability checks
- Storage usage tracking

---

## 12. Future Architecture Enhancements

### 12.1 Microservices

```
API Gateway
├── Certificate Service
├── IPFS Service
├── Notification Service
└── Analytics Service
```

### 12.2 Database Integration

```
PostgreSQL
├── Certificate metadata
├── User profiles
├── Transaction history
└── Analytics data
```

### 12.3 Advanced Features

```
├── Certificate Marketplace
├── Multi-signature Issuance
├── Certificate Revocation
├── Batch Operations
└── Mobile App
```

---

## 13. Technology Decisions

### Why Solidity?
- Industry standard for Ethereum
- Well-documented and tested
- Large developer community
- Mature tooling (Hardhat, Truffle)

### Why IPFS?
- Decentralized storage
- Content-addressed (immutable)
- No single point of failure
- Cost-effective

### Why Express.js?
- Lightweight and flexible
- Easy to set up and deploy
- Large ecosystem
- Good for REST APIs

### Why ethers.js?
- Modern Web3 library
- Better TypeScript support
- Smaller bundle size
- Active development

---

## 14. Compliance & Standards

### 14.1 Code Standards

- Solidity: OpenZeppelin best practices
- JavaScript: ES6+ standards
- HTML/CSS: W3C standards

### 14.2 Security Standards

- OWASP Top 10
- Smart contract security best practices
- Data protection regulations

### 14.3 Documentation Standards

- JSDoc for JavaScript
- NatSpec for Solidity
- README with setup instructions
- API documentation

---

**Document Version**: 1.0.0  
**Last Updated**: 2024  
**Status**: Complete
