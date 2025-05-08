import express from 'express'
import authMiddleware from '../middleware/authMiddleware.js'
import authorizeRole from '../middleware/roleMiddleware.js'
import User from '../models/User.js'

const router = express.Router()

router.get("/users", authMiddleware, authorizeRole(['admin']), async(req,res) => {
    try {
        const users = await User.find({}, '-password')

        res.json(users)
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})

router.patch('/users/:id/role', authMiddleware, authorizeRole(['admin']), async(req,res) => {
    const {role} = req.body
    const validRoles = ['admin', 'manager', 'user']
    if(!validRoles.includes(role)){
        return res.status(400).json({ error: "Invalid role" })   
    }

    try {
       const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        { role },
        { new: true, select: "-password" }
       )
       
       if(!updatedUser)
        return res.status(404).json({ error: "User not found" })
    } catch (err) {
        res.status(500).json({ error: err.message }); 
    }
})

export default router