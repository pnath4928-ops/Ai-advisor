import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../app';

jest.mock('../config/env', () => ({
  __esModule: true,
  default: {
    PORT: '5000',
    MONGODB_URI: 'mongodb://localhost:27017/test',
    JWT_SECRET: 'test_secret',
    JWT_REFRESH_SECRET: 'test_refresh_secret',
    JWT_EXPIRES_IN: '15m',
    JWT_REFRESH_EXPIRES_IN: '7d',
    NODE_ENV: 'test',
  },
}));

let mongoServer: MongoMemoryServer;
let teacherToken: string;
let studentToken: string;
let adminToken: string;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  // Register teacher
  const teacherReg = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Teacher Test',
      email: 'teacher@test.com',
      password: 'password123',
      role: 'teacher',
    });
  teacherToken = teacherReg.body.accessToken;

  // Register student
  const studentReg = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Student Test',
      email: 'student@test.com',
      password: 'password123',
      role: 'student',
    });
  studentToken = studentReg.body.accessToken;

  // Register admin
  const adminReg = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Admin Test',
      email: 'admin@test.com',
      password: 'password123',
      role: 'admin',
    });
  adminToken = adminReg.body.accessToken;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    if (!['users', 'students', 'teachers'].includes(key)) {
      await collections[key].deleteMany({});
    }
  }
});

describe('Auth API', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'New User',
          email: 'new@test.com',
          password: 'password123',
          role: 'student',
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
      expect(res.body.user).toHaveProperty('id');
      expect(res.body.user.email).toBe('new@test.com');
    });

    it('should return 400 for duplicate email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Duplicate',
          email: 'teacher@test.com',
          password: 'password123',
          role: 'student',
        });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'student@test.com',
          password: 'password123',
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body.user.email).toBe('student@test.com');
    });

    it('should return 401 for invalid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'student@test.com',
          password: 'wrongpassword',
        });

      expect(res.status).toBe(401);
    });
  });
});

describe('Teacher API', () => {
  describe('GET /api/teacher/students', () => {
    it('should return assigned students (empty initially)', async () => {
      const res = await request(app)
        .get('/api/teacher/students')
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should return 401 without token', async () => {
      const res = await request(app).get('/api/teacher/students');
      expect(res.status).toBe(401);
    });

    it('should return 403 for student role', async () => {
      const res = await request(app)
        .get('/api/teacher/students')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(403);
    });
  });
});

describe('Student API', () => {
  describe('GET /api/student/profile', () => {
    it('should return student profile', async () => {
      const res = await request(app)
        .get('/api/student/profile')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('studentId');
    });
  });

  describe('POST /api/student/study-plans', () => {
    it('should create a study plan', async () => {
      const res = await request(app)
        .post('/api/student/study-plans')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          weekStartDate: new Date().toISOString(),
          status: 'active',
        });

      expect(res.status).toBe(201);
    });
  });

  describe('POST /api/student/tasks', () => {
    it('should create a task', async () => {
      const planRes = await request(app)
        .post('/api/student/study-plans')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ weekStartDate: new Date().toISOString(), status: 'active' });

      const planId = planRes.body._id;

      const res = await request(app)
        .post('/api/student/tasks')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          studyPlanId: planId,
          day: 'Monday',
          topic: 'Algebra',
          subjectName: 'Mathematics',
          plannedMinutes: 60,
          studyTechnique: 'pomodoro',
        });

      expect(res.status).toBe(201);
    });
  });
});

describe('AI API', () => {
  describe('POST /api/ai/generate', () => {
    it('should generate an AI suggestion', async () => {
      await request(app)
        .post('/api/student/study-plans')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ weekStartDate: new Date().toISOString(), status: 'active' });

      const res = await request(app)
        .post('/api/ai/generate')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ type: 'plan' });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('recommendedAction');
    });

    it('should return 400 for invalid type', async () => {
      const res = await request(app)
        .post('/api/ai/generate')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ type: 'invalid' });

      expect(res.status).toBe(400);
    });
  });
});

describe('Admin API', () => {
  describe('GET /api/admin/stats', () => {
    it('should return system stats', async () => {
      const res = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('totalUsers');
      expect(res.body).toHaveProperty('totalStudents');
    });

    it('should return 403 for non-admin', async () => {
      const res = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/admin/users', () => {
    it('should return paginated users', async () => {
      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('users');
      expect(res.body).toHaveProperty('total');
    });
  });
});
