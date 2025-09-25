import express from "express";
import "dotenv/config"
import cors from "cors";
import http from "http";
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import { Server } from "socket.io";

// create express app and http server
const app = express();
const server = http.createServer(app)

const rawAllowed = process.env.ALLOWED_ORIGINS || "";
const allowedOrigins = rawAllowed
  .split(",")
  .map((s) => s.trim().replace(/^['"]|['"]$/g, ""))
  .filter(Boolean);

//socket io setup
export const io = new Server(server, {
    cors: {
    origin: allowedOrigins.length ? allowedOrigins : "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
})

export const userSocketMap = {};

io.on("connection", (socket)=> {
    const userId = socket.handshake.query.userId;
    console.log("User connected", userId);

    if(userId) userSocketMap[userId] = socket.id;

    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", ()=>{
        console.log("User Disconnected", userId);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    })
    
})

// middleware setup

app.use(express.json({limit: "4mb"}))
// configure express CORS using allowedOrigins
if (allowedOrigins.length) {
  app.use(cors({ origin: allowedOrigins, credentials: true }));
  console.log("CORS allowed origins:", allowedOrigins);
} else {
  // WARNING: allows all origins — OK for quick testing, restrict in production
  app.use(cors());
  console.log("CORS: allowing all origins");
}

app.use("/api/status", (req,res)=> res.send("Server is live..."));
app.get("/", (req, res) => res.redirect("/api/status"));

app.use("/api/auth", userRouter)
app.use("/api/messages", messageRouter)

//connect to mongodb
await connectDB();

const PORT = process.env.PORT || 5000

server.listen(PORT, ()=> console.log("server is running on port: "+ PORT));
console.log("/api/status available");
