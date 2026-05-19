import { createPublicClient, createWalletClient, http } from "viem";
import { sepolia, hardhat } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { writeFileSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import * as dotenv from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "../.env") });

const artifact = JSON.parse(
  readFileSync(join(__dirname, "../artifacts/contracts/Certificate.sol/Certificate.json"), "utf8")
);

const isSepolia = process.argv.includes("--sepolia");

async function main() {
  const privateKey = isSepolia
    ? process.env.SEPOLIA_PRIVATE_KEY
    : "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

  const rpcUrl = isSepolia
    ? process.env.SEPOLIA_RPC_URL
    : "http://127.0.0.1:8545";

  const chain = isSepolia ? sepolia : hardhat;
  const network = isSepolia ? "sepolia" : "localhost";

  if (!privateKey || privateKey.length < 60) {
    console.error("❌ Invalid private key in .env — must be 64 hex chars");
    process.exit(1);
  }

  const account = privateKeyToAccount(privateKey);

  const walletClient = createWalletClient({ account, chain, transport: http(rpcUrl) });
  const publicClient = createPublicClient({ chain, transport: http(rpcUrl) });

  console.log(`Deploying to ${network} with account: ${account.address}`);

  const hash = await walletClient.deployContract({
    abi: artifact.abi,
    bytecode: artifact.bytecode,
    args: [],
  });

  console.log("Transaction hash:", hash);
  console.log("Waiting for confirmation...");

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  const address = receipt.contractAddress;

  console.log(`✅ Certificate deployed to: ${address}`);

  const out = `CONTRACT_ADDRESS=${address}\nNETWORK=${network}\n`;
  writeFileSync(join(__dirname, "../.env.deployed"), out);
  console.log("📝 Address saved to .env.deployed");
}

main().catch((err) => {
  console.error(err.message || err);
  process.exitCode = 1;
});
