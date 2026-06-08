import mongoose from "mongoose";
import {DB_NAME} from "../constants.js"


//mongodb connection
const connectDB = async () => {

    try {
       const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`DB connected DB HOST : ${connectionInstance.connection.host}`);
    } catch (error) {
        console.error("mongodb connection Failed" , error);
        process.exit(1)
        
    }
    
}
export default connectDB
