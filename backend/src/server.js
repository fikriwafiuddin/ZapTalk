import express from "express"
import "dotenv/config"
import cookieParser from "cookie-parser"
import cors from "cors"
import connectDB from "./utils/connectDB.js"
import route from "./router.js"
import http from "http"
import path from "path"
import { fileURLToPath } from "url"
import { initializeSocket } from "./utils/socketManager.js"

const app = express()
const port = process.env.PORT || 5000
const server = http.createServer(app)

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Initialize Socket.IO
initializeSocket(server)

app.use("/images", express.static(path.join(__dirname, "../images")))
app.use(express.json())
app.use(cookieParser())
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: "GET,PUT,PATCH,POST,DELETE",
    credentials: true,
  })
)
connectDB()
app.use(route)

server.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})
