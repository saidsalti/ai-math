// Multiplication Game Logic and Animation

// Game variables
let score = 0;
let level = 1;
let currentAnswer = 0;
let maxNumber = 5; // Start with small numbers
let balloons = []; // Array to store balloon objects
let confetti = []; // Array for celebration confetti
let isAnswerCorrect = false;
let showingCelebration = false;
let timeToNextQuestion = 0;

// DOM Elements
let scoreElement;
let levelElement;
let num1Element;
let num2Element;
let optionsContainer;
let nextButton;
let resetButton;

// Colors for balloons
const balloonColors = [
  [255, 99, 71],   // Tomato
  [255, 165, 0],   // Orange
  [255, 215, 0],   // Gold
  [50, 205, 50],   // Lime Green
  [30, 144, 255],  // Dodger Blue
  [147, 112, 219], // Medium Purple
  [255, 105, 180], // Hot Pink
  [0, 191, 255]    // Deep Sky Blue
];

// Setup p5.js canvas
function setup() {
  let canvas = createCanvas(600, 300);
  canvas.parent('sketch-container');
  
  // Get DOM elements
  scoreElement = document.getElementById('score');
  levelElement = document.getElementById('level');
  num1Element = document.getElementById('num1');
  num2Element = document.getElementById('num2');
  optionsContainer = document.getElementById('options-container');
  nextButton = document.getElementById('next-btn');
  resetButton = document.getElementById('reset-btn');
  
  // Add event listeners
  nextButton.addEventListener('click', generateNewQuestion);
  resetButton.addEventListener('click', resetGame);
  
  // Initialize the game
  generateNewQuestion();
  
  // Create some initial balloons
  for (let i = 0; i < 5; i++) {
    createBalloon();
  }
}

// Main draw function
function draw() {
  background(240, 248, 255); // Light blue background
  
  // Update and display balloons
  for (let i = balloons.length - 1; i >= 0; i--) {
    balloons[i].update();
    balloons[i].display();
    
    // Remove balloons that are off-screen
    if (balloons[i].y < -50) {
      balloons.splice(i, 1);
    }
  }
  
  // Update and display confetti when answer is correct
  if (showingCelebration) {
    for (let i = confetti.length - 1; i >= 0; i--) {
      confetti[i].update();
      confetti[i].display();
      
      // Remove confetti that's done
      if (confetti[i].alpha <= 0) {
        confetti.splice(i, 1);
      }
    }
    
    // If all confetti is gone, reset celebration
    if (confetti.length === 0) {
      showingCelebration = false;
    }
    
    // Timer for next question
    if (timeToNextQuestion > 0) {
      timeToNextQuestion--;
      if (timeToNextQuestion === 0) {
        generateNewQuestion();
      }
    }
  }
}

// Generate a new multiplication question
function generateNewQuestion() {
  // Clear any existing celebration state
  showingCelebration = false;
  confetti = [];
  
  // Generate two random numbers based on current level
  let num1 = Math.floor(Math.random() * maxNumber) + 1;
  let num2 = Math.floor(Math.random() * maxNumber) + 1;
  
  // Update the displayed numbers
  num1Element.textContent = num1;
  num2Element.textContent = num2;
  
  // Calculate the correct answer
  currentAnswer = num1 * num2;
  
  // Generate answer options
  generateOptions(currentAnswer);
}

// Generate answer options including the correct one
function generateOptions(correctAnswer) {
  // Clear previous options
  optionsContainer.innerHTML = '';
  
  // Create an array with the correct answer
  let options = [correctAnswer];
  
  // Add 3 more unique incorrect options
  while (options.length < 4) {
    // Generate a random number close to the correct answer
    let incorrectAnswer;
    let offset = Math.floor(Math.random() * 5) + 1;
    
    // 50% chance to add or subtract the offset
    if (Math.random() > 0.5) {
      incorrectAnswer = correctAnswer + offset;
    } else {
      incorrectAnswer = Math.max(1, correctAnswer - offset);
    }
    
    // Make sure the option is not already in the array
    if (!options.includes(incorrectAnswer)) {
      options.push(incorrectAnswer);
    }
  }
  
  // Shuffle the options
  options = shuffleArray(options);
  
  // Create buttons for each option
  options.forEach(option => {
    const button = document.createElement('button');
    button.className = 'option-btn';
    button.textContent = option;
    button.addEventListener('click', () => checkAnswer(option, button));
    optionsContainer.appendChild(button);
  });
}

// Check if the selected answer is correct
function checkAnswer(selectedAnswer, button) {
  // Disable all options after an answer is selected
  const allOptions = document.querySelectorAll('.option-btn');
  allOptions.forEach(option => {
    option.disabled = true;
  });
  
  if (selectedAnswer === currentAnswer) {
    // Correct answer
    button.classList.add('correct');
    score += 10 * level;
    scoreElement.textContent = score;
    
    // Create celebration effects
    showingCelebration = true;
    createConfetti();
    
    // Add new balloons
    for (let i = 0; i < 3; i++) {
      createBalloon();
    }
    
    // If score crosses thresholds, increase level
    if (score >= level * 50) {
      level++;
      maxNumber = Math.min(10, 4 + level); // Increase max number as level increases
      levelElement.textContent = level;
    }
    
    // Set timer to automatically generate next question
    timeToNextQuestion = 120; // About 2 seconds at 60 fps
  } else {
    // Incorrect answer
    button.classList.add('incorrect');
    
    // Highlight the correct answer
    allOptions.forEach(option => {
      if (parseInt(option.textContent) === currentAnswer) {
        option.classList.add('correct');
      }
    });
  }
}

// Reset the game
function resetGame() {
  score = 0;
  level = 1;
  maxNumber = 5;
  scoreElement.textContent = score;
  levelElement.textContent = level;
  
  // Clear balloons and confetti
  balloons = [];
  confetti = [];
  showingCelebration = false;
  
  // Create some initial balloons
  for (let i = 0; i < 5; i++) {
    createBalloon();
  }
  
  // Generate a new question
  generateNewQuestion();
}

// Create a balloon with random properties
function createBalloon() {
  const colorIndex = Math.floor(Math.random() * balloonColors.length);
  const balloon = {
    x: random(width),
    y: height + 50,
    size: random(30, 60),
    speed: random(0.5, 2),
    wobble: 0,
    wobbleSpeed: random(0.01, 0.05),
    color: balloonColors[colorIndex],
    
    update: function() {
      this.y -= this.speed;
      this.wobble += this.wobbleSpeed;
    },
    
    display: function() {
      push();
      translate(this.x + sin(this.wobble) * 2, this.y);
      
      // Draw string
      stroke(200);
      strokeWeight(1);
      line(0, 0, 0, this.size);
      
      // Draw balloon
      noStroke();
      fill(this.color[0], this.color[1], this.color[2], 200);
      ellipse(0, -this.size/2, this.size, this.size * 1.2);
      
      // Draw balloon tie
      fill(this.color[0], this.color[1], this.color[2], 230);
      triangle(-3, 0, 3, 0, 0, 5);
      
      pop();
    }
  };
  
  balloons.push(balloon);
}

// Create confetti explosion
function createConfetti() {
  for (let i = 0; i < 100; i++) {
    const colorIndex = Math.floor(Math.random() * balloonColors.length);
    const particle = {
      x: width / 2,
      y: height / 2,
      size: random(3, 8),
      speedX: random(-3, 3),
      speedY: random(-5, -1),
      color: balloonColors[colorIndex],
      alpha: 255,
      rotation: random(TWO_PI),
      rotationSpeed: random(-0.1, 0.1),
      
      update: function() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.speedY += 0.05; // Gravity
        this.alpha -= 2;
        this.rotation += this.rotationSpeed;
      },
      
      display: function() {
        push();
        translate(this.x, this.y);
        rotate(this.rotation);
        noStroke();
        fill(this.color[0], this.color[1], this.color[2], this.alpha);
        rect(0, 0, this.size, this.size);
        pop();
      }
    };
    
    confetti.push(particle);
  }
}

// Shuffle array (Fisher-Yates algorithm)
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
