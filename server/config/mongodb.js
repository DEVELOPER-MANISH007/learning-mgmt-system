import mongoose from "mongoose";

//contect to mongodb database

const conntectDB = async () => {
  mongoose.connection.on("connected", () => {
    console.log("Mongodb connected successfully");
  });

  await mongoose.connect(`${process.env.MONGODB_URI}/lms`);
};

export default conntectDB;
