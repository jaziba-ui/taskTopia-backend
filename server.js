// const express = require('express')
import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()
import taskRoutes from './routes/task.js'
import authRoutes from './routes/auth.js'
import notificationRoutes from './routes/notification.js'
import userRoutes from './routes/user.js'


const app = express()
app.use(cors())
app.use(express.json())

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB connected"))
.catch(err => console.log(err))

app.use("/api/auth", authRoutes)
app.use("/api/tasks", taskRoutes)
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on ${PORT}`))