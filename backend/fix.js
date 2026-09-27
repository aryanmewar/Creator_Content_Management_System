import mongoose from "mongoose";
import { getStartOfToday } from "./src/utils/dateUtils.js";

mongoose.connect("mongodb+srv://aryan-app:aryan2005@cluster0.9llrym8.mongodb.net/?appName=Cluster0")
.then(async () => {
  const db = mongoose.connection.db;
  const today = getStartOfToday();
  console.log("Today:", today);
  
  const contents = await db.collection("contents").find({ 
    status: { $in: ["ASSIGNED", "DRAFT"] }
  }).toArray();
  
  let count = 0;
  for (let c of contents) {
    if (c.dueDate && new Date(c.dueDate) >= today && c.isOverdue) {
      await db.collection("contents").updateOne({_id: c._id}, {$set: {isOverdue: false}});
      console.log("Fixed:", c.title);
      count++;
    }
  }
  console.log("Total fixed:", count);
  process.exit(0);
}).catch(console.error);
