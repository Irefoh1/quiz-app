const express = require('express');
const router = express.Router();
const questions = require('../data/questions.json');

// Get all categories
router.get('/categories', (req, res) => {
  const categories = [...new Set(questions.map(q => q.category))];
  res.json(categories);
});

// Get questions (optionally filtered by category)
router.get('/questions', (req, res) => {
  const { category, limit } = req.query;
  
  let filteredQuestions = [...questions];
  
  if (category) {
    filteredQuestions = filteredQuestions.filter(
      q => q.category.toLowerCase() === category.toLowerCase()
    );
  }
  
  // Shuffle questions
  filteredQuestions = filteredQuestions.sort(() => Math.random() - 0.5);
  
  // Apply limit
  if (limit) {
    filteredQuestions = filteredQuestions.slice(0, parseInt(limit));
  }
  
  // Remove correct answer from response
  const questionsWithoutAnswers = filteredQuestions.map(q => ({
    id: q.id,
    question: q.question,
    options: q.options,
    category: q.category
  }));
  
  res.json(questionsWithoutAnswers);
});

// Get a single question by ID
router.get('/questions/:id', (req, res) => {
  const question = questions.find(q => q.id === parseInt(req.params.id));
  
  if (!question) {
    return res.status(404).json({ error: 'Question not found' });
  }
  
  const { correctAnswer, ...questionWithoutAnswer } = question;
  res.json(questionWithoutAnswer);
});

// Submit answer and get result
router.post('/submit', (req, res) => {
  const { questionId, answer } = req.body;
  
  if (!questionId || answer === undefined) {
    return res.status(400).json({ error: 'questionId and answer are required' });
  }
  
  const question = questions.find(q => q.id === parseInt(questionId));
  
  if (!question) {
    return res.status(404).json({ error: 'Question not found' });
  }
  
  const isCorrect = question.correctAnswer === answer;
  
  res.json({
    correct: isCorrect,
    correctAnswer: question.correctAnswer,
    explanation: question.explanation || null
  });
});

// Submit entire quiz and get score
router.post('/submit-quiz', (req, res) => {
  const { answers } = req.body;
  
  if (!answers || !Array.isArray(answers)) {
    return res.status(400).json({ error: 'answers array is required' });
  }
  
  let score = 0;
  const results = [];
  
  answers.forEach(({ questionId, answer }) => {
    const question = questions.find(q => q.id === parseInt(questionId));
    
    if (question) {
      const isCorrect = question.correctAnswer === answer;
      if (isCorrect) score++;
      
      results.push({
        questionId,
        correct: isCorrect,
        correctAnswer: question.correctAnswer,
        yourAnswer: answer
      });
    }
  });
  
  res.json({
    score,
    total: answers.length,
    percentage: Math.round((score / answers.length) * 100),
    results
  });
});

// Get quiz statistics
router.get('/stats', (req, res) => {
  const categories = {};
  
  questions.forEach(q => {
    if (!categories[q.category]) {
      categories[q.category] = 0;
    }
    categories[q.category]++;
  });
  
  res.json({
    totalQuestions: questions.length,
    categories
  });
});

module.exports = router;