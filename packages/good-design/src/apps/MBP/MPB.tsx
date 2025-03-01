import { useState, useEffect } from "react";
import Onboard from "@web3-onboard/core";
import injectedModule from "@web3-onboard/injected-wallets";
import { ethers, Contract } from "ethers";
import { useG$Balance } from "@gooddollar/web3sdk-v2";
import { useGetContract, useGetEnvChainId } from "@gooddollar/web3sdk-v2";
import celo from "../../assets/svg/celo.svg";
import fuse from "../../assets/svg/fuse.svg";
import ethereum from "../../assets/svg/ethereum.svg";
import axelar from "../../assets/svg/axelar.svg";
import layerzero from "../../assets/svg/layerzero.svg";
import sync from "../../assets/svg/sync.svg";
import gooddollar from "./contracts/gooddollar.json";
import gooddollar2 from "./contracts/gooddollar2.json";
import Notification from "./Notification";
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

const MPB = ({ ethereumBalance, celoBalance, fuseBalance, useCanBridge, onBridge, relayStatus, bridgeStatus }) => {
  /*const gdFuse = useGetContract("GoodDollar", true, "base", 122) as IGoodDollar;
  const gdCelo = useGetContract("GoodDollar", true, "base", 42220) as IGoodDollar;
  console.log(gdFuse);
  console.log(gdCelo);*/
  const { showNotification, notification, onClose } = useNotification();
  const [visibility, setVisibility] = useState("none");
  const [amount, setAmount] = useState("");
  const [label, setLabel] = useState("Connect Wallet");
  const [signer, setSigner] = useState([]);
  const [contractAddress, setContractAddress] = useState("0x67C5870b4A41D4Ebef24d2456547A03F1f3e094B");
  const [srcChainId, setSrcChainId] = useState(1);
  const [dstChainId, setDstChainId] = useState(1);
  const [userAddress, setUserAddress] = useState("");
  const [provider, setProvider] = useState("Axelar");
  const [srcNetworkImg, setSrcNetworkImg] = useState(ethereum);
  const [srcNetwork, setSrcNetwork] = useState("Ethereum");
  const [dstNetwork, setDstNetwork] = useState("Celo");
  const [srcNetworkCounter, setSrcNetworkCounter] = useState(0);
  const [fee, setFee] = useState("/");
  const [txHash, setTxHash] = useState("");
  const [expLnk, setExpLnk] = useState("");
  const [transition, setTransition] = useState("none");
  const [transform, setTransform] = useState("none");
  const [angel, setAngel] = useState(-360);
  const [balance, setBalance] = useState(564654.25);
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
        setProvider(buttonName.charAt(0).toUpperCase() + buttonName.slice(1));
        providers.map((provider, index) => {
          if (buttonColors[provider].backgroundColor !== "#ededed") {
            if (buttonName == provider) {
              setButtonColors(prevColors => ({
                ...prevColors,
                [provider]: {
                  backgroundColor: "aliceblue",
                  borderColor: "rgb(0, 174, 255)"
                }
              }));
            } else {
              setButtonColors(prevColors => ({
                ...prevColors,
                [provider]: {
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
      setBalance(ethereumBalance);
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
        setBalance(celoBalance);
      } else {
        setSrcNetwork("Fuse");
        setSrcNetworkImg(fuse);
        setBalance(fuseBalance);
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
      }

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
      setFee(text[tProvider][tFee]);
      console.log(text[tProvider][tFee]);
    }
  };
  const handleChange = async event => {
    let numb = event.target.value.match(/^([0-9]+\.?[0-9]*|\.[0-9]+)?$/);
    console.log(numb);
    setAmount(numb[0].replace(/^0+/, ""));
    console.log(amount);
    await calculateFee();
  };
  const handleDstAddress = async event => {
    let address = event.target.value.match(/^0x[a-fA-F0-9]{0,40}$/);
    setUserAddress(address[0]);
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
      const GooddollarContract = new Contract(contractAddress, gooddollar, signer);
      let ethaddress = userAddress.match(/0x[a-fA-F0-9]{40}/);
      console.log(ethaddress[0]);

      const b = await GooddollarContract.callStatic.balanceOf(ethaddress[0]);

      setBalance(b.toString());
      setVisibility("block");
      setLabel("Review");
    };*/
    if (signer.length !== 0) {
      console.log(signer);
      setVisibility("block");
      setLabel("Review");
      recalculateFee();

      //checkBalance();
      if (amount !== "") {
        recalculateFee();
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

      setUserAddress(wallets[0].accounts[0].address);
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
        }*/
        } else {
          const onBridgeResult = await onBridge();
          var bp;
          if ("undefined" == typeof provider || provider == "Axelar") {
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

          /*const GooddollarContract = new Contract(contractAddress, gooddollar, signer);
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
            if ("undefined" == typeof provider || provider == "Axelar") {
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
      {notification && <Notification type={notification.type} message={notification.message} onClose={onClose} />}
      <div id="network" style={{ width: "100px", marginRight: "auto", marginLeft: "auto", display: visibility }}>
        <img style={{ width: "50px", height: "50px" }} src={srcNetworkImg} />
        <img
          id="sync"
          style={{
            width: "50px",
            height: "50px",
            backgroundColor: "rgb(0, 174, 255)",
            borderRadius: "50px",
            transition: transition,
            transform: transform
          }}
          src={sync}
          onClick={handleChangeNetwork}
        />
      </div>
      <div id="balance" style={{ display: visibility }}>
        <pre
          style={{
            textAlign: "center",
            fontWeight: "400",
            fontSize: "x-large"
          }}
        >
          {balance} G$
        </pre>
      </div>
      <div
        id="dstNetwork"
        style={{
          display: visibility,
          marginRight: "auto",
          marginLeft: "auto"
        }}
      >
        <label
          for="dstNetwork"
          style={{
            display: "block",
            textAlign: "center",
            width: "100%",
            clear: "both",
            fontFamily: "Roboto",
            fontSize: "x-large",
            fontWeight: "400"
          }}
        >
          Which network you're going to bridge to?
        </label>
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
      </div>
      <div
        id="provider"
        style={{
          display: visibility,
          marginRight: "auto",
          marginLeft: "auto"
        }}
      >
        <label
          for="provider"
          style={{
            display: "block",
            textAlign: "center",
            width: "100%",
            clear: "both",
            fontFamily: "Roboto",
            fontSize: "x-large",
            fontWeight: "400"
          }}
        >
          Choose provider
        </label>
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
                name="provider"
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
      </div>
      <div
        id="dstAddress"
        style={{
          display: visibility,
          width: "560px",
          marginRight: "auto",
          marginLeft: "auto",
          marginTop: "25px",
          marginBottom: "25px"
        }}
      >
        <label
          for="dstAddress"
          style={{
            fontFamily: "Roboto",
            fontSize: "x-large",
            fontWeight: "400"
          }}
        >
          Address:
        </label>
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
            borderRadius: "50px"
          }}
          type="text"
          value={userAddress}
          onChange={handleDstAddress}
          placeholder="Enter address"
        />
      </div>
      <div
        id="amount"
        style={{
          display: visibility,
          width: "500px",
          marginRight: "auto",
          marginLeft: "auto",
          marginTop: "20px",
          marginBottom: "20px"
        }}
      >
        <label
          for="amount"
          style={{
            fontFamily: "Roboto",
            fontSize: "x-large",
            fontWeight: "400"
          }}
        >
          Amount:
        </label>
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
            borderRadius: "50px"
          }}
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
        <p
          style={{
            textAlign: "left",
            fontFamily: "Roboto",
            marginTop: "5px",
            fontSize: "small"
          }}
        >
          The estimated fee for bridging is: {fee}
        </p>
      </div>

      <button
        style={{
          height: "50px",
          width: "200px",
          marginRight: "auto",
          marginLeft: "auto",
          fontFamily: "Roboto",
          fontWeight: "400",
          fontSize: "x-large",
          border: "none",
          borderRadius: "50px",
          backgroundColor: "rgb(0, 174, 255)",
          color: "white"
        }}
        onClick={handleOnClick}
      >
        {label}
      </button>
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
    </>
  );
};
export default MPB;
