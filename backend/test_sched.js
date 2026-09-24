import mongoose from "mongoose";
import env from "./src/config/env.js";
import dns from "dns";
import * as scheduleService from "./src/modules/schedules/schedule.service.js";

const test = async () => {
  dns.setServers(["1.1.1.1", "8.8.8.8"]);
  await mongoose.connect(env.MONGODB_URI);
  try {
    const res = await scheduleService.getSchedules({
      month: 9,
      year: 2026,
      limit: 200,
    });
    console.log("Success:", res);
  } catch (err) {
    console.error("Error:", err);
  }
  process.exit(0);
};

test();
