import mongoose from 'mongoose';
import dns from 'dns';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGODB_URI;
console.log("URI:", uri);

async function testWithoutDns() {
  console.log("Testing WITHOUT dns.setServers...");
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000, family: 4 });
    console.log("✅ Success WITHOUT dns.setServers (family 4)");
    await mongoose.disconnect();
  } catch (err) {
    console.error("❌ Failed WITHOUT dns.setServers (family 4):", err.message);
  }
}

async function testDefault() {
  console.log("Testing completely default...");
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log("✅ Success completely default");
    await mongoose.disconnect();
  } catch (err) {
    console.error("❌ Failed completely default:", err.message);
  }
}

async function run() {
  await testWithoutDns();
  await testDefault();
  process.exit(0);
}
run();
