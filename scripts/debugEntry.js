const hre = require("hardhat");

async function main() {
  const contractAddress = "0x78bAa058f01f8731F24f8827f6714b5C8757216a";
  const PredictionPool = await hre.ethers.getContractAt("PredictionPool", contractAddress);
  
  const [signer] = await hre.ethers.getSigners();
  
  const entryFee = await PredictionPool.entryFee();
  console.log("Entry Fee:", hre.ethers.formatEther(entryFee), "ETH");
  console.log("Sending:", hre.ethers.formatEther(entryFee), "ETH\n");
  
  // Try staticCall to see the actual error
  try {
    await PredictionPool.connect(signer).enterRound.staticCall({
      value: entryFee,
      gasLimit: 300000
    });
    console.log("✅ Static call succeeded - transaction should work!");
  } catch (error) {
    console.log("❌ Static call failed");
    console.log("Error message:", error.message);
    
    // Try to decode the error
    if (error.data) {
      console.log("\nError data:", error.data);
      
      // Check if it's a string error
      if (error.data.length > 10) {
        try {
          const reason = hre.ethers.toUtf8String("0x" + error.data.slice(138));
          console.log("Decoded reason:", reason);
        } catch (e) {
          console.log("Could not decode error");
        }
      }
    }
    
    if (error.errorName) {
      console.log("Error name:", error.errorName);
    }
    
    if (error.errorArgs) {
      console.log("Error args:", error.errorArgs);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
