// // db.ts
// Typescript implementation. Does not work currently
import Dexie, { Table } from "dexie";
import { FeedPost } from "src/sdk/newsfeed";

export interface HistoryCache {
  id: string;
}

const schema = {
  posts: "++id, title, link, published",
  historyCache: "++id"
};

// basic example based on docs, tailored specifically to the NewsFeed
export class TSDexie extends Dexie {
  posts!: Table<FeedPost>;
  historyCache!: Table<HistoryCache>;

  constructor(dbName) {
    super(dbName);
    this.version(1).stores(schema);
  }
}
// define the indexable columns
// export interface DexieStoreSchema {
//   [key: string]: string;
// }

// attempt at a more generic implementation
// // export class TSDexie<T> extends Dexie {
// //   _options: any; // missing cache in DexieOptions
// //   _!: Table<T>;

// //   constructor(dbName: string, schema: DexieStoreSchema, options?: any) {
// //     console.log("testdexie -- should run super", dbName, schema);
// //     super(dbName);
// //     console.log("testdexie -- super ran");
// //     this._options = options = {
// //       // some default options
// //       // addons: (Dexie as any as DexieConstructor).addons,
// //       autoOpen: false, // explicitely have to run db.open()
// //       cache: "immutable", // improve performance and data load
// //       ...options
// //     };
// //     console.log("testdexie -- initialize db", { schema, dbName });
// //     this.version(1).stores(schema);

// //     const tableName = Object.keys(schema)[0];

// //     console.log("initialize dexie db -->", { tableName });
// //     this._ = this.table(tableName);
// //   }
// // }
