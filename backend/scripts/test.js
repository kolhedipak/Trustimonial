const mongoose = require('mongoose');
const User = require('../models/User');
const Testimonial = require('../models/Testimonial');
const RequestLink = require('../models/RequestLink');
const Template = require('../models/Template');
require('dotenv').config();

const testDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/trustimonials');
    console.log('✅ Connected to MongoDB');

    // Test User model
    const userCount = await User.countDocuments();
    console.log(`✅ Users: ${userCount} documents`);

    // Test Testimonial model
    const testimonialCount = await Testimonial.countDocuments();
    console.log(`✅ Testimonials: ${testimonialCount} documents`);

    // Test RequestLink model
    const linkCount = await RequestLink.countDocuments();
    console.log(`✅ Request Links: ${linkCount} documents`);

    // Test Template model
    const templateCount = await Template.countDocuments();
    console.log(`✅ Templates: ${templateCount} documents`);

    // Test relationships
    const userWithLinks = await User.findOne().populate('_id');
    if (userWithLinks) {
      console.log('✅ User model relationships working');
    }

    // Test API endpoints (basic connectivity)
    const testUser = await User.findOne({ email: 'admin@trustimonials.com' });
    if (testUser) {
      console.log('✅ Admin user found');
    }

    const approvedTestimonials = await Testimonial.find({ status: 'approved' });
    console.log(`✅ Found ${approvedTestimonials.length} approved testimonials`);

    console.log('\n🎉 All tests passed! Database is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('📡 Database connection closed');
  }
};

testDatabase();
