import { dialog } from 'electron';
import mongoose from 'mongoose';

let cloudConnection; 

export const  connectToCloudDB = async (uri_cloud)=> {
  if (!cloudConnection) { 
    try {
      cloudConnection = await mongoose.createConnection(uri_cloud);
      console.log("Connected to cloud MongoDB");
    } catch (error) {
      console.error("Failed to connect to cloud MongoDB:", error.message);
      throw error;
    }
  }
  return cloudConnection;
}


export const connectDB = async (url) => {
  try {
    await mongoose.connect(url);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error.message);
    dialog.showMessageBox({
      message: `Failed to connect to MongoDB: ${error.message}`,
    })
  }
};

