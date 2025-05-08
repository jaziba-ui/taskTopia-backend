import Task from "../models/Task.js";
import mongoose from "mongoose";
const { ObjectId } = mongoose.Types;

export const getAssignedTasks = async (req, res) => {
  try {
    const userId = new ObjectId(req.user.id); // ✅ convert to ObjectId
    console.log("User ID from token:", userId);
    const filters = {
      assignedTo: userId,
      createdBy: { $ne: userId },
    };

    const queryFilters = {};

    if (req.query.status) queryFilters.status = req.query.status;
    if (req.query.priority) queryFilters.priority = req.query.priority;
    if (req.query.search) {
      queryFilters.title = { $regex: req.query.search, $options: "i" };
    }

    const tasks = await Task.find({ ...filters, ...queryFilters }).populate("createdBy assignedTo");
    console.log("Query Filters:", { ...filters, ...queryFilters });
    console.log("assigned To",tasks);

    res.json({ tasks });
  } catch (error) {
    console.error("Error fetching assigned tasks:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
