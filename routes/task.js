import express from "express";
import Task from "../models/Task.js";
import authMiddleware from "../middleware/authMiddleware.js";
import Notification from '../models/Notification.js'
import { getAssignedTasks } from "../controller/taskController.js";

const router = express.Router();

const authorizeRole = (roles) => {
  return (req,res,next) => {
    console.log("User Role:", req.user.role)
    if(!roles.includes(req.user.role)){
      return res.status(403).send("Access denied")
    }
    next()
  }
}

const buildFilters = (reqQuery) => {
  const filter = {};

  if (reqQuery.search) {
    filter.$or = [
      { title: { $regex: reqQuery.search, $options: "i" } },
      { description: { $regex: reqQuery.search, $options: "i" } },
    ];
  }

  if (reqQuery.status) {
    filter.status = { $regex: `^${reqQuery.status}$`, $options: "i" };
  }

  if (reqQuery.priority) {
    filter.priority = { $regex: `^${reqQuery.priority}$`, $options: "i" };
  }

  // console.log("🔍 Final Filter Applied:", JSON.stringify(filter, null, 2));
  return filter;
};

// Create Task
router.post("/", authMiddleware, authorizeRole(['admin' , 'manager']),
  async (req, res) => {
  const { title, description, dueDate, priority, assignedTo } = req.body;

  console.log("Request Body:", req.body);

  // Validation
  if (!title || !dueDate || !priority) {
    return res
      .status(400)
      .json({ error: "Title, Due Date, and Priority are required" });
  }

  const parsedDate = new Date(dueDate);
  if (isNaN(parsedDate)) {
    return res.status(400).json({ error: "Invalid dueDate format" });
  }

  try {
    // Create the task with assignedTo (if present)
    const task = await Task.create({
      title,
      description,
      dueDate: parsedDate,
      priority,
      createdBy: req.user.id,
      ...(assignedTo && { assignedTo }), // only add if exists
    });
    

    // Send a notification if the task was assigned
    if (assignedTo) {
      await Notification.create({
        user: assignedTo,
        message: `A new task "${task.title}" was assigned to you!`,
      });
    }

    const io = req.app.get("io"); // make sure to expose io globally
    console.log(`Emitting notification to ${assignedTo}`);

  io.to(assignedTo).emit("new-notification", {
    message: `A new task "${title}" has been assigned to you.`,
  });

    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get Created Tasks
router.get("/created-tasks",authMiddleware, authorizeRole(['admin' , 'manager']),
   async (req, res) => {
  try {
    const baseFilter = { createdBy: req.user.id };
    const queryFilters = buildFilters(req.query);
    const finalFilter = { ...baseFilter, ...queryFilters };

    const createdTasks = await Task.find(finalFilter).populate("createdBy assignedTo");

    // console.log("Created Task:", createdTasks);

    res.json({ tasks: createdTasks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/assigned-tasks", authMiddleware, getAssignedTasks);

// router.get('/overdue-tasks', authMiddleware, async (req, res) => {
//   try {
//     const now = new Date();

//     const overdueTasks = await Task.find({
//       dueDate: { $lt: now },
//       status: { $ne: 'completed' } // optional condition
//     });

//     res.status(200).json(overdueTasks);
//   } catch (error) {
//     res.status(500).json({ message: 'Error fetching overdue tasks' });
//   }
// });


// Update Task
router.put("/:id", authMiddleware, authorizeRole(['admin' , 'manager']),
  async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!task) return res.status(404).json({ error: "Task not found" });

    if (task.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized action" });
    }

    res.json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete Task
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });

    if (
      task.createdBy.toString() !== req.user.id &&
      task.assignedTo?.toString() !== req.user.id
    ) {
      return res.status(403).json({ error: "Unauthorized action" });
    }

    await task.deleteOne(); 

    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


router.patch("/:id/assign", authMiddleware, authorizeRole(['admin' , 'manager']),
  async (req, res) => {
  try {
    const { assignedTo } = req.body;

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { assignedTo },
      { new: true }
    ).populate("assignedTo", "name email");
    if (!task) return res.status(404).json({ error: "Task not found!" });
    console.log("Assigned To (ID):", assignedTo, typeof assignedTo);

    // Notification for newly created task
if (assignedTo) {
  await Notification.create({
    user: assignedTo,
    message: `A new task "${task.title}" was assigned to you!`,
  });

  const io = req.app.get("io");
  console.log(`Emitting notification to ${assignedTo}`);

  io.to(assignedTo).emit("new-notification", {
    message: `A new task "${title}" has been assigned to you.`,
  });
}


console.log("Assigned to:", assignedTo);
    console.log('Notification sent:', task, user);  


    res.json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error while assigning task" });
  }
});

export default router;
