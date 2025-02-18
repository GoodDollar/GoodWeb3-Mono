import { useState, useEffect } from "react";
import Onboard from "@web3-onboard/core";
import injectedModule from "@web3-onboard/injected-wallets";
import { ethers, Contract, utils } from "ethers";
import CallContractGasEstimation from "./contracts/CallContractGasEstimation.json";
import CallContractWithToken from "./contracts/CallContractWithToken.json";
import CallContract from "./contracts/CallContract.json";
import gooddollar from "./contracts/gooddollar.json";
import gooddollar2 from "./contracts/gooddollar2.json";

import CallContractGasEstimationBinary from "./contracts/CallContractGasEstimation.txt";
import CallContractWithTokenBinary from "./contracts/CallContractWithToken.txt";
import CallContractBinary from "./contracts/CallContract.txt";
import gooddollarBinary from "./contracts/gooddollar.txt";
import setChain from "@web3-onboard/core/dist/chain";

const MAINNET_RPC_URL = "https://rpc.ankr.com/eth";

const injected = injectedModule();
const onboard = Onboard({
  // This javascript object is unordered meaning props do not require a certain order
  wallets: [injected],
  chains: [
    {
      id: 1,
      token: "ETH",
      label: "Ethereum Mainnet",
      rpcUrl: MAINNET_RPC_URL
    },
    {
      id: 11155111,
      token: "ETH",
      label: "Ethreum Sepolia",
      rpcUrl: "https://rpc.ankr.com/eth_sepolia"
    },
    {
      id: "0x2105",
      token: "ETH",
      label: "Base",
      rpcUrl: "https://mainnet.base.org"
    },
    {
      id: 42220,
      token: "ETH",
      label: "Celo",
      rpcUrl: "https://rpc.ankr.com/celo"
    },
    {
      id: 122,
      token: "FUSE",
      label: "Fuse",
      rpcUrl: "https://rpc.fuse.io"
    }
  ]
});

// Button.js
/*import React from "react";

const Button = ({ label, onClick }) => {
  return <button onClick={onClick}>{label}</button>;
};*/
const MPB = ({ srcNetwork, dstNetwork, provider }) => {
  const [visibility, setVisibility] = useState("none");
  const [amount, setAmount] = useState("");
  const [label, setLabel] = useState("Connect Wallet");
  const [signer, setSigner] = useState([]);
  const [contractAddress, setContractAddress] = useState("0x67C5870b4A41D4Ebef24d2456547A03F1f3e094B");
  const [srcChainId, setSrcChainId] = useState(1);
  const [dstChainId, setDstChainId] = useState(1);
  const [userAddress, setUserAddress] = useState("");
  const [balance, setBalance] = useState("");
  const [fee, setFee] = useState("");
  const calculateFee = () => {
    var tFee = "";
    var tProvider = "";
    /*
    /  This is CORS issue, try to authorize this origin from your express server
    /  or run the request from the backend via another proxy server
    const url = 'https://goodserver.gooddollar.org/bridge/estimatefees';
    const response = await fetch(url);    
    const text = await response.text();
    */
    const text = {
      AXELAR: {
        AXL_CELO_TO_ETH: "4.386499783337742 Celo",
        AXL_ETH_TO_CELO: "0.000040911855813545 ETH"
      },
      LAYERZERO: {
        LZ_ETH_TO_CELO: "0.000441359200711697 ETH",
        LZ_ETH_TO_FUSE: "0.000320624723154988 ETH",
        LZ_CELO_TO_ETH: "32.215487970930646 Celo",
        LZ_CELO_TO_FUSE: "0.08875872068155444 CELO",
        LZ_FUSE_TO_ETH: "157.674306032853 Fuse",
        LZ_FUSE_TO_CELO: "2.20834510912 Fuse"
      }
    };
    if ("undefined" == typeof provider || provider == "Axelar") {
      tFee = "AXL_";
      tProvider = "AXELAR";
    } else {
      tFee = "LZ_";
      tProvider = "LAYERZERO";
    }
    if ("undefined" == typeof srcNetwork || srcNetwork == "Ethereum") {
      tFee += "ETH_TO_";
    } else if (srcNetwork == "Celo") {
      tFee += "CELO_TO_";
    } else if (srcNetwork == "Fuse") {
      tFee += "FUSE_TO_";
    }
    if ("undefined" == typeof dstNetwork || dstNetwork == "Celo") {
      tFee += "CELO";
    } else if (dstNetwork == "Ethereum") {
      tFee += "ETH";
    } else if (dstNetwork == "Fuse") {
      tFee += "FUSE";
    }
    console.log(tFee);
    console.log(tProvider);
    setFee("The estimated fee for bridging is: " + text[tProvider][tFee]);
    console.log(text[tProvider][tFee]);
  };
  const handleChange = async event => {
    let numb = event.target.value.match(/\d+/g);
    setAmount(numb[0].replace(/^0+/, ""));
    console.log(amount);
    calculateFee();
  };
  useEffect(() => {
    if (srcNetwork === "Ethereum") {
      setContractAddress("0x67C5870b4A41D4Ebef24d2456547A03F1f3e094B");
      setSrcChainId(1);
    } else if (srcNetwork === "Celo") {
      setContractAddress("0x62b8b11039fcfe5ab0c56e502b1c372a3d2a9c7a");
      setSrcChainId(42220);
    } else if (srcNetwork === "Fuse") {
      setContractAddress("0x495d133B938596C9984d462F007B676bDc57eCEC");
      setSrcChainId(122);
    }

    if ("undefined" !== typeof srcNetwork && ("undefined" !== typeof dstNetwork) !== "" && srcNetwork === dstNetwork) {
      alert("Source network & destination network should not be the same");
    }
    if (dstNetwork === "Ethereum") {
      setDstChainId(1);
    } else if (dstNetwork === "Celo") {
      setDstChainId(42220);
    } else if (dstNetwork === "Fuse") {
      setDstChainId(122);
    }

    const checkBalance = async () => {
      const GooddollarContract = new Contract(contractAddress, gooddollar, signer);
      let ethaddress = userAddress.match(/0x[a-fA-F0-9]{40}/);
      console.log(ethaddress[0]);

      const b = await GooddollarContract.callStatic.balanceOf(ethaddress[0]);

      setBalance("Your balance is " + b.toString() + " g$");
      setVisibility("block");
      setLabel("Review");
    };
    if (signer.length !== 0) {
      console.log(signer);
      checkBalance();
      if (amount !== "") {
        calculateFee();
        console.log(provider);
      }
    }
  }, [signer, srcNetwork, dstNetwork, provider]);

  const handleOnClick = async () => {
    if (signer.length === 0) {
      const wallets = await onboard.connectWallet();
      const ethersProvider = new ethers.providers.Web3Provider(wallets[0].provider, "any");
      await onboard.setChain({ chainId: srcChainId });
      setSigner(ethersProvider.getSigner());
      setUserAddress("Your address is " + wallets[0].accounts[0].address);
    } else {
      if (label == "Review") {
        if ("undefined" == typeof dstChainId) {
          cId = 42220;
        } else {
          cId = dstChainId;
        }
        await onboard.setChain({ chainId: cId });

        const GooddollarContract = new Contract("0xa3247276dbcc76dd7705273f766eb3e8a5ecf4a5", gooddollar2, signer);
        let ethaddress = userAddress.match(/0x[a-fA-F0-9]{40}/);
        console.log(ethaddress[0]);
        console.log(GooddollarContract);

        const r = await GooddollarContract.callStatic.canBridge(ethaddress[0], amount);
        console.log(r);

        if (r[0] == true) {
          setLabel("Bridge G$");
        } else {
          alert("Sorry you can't bridge!");
        }
      } else {
        const GooddollarContract = new Contract(contractAddress, gooddollar, signer);
        let ethaddress = userAddress.match(/0x[a-fA-F0-9]{40}/);
        console.log(ethaddress[0]);
        console.log(GooddollarContract);

        if ("undefined" == typeof srcNetwork || srcNetwork == "Etheruem" || srcNetwork == "Fuse") {
          var amt = amount * 100;
        } else {
          var amt = (amount * 10) ^ 18;
        }
        try {
          var apr = await GooddollarContract.callStatic.approve("0xa3247276dbcc76dd7705273f766eb3e8a5ecf4a5", amt);
          apr = apr.wait();
          if (apr.transactionHash) {
            try {
              apr = await GooddollarContract.callStatic.bridgeTo(userAddress, amt);
              apr = apr.wait();
              if (apr.transactionHash) {
              }
            } catch (err) {
              console.log(err);
              alert("An error occured");
            }
          }
        } catch (err) {
          console.log(err);
          alert("An error occured");
        }
      }

      //console.log(b.toString());

      /*const CallContractGasEstimationContract = new Contract(
        "0x18460C4f98368EDaD279fA5A154C5cc80c2bB9Ff",
        CallContractGasEstimation,
        signer
      );*/
      //console.log(CallContractGasEstimationContract)
      /*const fee = await CallContractGasEstimationContract.callStatic.estimateGasFee(
        "base-sepolia",
        "0xe432150cce91c13a887f7D836923d5597adD8E31",
        amount
      );*/
      //console.log(utils.formatEther(fee.toString()));
      //console.log(fee._hex)
      /*const CallContractContract = new Contract("0x809bF4D3CD832355E92474c1cC01E60D8B3A705a", CallContract, signer);
      var tx = await CallContractContract.setRemoteValue(
        "base-sepolia",
        "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        amount,
        { value: fee }
      );
      tx = await tx.wait();
      if (tx.transactionHash) {
        console.log("ok, tx hash is: " + tx.transactionHash);
      }*/
    }
  };
  return (
    <>
      <pre>{userAddress}</pre>
      <pre>{balance}</pre>
      <input
        style={{ display: visibility }}
        type="text"
        value={amount}
        onChange={handleChange}
        placeholder="Enter amount"
      />
      <pre>{fee}</pre>
      <button onClick={handleOnClick}>{label}</button>
      <pre>{txHash}</pre>
    </>
  );
};
export default MPB;
