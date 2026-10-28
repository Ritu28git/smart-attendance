// Automated login test using in-memory MongoDB
// Run with: node tests/loginTest.js

const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const http = require('http');

(async () => {
  // Start in-memory MongoDB
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
  console.log('🗄️ Connected to in-memory MongoDB');

  // Load User model
  const User = require('../models/User');

  // Create test admin user
  const testPassword = 'TestPass123!';
  const hashed = await bcrypt.hash(testPassword, 12);
  await User.create({
    name: 'Test Admin',
    employeeId: 'TEST001',
    email: 'testadmin@example.com',
    password: hashed,
    role: 'admin',
  });
  console.log('👤 Test admin user created');

  // Import the Express app (server.js exports the app)
  const app = require('../server');

  // Start the app on a random available port
  const server = http.createServer(app);
  server.listen(0, async () => {
    const { port } = server.address();
    console.log(`🚀 Test server listening on http://localhost:${port}`);

    try {
      const response = await fetch(`http://localhost:${port}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: 'TEST001', password: testPassword }),
      });
      const data = await response.json();
      console.log('🔎 Login response status:', response.status);
      console.log('🔎 Login response body:', JSON.stringify(data, null, 2));
    } catch (err) {
      console.error('❗ Error during login request:', err);
    } finally {
      // Clean up
      server.close(async () => {
        await mongoose.disconnect();
        await mongod.stop();
        console.log('🧹 Cleaned up test resources');
        process.exit(0);
      });
    }
  });
})();
