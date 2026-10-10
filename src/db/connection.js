import "dotenv/config"
import mongoose from "mongoose";

const connectMongoDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL)
        console.log("MongoDB Connected")
    } catch (error) {
        console.error("mongoDB connection error", error)
        process.exit(1)
    }
}

export default connectMongoDB;


// import "dotenv/config";
// import mongoose from "mongoose";


// const connectMongoDB = async () => {
//     try {
//         await mongoose.connect(process.env.MONOGODB_URL)
//         console.log("MongoDB connected")
//     } catch (error) {
//         console.error("MongoDB Connnection error", error)
//         process.exit(1)
//     }
// }

// export default connectMongoDB;