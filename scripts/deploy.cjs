require("dotenv").config({ path: require("path").join(__dirname, "../.env.local") });
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });

const { ethers, artifacts } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const signers = await ethers.getSigners();
  if (signers.length === 0) {
    throw new Error(
      "No signer found. Make sure DEPLOYER_PRIVATE_KEY is set in .env.local"
    );
  }
  const deployer = signers[0];

  console.log("Deploying with:", deployer.address);

  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Balance:", ethers.formatEther(balance), "A0GI");

  if (balance === 0n) {
    throw new Error("Deployer wallet has 0 balance. Get testnet tokens at https://faucet.0g.ai");
  }

  const PayrollManager = await ethers.getContractFactory("PayrollManager");
  console.log("Deploying PayrollManager…");
  const payroll = await PayrollManager.deploy(deployer.address);
  await payroll.waitForDeployment();

  const address = await payroll.getAddress();
  console.log("✅ PayrollManager deployed to:", address);
  console.log("Explorer:", `https://chainscan-galileo.0g.ai/address/${address}`);

  // Deposit 1 A0GI into the contract to fund payroll
  console.log("Depositing 1 A0GI to contract…");
  const depositTx = await deployer.sendTransaction({
    to: address,
    value: ethers.parseEther("1.0"),
  });
  await depositTx.wait();
  console.log("✅ Deposited 1 A0GI");

  // Save deployment info for the frontend
  const deployment = {
    address,
    network: "0g-galileo",
    chainId: 16602,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
  };

  const outDir = path.join(__dirname, "../src/lib");
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(
    path.join(outDir, "deployment.json"),
    JSON.stringify(deployment, null, 2)
  );

  // Save ABI for reference
  const artifact = await artifacts.readArtifact("PayrollManager");
  fs.writeFileSync(
    path.join(outDir, "PayrollManager.abi.json"),
    JSON.stringify(artifact.abi, null, 2)
  );

  // Automatically update .env.local with the new contract address
  const envPath = path.join(__dirname, "../.env.local");
  let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";
  if (envContent.includes("NEXT_PUBLIC_CONTRACT_ADDRESS=")) {
    envContent = envContent.replace(
      /NEXT_PUBLIC_CONTRACT_ADDRESS=.*/,
      `NEXT_PUBLIC_CONTRACT_ADDRESS=${address}`
    );
  } else {
    envContent += `\nNEXT_PUBLIC_CONTRACT_ADDRESS=${address}`;
  }
  fs.writeFileSync(envPath, envContent);

  console.log("\n🎉 Done! Next steps:");
  console.log(`   NEXT_PUBLIC_CONTRACT_ADDRESS has been set to ${address} in .env.local`);
  console.log("   Run: npm run dev");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
