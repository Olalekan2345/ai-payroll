require("dotenv").config({ path: require("path").join(__dirname, "../.env.local") });
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });

const { ethers, artifacts } = require("hardhat");
const fs = require("fs");
const path = require("path");

const ZERO = "0x0000000000000000000000000000000000000000";

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

  const factoryAddress = process.env.NEXT_PUBLIC_FACTORY_ADDRESS || ZERO;
  let payrollAddress;

  if (factoryAddress !== ZERO) {
    // Deploy THROUGH the factory so the PayrollManager is registered and
    // factory callbacks (markEmployee / unmarkEmployee) work.
    console.log("Using factory at:", factoryAddress);
    const factoryAbi = [
      "function createPayroll() external returns (address)",
      "function getContract(address) external view returns (address)",
      "event PayrollCreated(address indexed employer, address indexed payrollContract)",
    ];
    const factory = new ethers.Contract(factoryAddress, factoryAbi, deployer);

    const existing = await factory.getContract(deployer.address);
    if (existing !== ZERO) {
      console.log(`Deployer already has a PayrollManager at ${existing}. Reusing it.`);
      payrollAddress = existing;
    } else {
      console.log("Calling factory.createPayroll()…");
      const tx = await factory.createPayroll();
      const receipt = await tx.wait();
      const ev = receipt.logs
        .map((l) => { try { return factory.interface.parseLog(l); } catch { return null; } })
        .find((p) => p && p.name === "PayrollCreated");
      if (!ev) throw new Error("PayrollCreated event not found");
      payrollAddress = ev.args.payrollContract;
      console.log("✅ PayrollManager deployed via factory at:", payrollAddress);
    }
  } else {
    // Standalone deployment — no factory integration.
    const PayrollManager = await ethers.getContractFactory("PayrollManager");
    console.log("Deploying standalone PayrollManager (no factory)…");
    const payroll = await PayrollManager.deploy(deployer.address, ZERO);
    await payroll.waitForDeployment();
    payrollAddress = await payroll.getAddress();
    console.log("✅ PayrollManager deployed to:", payrollAddress);
  }

  console.log("Explorer:", `https://chainscan-galileo.0g.ai/address/${payrollAddress}`);

  // Deposit 1 A0GI into the contract to fund payroll
  console.log("Depositing 1 A0GI to contract…");
  const depositTx = await deployer.sendTransaction({
    to: payrollAddress,
    value: ethers.parseEther("1.0"),
  });
  await depositTx.wait();
  console.log("✅ Deposited 1 A0GI");

  // Save deployment info for the frontend
  const deployment = {
    address: payrollAddress,
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

  const artifact = await artifacts.readArtifact("PayrollManager");
  fs.writeFileSync(
    path.join(outDir, "PayrollManager.abi.json"),
    JSON.stringify(artifact.abi, null, 2)
  );

  const envPath = path.join(__dirname, "../.env.local");
  let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";
  if (envContent.includes("NEXT_PUBLIC_CONTRACT_ADDRESS=")) {
    envContent = envContent.replace(
      /NEXT_PUBLIC_CONTRACT_ADDRESS=.*/,
      `NEXT_PUBLIC_CONTRACT_ADDRESS=${payrollAddress}`
    );
  } else {
    envContent += `\nNEXT_PUBLIC_CONTRACT_ADDRESS=${payrollAddress}`;
  }
  fs.writeFileSync(envPath, envContent);

  console.log("\n🎉 Done! Next steps:");
  console.log(`   NEXT_PUBLIC_CONTRACT_ADDRESS has been set to ${payrollAddress} in .env.local`);
  console.log("   Run: npm run dev");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
