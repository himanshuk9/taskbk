const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: String,
  date: String,
  assignedTo: String,
  category: String,
  description: String,
  status: {
    type: String,
    default: "New"
  }
});

module.exports = mongoose.model('Task', taskSchema);
