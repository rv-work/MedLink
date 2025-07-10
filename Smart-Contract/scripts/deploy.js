const hre = require("hardhat");

async function main() {
  const ReportManager = await hre.ethers.getContractFactory("ReportManager");
  const reportManager = await ReportManager.deploy();

  await reportManager.waitForDeployment(); 
  const address = await reportManager.getAddress(); 

  console.log(`Contract deployed to: ${address}`);
}

main().catch((error) => { 
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});
