import mongoose from "mongoose";

mongoose.connect("mongodb+srv://aryan-app:aryan2005@cluster0.9llrym8.mongodb.net/?appName=Cluster0")
.then(async () => {
  const db = mongoose.connection.db;
  const result = await db.collection("contents").updateMany(
    { status: "ASSIGNED" },
    { $set: { isCheckedByContributor: false } }
  );
  console.log(`Reset isCheckedByContributor for ${result.modifiedCount} contents`);
  process.exit(0);
}).catch(console.error);
