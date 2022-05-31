export { ak as DAO_NETWORK, S as SupportedChainId, ae as getNetworkEnv, as as portfolioSupportedAt } from '../chunks/addresses.js';
export { L as LIQUIDITY_PROTOCOL } from '../chunks/protocols.js';

var DEFAULT_DEADLINE_FROM_NOW = 60 * 20;
var AdditionalChainId;
(function (AdditionalChainId) {
    AdditionalChainId[AdditionalChainId["FUSE"] = 122] = "FUSE";
    //KOVAN = 42
})(AdditionalChainId || (AdditionalChainId = {}));

export { AdditionalChainId, DEFAULT_DEADLINE_FROM_NOW };
