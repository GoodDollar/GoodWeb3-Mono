import Dexie from "dexie";

const schema = {
  posts: "++id, title, link, published"
};

export const createNewsFeedDb = () => {
  const db = new Dexie("GDNewsFeedDB", { autoOpen: false });
  db.version(1).stores(schema);
  return db;
};
