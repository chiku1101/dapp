const hre = require("hardhat");

async function main() {
  console.log("Deploying VCRegistry contract...");

  const VCRegistry = await hre.ethers.getContractFactory("VCRegistry");
  const vcRegistry = await VCRegistry.deploy();

  await vcRegistry.waitForDeployment();

  const contractAddress = await vcRegistry.getAddress();
  console.log("VCRegistry deployed to:", contractAddress);

  // Save the contract address to a file
  const fs = require('fs');
  const contractInfo = {
    address: contractAddress,
    network: hre.network.name,
    deployedAt: new Date().toISOString()
  };

  fs.writeFileSync(
    './src/contracts/deployed.json',
    JSON.stringify(contractInfo, null, 2)
  );

  console.log("Contract info saved to src/contracts/deployed.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });