const { ethers } = require("hardhat")

async function main() {
  const [owner] = await ethers.getSigners()
 
  const tx = await owner.sendTransaction({
    to: "0xde434bEd30c2a032C8bc3D6C6B3C29f4419860AF",
    value: ethers.parseEther("100.0") 
  })

  console.log("Transaction Hash:", tx.hash)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
