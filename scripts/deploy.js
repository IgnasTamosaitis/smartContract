const hre = require("hardhat");

async function main() {
  const subscriptionId = process.env.VRF_SUBSCRIPTION_ID;
  if (!subscriptionId) {
    throw new Error("Please set VRF_SUBSCRIPTION_ID in your .env");
  }

  console.log("Deploying PredictionPool to Sepolia with subscription:", subscriptionId);

  const PredictionPool = await hre.ethers.getContractFactory("PredictionPool");
  const pool = await PredictionPool.deploy(subscriptionId);

  await pool.waitForDeployment();

  console.log("PredictionPool deployed to:", await pool.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});