import mongoose from "mongoose";
require("dotenv").config();

const dbURL:string = process.env.MONGODB || ""

const connectDB = async () => {
    try {
        await mongoose.connect(dbURL).then((data: any) => {
            console.log(`Mongodb connected with ${dbURL}`);
        })
    } catch (error: any) {
        console.log(error.message);
        setTimeout(connectDB, 5000);
    }
}

export default connectDB;