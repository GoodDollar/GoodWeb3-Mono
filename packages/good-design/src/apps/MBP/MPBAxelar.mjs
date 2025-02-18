import { Wallet, Contract, providers, utils, ContractFactory } from "ethers"
import CallContractGasEstimation  from './contracts/CallContractGasEstimation.json' assert {type:'json'}
import CallContractWithToken  from './contracts/CallContractWithToken.json' assert {type:'json'}
import CallContract  from './contracts/CallContract.json' assert {type:'json'}
import fs from "fs"
const CallContractGasEstimationBinary = fs.readFileSync('./contracts/CallContractGasEstimation.txt','utf8');
const CallContractWithTokenBinary = fs.readFileSync('./contracts/CallContractWithToken.txt','utf8');
const CallContractBinary = fs.readFileSync('./contracts/CallContract.txt','utf8');

const p = new providers.JsonRpcProvider('https://rpc.ankr.com/eth_sepolia')
//import bip39 from "bip39"
//const mn = bip39.generateMnemonic()
const mnemonic = 'you boost venture blood sample cruel actual long apology hurry inflict taste'
var w = Wallet.fromMnemonic(mnemonic)
w = w.connect(p);
/*const CallContractGasEstimationFactory = new ContractFactory(CallContractGasEstimation,CallContractGasEstimationBinary,w)
const CallContractGasEstimationContract = await CallContractGasEstimationFactory.deploy('0xe432150cce91c13a887f7D836923d5597adD8E31','0xbE406F0189A0B4cf3A05C286473D23791Dd44Cc6')
await CallContractGasEstimationContract.deployed();
console.log("CallContractGasEstimationContract deployed to:", CallContractGasEstimationContract.address);
//0x18460C4f98368EDaD279fA5A154C5cc80c2bB9Ff
*/
/*const CallContractFactory = new ContractFactory(CallContract,CallContractBinary,w)
const CallContractContract = await CallContractFactory.deploy('0xe432150cce91c13a887f7D836923d5597adD8E31','0xbE406F0189A0B4cf3A05C286473D23791Dd44Cc6')
await CallContractContract.deployed();
console.log("CallContractContract deployed to:", CallContractContract.address);
// 0x809bF4D3CD832355E92474c1cC01E60D8B3A705a
*/

/*const CallContractWithTokenFactory = new ContractFactory(CallContractWithToken,CallContractWithTokenBinary,w)
const CallContractWithTokenContract = await CallContractWithTokenFactory.deploy('0xe432150cce91c13a887f7D836923d5597adD8E31','0xbE406F0189A0B4cf3A05C286473D23791Dd44Cc6')
await CallContractWithTokenContract.deployed();
console.log("CallContractWithTokenContract deployed to:", CallContractWithTokenContract.address);
// 0x70f16E4BeE36ADF829c6F24fF2468dca836aB6A1
//0x82F4Db9C8816Ef6564d69ab6488E562727C2CF44*/


const CallContractGasEstimationContract = new Contract("0x18460C4f98368EDaD279fA5A154C5cc80c2bB9Ff", CallContractGasEstimation, w);
//console.log(CallContractGasEstimationContract)
const fee = await CallContractGasEstimationContract.callStatic.estimateGasFee('base-sepolia','0xe432150cce91c13a887f7D836923d5597adD8E31', 'ok, it works!')
console.log(utils.formatEther(fee.toString()));
//console.log(fee._hex)
const CallContractContract = new Contract("0x809bF4D3CD832355E92474c1cC01E60D8B3A705a", CallContract, w);
const tx = await CallContractContract.setRemoteValue('base-sepolia','0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', 'ok, it works!', {value: fee});
console.log(await tx.wait())
/*const CallContractWithTokenContract = new Contract("0x82F4Db9C8816Ef6564d69ab6488E562727C2CF44", CallContractWithToken, w);
const tx = await CallContractWithTokenContract.sendToMany('base-sepolia','0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', 'ok, it works!', 'USDC', 10, {gasLimit: 100000,value: fee});
console.log(await tx.wait())*/


