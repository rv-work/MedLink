// require("@nomicfoundation/hardhat-toolbox");
// require("dotenv").config(); 

// /** @type import('hardhat/config').HardhatUserConfig */
// module.exports = {
//   solidity: "0.8.28",
//   networks: {
//     sepolia: {
//       url: `https://eth-sepolia.g.alchemy.com/v2/45hYRHpZY8B-ahK1laOdFeU03ulUjoqe`, // or Alchemy URL
//       accounts: [`0x${process.env.PRIVATE_KEY}`], // your wallet's private key
//     },
//     mumbai: {
//       url: `https://rpc-mumbai.maticvigil.com/`, // for Mumbai Testnet
//       accounts: [`0x${process.env.PRIVATE_KEY}`], // your wallet's private key
//     },
//   },
// };




require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
};
