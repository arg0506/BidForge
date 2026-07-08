const hre = require("hardhat");

async function main() {
  console.log("Starting deployment of AuctionManager...");

  // Get the ContractFactory
  const AuctionManager = await hre.ethers.getContractFactory("AuctionManager");

  // Deploy the contract
  const manager = await AuctionManager.deploy();

  await manager.waitForDeployment();

  const contractAddress = await manager.getAddress();
  console.log("AuctionManager successfully deployed to:", contractAddress);
  
  // Note: Write the address to the frontend config if applicable
  console.log("To connect your frontend, update your VITE_CONTRACT_ADDRESS in .env");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed with error:", error);
    process.exit(1);
  });
