import { sortBy } from "lodash";

import { fallback, toV1, withTemporaryFile } from "./utils";

const Config = {
  ipfsGateways:
    "https://{cid}.ipfs.nftstorage.link,https://cloudflare-ipfs.com/ipfs/{cid},https://ipfs.io/ipfs/{cid},https://{cid}.ipfs.dweb.link",
  ipfsUploadGateway: "https://ipfsgateway.goodworker.workers.dev"
};

interface RequestOptions {
  headers?: any;
  body?: any;
  mode?: any;
}

class IpfsStorage {
  client: any;
  gateways: any;

  constructor(httpFactory, config) {
    const { ipfsGateways, ipfsUploadGateway } = config;

    // add tpyes
    this.client = {
      request: async (method, url, options: RequestOptions = {}) => {
        const baseUrl = ipfsUploadGateway;
        const updatedOptions = {
          ...options,
          method: method,
          credentials: "include",
          headers: {
            ...options?.headers
          }
        };

        const response = await httpFactory(baseUrl + url, updatedOptions);
        return response;
      },
      get: async url => {
        const updatedOptions = {
          method: "GET"
        };

        const response = await httpFactory(url, updatedOptions);
        const blob = await response.blob();
        return blob;
      }
    };

    this.gateways = ipfsGateways.split(",").map((gateway, index) => ({ gateway, index, failed: 0 }));
  }

  async store(dataUrl) {
    const { client } = this;
    const form = new FormData();

    // eslint-disable-next-line require-await
    const { data } = await withTemporaryFile(dataUrl, async file => {
      form.append("file", file);
      return await client("POST", "/", { body: form, mode: "no-cors" });
    });

    return toV1(data.cid);
  }

  async load(cid) {
    const blob = await this._lookupGateways(cid);
    const imageUrl = URL.createObjectURL(blob);
    return imageUrl;
  }

  async _lookupGateways(cid) {
    const { gateways, _requestGateway } = this;

    // try gateways and update failed counters
    try {
      const v1 = toV1(cid);

      // eslint-disable-next-line require-await
      return await fallback(gateways.map(gateway => async () => _requestGateway(cid, v1, gateway)));
    } finally {
      // doesn't changes gateway order if it have failed count < 3
      // the gateways failed more times will be moved to the end
      const failingAttemptsGreaterThree = ({ failed }) => (failed < 3 ? 0 : failed);

      // re order gateways. non-failing will keep priorities set in config
      this.gateways = sortBy(gateways, failingAttemptsGreaterThree, "index");
    }
  }

  _requestGateway = async (cid, v1, gateway) => {
    const { gateway: gatewayUrl } = gateway;
    const { client } = this;
    const url = gatewayUrl.replace("{cid}", v1);

    try {
      // try gateway
      const response = await client.get(url);

      // reset failing attempts counter on success
      gateway.failed = 0;

      return response;
    } catch (exception) {
      console.log("try IPFS url: FAIL", { url, cid });

      // increase it on error
      gateway.failed += 1;
      throw exception;
    }
  };
}

export default function createIpfsStorage(httpFactory) {
  return new IpfsStorage(httpFactory, Config);
}
