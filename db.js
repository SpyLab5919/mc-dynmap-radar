import {JSONFile, Low} from 'lowdb';

const openDb = async (filePath) => {
  const adapter = new JSONFile(filePath);
  const db = new Low(adapter);
  await db.read();
  return db;
};

export default openDb;
