// Time Attack Challenge - Answer as many multiplication problems as possible in 60 seconds

const TimeAttackChallenge = {
  timer: 60,            // 60 seconds
  score: 0,             // Current score
  correctAnswers: 0,    // Number of correct answers
  totalQuestions: 0,    // Total questions attempted
  currentProblem: {},   // Current multiplication problem
  timerInterval: null,  // Timer interval
  maxNumber: 10,        // Maximum number to use in multiplication (increases with progress)
  streak: 0,            // Current streak of correct answers
  gameActive: false,    // Is the game currently active
  particles: [],        // Visual particles for feedback
  
  // Initialize the challenge
  initialize: function() {
    // Create UI for this challenge
    const ui = createChallengeUI(`
      <div class="math-problem">
        <span id="num1">5</span> × <span id="num2">7</span> = ?
      </div>
      <div class="answer-options" id="options-container">
        <!-- Will be populated dynamically -->
      </div>
    `);
    
    // Get DOM elements
    this.problemElement = {
      num1: ui.get('num1'),
      num2: ui.get('num2')
    };
    this.optionsContainer = ui.get('options-container');
    
    // Show timer
    document.getElementById('challenge-timer').classList.remove('hidden');
    
    // Reset game state
    this.timer = 60;
    this.score = 0;
    this.correctAnswers = 0;
    this.totalQuestions = 0;
    this.streak = 0;
    this.maxNumber = 10;
    this.particles = [];
    this.gameActive = true;
    
    // Update UI
    document.getElementById('timer-display').textContent = '01:00';
    document.getElementById('current-score').textContent = '0';
    
    // Update progress
    updateProgress(0, 1); // Just a placeholder ratio
    
    // Start the timer
    this.startTimer();
    
    // Generate the first problem
    this.generateProblem();
    
    // Set up the p5.js canvas for animations
    this.setupCanvas();
  },
  
  // Set up the p5.js canvas
  setupCanvas: function() {
    if (window.timeAttackSketch) {
      window.timeAttackSketch.remove();
    }
    
    window.timeAttackSketch = new p5((sketch) => {
      sketch.setup = () => {
        const canvas = sketch.createCanvas(challengeSystem.canvasWidth, challengeSystem.canvasHeight);
        canvas.parent('sketch-container');
        sketch.textAlign(sketch.CENTER, sketch.CENTER);
      };
      
      sketch.draw = () => {
        if (!this.gameActive || challengeSystem.paused) return;
        
        sketch.background(249, 249, 249);
        
        // Draw timer visualization
        const timeProgress = this.timer / 60;
        sketch.noStroke();
        sketch.fill(255, 179, 71, 50);
        sketch.arc(sketch.width/2, sketch.height/2, 200, 200, -sketch.PI/2, -sketch.PI/2 + sketch.TWO_PI * timeProgress);
        
        // Draw streak counter if streak > 1
        if (this.streak > 1) {
          sketch.fill(52, 152, 219);
          sketch.textSize(24);
          sketch.text(`${this.streak} متتالية!`, sketch.width/2, 50);
        }
        
        // Draw particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
          const p = this.particles[i];
          p.update();
          p.display(sketch);
          
          if (p.alpha <= 0) {
            this.particles.splice(i, 1);
          }
        }
      };
    });
  },
  
  // Start the countdown timer
  startTimer: function() {
    // Clear any existing timer
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    
    const timerDisplay = document.getElementById('timer-display');
    
    this.timerInterval = setInterval(() => {
      if (challengeSystem.paused) return;
      
      this.timer--;
      
      // Update the timer display
      const minutes = Math.floor(this.timer / 60);
      const seconds = this.timer % 60;
      timerDisplay.textContent = 
        (minutes < 10 ? '0' : '') + minutes + ':' + 
        (seconds < 10 ? '0' : '') + seconds;
      
      // Update progress bar based on time remaining
      updateProgress(60 - this.timer, 60);
      
      // Check if time is up
      if (this.timer <= 0) {
        this.endGame();
      }
      
      // Last 10 seconds - highlight timer
      if (this.timer <= 10) {
        timerDisplay.classList.add('warning');
      } else {
        timerDisplay.classList.remove('warning');
      }
    }, 1000);
  },
  
  // Generate a new multiplication problem
  generateProblem: function() {
    // Generate two random numbers based on player's progress
    const num1 = Math.floor(Math.random() * this.maxNumber) + 1;
    const num2 = Math.floor(Math.random() * this.maxNumber) + 1;
    
    // Set the current problem
    this.currentProblem = {
      num1: num1,
      num2: num2,
      answer: num1 * num2
    };
    
    // Update the UI
    this.problemElement.num1.textContent = num1;
    this.problemElement.num2.textContent = num2;
    
    // Generate answer options
    this.generateOptions();
    
    // Increment total questions
    this.totalQuestions++;
  },
  
  // Generate answer options for the current problem
  generateOptions: function() {
    // Clear existing options
    this.optionsContainer.innerHTML = '';
    
    // Create array with the correct answer
    const correctAnswer = this.currentProblem.answer;
    const options = [correctAnswer];
    
    // Add 3 more unique incorrect options
    while (options.length < 4) {
      // Generate a random number close to the correct answer
      let incorrectAnswer;
      const useLargeOffset = Math.random() < 0.3;
      
      if (useLargeOffset) {
        // Sometimes use larger offsets for more challenge
        incorrectAnswer = correctAnswer + Math.floor(Math.random() * 10) + 5;
      } else {
        // Usually use small offsets
        incorrectAnswer = correctAnswer + (Math.random() < 0.5 ? 1 : -1) * 
                         (Math.floor(Math.random() * 3) + 1);
      }
      
      // Ensure the number is positive
      incorrectAnswer = Math.max(1, incorrectAnswer);
      
      // Make sure the option is not already in the array
      if (!options.includes(incorrectAnswer)) {
        options.push(incorrectAnswer);
      }
    }
    
    // Shuffle the options
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }
    
    // Create buttons for each option
    options.forEach(option => {
      const button = document.createElement('button');
      button.className = 'answer-btn';
      button.textContent = option;
      button.addEventListener('click', () => this.checkAnswer(option, button));
      this.optionsContainer.appendChild(button);
    });
  },
  
  // Check if the selected answer is correct
  checkAnswer: function(selectedAnswer, button) {
    // Prevent answering if game is paused or not active
    if (!this.gameActive || challengeSystem.paused) return;
    
    // Disable all options
    const allButtons = document.querySelectorAll('.answer-btn');
    allButtons.forEach(btn => btn.disabled = true);
    
    if (selectedAnswer === this.currentProblem.answer) {
      // Correct answer
      button.classList.add('correct');
      
      // Increment score and correct answer count
      this.score += 10 + (this.streak * 2); // Bonus for streaks
      this.correctAnswers++;
      this.streak++;
      
      // Update score display
      document.getElementById('current-score').textContent = this.score;
      
      // Create particles for visual feedback
      this.createSuccessParticles();
      
      // Increase difficulty slightly every 5 correct answers
      if (this.correctAnswers % 5 === 0 && this.maxNumber < 20) {
        this.maxNumber++;
      }
      
      // Generate a new problem after a short delay
      setTimeout(() => {
        if (this.gameActive) this.generateProblem();
      }, 800);
    } else {
      // Incorrect answer
      button.classList.add('incorrect');
      this.streak = 0;
      
      // Highlight the correct answer
      allButtons.forEach(btn => {
        if (parseInt(btn.textContent) === this.currentProblem.answer) {
          btn.classList.add('correct');
        }
      });
      
      // Create error particles
      this.createErrorParticles();
      
      // Generate a new problem after a slightly longer delay
      setTimeout(() => {
        if (this.gameActive) this.generateProblem();
      }, 1200);
    }
  },
  
  // Create success particles
  createSuccessParticles: function() {
    const p5Inst = window.timeAttackSketch;
    if (!p5Inst) return;
    
    for (let i = 0; i < 30; i++) {
      this.particles.push({
        x: p5Inst.width / 2,
        y: p5Inst.height / 2,
        size: p5Inst.random(5, 20),
        speedX: p5Inst.random(-3, 3),
        speedY: p5Inst.random(-5, -1),
        color: [46, 204, 113], // Green
        alpha: 255,
        rotation: p5Inst.random(p5Inst.TWO_PI),
        rotationSpeed: p5Inst.random(-0.1, 0.1),
        
        update: function() {
          this.x += this.speedX;
          this.y += this.speedY;
          this.speedY += 0.1; // Gravity
          this.alpha -= 4;
          this.rotation += this.rotationSpeed;
        },
        
        display: function(sketch) {
          sketch.push();
          sketch.translate(this.x, this.y);
          sketch.rotate(this.rotation);
          sketch.noStroke();
          sketch.fill(this.color[0], this.color[1], this.color[2], this.alpha);
          sketch.rect(0, 0, this.size, this.size);
          sketch.pop();
        }
      });
    }
  },
  
  // Create error particles
  createErrorParticles: function() {
    const p5Inst = window.timeAttackSketch;
    if (!p5Inst) return;
    
    for (let i = 0; i < 20; i++) {
      this.particles.push({
        x: p5Inst.width / 2,
        y: p5Inst.height / 2,
        size: p5Inst.random(3, 15),
        speedX: p5Inst.random(-2, 2),
        speedY: p5Inst.random(-3, 3),
        color: [231, 76, 60], // Red
        alpha: 255,
        
        update: function() {
          this.x += this.speedX;
          this.y += this.speedY;
          this.speedX *= 0.95;
          this.speedY *= 0.95;
          this.alpha -= 5;
        },
        
        display: function(sketch) {
          sketch.noStroke();
          sketch.fill(this.color[0], this.color[1], this.color[2], this.alpha);
          sketch.circle(this.x, this.y, this.size);
        }
      });
    }
  },
  
  // End the game and show results
  endGame: function() {
    if (!this.gameActive) return;
    
    // Stop the game
    this.gameActive = false;
    clearInterval(this.timerInterval);
    
    // Calculate stars based on performance
    let stars = 0;
    if (this.score >= 200) stars = 3;
    else if (this.score >= 120) stars = 2;
    else if (this.score >= 50) stars = 1;
    
    // Show results
    endChallenge({
      score: this.score,
      time: 60, // Full time was used
      correct: this.correctAnswers,
      total: this.totalQuestions,
      stars: stars
    });
    
    // Update streak in player stats
    challengeSystem.playerStats.currentStreak = 
      Math.max(this.streak, challengeSystem.playerStats.currentStreak);
  },
  
  // Pause the challenge
  pause: function() {
    // Nothing specific needed here as the interval check handles pausing
  },
  
  // Resume the challenge
  resume: function() {
    // Nothing specific needed here as the interval check handles resuming
  },
  
  // Clean up when leaving the challenge
  cleanup: function() {
    clearInterval(this.timerInterval);
    this.gameActive = false;
    
    if (window.timeAttackSketch) {
      window.timeAttackSketch.remove();
    }
  }
};
