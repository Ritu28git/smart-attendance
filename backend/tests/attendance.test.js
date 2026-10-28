// tests/attendance.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// Import the Express app
const app = require('../server');
const User = require('../models/User');
const Attendance = require('../models/Attendance');

// Helper to create a temporary image file
function createTempImage() {
  const imgPath = path.join(__dirname, 'temp-image.png');
  // Simple 1x1 pixel PNG (transparent)
  const base64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAusB9Y1b1RAAAAAASUVORK5CYII=';
  fs.writeFileSync(imgPath, Buffer.from(base64, 'base64'));
  return imgPath;
}

describe('Smart Office Attendance Backend End-to-End', () => {
  let adminToken;
  let employeeToken;
  const adminCred = { email: 'admin_test@example.com', password: 'AdminPass123!' };
  const employeeCred = { email: 'emp_test@example.com', password: 'EmployeePass123!' };
  const employeeInfo = {
    name: 'Test Employee',
    employeeId: 'EMP001',
    email: employeeCred.email,
    password: employeeCred.password,
    department: 'Engineering',
    designation: 'Developer',
  };

  beforeAll(async () => {
    // Ensure a clean DB state for test user accounts
    await User.deleteMany({ $or: [{ email: adminCred.email }, { email: employeeCred.email }] });
    await Attendance.deleteMany({});

    // Create admin directly (bypass createAdmin script)
    const hashed = await bcrypt.hash(adminCred.password, 12);
    await User.create({
      name: 'Admin Test',
      employeeId: 'ADM001',
      email: adminCred.email,
      password: hashed,
      role: 'admin',
    });

    // Login admin to obtain token
    const loginRes = await request(app).post('/api/auth/login').send({
      employeeId: 'ADM001',
      password: adminCred.password,
    });
    adminToken = loginRes.body.token;
  }, 20000);

  afterAll(async () => {
    // Clean up test data and close DB connection
    await User.deleteMany({ $or: [{ email: adminCred.email }, { email: employeeCred.email }] });
    await Attendance.deleteMany({});
    await mongoose.connection.close();
    // Remove temp image if exists
    const imgPath = path.join(__dirname, 'temp-image.png');
    if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
  });

  test('Admin can register a new employee', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(employeeInfo);
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.employee.email).toBe(employeeCred.email);
  });

  test('Employee can login and receive token', async () => {
    const res = await request(app).post('/api/auth/login').send({
      employeeId: employeeInfo.employeeId,
      password: employeeCred.password,
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    employeeToken = res.body.token;
  });

  test('Employee can check‑in with location consent', async () => {
    const res = await request(app)
      .post('/api/attendance/check-in')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({ consent: true, latitude: 12.34, longitude: 56.78 });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.attendance.location).toMatchObject({ latitude: 12.34, longitude: 56.78 });
  });

  test('Employee can upload attendance photo and store face hash', async () => {
    const imgPath = createTempImage();
    const res = await request(app)
      .post('/api/attendance/photo')
      .set('Authorization', `Bearer ${employeeToken}`)
      .attach('photo', imgPath);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.faceHash).toBeDefined();
  });

  test('Employee can verify face successfully', async () => {
    const imgPath = createTempImage();
    const res = await request(app)
      .post('/api/attendance/verify-face')
      .set('Authorization', `Bearer ${employeeToken}`)
      .attach('photo', imgPath);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.verified).toBe(true);
  });
});
