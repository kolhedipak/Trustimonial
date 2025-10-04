const mongoose = require('mongoose');
const User = require('../models/User');
const Template = require('../models/Template');
const Testimonial = require('../models/Testimonial');
const RequestLink = require('../models/RequestLink');
const Space = require('../models/Space');
const Widget = require('../models/Widget');
require('dotenv').config();

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/trustimonials');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Template.deleteMany({});
    await Testimonial.deleteMany({});
    await RequestLink.deleteMany({});
    await Space.deleteMany({});
    await Widget.deleteMany({});
    console.log('Cleared existing data');

    // Create users
    const adminUser = new User({
      name: 'Alice Admin',
      email: 'admin@trustimonials.com',
      passwordHash: 'Passw0rd!', // Will be hashed by pre-save middleware
      role: 'Admin'
    });

    const regularUser = new User({
      name: 'User One',
      email: 'user1@trustimonials.com',
      passwordHash: 'Passw0rd!', // Will be hashed by pre-save middleware
      role: 'User'
    });

    await adminUser.save();
    await regularUser.save();
    console.log('Created users');

    // Create templates
    const simpleTemplate = new Template({
      name: 'Simple',
      formConfig: {
        fields: ['authorName', 'content', 'rating'],
        required: ['authorName', 'content'],
        optional: ['rating', 'authorEmail']
      },
      emailSubject: 'Thank you for your testimonial!',
      emailBody: 'Thank you for taking the time to share your feedback. We appreciate your testimonial!',
      createdBy: adminUser._id,
      isPublic: true
    });

    const detailedTemplate = new Template({
      name: 'Detailed',
      formConfig: {
        fields: ['authorName', 'authorEmail', 'content', 'rating', 'images'],
        required: ['authorName', 'content'],
        optional: ['authorEmail', 'rating', 'images']
      },
      emailSubject: 'Your testimonial has been received',
      emailBody: 'Thank you for your detailed feedback! We will review and publish your testimonial soon.',
      createdBy: regularUser._id,
      isPublic: false
    });

    await simpleTemplate.save();
    await detailedTemplate.save();
    console.log('Created templates');

    // Create testimonials
    const testimonial1 = new Testimonial({
      authorName: 'Jane Doe',
      authorEmail: 'jane@example.com',
      content: 'This product has completely transformed how we handle customer feedback. The interface is intuitive and the results are amazing!',
      rating: 5,
      status: 'approved',
      approvedAt: new Date(),
      createdBy: regularUser._id
    });

    const testimonial2 = new Testimonial({
      authorName: 'John Smith',
      authorEmail: 'john@example.com',
      content: 'Great service and excellent support team. Highly recommended for any business looking to collect testimonials.',
      rating: 4,
      status: 'approved',
      approvedAt: new Date(),
      createdBy: regularUser._id
    });

    const testimonial3 = new Testimonial({
      authorName: 'Sarah Wilson',
      content: 'The testimonial collection process was smooth and easy. Our customers love the simple interface.',
      rating: 5,
      status: 'pending',
      createdBy: regularUser._id
    });

    await testimonial1.save();
    await testimonial2.save();
    await testimonial3.save();
    console.log('Created testimonials');

    // Create request links
    const link1 = new RequestLink({
      owner: regularUser._id,
      slug: 'customer-feedback',
      templateId: simpleTemplate._id,
      maxUses: 100,
      uses: 2
    });

    const link2 = new RequestLink({
      owner: adminUser._id,
      slug: 'product-reviews',
      templateId: detailedTemplate._id,
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      maxUses: 50,
      uses: 0
    });

    await link1.save();
    await link2.save();
    console.log('Created request links');

    // Create spaces
    const space1 = new Space({
      ownerId: regularUser._id,
      name: 'Customer Feedback',
      description: 'Collect testimonials from our satisfied customers',
      templateId: simpleTemplate._id,
      maxUses: 100
    });

    const space2 = new Space({
      ownerId: adminUser._id,
      name: 'Product Reviews',
      description: 'Gather detailed product reviews and ratings',
      templateId: detailedTemplate._id,
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      maxUses: 50
    });

    const space3 = new Space({
      ownerId: regularUser._id,
      name: 'Team Testimonials',
      description: 'Internal team feedback and testimonials'
    });

    await space1.save();
    await space2.save();
    await space3.save();
    console.log('Created spaces');

    // Create sample widgets
    const wallWidget = new Widget({
      spaceId: space1._id,
      name: 'Customer Wall of Love',
      type: 'wall',
      designTemplate: 'grid-cards',
      settings: {
        theme: 'light',
        itemsToShow: 12,
        sortOrder: 'newest',
        showAuthor: true,
        showRating: true,
        isPublic: true,
        filter: {
          minRating: 4,
          hasMedia: false
        },
        spacingAndGutter: {
          gapPx: 16,
          cardRadiusPx: 8
        },
        cta: {
          text: 'Leave a testimonial',
          url: 'https://example.com/testimonials',
          style: 'button'
        }
      },
      createdBy: regularUser._id
    });

    const singleWidget = new Widget({
      spaceId: space1._id,
      name: 'Featured Testimonial',
      type: 'single',
      designTemplate: 'card-compact',
      settings: {
        theme: 'light',
        selectTestimonial: 'auto-latest',
        showAuthorDetails: true,
        showDate: false,
        isPublic: true,
        cta: {
          text: 'Share your experience',
          url: 'https://example.com/testimonials',
          style: 'button'
        }
      },
      createdBy: regularUser._id
    });

    await wallWidget.save();
    await singleWidget.save();
    console.log('Created sample widgets');

    console.log('Seed data created successfully!');
    console.log('\nTest accounts:');
    console.log('Admin: admin@trustimonials.com / Passw0rd!');
    console.log('User: user1@trustimonials.com / Passw0rd!');
    console.log('\nTest links:');
    console.log(`http://localhost:3000/t/customer-feedback`);
    console.log(`http://localhost:3000/t/product-reviews`);

  } catch (error) {
    console.error('Seed error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

seedData();
