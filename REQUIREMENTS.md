# Requirement Specification Document (SRD)
## CertChain - Blockchain Certificate Platform

**Project Title:** CertChain - Decentralized Certificate Issuance and Verification Platform

**Version:** 1.0.0

**Date:** 2024

**Status:** Complete

---

## 1. Executive Summary

CertChain is a decentralized application (DApp) that leverages Ethereum blockchain and IPFS to solve the problem of certificate fraud and centralized trust. The platform enables institutions to issue tamper-proof certificates that can be instantly verified by anyone without requiring a central authority. Certificates are stored immutably on the blockchain with optional supporting documents on IPFS.

---

## 2. Problem Statement

### Current Challenges

1. **Certificate Fraud**: Traditional certificates can be forged or altered
2. **Centralized Trust**: Verification requires contacting the issuing institution
3. **Slow Verification**: Manual verification processes are time-consuming
4. **Single Point of Failure**: Centralized databases can be compromised
5. **Limited Accessibility**: Verification often requires institutional access

### Proposed Solution

A blockchain-based certificate system that:
- Makes certificates immutable and tamper-proof
- Enables instant verification without intermediaries
- Provides transparent, auditable records
- Eliminates single points of failure
- Allows anyone to verify authenticity

---

## 3. Project Objectives

### Primary Objectives

1. **Develop Smart Contract**
   - Create Certificate.sol for on-chain certificate storage
   - Implement certificate issuance with validation
   - Enable certificate verification and history tracking
   - Ensure gas efficiency and security

2. **Build Backend API**
   - Create Express.js server for blockchain interaction
   - Integrate IPFS via Pinata for file storage
   - Implement certificate issuance endpoint
   - Implement certificate verification endpoint
   - Handle file uploads securely

3. **Develop Frontend Interface**
   - Create user-friendly web interface
   - Implement MetaMask wallet integration
   - Build certificate issuance form
   - Build certificate verification interface
   - Implement certificate history view
   - Add PDF export functionality

4. **Deploy and Test**
   - Deploy contract to Sepolia testnet
   - Perform functional testing
   - Optimize gas usage
   - Verify security best practices
   - Create comprehensive documentation

### Secondary Objectives

1. Support multiple blockchain networks (Ethereum, Polygon, Binance)
2. Implement certificate search and filtering
3. Add certificate revocation capability (future)
4. Create admin dashboard (future)

---

## 4. Functional Requirements

### 4.1 Smart Contract Requirements

#### FR-SC-1: Certificate Issuance
- **Description**: System shall allow authorized users to issue certificates on-chain
- **Input**: Certificate ID, Student Name, Course, IPFS Hash (optional)
- **Validation**:
  - Certificate ID must be unique
  - All required fields must be non-empty
  - Certificate ID must not already exist
- **Output**: Transaction hash, Certificate stored on blockchain
- **Event**: CertificateIssued event emitted with indexed ID and issuer

#### FR-SC-2: Certificate Verification
- **Description**: System shall retrieve certificate details from blockchain
- **Input**: Certificate ID
- **Output**: Student Name, Course, IPFS Hash, Issue Date, Issuer Address
- **Behavior**: Return empty/zero values if certificate doesn't exist

#### FR-SC-3: Certificate History
- **Description**: System shall retrieve all certificates issued by a specific address
- **Input**: Issuer address
- **Output**: Array of certificate IDs
- **Behavior**: Return empty array if no certificates found

#### FR-SC-4: Certificate Existence Check
- **Description**: System shall check if a certificate exists
- **Input**: Certificate ID
- **Output**: Boolean (true/false)

### 4.2 Backend API Requirements

#### FR-API-1: File Upload to IPFS
- **Endpoint**: POST /upload
- **Input**: File (PDF, PNG, JPG)
- **Output**: IPFS Hash, Gateway URL
- **Validation**: File size limit, file type validation
- **Error Handling**: Return error if upload fails

#### FR-API-2: Certificate Issuance
- **Endpoint**: POST /issue
- **Input**: Certificate ID, Student Name, Course, IPFS Hash (optional)
- **Output**: Transaction hash, Success status
- **Validation**: All required fields present
- **Error Handling**: Return error message if transaction fails

#### FR-API-3: Certificate Verification
- **Endpoint**: GET /verify/:id
- **Input**: Certificate ID (URL parameter)
- **Output**: Certificate details (name, course, IPFS hash, date, issuer)
- **Error Handling**: Return error if certificate not found

#### FR-API-4: CORS Support
- **Description**: Backend shall support cross-origin requests from frontend
- **Behavior**: Enable CORS for all origins

### 4.3 Frontend Requirements

#### FR-FE-1: Wallet Connection
- **Description**: User shall connect MetaMask wallet
- **Behavior**:
  - Display "Connect Wallet" button
  - Show connection status
  - Display wallet address (truncated)
  - Validate network (Sepolia or Hardhat)
  - Show network warning if wrong network

#### FR-FE-2: Certificate Issuance Form
- **Description**: User shall fill form to issue certificate
- **Fields**:
  - Certificate ID (required, text input)
  - Student Name (required, text input)
  - Course (required, text input)
  - Certificate File (optional, file upload)
  - Pinata JWT (optional, text input)
- **Behavior**:
  - Validate all required fields
  - Upload file to IPFS if provided
  - Display IPFS hash after upload
  - Issue certificate on-chain
  - Show transaction hash
  - Clear form after success

#### FR-FE-3: Certificate Verification
- **Description**: User shall verify certificate by ID
- **Input**: Certificate ID
- **Output**: Certificate preview card with:
  - Student name
  - Course name
  - Issue date
  - Certificate ID
  - IPFS file link
  - Blockchain verification badge
- **Behavior**:
  - Display error if certificate not found
  - Show loading state during verification

#### FR-FE-4: Certificate Preview
- **Description**: System shall display beautiful certificate preview
- **Content**:
  - CertChain logo and branding
  - "Verified on Blockchain" badge
  - Student name (gold gradient)
  - Course name
  - Issue date
  - Certificate ID
  - IPFS file link
  - Corner decorations
  - Footer with blockchain info

#### FR-FE-5: PDF Export
- **Description**: User shall download certificate as PDF
- **Behavior**:
  - Generate PDF from certificate preview
  - Include all certificate details
  - Download with filename: `certificate-{id}.pdf`

#### FR-FE-6: Certificate History
- **Description**: User shall view all certificates issued by their wallet
- **Behavior**:
  - Load certificates from blockchain
  - Display certificate count
  - Show certificate ID, student name, course, date
  - Allow quick-verify from history
  - Sort by newest first

#### FR-FE-7: Responsive Design
- **Description**: Interface shall work on desktop and mobile
- **Behavior**:
  - Adapt layout for screens < 480px
  - Maintain usability on all screen sizes

#### FR-FE-8: Error Handling
- **Description**: System shall display user-friendly error messages
- **Types**:
  - Network errors
  - Validation errors
  - Transaction errors
  - File upload errors
- **Behavior**: Show error messages in status boxes with clear descriptions

### 4.4 Integration Requirements

#### FR-INT-1: MetaMask Integration
- **Description**: Frontend shall integrate with MetaMask wallet
- **Behavior**:
  - Detect MetaMask availability
  - Request account access
  - Listen for account/network changes
  - Handle connection errors

#### FR-INT-2: Blockchain Connection
- **Description**: Backend shall connect to Ethereum blockchain
- **Behavior**:
  - Support Sepolia testnet
  - Support local Hardhat network
  - Use ethers.js v6 for interaction
  - Handle RPC errors gracefully

#### FR-INT-3: IPFS Integration
- **Description**: Backend shall integrate with IPFS via Pinata
- **Behavior**:
  - Upload files to Pinata
  - Return IPFS hash
  - Provide gateway URL
  - Handle upload errors

---

## 5. Non-Functional Requirements

### 5.1 Performance Requirements

| Requirement | Target | Rationale |
|-------------|--------|-----------|
| Certificate Issuance Gas | < 120,000 gas | Reasonable cost for users |
| Verification Response Time | < 2 seconds | Quick user feedback |
| File Upload Time | < 30 seconds | Acceptable for users |
| Frontend Load Time | < 3 seconds | Good user experience |
| API Response Time | < 1 second | Responsive interface |

### 5.2 Security Requirements

| Requirement | Implementation |
|-------------|-----------------|
| Private Key Protection | Environment variables, never hardcoded |
| Input Validation | All inputs validated on contract and backend |
| No Reentrancy | No external calls in contract |
| CORS Protection | Configured for frontend origin |
| HTTPS | Recommended for production |
| Wallet Security | MetaMask handles key management |

### 5.3 Scalability Requirements

- Support up to 10,000 certificates per issuer
- Handle concurrent users without performance degradation
- Efficient storage using mappings (O(1) lookups)

### 5.4 Availability Requirements

- 99% uptime for backend API
- Blockchain availability depends on Ethereum network
- IPFS availability depends on Pinata service

### 5.5 Usability Requirements

- Intuitive interface requiring minimal training
- Clear error messages for all failure scenarios
- Responsive design for mobile and desktop
- Accessibility considerations (color contrast, font sizes)

### 5.6 Maintainability Requirements

- Well-documented code with comments
- Clear project structure
- Modular design for easy updates
- Version control with Git

---

## 6. Data Requirements

### 6.1 Data Model

#### Certificate Structure
```solidity
struct Cert {
    string studentName;      // Name of certificate recipient
    string course;           // Course or achievement name
    string ipfsHash;         // IPFS hash of certificate document
    uint date;               // Unix timestamp of issuance
    address issuedBy;        // Wallet address of issuer
}
```

#### Storage Mappings
```solidity
mapping(string => Cert) certificates;           // ID → Certificate
mapping(address => string[]) issuedBy;          // Issuer → Certificate IDs
```

### 6.2 Data Persistence

- **On-Chain**: Certificate data stored permanently on Ethereum blockchain
- **IPFS**: Certificate documents stored on IPFS via Pinata
- **Frontend**: No persistent storage (stateless)
- **Backend**: No persistent storage (stateless)

### 6.3 Data Privacy

- Certificate data is public (on blockchain)
- IPFS files are public (accessible via hash)
- Private keys stored securely in environment variables
- No personal data beyond certificate details

---

## 7. System Requirements

### 7.1 Hardware Requirements

**Development:**
- CPU: 2+ cores
- RAM: 4GB minimum, 8GB recommended
- Storage: 2GB for node_modules and artifacts

**Deployment:**
- Server: Standard cloud VM (AWS t3.micro or equivalent)
- Storage: 1GB for application files

### 7.2 Software Requirements

| Component | Version | Purpose |
|-----------|---------|---------|
| Node.js | 18+ | Runtime environment |
| npm | 9+ | Package manager |
| Hardhat | 3.3.0+ | Smart contract development |
| Solidity | 0.8.28 | Smart contract language |
| ethers.js | 6.x | Blockchain interaction |
| Express.js | 4.18+ | Backend framework |
| MetaMask | Latest | Wallet integration |

### 7.3 Network Requirements

- **Blockchain**: Ethereum Sepolia testnet or local Hardhat
- **RPC Provider**: Alchemy, Infura, or local node
- **IPFS**: Pinata API (free tier available)
- **Internet**: Required for blockchain and IPFS access

---

## 8. Deployment Requirements

### 8.1 Deployment Environments

#### Development
- Local Hardhat network (Chain ID 31337)
- Local backend on port 3000
- Frontend served locally

#### Testing
- Sepolia testnet (Chain ID 11155111)
- Backend on test server
- Frontend on test domain

#### Production
- Ethereum mainnet (future)
- Production backend server
- Production frontend domain
- HTTPS required

### 8.2 Deployment Process

1. Compile smart contracts: `npm run compile`
2. Deploy to Sepolia: `npm run deploy:sepolia`
3. Update `.env` with contract address
4. Start backend: `npm run backend`
5. Serve frontend: `npx http-server frontend`

### 8.3 Configuration Management

- Environment variables in `.env` file
- Deployment address saved to `.env.deployed`
- Network configuration in `hardhat.config.ts`
- Backend configuration in `backend/server.js`

---

## 9. Testing Requirements

### 9.1 Unit Testing

- Smart contract functions tested individually
- Backend API endpoints tested with mock data
- Frontend components tested for functionality

### 9.2 Integration Testing

- Smart contract deployed and tested on testnet
- Backend connected to blockchain
- Frontend connected to backend API
- IPFS integration tested with file uploads

### 9.3 System Testing

- End-to-end certificate issuance flow
- End-to-end certificate verification flow
- Certificate history retrieval
- PDF export functionality
- Error handling and edge cases

### 9.4 Security Testing

- Input validation testing
- Private key protection verification
- CORS configuration testing
- Transaction security testing

### 9.5 Performance Testing

- Gas usage measurement
- Response time measurement
- Load testing with multiple users
- File upload performance

---

## 10. Acceptance Criteria

### 10.1 Smart Contract

- [x] Certificate.sol compiles without errors
- [x] All functions implemented and tested
- [x] Input validation working correctly
- [x] Events emitted properly
- [x] Deployed to Sepolia testnet
- [x] Gas usage optimized

### 10.2 Backend API

- [x] Express server runs on port 3000
- [x] All endpoints implemented and tested
- [x] IPFS integration working
- [x] Error handling implemented
- [x] CORS enabled
- [x] Environment variables configured

### 10.3 Frontend

- [x] MetaMask integration working
- [x] Certificate issuance form functional
- [x] Certificate verification working
- [x] Certificate preview displaying correctly
- [x] PDF export working
- [x] Certificate history loading
- [x] Responsive design working
- [x] Error messages displaying

### 10.4 Documentation

- [x] README with setup instructions
- [x] API documentation
- [x] Smart contract documentation
- [x] Code comments and JSDoc
- [x] Deployment guide
- [x] Troubleshooting guide

### 10.5 Testing

- [x] Manual test cases completed
- [x] Error scenarios tested
- [x] Edge cases handled
- [x] Security best practices verified

---

## 11. Constraints and Assumptions

### 11.1 Constraints

1. **Blockchain**: Limited to Ethereum and compatible networks
2. **File Size**: IPFS files limited by Pinata (100MB free tier)
3. **Cost**: Users must pay gas fees for transactions
4. **Network**: Requires internet connection
5. **Wallet**: Requires MetaMask or compatible wallet

### 11.2 Assumptions

1. Users have MetaMask installed
2. Users have Sepolia testnet ETH
3. Users have Pinata account (for file uploads)
4. Backend server is running and accessible
5. Blockchain network is operational
6. IPFS/Pinata service is operational

---

## 12. Future Enhancements

1. **Certificate Revocation**: Ability to revoke issued certificates
2. **Multi-Signature**: Require multiple signers for certificate issuance
3. **Certificate Templates**: Pre-designed certificate templates
4. **Batch Issuance**: Issue multiple certificates at once
5. **Certificate Search**: Advanced search and filtering
6. **Admin Dashboard**: Dashboard for certificate management
7. **Mainnet Deployment**: Deploy to Ethereum mainnet
8. **Mobile App**: Native mobile application
9. **Certificate Marketplace**: Trade or transfer certificates
10. **Integration with Educational Platforms**: Direct integration with universities

---

## 13. Glossary

| Term | Definition |
|------|-----------|
| **DApp** | Decentralized Application running on blockchain |
| **Smart Contract** | Self-executing code on blockchain |
| **IPFS** | InterPlanetary File System for decentralized storage |
| **Pinata** | IPFS pinning service for file persistence |
| **MetaMask** | Browser extension for Ethereum wallet management |
| **Sepolia** | Ethereum testnet for development and testing |
| **Gas** | Fee required to execute transactions on Ethereum |
| **Testnet** | Test network for development (not real money) |
| **Mainnet** | Production Ethereum network (real money) |
| **RPC** | Remote Procedure Call for blockchain interaction |
| **ABI** | Application Binary Interface for contract interaction |
| **Bytecode** | Compiled smart contract code |

---

## 14. Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Project Lead | - | - | 2024 |
| Smart Contract Developer | - | - | 2024 |
| Frontend Developer | - | - | 2024 |
| Backend Developer | - | - | 2024 |
| Tester/Documentation | - | - | 2024 |

---

**Document Version**: 1.0.0  
**Last Updated**: 2024  
**Status**: Complete
