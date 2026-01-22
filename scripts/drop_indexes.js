
const { MongoClient } = require('mongodb');

// Connection URL
const url = process.env.DATABASE_URL || "mongodb://127.0.0.1:27017/wechat2feishu";
const client = new MongoClient(url);

// Database Name
const dbName = 'wechat2feishu';

async function main() {
  // Use connect method to connect to the server
  await client.connect();
  console.log('Connected successfully to server');
  const db = client.db(dbName);
  const collection = db.collection('User');

  console.log("Current Indexes:");
  const indexes = await collection.indexes();
  console.log(indexes);

  try {
      // Drop the problematic indexes
      await collection.dropIndex("User_phoneNumber_key");
      console.log("Dropped index: User_phoneNumber_key");
  } catch (e) {
      console.log("Index User_phoneNumber_key not found or already dropped.");
  }

  try {
      await collection.dropIndex("User_wechatUnionId_key");
      console.log("Dropped index: User_wechatUnionId_key");
  } catch (e) {
      console.log("Index User_wechatUnionId_key not found or already dropped.");
  }
  
  try {
      await collection.dropIndex("User_feishuUserId_key");
      console.log("Dropped index: User_feishuUserId_key (Just in case, we can recreate unique if needed)");
  } catch (e) {
      console.log("Index User_feishuUserId_key not found or already dropped.");
  }

  return 'done.';
}

main()
  .then(console.log)
  .catch(console.error)
  .finally(() => client.close());
