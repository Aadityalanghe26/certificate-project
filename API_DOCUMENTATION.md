# CertChain API Documentation

## Overview

The CertChain backend API provides endpoints for certificate issuance, verification, and IPFS file management. The API is built with Express.js and connects to the Ethereum blockchain via ethers.js.

**Base URL**: `http://localhost:3000`

**Content-Type**: `application/json`

---

## Authentication

The API does not require authentication. However, blockchain transactions require a valid private key configured in the `.env` file.

---

## Endpoints

### 1. Upload File to IPFS

Upload a certificate document to IPFS via Pinata.

**Endpoint**: `POST /upload`

**Content-Type**: `multipart/form-data`

**Request Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| file | File | Yes | Certificate document (PDF, PNG, JPG) |

**Request Example**:
```bash
curl -X POST http://localhost:3000/upload \
  -F "file=@certificate.pdf"
```

**Response (Success - 200)**:
```json
{
  "ipfsHash": "QmXxxx...",
  "url": "https://gateway.pinata.cloud/ipfs/QmXxxx..."
}
```

**Response Fields**:
| Field | Type | Description |
|-------|------|-------------|
| ipfsHash | string | IPFS content hash |
| url | string | Pinata gateway URL for accessing file |

**Response (Error - 400)**:
```json
{
  "error": "No file provided"
}
```

**Response (Error - 500)**:
```json
{
  "error": "Pinata upload failed: ..."
}
```

**Error Codes**:
| Code | Message | Cause |
|------|---------|-------|
| 400 | No file provided | File parameter missing |
| 500 | PINATA_JWT not set in .env | Missing environment variable |
| 500 | Pinata upload failed | Network or API error |

**Notes**:
- File size limit: 100MB (Pinata free tier)
- Supported formats: PDF, PNG, JPG
- IPFS hash can be used in certificate issuance
- Files are publicly accessible via IPFS gateway

---

### 2. Issue Certificate

Issue a new certificate on the blockchain.

**Endpoint**: `POST /issue`

**Content-Type**: `application/json`

**Request Body**:
```json
{
  "id": "CERT-2024-001",
  "name": "Jane Doe",
  "course": "Solidity Fundamentals",
  "ipfsHash": "QmXxxx..." // optional
}
```

**Request Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Unique certificate identifier |
| name | string | Yes | Student/recipient name |
| course | string | Yes | Course or achievement name |
| ipfsHash | string | No | IPFS hash from /upload endpoint |

**Request Example**:
```bash
curl -X POST http://localhost:3000/issue \
  -H "Content-Type: application/json" \
  -d '{
    "id": "CERT-2024-001",
    "name": "Jane Doe",
    "course": "Solidity Fundamentals",
    "ipfsHash": "QmXxxx..."
  }'
```

**Response (Success - 200)**:
```json
{
  "success": true,
  "txHash": "0xabc123..."
}
```

**Response Fields**:
| Field | Type | Description |
|-------|------|-------------|
| success | boolean | Transaction success status |
| txHash | string | Ethereum transaction hash |

**Response (Error - 500)**:
```json
{
  "error": "Certificate ID already exists"
}
```

**Error Codes**:
| Code | Message | Cause |
|------|---------|-------|
| 500 | ID cannot be empty | Missing certificate ID |
| 500 | Name cannot be empty | Missing student name |
| 500 | Course cannot be empty | Missing course name |
| 500 | Certificate ID already exists | Duplicate certificate ID |
| 500 | Contract not deployed | CONTRACT_ADDRESS not set |
| 500 | Network error | RPC connection failed |

**Notes**:
- Certificate ID must be unique across all certificates
- Transaction requires gas fees (paid from DEPLOYER_PRIVATE_KEY account)
- IPFS hash is optional but recommended
- Transaction confirmation takes ~15-30 seconds on Sepolia
- Once issued, certificate cannot be modified (immutable)

**Gas Estimation**:
- Typical gas usage: 80,000 - 120,000 gas
- At 20 gwei: ~$1.60 - $2.40 USD (Sepolia testnet)

---

### 3. Verify Certificate

Retrieve certificate details from the blockchain.

**Endpoint**: `GET /verify/:id`

**URL Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Certificate ID to verify |

**Request Example**:
```bash
curl http://localhost:3000/verify/CERT-2024-001
```

**Response (Success - 200)**:
```json
{
  "studentName": "Jane Doe",
  "course": "Solidity Fundamentals",
  "ipfsHash": "QmXxxx...",
  "date": "1704067200",
  "issuedBy": "0x742d35Cc6634C0532925a3b844Bc9e7595f42e0"
}
```

**Response Fields**:
| Field | Type | Description |
|-------|------|-------------|
| studentName | string | Name of certificate recipient |
| course | string | Course or achievement name |
| ipfsHash | string | IPFS hash of certificate document |
| date | string | Unix timestamp of issuance |
| issuedBy | string | Ethereum address of issuer |

**Response (Error - 500)**:
```json
{
  "error": "Certificate not found or network error"
}
```

**Error Codes**:
| Code | Message | Cause |
|------|---------|-------|
| 500 | Certificate not found | Certificate ID doesn't exist |
| 500 | Contract not deployed | CONTRACT_ADDRESS not set |
| 500 | Network error | RPC connection failed |

**Notes**:
- This is a read-only operation (no gas cost)
- Returns empty/zero values if certificate doesn't exist
- IPFS hash can be used to retrieve document from gateway
- Date is Unix timestamp (seconds since epoch)
- issuedBy address can be verified on Etherscan

**Example IPFS Gateway URL**:
```
https://gateway.pinata.cloud/ipfs/{ipfsHash}
```

---

## Request/Response Examples

### Complete Certificate Issuance Flow

**Step 1: Upload Certificate Document**
```bash
curl -X POST http://localhost:3000/upload \
  -F "file=@certificate.pdf"
```

Response:
```json
{
  "ipfsHash": "QmXxxx...",
  "url": "https://gateway.pinata.cloud/ipfs/QmXxxx..."
}
```

**Step 2: Issue Certificate with IPFS Hash**
```bash
curl -X POST http://localhost:3000/issue \
  -H "Content-Type: application/json" \
  -d '{
    "id": "CERT-2024-001",
    "name": "Jane Doe",
    "course": "Solidity Fundamentals",
    "ipfsHash": "QmXxxx..."
  }'
```

Response:
```json
{
  "success": true,
  "txHash": "0xabc123..."
}
```

**Step 3: Verify Certificate**
```bash
curl http://localhost:3000/verify/CERT-2024-001
```

Response:
```json
{
  "studentName": "Jane Doe",
  "course": "Solidity Fundamentals",
  "ipfsHash": "QmXxxx...",
  "date": "1704067200",
  "issuedBy": "0x742d35Cc6634C0532925a3b844Bc9e7595f42e0"
}
```

---

## Error Handling

### Error Response Format

All errors follow this format:

```json
{
  "error": "Error message describing what went wrong"
}
```

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| PINATA_JWT not set | Missing environment variable | Add PINATA_JWT to .env |
| Contract not deployed | CONTRACT_ADDRESS not set | Deploy contract and update .env |
| Certificate ID already exists | Duplicate ID | Use unique certificate ID |
| Network error | RPC connection failed | Check RPC_URL and network status |
| No file provided | Missing file in upload | Include file in multipart form |

---

## Rate Limiting

Currently, no rate limiting is implemented. For production, consider adding:
- Request rate limiting (e.g., 100 requests/minute)
- IP-based throttling
- Authentication tokens

---

## CORS Configuration

The API enables CORS for all origins:

```javascript
app.use(cors());
```

For production, restrict to specific origins:

```javascript
app.use(cors({
  origin: 'https://yourdomain.com',
  credentials: true
}));
```

---

## Environment Variables

Required environment variables for API operation:

```env
# Blockchain Connection
CONTRACT_ADDRESS=0x...          # Deployed contract address
RPC_URL=https://...             # Ethereum RPC endpoint
DEPLOYER_PRIVATE_KEY=0x...      # Private key for signing transactions

# IPFS Integration
PINATA_JWT=eyJhbGc...           # Pinata API JWT token
```

---

## Performance Considerations

### Response Times

| Endpoint | Typical Time | Notes |
|----------|--------------|-------|
| POST /upload | 5-30 seconds | Depends on file size and network |
| POST /issue | 15-30 seconds | Includes blockchain confirmation |
| GET /verify | < 1 second | Read-only, no blockchain wait |

### Optimization Tips

1. **File Upload**: Compress files before upload
2. **Certificate Issuance**: Batch multiple certificates if possible
3. **Verification**: Cache results for frequently verified certificates
4. **RPC Provider**: Use dedicated RPC endpoint for better performance

---

## Security Best Practices

1. **Private Key Protection**
   - Never expose DEPLOYER_PRIVATE_KEY
   - Use environment variables, not hardcoded values
   - Rotate keys regularly

2. **Input Validation**
   - All inputs are validated on backend
   - Additional validation on smart contract
   - Sanitize file uploads

3. **HTTPS**
   - Use HTTPS in production
   - Enable SSL/TLS certificates

4. **CORS**
   - Restrict to trusted origins in production
   - Disable in development if needed

5. **Rate Limiting**
   - Implement rate limiting for production
   - Prevent abuse and DDoS attacks

---

## Deployment

### Local Development

```bash
npm run backend
# API runs on http://localhost:3000
```

### Production Deployment

1. Set environment variables on server
2. Use process manager (PM2, systemd)
3. Enable HTTPS
4. Configure firewall
5. Monitor logs and errors
6. Set up alerting

---

## Monitoring and Logging

### Recommended Logging

Add logging to track:
- Request/response times
- Error rates
- Transaction failures
- IPFS upload issues

Example:
```javascript
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});
```

---

## Versioning

Current API Version: **1.0.0**

Future versions may include:
- Batch certificate operations
- Advanced search and filtering
- Certificate revocation
- Multi-signature support
- Webhook notifications

---

## Support

For issues or questions:
1. Check error messages and troubleshooting guide
2. Review smart contract events on Etherscan
3. Check IPFS gateway for file accessibility
4. Verify environment variables are set correctly

---

**Last Updated**: 2024  
**API Version**: 1.0.0  
**Status**: Production Ready
