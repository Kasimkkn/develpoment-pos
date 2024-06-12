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
    const fallbackUrl =
      "mongodb+srv://kasimkkn15:kasim123@pos-restaurant.qae3jgl.mongodb.net/pos-restuarant?retryWrites=true&w=majority&appName=pos-restaurant";
    console.log("Trying fallback URL:", fallbackUrl);
    await mongoose.connect(fallbackUrl);
    console.log("Connected to MongoDB using fallback URL");
  }
};

