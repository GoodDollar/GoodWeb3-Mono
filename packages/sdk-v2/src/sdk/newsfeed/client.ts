import { CeramicClient } from "@ceramicnetwork/http-client";
import { TileDocument } from "@ceramicnetwork/stream-tile";
import { assign, once } from "lodash";

import { batch } from "./utils";

// define in class initializers
const devCeramicNodeURL = "https://ceramic.gooddollar.org";

export const getCeramicClient = once(() => new CeramicClient(devCeramicNodeURL));
const syncOptions = { syncTimeoutSeconds: 5000 / 1000 };
const ceramicBatchSize = 5;

export class CeramicModel {
  static index: null | string = null;

  static liveIndex: null | string = null;

  static get ceramic() {
    return getCeramicClient();
  }

  static async all(): Promise<TileDocument[]> {
    const {
      content: { items = [] }
    } = await this._getIndex();

    return this._loadEntities(items);
  }

  static async find(id: any): Promise<TileDocument> {
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

  static async getLiveIndex(): Promise<TileDocument> {
    return this._getIndex(true);
  }

  static async loadDocument(id: any): Promise<TileDocument> {
    return TileDocument.load(this.ceramic, id, syncOptions);
  }

  /** @private */
  static async _getIndex(forLiveUpdates = false): Promise<TileDocument> {
    const indexID = forLiveUpdates ? this.liveIndex : this.index;

    if (!indexID) {
      throw new Error(`${forLiveUpdates ? "Primary" : "Live"} index isn't defined`);
    }

    return this.loadDocument(indexID);
  }

  /** @private */
  static async _loadEntities(ids: string[]): Promise<TileDocument[]> {
    return batch(ids, ceramicBatchSize, async id => this.loadDocument(id));
  }
}
