import express from "express"
import Task from "../models/Task.js"
import authMiddleware from '../middleware/authMiddleware.js'

const router = express.Router()

// Create Task
// Create Task
// Create Task
router.post("/", authMiddleware, async (req, res) => {
    const { title, description, dueDate, priority } = req.body;
  
    // Validation
    if (!title || !dueDate || !priority) {
      return res.status(400).json({ error: "Title, Due Date, and Priority are required" });
    }
  
    // Validate the date format
    const parsedDate = new Date(dueDate);
    if (isNaN(parsedDate)) {
      return res.status(400).json({ error: "Invalid dueDate format" });
    }
  
    try {
      const task = await Task.create({ 
        ...req.body, 
        createdBy: req.user.id 
      });
      res.status(201).json(task);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  
  

// Get Tasks (created by or assigned to user)
router.get("/", authMiddleware, async(req,res) => {
    try {
        const created = await Task.find({ createdBy: req.user.id })
        const assigned = await Task.find({ assignedTo: req.user.id })
        const overdue = await Task.find({ assignedTo: req.user.id, dueDate: { $lt: new Date() }, status: { $ne: "Completed" }})
        
        res.json({ created, assigned, overdue })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// Update Task
router.put("/:id", authMiddleware, async(req,res) => {
    try {
        const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true })

        res.json(task)
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
})

// Delete Task
router.delete("/:id", authMiddleware, async(req,res) => {
    try {
        await Task.findByIdAndDelete(req.params.id)

        res.json({ message: "Task deleted" })
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
})

export default router