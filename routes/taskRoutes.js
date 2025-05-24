const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const User = require('../models/User');
const verifyToken = require('../middleware/verifyToken');

const STATUS = {
  NEW: "New",
  ACTIVE: "Active",
  COMPLETED: "Completed",
  FAILED: "Failed"
};

// ✅ Create Task
router.post('/create', async (req, res) => {
  try {
    const task = new Task(req.body);
    await task.save();
    res.status(200).json({ message: "Task created successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error creating task", error: err.message });
  }
});

// ✅ Admin Dashboard - Employee Task Summary
router.get('/summary', async (req, res) => {
  try {
    const users = await User.find({ role: 'employee' });
    const tasks = await Task.find();

    const taskMap = {};
    tasks.forEach(task => {
      const assignedTo = task.assignedTo?.toLowerCase(); // normalize
      if (!taskMap[assignedTo]) {
        taskMap[assignedTo] = [];
      }
      taskMap[assignedTo].push(task);
    });

    const summary = users.map(user => {
      const userName = user.name.toLowerCase(); // normalize
      const userTasks = taskMap[userName] || [];
      return {
        name: user.name,
        new: userTasks.filter(t => t.status === STATUS.NEW).length,
        active: userTasks.filter(t => t.status === STATUS.ACTIVE).length,
        completed: userTasks.filter(t => t.status === STATUS.COMPLETED).length,
        failed: userTasks.filter(t => t.status === STATUS.FAILED).length
      };
    });

    res.status(200).json(summary);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch summary", error: err.message });
  }
});

// ✅ Get Tasks for Logged-in Employee
router.get('/my-tasks', verifyToken, async (req, res) => {
  try {
     

    const tasks = await Task.find({
      assignedTo: new RegExp(`^${req.user.name}$`, 'i') // case-insensitive match
    });
    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch tasks", error: err.message });
  }
});

// ✅ Update Task Status (by Employee)
router.put('/update-status/:taskId', verifyToken, async (req, res) => {
  const { status } = req.body;
  try {
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.taskId,
      { status },
      { new: true }
    );
    res.status(200).json(updatedTask);
  } catch (err) {
    res.status(500).json({ message: "Failed to update status", error: err.message });
  }
});

module.exports = router;
