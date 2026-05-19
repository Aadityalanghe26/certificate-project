# CertChain Testing Guide

## Overview

This guide covers all testing aspects of the CertChain project including unit tests, integration tests, and manual testing procedures.

---

## 1. Test Environment Setup

### 1.1 Start Local Hardhat Node

```bash
npm run node
```

**Expected Output:**
```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/
```

Keep this terminal open for testing.

### 1.2 Deploy Contract to Local Network

In a new terminal:

```bash
npm run deploy
```

**Expected Output:**
```
Deploying to localhost with account: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Transaction hash: 0x...
Waiting for confirmation...
✅ Certificate deployed to: 0xe7f1725e7734ce288f8367e1bb143e90bb3f0512
📝 Address saved to .env.deployed
```

### 1.3 Start Backend Server

In another terminal:

```bash
npm run backend
```

**Expected Output:**
```
✅ Backend running on http://localhost:3000
📝 Contract Address: 0xe7f1725e7734ce288f8367e1bb143e90bb3f0512
🔗 RPC URL: http://127.0.0.1:8545
```

---

## 2. Unit Tests - Smart Contract

### 2.1 Run Smart Contract Tests

```bash
npm test
```

**Expected Output:**
```
✓ should issue a certificate successfully
✓ should verify a certificate
✓ should check if certificate exists
✓ should return false for non-existent certificate
✓ should retrieve certificates by issuer
✓ should issue multiple certificates
✓ should reject duplicate certificate ID
✓ should reject empty certificate ID
✓ should reject empty student name
✓ should reject empty course
✓ should allow different issuer to issue certificate
✓ should issue certificate without IPFS hash
✓ should return correct issuer address
✓ should return valid timestamp
✓ should return empty array for issuer with no certificates

✅ All tests completed!
```

### 2.2 Test Coverage

The test suite covers:

| Test Case | Purpose | Status |
|-----------|---------|--------|
| Issue Certificate | Verify certificate creation | ✅ |
| Verify Certificate | Retrieve certificate data | ✅ |
| Certificate Existence | Check if certificate exists | ✅ |
| Non-existent Certificate | Handle missing certificates | ✅ |
| Get Certificates by Issuer | Retrieve issuer history | ✅ |
| Multiple Certificates | Issue multiple certificates | ✅ |
| Duplicate ID Rejection | Prevent duplicate IDs | ✅ |
| Empty ID Validation | Validate required fields | ✅ |
| Empty Name Validation | Validate required fields | ✅ |
| Empty Course Validation | Validate required fields | ✅ |
| Different Issuer | Support multiple issuers | ✅ |
| No IPFS Hash | Optional IPFS support | ✅ |
| Issuer Address | Verify issuer tracking | ✅ |
| Timestamp Validation | Verify timestamp accuracy | ✅ |
| Empty History | Handle no certificates | ✅ |

### 2.3 Test Execution Details

Each test:
1. Deploys a fresh contract instance
2. Executes the test scenario
3. Verifies expected behavior
4. Cleans up resources

---

## 3. Integration Tests - Backend API

### 3.1 Test IPFS Upload Endpoint

**Test Case 1: Successful File Upload**

```bash
curl -X POST http://localhost:3000/upload \
  -F "file=@test-certificate.pdf"
```

**Expected Response:**
```json
{
  "ipfsHash": "QmXxxx...",
  "url": "https://gateway.pinata.cloud/ipfs/QmXxxx..."
}
```

**Verification:**
- [ ] Response contains ipfsHash
- [ ] Response contains gateway URL
- [ ] IPFS hash is valid format (Qm...)
- [ ] Gateway URL is accessible

**Test Case 2: Missing File**

```bash
curl -X POST http://localhost:3000/upload
```

**Expected Response:**
```json
{
  "error": "No file provided"
}
```

**Verification:**
- [ ] Returns 400 status code
- [ ] Error message is clear

### 3.2 Test Certificate Issuance Endpoint

**Test Case 1: Successful Issuance**

```bash
curl -X POST http://localhost:3000/issue \
  -H "Content-Type: application/json" \
  -d '{
    "id": "CERT-TEST-001",
    "name": "Test Student",
    "course": "Blockchain Basics",
    "ipfsHash": "QmXxxx..."
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "txHash": "0xabc123..."
}
```

**Verification:**
- [ ] Returns 200 status code
- [ ] success is true
- [ ] txHash is valid format (0x...)
- [ ] Transaction is confirmed on blockchain

**Test Case 2: Missing Required Field**

```bash
curl -X POST http://localhost:3000/issue \
  -H "Content-Type: application/json" \
  -d '{
    "id": "CERT-TEST-002",
    "name": "Test Student",
    "course": ""
  }'
```

**Expected Response:**
```json
{
  "error": "Course cannot be empty"
}
```

**Verification:**
- [ ] Returns 500 status code
- [ ] Error message is descriptive

**Test Case 3: Duplicate Certificate ID**

```bash
# First issuance
curl -X POST http://localhost:3000/issue \
  -H "Content-Type: application/json" \
  -d '{
    "id": "CERT-DUP-001",
    "name": "Student 1",
    "course": "Course 1"
  }'

# Second issuance with same ID
curl -X POST http://localhost:3000/issue \
  -H "Content-Type: application/json" \
  -d '{
    "id": "CERT-DUP-001",
    "name": "Student 2",
    "course": "Course 2"
  }'
```

**Expected Response (Second):**
```json
{
  "error": "Certificate ID already exists"
}
```

**Verification:**
- [ ] First issuance succeeds
- [ ] Second issuance fails
- [ ] Error message is clear

### 3.3 Test Certificate Verification Endpoint

**Test Case 1: Successful Verification**

```bash
curl http://localhost:3000/verify/CERT-TEST-001
```

**Expected Response:**
```json
{
  "studentName": "Test Student",
  "course": "Blockchain Basics",
  "ipfsHash": "QmXxxx...",
  "date": "1704067200",
  "issuedBy": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
}
```

**Verification:**
- [ ] Returns 200 status code
- [ ] All fields are present
- [ ] Data matches issued certificate
- [ ] Date is valid Unix timestamp
- [ ] issuedBy is valid Ethereum address

**Test Case 2: Non-existent Certificate**

```bash
curl http://localhost:3000/verify/CERT-NONEXISTENT
```

**Expected Response:**
```json
{
  "error": "Certificate not found or network error"
}
```

**Verification:**
- [ ] Returns 500 status code
- [ ] Error message is descriptive

### 3.4 Test Health Check Endpoint

```bash
curl http://localhost:3000/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Verification:**
- [ ] Returns 200 status code
- [ ] Status is "ok"
- [ ] Timestamp is current

---

## 4. Frontend Testing

### 4.1 Manual Testing Checklist

#### Wallet Connection
- [ ] MetaMask extension installed
- [ ] "Connect Wallet" button visible
- [ ] Click button opens MetaMask popup
- [ ] Approve connection in MetaMask
- [ ] Wallet address displays correctly
- [ ] Connection status shows "Connected"
- [ ] Network indicator shows correct network

#### Network Validation
- [ ] Connected to Sepolia network
- [ ] Network name displays correctly
- [ ] Wrong network shows warning
- [ ] "Switch to Sepolia" button works
- [ ] Network switch successful

#### Certificate Issuance
- [ ] Form fields visible and editable
- [ ] Certificate ID input accepts text
- [ ] Student Name input accepts text
- [ ] Course input accepts text
- [ ] File upload area visible
- [ ] Can select file from computer
- [ ] File name displays after selection
- [ ] "Upload to IPFS" button enabled when file selected
- [ ] IPFS upload shows success message
- [ ] IPFS hash displays in preview
- [ ] "Issue Certificate" button enabled when form filled
- [ ] Click issue button opens MetaMask
- [ ] Approve transaction in MetaMask
- [ ] Success message displays with tx hash
- [ ] Form clears after success

#### Certificate Verification
- [ ] Verify section visible
- [ ] Certificate ID input accepts text
- [ ] "Verify" button clickable
- [ ] Loading state shows during verification
- [ ] Certificate preview displays
- [ ] Student name shows correctly
- [ ] Course name shows correctly
- [ ] Issue date displays
- [ ] Certificate ID displays
- [ ] IPFS link is clickable
- [ ] Blockchain badge visible
- [ ] "Download PDF" button visible
- [ ] PDF downloads successfully
- [ ] PDF contains all certificate details

#### Certificate History
- [ ] "Load History" button visible
- [ ] Click button loads certificates
- [ ] Loading state shows
- [ ] Certificates list displays
- [ ] Certificate count shows
- [ ] Each certificate shows ID, name, course, date
- [ ] Can click certificate to verify
- [ ] History updates after new issuance

#### Error Handling
- [ ] Empty fields show validation error
- [ ] Duplicate ID shows error
- [ ] Wrong network shows warning
- [ ] Network error shows message
- [ ] IPFS upload error shows message
- [ ] Transaction failure shows error
- [ ] Error messages are clear and helpful

#### Responsive Design
- [ ] Desktop view (1920px) works
- [ ] Tablet view (768px) works
- [ ] Mobile view (375px) works
- [ ] All buttons clickable on mobile
- [ ] Text readable on all sizes
- [ ] No horizontal scrolling

#### UI/UX
- [ ] Dark theme displays correctly
- [ ] Colors are readable
- [ ] Gradients render properly
- [ ] Animations are smooth
- [ ] Loading spinners animate
- [ ] Status messages display clearly
- [ ] Buttons have hover effects
- [ ] Links are underlined

### 4.2 Browser Compatibility

Test on:
- [ ] Chrome/Chromium (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### 4.3 MetaMask Compatibility

- [ ] MetaMask extension works
- [ ] WalletConnect works (if implemented)
- [ ] Account switching works
- [ ] Network switching works
- [ ] Transaction signing works

---

## 5. Security Testing

### 5.1 Input Validation Testing

**Test Case 1: SQL Injection**
```
Input: "'; DROP TABLE certificates; --"
Expected: Treated as regular string, no SQL execution
```

**Test Case 2: XSS Attack**
```
Input: "<script>alert('XSS')</script>"
Expected: Rendered as text, no script execution
```

**Test Case 3: Large Input**
```
Input: 10MB string
Expected: Rejected or truncated safely
```

### 5.2 Private Key Security

- [ ] Private key not in version control
- [ ] Private key not in logs
- [ ] Private key not in error messages
- [ ] Private key not in frontend code
- [ ] .env file in .gitignore

### 5.3 CORS Security

```bash
# Test CORS headers
curl -i -X OPTIONS http://localhost:3000/upload \
  -H "Origin: http://example.com"
```

Expected headers:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS
```

### 5.4 Smart Contract Security

- [ ] No reentrancy vulnerabilities
- [ ] No integer overflow/underflow
- [ ] No unchecked external calls
- [ ] Proper access control
- [ ] Input validation on all parameters

---

## 6. Performance Testing

### 6.1 Gas Usage Testing

**Certificate Issuance**
```bash
# Deploy contract and issue certificate
# Check gas usage on Etherscan
```

Expected gas usage: 80,000 - 120,000 gas

### 6.2 Response Time Testing

**Backend Endpoints**
```bash
# Measure response times
time curl http://localhost:3000/verify/CERT-001
```

Expected times:
- Verify: < 1 second
- Issue: 15-30 seconds (blockchain confirmation)
- Upload: 5-30 seconds (file size dependent)

### 6.3 Load Testing

```bash
# Install Apache Bench
ab -n 100 -c 10 http://localhost:3000/health
```

Expected: No errors, consistent response times

---

## 7. Deployment Testing

### 7.1 Sepolia Testnet Testing

1. **Deploy Contract**
   ```bash
   npm run deploy:sepolia
   ```
   - [ ] Deployment succeeds
   - [ ] Contract address saved
   - [ ] Contract visible on Etherscan

2. **Test Backend on Sepolia**
   ```bash
   # Update .env with Sepolia RPC
   npm run backend
   ```
   - [ ] Backend connects to Sepolia
   - [ ] Can issue certificates
   - [ ] Can verify certificates

3. **Test Frontend on Sepolia**
   - [ ] Connect to Sepolia network
   - [ ] Issue certificate
   - [ ] Verify certificate
   - [ ] Check transaction on Etherscan

### 7.2 Production Readiness Checklist

- [ ] All tests passing
- [ ] No console errors
- [ ] No console warnings
- [ ] Code documented
- [ ] README complete
- [ ] API documentation complete
- [ ] Deployment guide complete
- [ ] Security review done
- [ ] Performance optimized
- [ ] Error handling complete

---

## 8. Continuous Integration

### 8.1 GitHub Actions (Optional)

Create `.github/workflows/test.yml`:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run compile
      - run: npm test
```

### 8.2 Pre-commit Hooks

```bash
# Install husky
npm install husky --save-dev
npx husky install

# Add pre-commit hook
npx husky add .husky/pre-commit "npm test"
```

---

## 9. Test Results Documentation

### 9.1 Test Report Template

```markdown
# Test Report - [Date]

## Summary
- Total Tests: 15
- Passed: 15
- Failed: 0
- Skipped: 0
- Success Rate: 100%

## Test Results

### Smart Contract Tests
- ✅ Issue Certificate
- ✅ Verify Certificate
- ... (all tests)

### Backend API Tests
- ✅ Upload Endpoint
- ✅ Issue Endpoint
- ✅ Verify Endpoint

### Frontend Tests
- ✅ Wallet Connection
- ✅ Certificate Issuance
- ✅ Certificate Verification

## Issues Found
None

## Recommendations
- Continue monitoring performance
- Regular security audits
- Update dependencies monthly
```

---

## 10. Troubleshooting Tests

### Issue: Tests Fail with "Contract not deployed"

**Solution:**
```bash
npm run deploy
npm test
```

### Issue: Backend Connection Error

**Solution:**
```bash
# Ensure Hardhat node is running
npm run node

# In another terminal
npm run backend
```

### Issue: IPFS Upload Fails

**Solution:**
- Verify PINATA_JWT in .env
- Check Pinata account has storage
- Verify file size < 100MB

### Issue: MetaMask Not Connecting

**Solution:**
- Install MetaMask extension
- Refresh browser
- Check browser console for errors
- Ensure localhost:8000 is allowed

---

## 11. Test Maintenance

### Regular Tasks

- [ ] Run tests weekly
- [ ] Update test cases for new features
- [ ] Review test coverage
- [ ] Update documentation
- [ ] Monitor test performance

### When to Add Tests

- [ ] New feature added
- [ ] Bug fixed
- [ ] Security issue found
- [ ] Performance issue identified

---

## 12. Resources

- [Hardhat Testing Guide](https://hardhat.org/docs/guides/test)
- [ethers.js Documentation](https://docs.ethers.org/v6/)
- [Node.js Test Runner](https://nodejs.org/api/test.html)
- [Solidity Testing Best Practices](https://docs.soliditylang.org/en/latest/security-considerations.html)

---

**Last Updated**: 2024  
**Version**: 1.0.0  
**Status**: Complete
