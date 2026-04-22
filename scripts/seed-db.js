#!/usr/bin/env node

/**
 * Database Seeding Script
 * 
 * Populates MongoDB with sample data for development and testing.
 * Usage: node scripts/seed-db.js
 */

require('dotenv').config({ path: './backend/.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// Import models (adjust path as needed)
const User = require('../backend/src/models/User');
const Code = require('../backend/src/models/Code');
const ScanLog = require('../backend/src/models/ScanLog');
const Token = require('../backend/src/models/Token');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hcdcx';

// Sample data
const sampleUsers = [
  {
    name: 'Admin User',
    email: 'admin@hcdcx.ai',
    password: 'Admin123!',
    role: 'admin',
    otpEnabled: false,
    emailVerified: true,
  },
  {
    name: 'Test User',
    email: 'test@hcdcx.ai',
    password: 'Test123!',
    role: 'user',
    otpEnabled: false,
    emailVerified: true,
  },
];

const sampleCodes = [
  {
    name: 'Company Website',
    type: 'hybrid',
    data: {
      inputType: 'url',
      content: 'https://hcdcx.ai',
      url: 'https://hcdcx.ai',
    },
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/sample-qr.png',
    publicId: 'sample-qr',
    colorDepth: 2,
    isDynamic: false,
    scans: 156,
  },
  {
    name: 'Product XYZ',
    type: 'qr',
    data: {
      inputType: 'url',
      content: 'https://hcdcx.ai/products/xyz',
      url: 'https://hcdcx.ai/products/xyz',
    },
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/sample-qr2.png',
    publicId: 'sample-qr2',
    colorDepth: 1,
    isDynamic: false,
    scans: 89,
  },
  {
    name: 'Dynamic Event Pass',
    type: 'hybrid',
    data: {
      inputType: 'text',
      content: 'EVENT2024-PASS-001',
      text: 'EVENT2024-PASS-001',
    },
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/sample-dynamic.png',
    publicId: 'sample-dynamic',
    colorDepth: 3,
    isDynamic: true,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    scans: 23,
  },
];

const generateScanLogs = (codeId, userId, count) => {
  const logs = [];
  const devices = ['Desktop', 'Mobile', 'Tablet'];
  const browsers = ['Chrome', 'Safari', 'Firefox', 'Edge'];
  const osList = ['Windows', 'macOS', 'iOS', 'Android'];
  const locations = [
    { country: 'United States', city: 'New York', lat: 40.7128, lng: -74.0060 },
    { country: 'United Kingdom', city: 'London', lat: 51.5074, lng: -0.1278 },
    { country: 'Japan', city: 'Tokyo', lat: 35.6895, lng: 139.6917 },
    { country: 'Germany', city: 'Berlin', lat: 52.5200, lng: 13.4050 },
  ];

  for (let i = 0; i < count; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    const timestamp = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
    const riskScore = Math.floor(Math.random() * 40); // 0-39 mostly low risk

    logs.push({
      codeId,
      userId: userId || null,
      status: riskScore >= 70 ? 'blocked' : (riskScore >= 40 ? 'warning' : 'success'),
      riskScore,
      ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      deviceInfo: {
        device: devices[Math.floor(Math.random() * devices.length)],
        browser: browsers[Math.floor(Math.random() * browsers.length)],
        os: osList[Math.floor(Math.random() * osList.length)],
      },
      location: locations[Math.floor(Math.random() * locations.length)],
      timestamp,
    });
  }
  return logs;
};

async function seedDatabase() {
  try {
    console.log('🌱 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data (optional - comment out to preserve)
    console.log('🧹 Clearing existing data...');
    await User.deleteMany({});
    await Code.deleteMany({});
    await ScanLog.deleteMany({});
    await Token.deleteMany({});
    console.log('✅ Data cleared');

    // Create users
    console.log('👤 Creating users...');
    const createdUsers = [];
    for (const userData of sampleUsers) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      const user = await User.create({
        ...userData,
        password: hashedPassword,
      });
      createdUsers.push(user);
      console.log(`  - ${user.email} (${user.role})`);
    }

    const adminUser = createdUsers[0];
    const testUser = createdUsers[1];

    // Create codes
    console.log('📱 Creating codes...');
    const createdCodes = [];
    for (let i = 0; i < sampleCodes.length; i++) {
      const codeData = sampleCodes[i];
      const userId = i === 0 ? adminUser._id : testUser._id;
      const code = await Code.create({
        ...codeData,
        userId,
      });
      createdCodes.push(code);
      console.log(`  - ${code.name} (${code.type})`);
    }

    // Create scan logs
    console.log('📊 Generating scan logs...');
    for (const code of createdCodes) {
      const logCount = code.scans || 50;
      const logs = generateScanLogs(code._id, code.userId, logCount);
      await ScanLog.insertMany(logs);
      console.log(`  - ${logCount} scans for ${code.name}`);
    }

    console.log('✨ Database seeded successfully!');
    console.log('\n📋 Test Credentials:');
    console.log('  Admin: admin@hcdcx.ai / Admin123!');
    console.log('  User:  test@hcdcx.ai / Test123!');

  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedDatabase();
