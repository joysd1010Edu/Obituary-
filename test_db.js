const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: 'backend/.env' });
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/obituary');
const db = mongoose.connection;
db.once('open', async () => {
  const count = await db.collection('memorials').countDocuments();
  console.log('Total memorials:', count);
  process.exit(0);
});
