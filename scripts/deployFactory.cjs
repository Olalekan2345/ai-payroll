require("dotenv").config({ path: require("path").join(__dirname, "../.env.local") });
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });

const { ethers, artifacts } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const signers = await ethers.getSigners();
  if (signers.length === 0) {
    throw new Error("No signer found. Make sure DEPLOYER_PRIVATE_KEY is set in .env.local");
  }
  const deployer = signers[0];
  console.log("Deploying with:", deployer.address);

  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Balance:", ethers.formatEther(balance), "A0GI");
  if (balance === 0n) throw new Error("No balance. Get testnet tokens at https://faucet.0g.ai");

  const PayrollFactory = await ethers.getContractFactory("PayrollFactory");
  console.log("Deploying PayrollFactory…");
  const factory = await PayrollFactory.deploy();
  await factory.waitForDeployment();

  const address = await factory.getAddress();
  console.log("✅ PayrollFactory deployed to:", address);
  console.log("Explorer:", `https://chainscan-galileo.0g.ai/address/${address}`);

  // Save ABI
  const artifact = await artifacts.readArtifact("PayrollFactory");
  const outDir = path.join(__dirname, "../src/lib");
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(
    path.join(outDir, "PayrollFactory.abi.json"),
    JSON.stringify(artifact.abi, null, 2)
  );

  // Update .env.local
  const envPath = path.join(__dirname, "../.env.local");
  let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";
  if (envContent.includes("NEXT_PUBLIC_FACTORY_ADDRESS=")) {
    envContent = envContent.replace(/NEXT_PUBLIC_FACTORY_ADDRESS=.*/, `NEXT_PUBLIC_FACTORY_ADDRESS=${address}`);
  } else {
    envContent += `\nNEXT_PUBLIC_FACTORY_ADDRESS=${address}`;
  }
  fs.writeFileSync(envPath, envContent);

  console.log("\n🎉 Done! Set in .env.local:");
  console.log(`   NEXT_PUBLIC_FACTORY_ADDRESS=${address}`);
  console.log("\nNext: any wallet can now deploy their own PayrollManager from the employer dashboard.");
  console.log("No need to set NEXT_PUBLIC_CONTRACT_ADDRESS — each employer deploys their own via the UI.");
}

main().catch((err) => { console.error(err); process.exit(1); });
