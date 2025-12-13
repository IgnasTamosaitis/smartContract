const hre = require("hardhat");

async function main() {
  console.log("Deploying PredictionPool (Ganache-friendly version)...");

  const PredictionPool = await hre.ethers.getContractFactory("PredictionPool");
  const pool = await PredictionPool.deploy(); // No VRF subscription needed!

  await pool.waitForDeployment();

  console.log("PredictionPool deployed to:", await pool.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});