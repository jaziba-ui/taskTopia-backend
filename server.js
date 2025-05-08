import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()
import { createServer } from 'http'
import { Server as SocketIoServer } from 'socket.io'
import taskRoutes from './routes/task.js'
import authRoutes from './routes/auth.js'
import notificationRoutes from './routes/notification.js'
import userRoutes from './routes/user.js'
import adminRoutes from './routes/admin.js'

const app = express();

app.use(cors())
app.use(express.json())

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB connected"))
.catch(err => console.log(err))

const connectedUsers = {}

const server = createServer(app)
const io = new SocketIoServer(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
})

io.on('connection', (socket) => {
    console.log("User connected with socket ID:", socket.id);
    

    socket.on("register", (userId) => {
        console.log("Registered users: ", userId)
        connectedUsers[userId] = socket.id
        socket.join(userId)
    })

    socket.on('disconnect', () => {
        for (const [userId, id] of Object.entries(connectedUsers)) {
            if (id === socket.id) {
              delete connectedUsers[userId];
              break;
            }
          }
        console.log('User disconnected')
    })
})

app.use("/api/auth", authRoutes)
app.use("/api/tasks", taskRoutes)
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes)
app.use("/admin", adminRoutes)
app.set('io', io)

const PORT = process.env.PORT || 5000
server.listen(PORT, () => console.log(`Server running on ${PORT}`));