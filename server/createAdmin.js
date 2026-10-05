const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const createOrGetAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');
    
    let admin = await User.findOne({ role: 'admin' });
    
    if (admin) {
      console.log('Admin already exists:');
      console.log(`Email/Phone: ${admin.email || admin.phone}`);
      // Password can't be retrieved since it's hashed. Let's update it to 'Admin@123'
      admin.password = 'Admin@123';
      await admin.save();
      console.log('Password reset to: Admin@123');
    } else {
      admin = await User.create({
        name: 'System Admin',
        email: 'admin@railporter.com',
        phone: '0000000000',
        password: 'Admin@123',
        role: 'admin'
      });
      console.log('New admin created:');
      console.log('Email: admin@railporter.com');
      console.log('Password: Admin@123');
    }
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

createOrGetAdmin();
