import { CeramicClient } from "@ceramicnetwork/http-client";
import { TileDocument } from "@ceramicnetwork/stream-tile";
import { assign, once } from "lodash";

import { batch } from "./utils";

// define in class initializers
const devCeramicNodeURL = "https://ceramic.gooddollar.org";

export const getCeramicClient = once(() => new CeramicClient(devCeramicNodeURL));
const syncOptions = { syncTimeoutSeconds: 5000 / 1000 };
const ceramicBatchSize = 5;

interface CeramicModelConfig {
  ceramicNodeUrl: null | string;
  ceramicIndex: null | string;
  ceramicLiveIndex: null | string;
}

export class CeramicModel {
  ceramicNodeUrl: null | string;
  ceramicIndex: null | string;
  ceramicLiveIndex: null | string;

  constructor({ ceramicNodeUrl = null, ceramicIndex = null, ceramicLiveIndex = null }: CeramicModelConfig) {
    this.ceramicNodeUrl = ceramicNodeUrl || devCeramicNodeURL;
    this.ceramicIndex = ceramicIndex;
    this.ceramicLiveIndex = ceramicLiveIndex;
  }

  get ceramic() {
    return getCeramicClient();
  }

  async all(): Promise<TileDocument[]> {
    const {
      content: { items = [] }
    } = await this._getIndex();

    return this._loadEntities(items);
  }

  async find(id: any): Promise<TileDocument> {
    const { content } = await this._getIndex();
    const documentId = String(id);

    if (!content.items.includes(documentId)) {
      const exception = new Error(`Ceramic document with '${documentId}' ID doesn't exists or have been removed`);

      assign(exception, {
        documentId,
        name: "DOCUMENT_NOT_FOUND"
      });

      throw exception;
    }

    return this.loadDocument(id);
  }

  async getLiveIndex(): Promise<TileDocument> {
    return this._getIndex(true);
  }

  async loadDocument(id: any): Promise<TileDocument> {
    return TileDocument.load(this.ceramic, id, syncOptions);
  }

  /** @private */
  async _getIndex(forLiveUpdates = false): Promise<TileDocument> {
    const indexID = forLiveUpdates ? this.ceramicLiveIndex : this.ceramicIndex;

    if (!indexID) {
      throw new Error(`${forLiveUpdates ? "Primary" : "Live"} index isn't defined`);
    }

    return this.loadDocument(indexID);
  }

  /** @private */
  async _loadEntities(ids: string[]): Promise<TileDocument[]> {
    return batch(ids, ceramicBatchSize, async id => this.loadDocument(id));
  }
}
