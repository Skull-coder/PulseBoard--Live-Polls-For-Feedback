import mongoose from "mongoose";


const connectDB = async (uri) => {

    try {
        const conn = await mongoose.connect(uri);
        console.log(`MongoDB connected: ${conn.connection.host}`)
        
    } catch (error) {
        throw new Error("MongoDb not connected")
    }
}

export default connectDB