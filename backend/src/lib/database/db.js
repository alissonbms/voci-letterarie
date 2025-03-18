import mongoose from "mongoose";

const connectToDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`Database connected successfully at ${conn.connection.host}`);
  } catch (error) {
    console.log("Error while trying to connect to database", error);
    process.exit(1);
  }
};

export default connectToDB;
