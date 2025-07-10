import { createContext, useContext, useState } from "react";
import { ethers } from "ethers";
import contractABI from "../ABI.json";
import toast from "react-hot-toast";

const Web3Context = createContext();

const contractAddress = "0xef11D1c2aA48826D4c41e54ab82D1Ff5Ad8A64Ca";

export const Web3Provider = ({ children }) => {
  const [contractInstance, setContractInstance] = useState(null);
  const [signer, setSigner] = useState(null);
  const [address, setAddress] = useState(null);

  // const connectWallet = async () => {
  //   if (window.ethereum && !contractInstance) {
  //     try {
  //       const provider = new ethers.BrowserProvider(window.ethereum);
  //       const signer = await provider.getSigner();
  //       const address = await signer.getAddress();

  //       const msg = "Please sign this message to verify ownership of your wallet.";
  //       const signature = await signer.signMessage(msg);

  //       const res = await fetch('http://localhost:5000/api/auth/metamask', {
  //         method: 'POST',
  //         headers: { 'Content-Type': 'application/json' },
  //         credentials: 'include',
  //         body: JSON.stringify({ address, signature }),
  //       });

  //       const data = await res.json();

  //       if (data.success) {
  //         console.log("Login Success", data);
  //         setSigner(signer);
  //         setAddress(address);
  //         const contract = new ethers.Contract(contractAddress, contractABI, signer);
  //         setContractInstance(contract);
  //         console.log("signer : " , signer)
  //         console.log("address : " , address)

  //       } else {
  //         console.error("Login Failed", data);
  //       }

  //     } catch (error) {
  //       console.error("Wallet connection error:", error);
  //     }

  //   } else {
  //     alert("Please install MetaMask");
  //   }
  // };

  const connectWallet = async () => {
    if (window.ethereum && !contractInstance) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();

        const msg =
          "Please sign this message to verify ownership of your wallet.";
        const signature = await signer.signMessage(msg);

        const res = await fetch("http://localhost:5000/api/auth/metamask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ address, signature }),
        });

        const data = await res.json();

        if (data.success) {
          console.log("Login Success", data);
          setSigner(signer);
          setAddress(address);
          toast.success("Connected Successfully");
          const contract = new ethers.Contract(
            contractAddress,
            contractABI,
            signer
          );
          setContractInstance(contract);
          console.log("signer : ", signer);
          console.log("address : ", address);
        } else {
          console.error("Login Failed", data);
          toast.error(data.message);
        }
      } catch (error) {
        console.error("Wallet connection error:", error);
      }
    } else {
      alert("Please install MetaMask");
    }
  };

  return (
    <Web3Context.Provider
      value={{
        contractInstance,
        connectWallet,
        signer,
        address,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error("useWeb3 must be used within a Web3Provider");
  }
  return context;
};
