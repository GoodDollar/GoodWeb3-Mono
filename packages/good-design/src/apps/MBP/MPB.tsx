import React, { useState, useEffect } from "react";
import { VStack, HStack, Box, View, Text, Image, Center } from "native-base";
import GoodButton from "../../core/buttons/GoodButton";
import { TransTitle, GdAmount } from "../../core/layout";

import { ethers, Contract, BigNumber } from "ethers";
import { useG$Amount, Web3Provider, Celo, Fuse } from "@gooddollar/web3sdk-v2";
import celo from "../../assets/svg/celo.svg";
import fuse from "../../assets/svg/fuse.svg";
import ethereum from "../../assets/svg/ethereum.svg";
import axelar from "../../assets/svg/axelar.svg";
import layerzero from "../../assets/svg/layerzero.svg";
import sync from "../../assets/svg/sync.svg";
import Contracts from "@gooddollar/goodprotocol/releases/deployment.json";
import TokenBridgeABI from "@gooddollar/bridge-contracts/artifacts/contracts/bridge/TokenBridge.sol/TokenBridge.json";
import GoodDollarABI from "@gooddollar/goodprotocol/artifacts/abis/IGoodDollar.min.json";

import { ExternalProvider, JsonRpcProvider } from "@ethersproject/providers";
import { DAppProvider, useEthers, Config, Mainnet } from "@usedapp/core";
import Notification from "./Notification";
const config: Config = {
  networks: [Mainnet, Fuse, Celo],
  readOnlyChainId: 42220,
  readOnlyUrls: {
    122: "https://rpc.fuse.io",
    42220: "https://forno.celo.org"
  }
};

const useNotification = () => {
  const [notification, setNotification] = useState(null);

  const showNotification = (type, message) => {
    setNotification({ type, message });
  };

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000); // 3 seconds
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const onClose = () => {
    setNotification(null);
  };

  return { showNotification, notification, onClose };
};

export default useNotification;

const MPB = ({ balance, useCanBridge, onBridge, relayStatus, bridgeStatus }) => {
  const ethereumObj = (window as any).ethereum;
  const { account } = useEthers();
  const w: ethers.Wallet = ethers.Wallet.createRandom();
  const [newProvider, setProvider] = useState<JsonRpcProvider | undefined>(
    new ethers.providers.JsonRpcProvider("https://rpc.ankr.com/eth", "any")
  );

  const { showNotification, notification, onClose } = useNotification();
  const [visibility, setVisibility] = useState("none");
  const [amount, setAmount] = useState("");
  const [label, setLabel] = useState("Connect Wallet");
  const [signer, setSigner] = useState([]);
  const [contractAddress, setContractAddress] = useState("0x67C5870b4A41D4Ebef24d2456547A03F1f3e094B");
  const [srcChainId, setSrcChainId] = useState(1);
  const [dstChainId, setDstChainId] = useState(1);
  const [userAddress, setUserAddress] = useState("");
  const [bridgeprovider, setBridgeProvider] = useState("Axelar");
  const [srcNetworkImg, setSrcNetworkImg] = useState(ethereum);
  const [srcNetwork, setSrcNetwork] = useState("Ethereum");
  const [dstNetwork, setDstNetwork] = useState("Celo");
  const [srcNetworkCounter, setSrcNetworkCounter] = useState(0);
  const [feeData, setFeeData] = useState({});
  const [fee, setFee] = useState("/");
  const [txHash, setTxHash] = useState("");
  const [expLnk, setExpLnk] = useState("");
  const [transition, setTransition] = useState("none");
  const [transform, setTransform] = useState("none");
  const [angel, setAngel] = useState(-360);
  const balanceFormatted = useG$Amount(BigNumber.from(balance), "G$", 1);
  const [borderBottom, setBorderBottom] = useState({
    ethereum: "3px",
    celo: "3px",
    fuse: "3px",
    axelar: "3px",
    layerzero: "3px"
  });
  const [top, setTop] = useState({
    ethereum: "0px",
    celo: "0px",
    fuse: "0px",
    axelar: "0px",
    layerzero: "0px"
  });
  const [buttonColors, setButtonColors] = useState({
    ethereum: {
      backgroundColor: "#ededed",
      borderColor: "#c9c9c9"
    },
    celo: {
      backgroundColor: "#ffffff",
      borderColor: "rgb(0, 174, 255)"
    },
    fuse: {
      backgroundColor: "#ffffff",
      borderColor: "rgb(0, 174, 255)"
    },
    axelar: {
      backgroundColor: "#ffffff",
      borderColor: "rgb(0, 174, 255)"
    },
    layerzero: {
      backgroundColor: "#ffffff",
      borderColor: "rgb(0, 174, 255)"
    }
  });
  const [inputColor, setInputColor] = useState({
    address: "black",
    amount: "black"
  });

  const handleSelect = buttonName => {
    const nets = ["ethereum", "celo", "fuse"];
    const providers = ["axelar", "layerzero"];
    if (buttonName !== srcNetwork.toLowerCase()) {
      setBorderBottom(prevBorderWidth => ({
        ...prevBorderWidth,
        [buttonName]: "1px"
      }));
      setTop(prevTop => ({
        ...prevTop,
        [buttonName]: "3px"
      }));
      if (nets.includes(buttonName)) {
        setDstNetwork(buttonName.charAt(0).toUpperCase() + buttonName.slice(1));
        nets.map((net, index) => {
          if (buttonColors[net].backgroundColor !== "#ededed") {
            if (buttonName == net) {
              setButtonColors(prevColors => ({
                ...prevColors,
                [net]: {
                  backgroundColor: "aliceblue",
                  borderColor: "rgb(0, 174, 255)"
                }
              }));
            } else {
              setButtonColors(prevColors => ({
                ...prevColors,
                [net]: {
                  backgroundColor: "#ffffff",
                  borderColor: "rgb(0, 174, 255)"
                }
              }));
            }
          }
        });
      }

      if (providers.includes(buttonName)) {
        setBridgeProvider(buttonName.charAt(0).toUpperCase() + buttonName.slice(1));
        providers.map((bridgeprovider, index) => {
          if (buttonColors[bridgeprovider].backgroundColor !== "#ededed") {
            if (buttonName == bridgeprovider) {
              setButtonColors(prevColors => ({
                ...prevColors,
                [bridgeprovider]: {
                  backgroundColor: "aliceblue",
                  borderColor: "rgb(0, 174, 255)"
                }
              }));
            } else {
              setButtonColors(prevColors => ({
                ...prevColors,
                [bridgeprovider]: {
                  backgroundColor: "#ffffff",
                  borderColor: "rgb(0, 174, 255)"
                }
              }));
            }
          }
        });
      }
    }

    // Use setTimeout to revert the border width after 1 second
    setTimeout(() => {
      setBorderBottom(prevBorderWidth => ({
        ...prevBorderWidth,
        [buttonName]: "3px"
      }));
      setTop(prevBorderWidth => ({
        ...prevBorderWidth,
        [buttonName]: "0px"
      }));
    }, 250); // 1000 milliseconds = 1 second
  };

  const handleChangeNetwork = () => {
    const nets = ["Ethereum", "Celo", "Fuse"];
    if (srcNetworkCounter + 1 > 2) {
      setSrcNetwork("Ethereum");
      setSrcNetworkImg(ethereum);
      setSrcNetworkCounter(0);
      nets.map((net, index) => {
        if (net == nets[0]) {
          setButtonColors(prevButtonColors => ({
            ...prevButtonColors,
            [net.toLowerCase()]: {
              backgroundColor: "#ededed",
              borderColor: "#c9c9c9"
            }
          }));
        } else {
          setButtonColors(prevButtonColors => ({
            ...prevButtonColors,
            [net.toLowerCase()]: {
              backgroundColor: "#ffffff",
              borderColor: "rgb(0, 174, 255)"
            }
          }));
        }
      });
    } else {
      if (srcNetworkCounter + 1 == 1) {
        setSrcNetwork("Celo");
        setSrcNetworkImg(celo);
      } else {
        setSrcNetwork("Fuse");
        setSrcNetworkImg(fuse);
      }
      setSrcNetworkCounter(srcNetworkCounter + 1);
      nets.map((net, index) => {
        if (net == nets[srcNetworkCounter + 1]) {
          setButtonColors(prevButtonColors => ({
            ...prevButtonColors,
            [net.toLowerCase()]: {
              backgroundColor: "#ededed",
              borderColor: "#c9c9c9"
            }
          }));
        } else {
          setButtonColors(prevButtonColors => ({
            ...prevButtonColors,
            [net.toLowerCase()]: {
              backgroundColor: "#ffffff",
              borderColor: "rgb(0, 174, 255)"
            }
          }));
        }
      });
    }
    setTransition("0.5s");
    setTransform("rotate(" + angel + "deg)");
    setAngel(angel - 360);
  };

  const calculateFee = async () => {
    var tFee = "";
    var tProvider = "";
    let text;
    if ("undefined" === typeof feeData.AXELAR) {
      //  This is CORS issue, try to authorize this origin from your express server
      //  or run the request from the backend via another proxy server
      const url = "https://goodserver.gooddollar.org/bridge/estimatefees";
      try {
        const response = await fetch(url);
        text = await response.json();
        if ("undefined" == typeof text.AXELAR) {
          showNotification("error", "Could not get estimation from the server");
          text = {
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
          setFeeData(text);
        }

        if ("undefined" == typeof bridgeprovider || bridgeprovider == "Axelar") {
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
        setFee(text[tProvider][tFee]);
        console.log(text[tProvider][tFee]);
      } catch (err) {
        showNotification("error", "Could not get estimation from the server");
        // Using stored data, just to let you know how it looks like, you can remove it when ever you want
        text = {
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
        setFeeData(text);
        if ("undefined" == typeof bridgeprovider || bridgeprovider == "Axelar") {
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
        setFee(text[tProvider][tFee]);
        console.log(text[tProvider][tFee]);
      }
    } else {
      if ("undefined" == typeof bridgeprovider || bridgeprovider == "Axelar") {
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
      setFee(feeData[tProvider][tFee]);
      console.log(feeData[tProvider][tFee]);
    }
  };
  const handleFocus = async event => {    
      this.style.borderColor = inputColor['amount']    
  }
  const handleBlur = async event => {   
      this.borderColor = inputColor['amount']    
  }
  const handleChange = async event => {
    let numb = event.target.value.match(/^([0-9]+\.?[0-9]*|\.[0-9]+)?$/);
    console.log(numb);
    if(numb !== null ){

      setAmount(numb[0].replace(/^0+/, ""));
      console.log(amount);
      await calculateFee();
    }else{
      setInputColor(prevColor => ({
        ...prevColor,
        amount: "red"
      }));
      setTimeout(function(){
        setInputColor(prevColor => ({
          ...prevColor,
          amount: "black"
        }));
      },3000)
      showNotification("error", "Invalid charcter, only numbers!");
    }
  };
  const handleDstAddress = async event => {
    let address = event.target.value.match(/^0x[a-fA-F0-9]{0,40}$/);
     if(address!==null){
       setUserAddress(address[0]); 
     }else{
      setInputColor(prevColor => ({
        ...prevColor,
        address: "red"
      }));
      setTimeout(function(){
        setInputColor(prevColor => ({
          ...prevColor,
          address: "black"
        }));
      },3000)
      showNotification("error", "Not an ethereum address!");
    }
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

    if (dstNetwork === "Ethereum") {
      setDstChainId(1);
    } else if (dstNetwork === "Celo") {
      setDstChainId(42220);
    } else if (dstNetwork === "Fuse") {
      setDstChainId(122);
    }
    const recalculateFee = async () => {
      await calculateFee();
    };
    /*const checkBalance = async () => {
      const GooddollarContract = new Contract(contracts["GoodDollar"], GoodDollarABI, signer);
      let ethaddress = userAddress.match(/0x[a-fA-F0-9]{40}/);
      console.log(ethaddress[0]);

      const b = await GooddollarContract.callStatic.balanceOf(ethaddress[0]);

      setBalance(b.toString());
      setVisibility("block");
      setLabel("Review");
    };*/
    const getAddr = async () => {
      const accountAddress = await signer.getAddress();
      if(userAddress==""){
        setUserAddress(accountAddress);

      }

      console.log(accountAddress);
    };

    if (newProvider.connection.url !== "https://rpc.ankr.com/eth") {
      console.log(newProvider);
      console.log(account);
      setSigner(newProvider.getSigner());
    }
    if (signer.length !== 0) {
      getAddr();
      console.log(signer);
      setVisibility("block");
      setLabel("Review");
      recalculateFee();
      //checkBalance();
      if (amount !== "") {
        recalculateFee();
        console.log(bridgeprovider);
      }
    }
  }, [signer, newProvider, srcNetwork, dstNetwork, bridgeprovider]);

  const handleOnClick = async () => {
    if (signer.length === 0) {
      await ethereumObj.request({ method: "eth_requestAccounts" });
      setProvider(new ethers.providers.Web3Provider(ethereumObj as ExternalProvider, "any"));
      //const wallets = await onboard.connectWallet();
      //const ethersProvider = new ethers.providers.Web3Provider(wallets[0].provider, "any");
      //await onboard.setChain({ chainId: srcChainId });
      //setSigner(ethersProvider.getSigner());

      //setUserAddress(wallets[0].accounts[0].address);
    } else {
      if (amount !== "") {
        if (label == "Review") {
          const canBridge = useCanBridge(srcNetwork, balance);
          if (canBridge.isValid === true) {
            setLabel("Bridge G$");
          } else {
            showNotification("error", canBridge.reason);
          }
          /*if ("undefined" == typeof dstChainId) {
          cId = 42220;
        } else {
          cId = dstChainId;
        }
        await onboard.setChain({ chainId: cId });

        const GooddollarContract = new Contract(Contracts["MpbBridge"], TokenBridgeABI.abi, signer);
        let ethaddress = userAddress.match(/0x[a-fA-F0-9]{40}/);
        console.log(ethaddress[0]);
        console.log(GooddollarContract);

        const r = await GooddollarContract.callStatic.canBridge(ethaddress[0], amount);
        console.log(r);

        if (r[0] == true) {
          setLabel("Bridge G$");
        } else {
          alert("Sorry you can't bridge!");
        }*/
        } else {
          const waiting = setInterval(showNotification("waiting", "Your transaction is pending..."), 1000);
          const onBridgeResult = await onBridge();
          clearInterval(waiting);
          var bp;
          if ("undefined" == typeof bridgeprovider || bridgeprovider == "Axelar") {
            bp = 0;
          } else {
            bp = 1;
          }
          if (onBridgeResult.success === true) {
            if (bp == 0) {
              setExpLnk("https://axelarscan.io/tx/" + onBridgeResult.txHash.replace("0x", "").toUpperCase());
            } else {
              setExpLnk("https://layerzeroscan.com/tx/" + onBridgeResult.txHash);
            }
            setTxHash("Bridged successfully " + onBridgeResult.txHash);
            showNotification("success", "Bridged successfully!");
          }

          /*const GooddollarContract = new Contract(Contracts["GoodDollar"], GoodDollarABI, signer);
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
            const nfee = fee.match(/-?\d{1,3}(?:,\d{3})*(?:\.\d+)?/g).map(parseFloat)[0];
            if ("undefined" == typeof bridgeprovider || bridgeprovider == "Axelar") {
              const bp = 0;
            } else {
              const bp = 1;
            }
            try {
              apr = await GooddollarContract.callStatic.bridgeTo(nfee, userAddress, dstChainId, amount, bp);
              apr = apr.wait();
              if (apr.transactionHash) {
                setTxHash("Bridged successfully " + apr.transactionHash);
                if (bp == 0) {
                  setExpLnk("https://axelarscan.io/tx/" + apr.transactionHash.replace("0x", "").toUpperCase());
                } else {
                  setExpLnk("https://layerzeroscan.com/tx/" + apr.transactionHash);
                }
              }
            } catch (err) {
              console.log(err);
              alert("An error occured");
            }
          }
        } catch (err) {
          console.log(err);
          alert("An error occured");
        }*/
        }
      } else {
        showNotification("error", "You should insert amount");
      }
    }
  };
  const handleMAX = () => {
    setAmount(balance);
  };
  const nets = { Ethereum: ethereum, Celo: celo, Fuse: fuse };
  const providers = { Axelar: axelar, LayerZero: layerzero };
  return (
    <>
      <VStack>
        {notification && <Notification type={notification.type} message={notification.message} onClose={onClose} />}
        <DAppProvider config={config}>
          <Web3Provider env="fuse" web3Provider={newProvider} config={config}>
            <HStack width="100px" marginRight="auto" marginLeft="auto" display={visibility}>
              <Image w="50px" h="50px" source={{ uri: srcNetworkImg }} style={{ float: "left" }} />
              <Image
                w="50px"
                h="50px"
                style={{
                  backgroundColor: "rgb(0, 174, 255)",
                  borderRadius: "50px",
                  transition: transition,
                  transform: transform
                }}
                source={sync}
                onClick={handleChangeNetwork}
              />
            </HStack>
            <Box marginTop="20px" marginRight="auto" marginLeft="auto" display={visibility}>
              <GdAmount
                color="goodGrey.700"
                amount={balanceFormatted}
                withDefaultSuffix={true}
                withFullBalance
                fontSize="xl"
              />
            </Box>
            <Box display={visibility} marginTop="30px" marginRight="auto" marginLeft="auto">
              <TransTitle t={/*i18n*/ "Which network you're going to bridge to?"} variant="title-gdblue" />
              <div
                id="netsContainer"
                style={{
                  width: "230px",
                  height: "60px",
                  marginLeft: "auto",
                  marginRight: "auto",
                  marginTop: "20px",
                  marginBottom: "20px"
                }}
              >
                {Object.keys(nets).map((key, index) => (
                  <>
                    <label
                      for={key}
                      style={{
                        position: "relative",
                        top: top[key.toLowerCase()],
                        display: "block",
                        width: "60px",
                        height: "60px",
                        float: "left",
                        border: `1px solid ${buttonColors[key.toLowerCase()].borderColor}`,
                        borderRadius: "10px",
                        borderBottom: `${borderBottom[key.toLowerCase()]} solid ${
                          buttonColors[key.toLowerCase()].borderColor
                        }`,
                        backgroundColor: buttonColors[key.toLowerCase()].backgroundColor
                      }}
                    >
                      <img
                        src={nets[key]}
                        style={{
                          display: "block",
                          position: "relative",
                          marginLeft: "auto",
                          marginRight: "auto",
                          top: "5px",
                          width: "50px",
                          height: "50px"
                        }}
                      ></img>
                    </label>
                    <input
                      type="radio"
                      name="dstNetwork"
                      id={key}
                      value={key}
                      style={{
                        visibility: "hidden",
                        float: "left"
                      }}
                      onClick={() => handleSelect(key.toLowerCase())}
                    />
                  </>
                ))}
              </div>
            </Box>
            <Box display={visibility} marginTop="10px" marginRight="auto" marginLeft="auto">
              <TransTitle t={/*i18n*/ "Choose provider"} variant="title-gdblue" />
              <div
                id="prvsContainer"
                style={{
                  width: "145px",
                  height: "60px",
                  marginLeft: "auto",
                  marginRight: "auto",
                  marginTop: "20px",
                  marginBottom: "20px"
                }}
              >
                {Object.keys(providers).map((key, index) => (
                  <>
                    <label
                      for={key}
                      style={{
                        position: "relative",
                        top: top[key.toLowerCase()],
                        display: "block",
                        width: "60px",
                        height: "60px",
                        float: "left",
                        border: `1px solid ${buttonColors[key.toLowerCase()].borderColor}`,
                        borderRadius: "10px",
                        borderBottom: `${borderBottom[key.toLowerCase()]} solid ${
                          buttonColors[key.toLowerCase()].borderColor
                        }`,
                        backgroundColor: buttonColors[key.toLowerCase()].backgroundColor
                      }}
                    >
                      <img
                        src={providers[key]}
                        style={{
                          display: "block",
                          position: "relative",
                          marginLeft: "auto",
                          marginRight: "auto",
                          top: "5px",
                          width: "50px",
                          height: "50px"
                        }}
                      ></img>
                    </label>
                    <input
                      type="radio"
                      name="bridgeprovider"
                      id={key}
                      value={key}
                      style={{
                        visibility: "hidden",
                        float: "left"
                      }}
                      onClick={() => handleSelect(key.toLowerCase())}
                    />
                  </>
                ))}
              </div>
            </Box>
            <Box
              display={visibility}
              width="560px"
              marginRight="auto"
              marginLeft="auto"
              marginTop="25px"
              marginBottom="25px"
            >
              <TransTitle t={/*i18n*/ "Address:"} variant="title-gdblue" />
              <input
                name="dstAddress"
                style={{
                  fontWeight: "400",
                  fontSize: "x-large",
                  fontFamily: "Roboto",
                  height: "50px",
                  width: "560px",
                  marginRight: "auto",
                  marginLeft: "auto",
                  borderRadius: "50px",
                  borderColor: inputColor["address"],
                  outline: "none"
                }}
                type="text"
                value={userAddress}
                onChange={handleDstAddress}
                placeholder="Enter address"
              />
            </Box>
            <Box
              display={visibility}
              width="500px"
              marginRight="auto"
              marginLeft="auto"
              marginTop="20px"
              marginBottom="20px"
            >
              <TransTitle t={/*i18n*/ "Amount:"} variant="title-gdblue" />
              <input
                name="amount"
                style={{
                  display: visibility,
                  fontWeight: "400",
                  fontSize: "x-large",
                  fontFamily: "Roboto",
                  height: "50px",
                  width: "500px",
                  marginRight: "auto",
                  marginLeft: "auto",
                  borderRadius: "50px",
                  borderColor: inputColor["amount"],
                  outline: "none"
                }}
                onFocus={handleFocus}
                onBlur={handleBlur}
                type="text"
                value={amount}
                onChange={handleChange}
                placeholder="Enter amount"
              />
              <span
                onClick={handleMAX}
                style={{
                  fontFamily: "Roboto",
                  fontWeight: "400",
                  fontSize: "small",
                  marginTop: "5px",
                  float: "right",
                  cursor: "default"
                }}
              >
                MAX
              </span>
              <Text textAlign="left" fontFamily="Roboto" marginTop="5px" fontSize="small">
                The estimated fee for bridging is: {fee}
              </Text>
            </Box>

            <GoodButton
              style={{ marginRight: "auto", marginLeft: "auto" }}
              backgroundColor="gdPrimary"
              color="white"
              width="200px"
              onPress={handleOnClick}
            >
              {label}
            </GoodButton>
            <pre
              style={{
                fontFamily: "Roboto",
                fontSize: "x-large",
                fontWeight: "400",
                textAlign: "center"
              }}
            >
              <a target="_blank" href={expLnk}>
                {txHash}
              </a>
            </pre>
          </Web3Provider>
        </DAppProvider>
      </VStack>
    </>
  );
};
export default MPB;
