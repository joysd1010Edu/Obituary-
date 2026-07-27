const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: 'backend/.env' });
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/obituary');
const db = mongoose.connection;
db.once('open', async () => {
  const memorials = await db.collection('memorials').find({}).limit(5).toArray();
  console.log(JSON.stringify(memorials, null, 2));
  process.exit(0);
});
