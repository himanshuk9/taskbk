const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User"); // Adjust path if needed

// MongoDB connection
mongoose.connect("mongodb://127.0.0.1:27017/taskApp", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Seed function
const seedAdmin = async () => {
  try {
    const existing = await User.findOne({ email: "admin@taskapp.com" });
    if (existing) {
      console.log("✅ Admin already exists.");
      return mongoose.disconnect();
    }

    const hashedPassword = await bcrypt.hash("admin123", 10); // Admin password

    const adminUser = new User({
      name: "Admin",
      email: "admin@taskapp.com",
      password: hashedPassword,
      role: "admin",
    });

    await adminUser.save();
    console.log("🎉 Admin user seeded successfully!");
  } catch (err) {
    console.error("❌ Error seeding admin user:", err);
  } finally {
    mongoose.disconnect();
  }
};

seedAdmin();
