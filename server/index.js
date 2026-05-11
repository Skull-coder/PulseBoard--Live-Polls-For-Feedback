import dotenv from "dotenv";
dotenv.config();
import http from "node:http"
import { initSocket } from "./src/sockets/socket.js";
import app from "./app.js";
import connectDB from "./src/common/config/auth.db.js";

async function main(){
    
    const port = process.env.PORT
    const uri = process.env.MONGODB_URI
    
    await connectDB(uri)

    
    const server = http.createServer(app);
    initSocket(server);

    server.listen(port,()=>{
        console.log("Server is started");
    })

}

main().catch(err=>{
    console.log("Failed to start server");
    process.exit(1);
})