import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const platformFeePercent = 5; // 5% platform fee
  
  const FreelanceEscrow = await ethers.getContractFactory("FreelanceEscrow");
  const freelanceEscrow = await FreelanceEscrow.deploy(platformFeePercent);

  await freelanceEscrow.waitForDeployment();
  
  const contractAddress = await freelanceEscrow.getAddress();
  console.log("FreelanceEscrow deployed to:", contractAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });