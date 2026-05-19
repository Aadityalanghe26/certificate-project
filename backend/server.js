/**
 * CertChain Backend API Server
 * 
 * Express.js server providing REST API endpoints for:
 * - IPFS file uploads via Pinata
 * - Certificate issuance on Ethereum blockchain
 * - Certificate verification and retrieval
 * 
 * Environment Variables Required:
 * - CONTRACT_ADDRESS: Deployed Certificate contract address
 * - RPC_URL: Ethereum RPC endpoint (default: http://127.0.0.1:8545)
 * - DEPLOYER_PRIVATE_KEY: Private key for signing transactions
 * - PINATA_JWT: Pinata API JWT token for IPFS uploads
 * 
 * @author CertChain Team
 * @version 1.0.0
 */

import express from "express";
import cors from "cors";
import multer from "multer";
import FormData from "form-data";
import fetch from "node-fetch";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { join, dirname } from "path";
import { ethers } from "ethers";
import * as dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config({ path: join(dirname(fileURLToPath(import.meta.url)), "../.env") });

const __dirname = dirname(fileURLToPath(import.meta.url));

// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());

// Configure multer for file uploads (memory storage)
const upload = multer({ storage: multer.memoryStorage() });

// Load smart contract ABI from compiled artifact
const artifact = JSON.parse(
  readFileSync(join(__dirname, "../artifacts/contracts/Certificate.sol/Certificate.json"), "utf8")
);

// Load environment variables
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const RPC_URL = process.env.RPC_URL || "http://127.0.0.1:8545";
const PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY;
const PINATA_JWT = process.env.PINATA_JWT;

// Initialize ethers.js provider and signer
const provider = new ethers.JsonRpcProvider(RPC_URL);
const signer = PRIVATE_KEY
  ? new ethers.Wallet(PRIVATE_KEY, provider)
  : new ethers.JsonRpcSigner(provider, (await provider.listAccounts())[0]?.address);

/**
 * Upload a file buffer to IPFS via Pinata API
 * 
 * @async
 * @param {Buffer} fileBuffer - File content as buffer
 * @param {string} filename - Original filename
 * @returns {Promise<string>} IPFS content hash (CID)
 * @throws {Error} If PINATA_JWT not set or upload fails
 * 
 * @example
 * const hash = await uploadToIPFS(fileBuffer, 'certificate.pdf');
 * // Returns: 'QmXxxx...'
 */
async function uploadToIPFS(fileBuffer, filename) {
  if (!PINATA_JWT) throw new Error("PINATA_JWT not set in .env");
  
  const form = new FormData();
  form.append("file", fileBuffer, { filename });
  
  const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: { Authorization: `Bearer ${PINATA_JWT}`, ...form.getHeaders() },
    body: form,
  });
  
  const data = await res.json();
  if (!data.IpfsHash) throw new Error("Pinata upload failed: " + JSON.stringify(data));
  
  return data.IpfsHash;
}

/**
 * POST /upload
 * 
 * Upload a certificate document to IPFS via Pinata
 * 
 * @route POST /upload
 * @param {File} file - Certificate document (PDF, PNG, JPG)
 * @returns {Object} 200 - IPFS hash and gateway URL
 * @returns {Object} 400 - No file provided
 * @returns {Object} 500 - Upload failed
 * 
 * @example
 * // Request
 * POST /upload
 * Content-Type: multipart/form-data
 * file: <binary>
 * 
 * // Response (200)
 * {
 *   "ipfsHash": "QmXxxx...",
 *   "url": "https://gateway.pinata.cloud/ipfs/QmXxxx..."
 * }
 */
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file provided" });
    }
    
    const hash = await uploadToIPFS(req.file.buffer, req.file.originalname);
    res.json({ 
      ipfsHash: hash, 
      url: `https://gateway.pinata.cloud/ipfs/${hash}` 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /issue
 * 
 * Issue a new certificate on the blockchain
 * 
 * @route POST /issue
 * @param {string} id - Unique certificate identifier
 * @param {string} name - Student/recipient name
 * @param {string} course - Course or achievement name
 * @param {string} [ipfsHash] - IPFS hash of certificate document (optional)
 * @returns {Object} 200 - Transaction hash and success status
 * @returns {Object} 500 - Transaction failed
 * 
 * @example
 * // Request
 * POST /issue
 * Content-Type: application/json
 * {
 *   "id": "CERT-2024-001",
 *   "name": "Jane Doe",
 *   "course": "Solidity Fundamentals",
 *   "ipfsHash": "QmXxxx..."
 * }
 * 
 * // Response (200)
 * {
 *   "success": true,
 *   "txHash": "0xabc123..."
 * }
 */
app.post("/issue", async (req, res) => {
  try {
    const contract = new ethers.Contract(CONTRACT_ADDRESS, artifact.abi, signer);
    const { id, name, course, ipfsHash } = req.body;
    
    // Call smart contract function
    const tx = await contract.issueCertificate(id, name, course, ipfsHash || "");
    
    // Wait for transaction confirmation
    await tx.wait();
    
    res.json({ success: true, txHash: tx.hash });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /verify/:id
 * 
 * Retrieve and verify a certificate from the blockchain
 * 
 * @route GET /verify/:id
 * @param {string} id - Certificate ID to verify
 * @returns {Object} 200 - Certificate details
 * @returns {Object} 500 - Certificate not found or error
 * 
 * @example
 * // Request
 * GET /verify/CERT-2024-001
 * 
 * // Response (200)
 * {
 *   "studentName": "Jane Doe",
 *   "course": "Solidity Fundamentals",
 *   "ipfsHash": "QmXxxx...",
 *   "date": "1704067200",
 *   "issuedBy": "0x742d35Cc6634C0532925a3b844Bc9e7595f42e0"
 * }
 */
app.get("/verify/:id", async (req, res) => {
  try {
    const contract = new ethers.Contract(CONTRACT_ADDRESS, artifact.abi, provider);
    const data = await contract.verifyCertificate(req.params.id);
    
    res.json({
      studentName: data[0],
      course: data[1],
      ipfsHash: data[2],
      date: data[3].toString(),
      issuedBy: data[4],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Health check endpoint
 * 
 * @route GET /health
 * @returns {Object} 200 - Server status
 */
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

/**
 * Start the Express server
 * 
 * Server listens on port 3000 and logs startup message
 */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
  console.log(`📝 Contract Address: ${CONTRACT_ADDRESS}`);
  console.log(`🔗 RPC URL: ${RPC_URL}`);
});
