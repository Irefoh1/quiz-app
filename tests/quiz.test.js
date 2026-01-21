const request = require('supertest');
const app = require('../src/app');

describe('Quiz API Endpoints', () => {
  
  describe('GET /health', () => {
    test('should return health status', async () => {
      const response = await request(app).get('/health');
      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe('UP');
    });
  });

  describe('GET /api/quiz/categories', () => {
    test('should return array of categories', async () => {
      const response = await request(app).get('/api/quiz/categories');
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/quiz/questions', () => {
    test('should return array of questions', async () => {
      const response = await request(app).get('/api/quiz/questions');
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    test('should limit questions when limit param provided', async () => {
      const response = await request(app).get('/api/quiz/questions?limit=5');
      expect(response.statusCode).toBe(200);
      expect(response.body.length).toBeLessThanOrEqual(5);
    });

    test('should filter by category', async () => {
      const response = await request(app).get('/api/quiz/questions?category=DevOps');
      expect(response.statusCode).toBe(200);
      response.body.forEach(q => {
        expect(q.category).toBe('DevOps');
      });
    });

    test('should not include correctAnswer in response', async () => {
      const response = await request(app).get('/api/quiz/questions?limit=1');
      expect(response.statusCode).toBe(200);
      expect(response.body[0].correctAnswer).toBeUndefined();
    });
  });

  describe('GET /api/quiz/questions/:id', () => {
    test('should return a single question', async () => {
      const response = await request(app).get('/api/quiz/questions/1');
      expect(response.statusCode).toBe(200);
      expect(response.body.id).toBe(1);
      expect(response.body.correctAnswer).toBeUndefined();
    });

    test('should return 404 for non-existent question', async () => {
      const response = await request(app).get('/api/quiz/questions/9999');
      expect(response.statusCode).toBe(404);
    });
  });

  describe('POST /api/quiz/submit', () => {
    test('should return correct result for right answer', async () => {
      const response = await request(app)
        .post('/api/quiz/submit')
        .send({ questionId: 1, answer: 0 });
      
      expect(response.statusCode).toBe(200);
      expect(response.body.correct).toBe(true);
    });

    test('should return incorrect result for wrong answer', async () => {
      const response = await request(app)
        .post('/api/quiz/submit')
        .send({ questionId: 1, answer: 3 });
      
      expect(response.statusCode).toBe(200);
      expect(response.body.correct).toBe(false);
    });

    test('should return 400 if questionId or answer missing', async () => {
      const response = await request(app)
        .post('/api/quiz/submit')
        .send({ questionId: 1 });
      
      expect(response.statusCode).toBe(400);
    });
  });

  describe('POST /api/quiz/submit-quiz', () => {
    test('should return quiz score', async () => {
      const response = await request(app)
        .post('/api/quiz/submit-quiz')
        .send({
          answers: [
            { questionId: 1, answer: 0 },
            { questionId: 2, answer: 1 }
          ]
        });
      
      expect(response.statusCode).toBe(200);
      expect(response.body.score).toBeDefined();
      expect(response.body.total).toBe(2);
      expect(response.body.percentage).toBeDefined();
      expect(response.body.results).toHaveLength(2);
    });

    test('should return 400 if answers not provided', async () => {
      const response = await request(app)
        .post('/api/quiz/submit-quiz')
        .send({});
      
      expect(response.statusCode).toBe(400);
    });
  });

  describe('GET /api/quiz/stats', () => {
    test('should return quiz statistics', async () => {
      const response = await request(app).get('/api/quiz/stats');
      expect(response.statusCode).toBe(200);
      expect(response.body.totalQuestions).toBeDefined();
      expect(response.body.categories).toBeDefined();
    });
  });

});