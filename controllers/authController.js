const User = require('../models/User');
const Task = require('../models/Task'); // ✅ Make sure you have Task model
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// ✅ Register
exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  const hash = await bcrypt.hash(password, 10);

  const role = (email === 'admin@company.com') ? 'admin' : 'employee';

  try {
    const user = await User.create({ name, email, password: hash, role });
    res.status(201).json({ msg: 'User registered successfully' });
  } catch (err) {
    res.status(400).json({ error: 'User already exists' });
  }
};

// ✅ Login
exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ error: 'Invalid email' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ error: 'Invalid password' });

  const token = jwt.sign(
    { id: user._id, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  res.json({ token, role: user.role, name: user.name });
};

// ✅ Assign Task with Email Notification
exports.assignTask = async (req, res) => {
  const { title, description, dueDate, tag, assignedTo } = req.body;

  try {
    const employee = await User.findById(assignedTo);
    if (!employee) return res.status(404).json({ error: 'Employee not found' });

    const newTask = await Task.create({
      title,
      description,
      dueDate,
      tag,
      assignedTo,
      status: 'New'
    });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Admin" <${process.env.MAIL_USER}>`,
      to: "hdxnews@gmail.com",
      subject: 'New Task Assigned',
      html: `
        <h3>Hello ${employee.name},</h3>
        <p>You have been assigned a new task.</p>
        <strong>Title:</strong> ${title}<br/>
        <strong>Description:</strong> ${description}<br/>
        <strong>Due Date:</strong> ${dueDate}<br/>
        <strong>Tag:</strong> ${tag}<br/><br/>
        <p>Please check your dashboard for more details.</p>
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({ msg: 'Task assigned and email sent successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to assign task or send email' });
  }
};
