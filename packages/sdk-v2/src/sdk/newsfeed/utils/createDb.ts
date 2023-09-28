// import { TSDexie as Dexie } from "../../storage/dexiestorage/dexie";
import Dexie from "dexie";

export interface HistoryCacheId {
  id: string;
}

const schema = {
  posts: "++id, title, link, published",
  historyCache: "++id"
};

export const createNewsFeedDb = (env = "qa") => {
  const db = new Dexie(env + "_GDNewsFeedDB", { autoOpen: false });
  db.version(1).stores(schema);

  return db;
};
