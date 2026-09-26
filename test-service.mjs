import mongoose from 'mongoose';
import * as contentService from './backend/src/modules/content/content.service.js';
import Content from './backend/src/modules/content/content.model.js';

async function test() {
  try {
    await mongoose.connect('mongodb+srv://aryanmewar:aryan1234@cluster0.9llrym8.mongodb.net/content-manager-pro');
    console.log("Connected to MongoDB");
    
    const draft = await Content.findOne({ status: 'DRAFT' }).populate('createdBy');
    if (!draft) {
      console.log("No DRAFT found");
      return;
    }
    
    console.log(`Found DRAFT: ${draft.title} (ID: ${draft._id})`);
    
    // Simulate updating status to ASSIGNED
    try {
      const updated = await contentService.updateContentStatus(
        draft._id,
        "ASSIGNED",
        draft.createdBy._id
      );
      console.log("SUCCESS. New status:", updated.status);
    } catch(err) {
      console.error("FAILED to update status:", err.message);
      if (err.errors) console.error("Validation errors:", err.errors);
    }
    
    mongoose.disconnect();
  } catch(e) {
    console.error("Test error:", e);
    mongoose.disconnect();
  }
}
test();
