import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Content from './src/modules/content/content.model.js';

dotenv.config();

const updateVibeCoding = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to DB");
    
    const content = await Content.findOneAndUpdate(
      { title: "Vibe coding" },
      { 
        $set: { 
          "publishedLinks.youtube": "https://youtube.com/watch?v=123",
          "publishedLinks.instagram": "https://instagram.com/p/123"
        } 
      },
      { new: true }
    );
    
    console.log("Updated:", content?.title, content?.publishedLinks);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
};

updateVibeCoding();
