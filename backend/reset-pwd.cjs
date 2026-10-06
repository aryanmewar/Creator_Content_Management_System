const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dns = require('dns');
dns.setServers(['8.8.8.8']);
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI, { family: 4, serverSelectionTimeoutMS: 5000 })
  .then(async () => {
    const db = mongoose.connection.db;
    const hash = await bcrypt.hash('Admin@1234', 12);
    await db.collection('users').updateOne({ email: 'aryansharma@ricr.in' }, { $set: { passwordHash: hash } });
    console.log('Admin password successfully reset to Admin@1234');
    process.exit(0);
  })
  .catch(e => {
    console.error(e.message);
    process.exit(1);
  });
