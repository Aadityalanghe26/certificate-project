import { test } from "node:test";
import assert from "node:assert";
import { createPublicClient, createWalletClient, http } from "viem";
import { hardhat } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load contract artifact
const artifact = JSON.parse(
  readFileSync(join(__dirname, "../artifacts/contracts/Certificate.sol/Certificate.json"), "utf8")
);

// Test accounts
const DEPLOYER_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const USER_KEY = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";

const deployerAccount = privateKeyToAccount(DEPLOYER_KEY);
const userAccount = privateKeyToAccount(USER_KEY);

// Setup clients
const publicClient = createPublicClient({ chain: hardhat, transport: http() });
const deployerWallet = createWalletClient({ account: deployerAccount, chain: hardhat, transport: http() });
const userWallet = createWalletClient({ account: userAccount, chain: hardhat, transport: http() });

let contractAddress;

/**
 * Deploy Certificate contract
 */
async function deployContract() {
  const hash = await deployerWallet.deployContract({
    abi: artifact.abi,
    bytecode: artifact.bytecode,
    args: [],
  });

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  contractAddress = receipt.contractAddress;
  console.log(`✅ Contract deployed at: ${contractAddress}`);
  return contractAddress;
}

/**
 * Test Suite: Certificate Smart Contract
 */
test("Certificate Smart Contract", async (t) => {
  // Deploy contract before tests
  await deployContract();

  /**
   * Test 1: Issue Certificate
   */
  await t.test("should issue a certificate successfully", async () => {
    const hash = await deployerWallet.writeContract({
      address: contractAddress,
      abi: artifact.abi,
      functionName: "issueCertificate",
      args: ["CERT-001", "Jane Doe", "Solidity Fundamentals", "QmXxxx"],
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    assert.strictEqual(receipt.status, "success", "Transaction should succeed");
  });

  /**
   * Test 2: Verify Certificate
   */
  await t.test("should verify a certificate", async () => {
    const result = await publicClient.readContract({
      address: contractAddress,
      abi: artifact.abi,
      functionName: "verifyCertificate",
      args: ["CERT-001"],
    });

    assert.strictEqual(result[0], "Jane Doe", "Student name should match");
    assert.strictEqual(result[1], "Solidity Fundamentals", "Course should match");
    assert.strictEqual(result[2], "QmXxxx", "IPFS hash should match");
  });

  /**
   * Test 3: Certificate Existence Check
   */
  await t.test("should check if certificate exists", async () => {
    const exists = await publicClient.readContract({
      address: contractAddress,
      abi: artifact.abi,
      functionName: "certificateExists",
      args: ["CERT-001"],
    });

    assert.strictEqual(exists, true, "Certificate should exist");
  });

  /**
   * Test 4: Non-existent Certificate
   */
  await t.test("should return false for non-existent certificate", async () => {
    const exists = await publicClient.readContract({
      address: contractAddress,
      abi: artifact.abi,
      functionName: "certificateExists",
      args: ["CERT-NONEXISTENT"],
    });

    assert.strictEqual(exists, false, "Certificate should not exist");
  });

  /**
   * Test 5: Get Certificates by Issuer
   */
  await t.test("should retrieve certificates by issuer", async () => {
    const certs = await publicClient.readContract({
      address: contractAddress,
      abi: artifact.abi,
      functionName: "getCertificatesByIssuer",
      args: [deployerAccount.address],
    });

    assert.ok(certs.length > 0, "Should have at least one certificate");
    assert.strictEqual(certs[0], "CERT-001", "First certificate should be CERT-001");
  });

  /**
   * Test 6: Issue Multiple Certificates
   */
  await t.test("should issue multiple certificates", async () => {
    const hash = await deployerWallet.writeContract({
      address: contractAddress,
      abi: artifact.abi,
      functionName: "issueCertificate",
      args: ["CERT-002", "John Smith", "Advanced Solidity", "QmYyyy"],
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    assert.strictEqual(receipt.status, "success", "Transaction should succeed");

    const certs = await publicClient.readContract({
      address: contractAddress,
      abi: artifact.abi,
      functionName: "getCertificatesByIssuer",
      args: [deployerAccount.address],
    });

    assert.strictEqual(certs.length, 2, "Should have two certificates");
  });

  /**
   * Test 7: Duplicate Certificate ID Should Fail
   */
  await t.test("should reject duplicate certificate ID", async () => {
    try {
      await deployerWallet.writeContract({
        address: contractAddress,
        abi: artifact.abi,
        functionName: "issueCertificate",
        args: ["CERT-001", "Another Person", "Another Course", "QmZzzz"],
      });
      assert.fail("Should have thrown error for duplicate ID");
    } catch (err) {
      assert.ok(err.message.includes("already exists"), "Should reject duplicate ID");
    }
  });

  /**
   * Test 8: Empty Certificate ID Should Fail
   */
  await t.test("should reject empty certificate ID", async () => {
    try {
      await deployerWallet.writeContract({
        address: contractAddress,
        abi: artifact.abi,
        functionName: "issueCertificate",
        args: ["", "Jane Doe", "Course", "QmXxxx"],
      });
      assert.fail("Should have thrown error for empty ID");
    } catch (err) {
      assert.ok(err.message.includes("cannot be empty"), "Should reject empty ID");
    }
  });

  /**
   * Test 9: Empty Student Name Should Fail
   */
  await t.test("should reject empty student name", async () => {
    try {
      await deployerWallet.writeContract({
        address: contractAddress,
        abi: artifact.abi,
        functionName: "issueCertificate",
        args: ["CERT-003", "", "Course", "QmXxxx"],
      });
      assert.fail("Should have thrown error for empty name");
    } catch (err) {
      assert.ok(err.message.includes("cannot be empty"), "Should reject empty name");
    }
  });

  /**
   * Test 10: Empty Course Should Fail
   */
  await t.test("should reject empty course", async () => {
    try {
      await deployerWallet.writeContract({
        address: contractAddress,
        abi: artifact.abi,
        functionName: "issueCertificate",
        args: ["CERT-003", "Jane Doe", "", "QmXxxx"],
      });
      assert.fail("Should have thrown error for empty course");
    } catch (err) {
      assert.ok(err.message.includes("cannot be empty"), "Should reject empty course");
    }
  });

  /**
   * Test 11: Different Issuer Can Issue Same Course
   */
  await t.test("should allow different issuer to issue certificate", async () => {
    const hash = await userWallet.writeContract({
      address: contractAddress,
      abi: artifact.abi,
      functionName: "issueCertificate",
      args: ["CERT-USER-001", "Alice Johnson", "Web3 Development", "QmAaaa"],
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    assert.strictEqual(receipt.status, "success", "Transaction should succeed");

    const certs = await publicClient.readContract({
      address: contractAddress,
      abi: artifact.abi,
      functionName: "getCertificatesByIssuer",
      args: [userAccount.address],
    });

    assert.strictEqual(certs.length, 1, "User should have one certificate");
  });

  /**
   * Test 12: Certificate Without IPFS Hash
   */
  await t.test("should issue certificate without IPFS hash", async () => {
    const hash = await deployerWallet.writeContract({
      address: contractAddress,
      abi: artifact.abi,
      functionName: "issueCertificate",
      args: ["CERT-NO-IPFS", "Bob Wilson", "Blockchain Basics", ""],
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    assert.strictEqual(receipt.status, "success", "Transaction should succeed");

    const result = await publicClient.readContract({
      address: contractAddress,
      abi: artifact.abi,
      functionName: "verifyCertificate",
      args: ["CERT-NO-IPFS"],
    });

    assert.strictEqual(result[2], "", "IPFS hash should be empty");
  });

  /**
   * Test 13: Verify Certificate Returns Correct Issuer
   */
  await t.test("should return correct issuer address", async () => {
    const result = await publicClient.readContract({
      address: contractAddress,
      abi: artifact.abi,
      functionName: "verifyCertificate",
      args: ["CERT-001"],
    });

    assert.strictEqual(
      result[4].toLowerCase(),
      deployerAccount.address.toLowerCase(),
      "Issuer should match deployer"
    );
  });

  /**
   * Test 14: Verify Certificate Returns Timestamp
   */
  await t.test("should return valid timestamp", async () => {
    const result = await publicClient.readContract({
      address: contractAddress,
      abi: artifact.abi,
      functionName: "verifyCertificate",
      args: ["CERT-001"],
    });

    const timestamp = Number(result[3]);
    const now = Math.floor(Date.now() / 1000);
    assert.ok(timestamp > 0, "Timestamp should be positive");
    assert.ok(timestamp <= now, "Timestamp should not be in future");
  });

  /**
   * Test 15: Empty Issuer History
   */
  await t.test("should return empty array for issuer with no certificates", async () => {
    const randomAddress = "0x0000000000000000000000000000000000000001";
    const certs = await publicClient.readContract({
      address: contractAddress,
      abi: artifact.abi,
      functionName: "getCertificatesByIssuer",
      args: [randomAddress],
    });

    assert.strictEqual(certs.length, 0, "Should return empty array");
  });
});

console.log("✅ All tests completed!");
