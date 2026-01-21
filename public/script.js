const API_URL = window.location.origin;

let questions = [];
let currentQuestion = 0;
let answers = [];
let quizResults = null;

// DOM Elements
const startScreen = document.getElementById('start-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultScreen = document.getElementById('result-screen');
const categorySelect = document.getElementById('category');
const numQuestionsSelect = document.getElementById('num-questions');
const startBtn = document.getElementById('start-btn');
const nextBtn = document.getElementById('next-btn');
const restartBtn = document.getElementById('restart-btn');
const reviewBtn = document.getElementById('review-btn');

// Initialize app
document.addEventListener('DOMContentLoaded', init);

async function init() {
  console.log('Initializing app...');
  console.log('API URL:', API_URL);
  
  try {
    await loadCategories();
    await loadStats();
    
    startBtn.addEventListener('click', startQuiz);
    nextBtn.addEventListener('click', nextQuestion);
    restartBtn.addEventListener('click', restartQuiz);
    reviewBtn.addEventListener('click', toggleReview);
    
    console.log('App initialized successfully');
  } catch (error) {
    console.error('Error initializing app:', error);
  }
}

async function loadCategories() {
  try {
    console.log('Loading categories...');
    const response = await fetch(`${API_URL}/api/quiz/categories`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const categories = await response.json();
    console.log('Categories loaded:', categories);
    
    categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category;
      option.textContent = category;
      categorySelect.appendChild(option);
    });
  } catch (error) {
    console.error('Error loading categories:', error);
  }
}

async function loadStats() {
  try {
    console.log('Loading stats...');
    const response = await fetch(`${API_URL}/api/quiz/stats`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const stats = await response.json();
    console.log('Stats loaded:', stats);
    
    const statsDiv = document.getElementById('stats');
    statsDiv.innerHTML = `
      <div class="stats-item">
        <span>Total Questions:</span>
        <span>${stats.totalQuestions}</span>
      </div>
      ${Object.entries(stats.categories).map(([cat, count]) => `
        <div class="stats-item">
          <span>${cat}:</span>
          <span>${count} questions</span>
        </div>
      `).join('')}
    `;
  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

async function startQuiz() {
  console.log('Starting quiz...');
  
  const category = categorySelect.value;
  const limit = numQuestionsSelect.value;
  
  console.log('Category:', category || 'All');
  console.log('Limit:', limit);
  
  try {
    let url = `${API_URL}/api/quiz/questions?limit=${limit}`;
    if (category) {
      url += `&category=${encodeURIComponent(category)}`;
    }
    
    console.log('Fetching questions from:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    questions = await response.json();
    console.log('Questions loaded:', questions.length);
    
    if (questions.length === 0) {
      alert('No questions available for this category.');
      return;
    }
    
    currentQuestion = 0;
    answers = [];
    
    showScreen(quizScreen);
    displayQuestion();
  } catch (error) {
    console.error('Error starting quiz:', error);
    alert('Error loading questions: ' + error.message);
  }
}

function displayQuestion() {
  const question = questions[currentQuestion];
  const total = questions.length;
  
  console.log('Displaying question:', currentQuestion + 1, 'of', total);
  
  // Update progress
  const progress = ((currentQuestion) / total) * 100;
  document.getElementById('progress').style.width = `${progress}%`;
  
  // Update question info
  document.getElementById('question-number').textContent = 
    `Question ${currentQuestion + 1}/${total}`;
  document.getElementById('category-badge').textContent = question.category;
  
  // Update question text
  document.getElementById('question-text').textContent = question.question;
  
  // Update options
  const optionsDiv = document.getElementById('options');
  optionsDiv.innerHTML = '';
  
  question.options.forEach((option, index) => {
    const optionDiv = document.createElement('div');
    optionDiv.className = 'option';
    optionDiv.textContent = option;
    optionDiv.addEventListener('click', () => selectOption(index));
    optionsDiv.appendChild(optionDiv);
  });
  
  // Reset next button
  nextBtn.disabled = true;
  nextBtn.textContent = currentQuestion === total - 1 ? 'Finish Quiz' : 'Next Question';
}

async function selectOption(index) {
  console.log('Option selected:', index);
  
  const options = document.querySelectorAll('.option');
  
  // Check if already answered
  if (options[0].classList.contains('disabled')) {
    console.log('Question already answered');
    return;
  }
  
  // Submit answer to get result
  const question = questions[currentQuestion];
  
  try {
    console.log('Submitting answer for question:', question.id);
    
    const response = await fetch(`${API_URL}/api/quiz/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        questionId: question.id,
        answer: index
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('Answer result:', result);
    
    // Store answer
    answers.push({
      questionId: question.id,
      answer: index,
      correct: result.correct,
      correctAnswer: result.correctAnswer,
      explanation: result.explanation
    });
    
    // Show result
    options.forEach((opt, i) => {
      opt.classList.add('disabled');
      if (i === result.correctAnswer) {
        opt.classList.add('correct');
      } else if (i === index && !result.correct) {
        opt.classList.add('incorrect');
      }
    });
    
    nextBtn.disabled = false;
  } catch (error) {
    console.error('Error submitting answer:', error);
    alert('Error submitting answer: ' + error.message);
  }
}

async function nextQuestion() {
  currentQuestion++;
  
  if (currentQuestion >= questions.length) {
    await showResults();
  } else {
    displayQuestion();
  }
}

async function showResults() {
  console.log('Showing results...');
  
  try {
    const response = await fetch(`${API_URL}/api/quiz/submit-quiz`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        answers: answers.map(a => ({
          questionId: a.questionId,
          answer: a.answer
        }))
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    quizResults = await response.json();
    console.log('Quiz results:', quizResults);
    
    // Update result screen
    document.getElementById('score-percentage').textContent = 
      `${quizResults.percentage}%`;
    document.getElementById('score-text').textContent = 
      `You scored ${quizResults.score} out of ${quizResults.total}`;
    
    // Set message based on score
    let message = '';
    if (quizResults.percentage >= 90) {
      message = '🏆 Excellent! You\'re a DevOps expert!';
    } else if (quizResults.percentage >= 70) {
      message = '👏 Great job! Keep learning!';
    } else if (quizResults.percentage >= 50) {
      message = '💪 Good effort! Review the topics you missed.';
    } else {
      message = '📚 Keep studying! Practice makes perfect.';
    }
    document.getElementById('score-message').textContent = message;
    
    // Build review list
    buildReviewList();
    
    showScreen(resultScreen);
  } catch (error) {
    console.error('Error getting results:', error);
    alert('Error getting results: ' + error.message);
  }
}

function buildReviewList() {
  const reviewList = document.getElementById('review-list');
  reviewList.innerHTML = '';
  
  answers.forEach((answer, index) => {
    const question = questions[index];
    const reviewItem = document.createElement('div');
    reviewItem.className = `review-item ${answer.correct ? 'correct' : 'incorrect'}`;
    
    reviewItem.innerHTML = `
      <h4>${index + 1}. ${question.question}</h4>
      <p><strong>Your answer:</strong> ${question.options[answer.answer]}</p>
      ${!answer.correct ? `<p><strong>Correct answer:</strong> ${question.options[answer.correctAnswer]}</p>` : ''}
      ${answer.explanation ? `<div class="explanation">💡 ${answer.explanation}</div>` : ''}
    `;
    
    reviewList.appendChild(reviewItem);
  });
}

function toggleReview() {
  const reviewSection = document.getElementById('review-section');
  reviewSection.classList.toggle('hidden');
  reviewBtn.textContent = reviewSection.classList.contains('hidden') 
    ? 'Review Answers' 
    : 'Hide Review';
}

function restartQuiz() {
  questions = [];
  currentQuestion = 0;
  answers = [];
  quizResults = null;
  
  document.getElementById('review-section').classList.add('hidden');
  reviewBtn.textContent = 'Review Answers';
  
  showScreen(startScreen);
}

function showScreen(screen) {
  console.log('Showing screen:', screen.id);
  [startScreen, quizScreen, resultScreen].forEach(s => {
    s.classList.remove('active');
  });
  screen.classList.add('active');
}