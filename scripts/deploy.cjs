const hre = require("hardhat");
const { ethers } = require("ethers");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("Deploying VCRegistry to sepolia...");
  
  // Get network config
  const network = hre.config.networks.sepolia;
  
  // Create provider and wallet
  const provider = new ethers.JsonRpcProvider(network.url);
  const wallet = new ethers.Wallet(network.accounts[0], provider);
  
  console.log("Deploying from account:", wallet.address);
  
  // Read and compile contract
  const contractPath = path.join(__dirname, '../artifacts/contracts/VCRegistry.sol/VCRegistry.json');
  const contractArtifact = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
  
  // Create contract factory
  const contractFactory = new ethers.ContractFactory(
    contractArtifact.abi,
    contractArtifact.bytecode,
    wallet
  );
  
  // Deploy the contract
  console.log("Deploying contract...");
  const contract = await contractFactory.deploy();
  
  // Wait for deployment
  await contract.waitForDeployment();
  
  const contractAddress = await contract.getAddress();
  console.log("VCRegistry deployed to sepolia:", contractAddress);
  
  // Update deployed.json
  const deployedPath = path.join(__dirname, '../src/contracts/deployed.json');
  const deployedData = {
    address: contractAddress,
    network: "sepolia",
    deployedAt: new Date().toISOString()
  };
  
  fs.writeFileSync(deployedPath, JSON.stringify(deployedData, null, 2));
  console.log("Updated", deployedPath);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });