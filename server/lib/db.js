import mongoose from "mongoose";

export const connectDB = async () => {
    try { 
        const raw = process.env.MONGODB_URI || "";
        const uri = raw.trim().replace(/^['"]|['"]$/g, "");
        const connectString = uri.includes("/chat-app") ? uri : `${uri}/chat-app`;

        mongoose.connection.on('connected', ()=> console.log('database connected'));
        await mongoose.connect(`${process.env.MONGODB_URI}/chat-app`)
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
}