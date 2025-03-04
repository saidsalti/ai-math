// Target Number Challenge - Use multiplication to reach the target number

const TargetNumberChallenge = {
  score: 0,
  level: 1,
  attempts: 3,
  targetNumber: 0,
  availableNumbers: [],
  selectedNumbers: [],
  currentCalculation: "",
  gameActive: false,
  puzzlesCompleted: 0,
  totalPuzzles: 10,
  timeLimit: 180, // 3 minutes
  remainingTime: 180,
  timerInterval: null,
  
  // Initialize the challenge
  initialize: function() {
    // Create UI for this challenge
    const ui = createChallengeUI(`
      <div class="target-display">
        <p>وصول للعدد المستهدف:</p>
        <div class="target-number" id="target-display">24</div>
      </div>
      
      <div class="available-numbers" id="available-numbers">
        <!-- Numbers will be generated here -->
      </div>
      
      <div class="calculation-display" id="calculation-display">
        <!-- Current calculation will be shown here -->
      </div>
      
      <div class="operation-btns">
        <button class="operation-btn" id="multiply-btn">×</button>
        <button class="operation-btn" id="clear-btn">C</button>
        <button class="operation-btn" id="submit-btn">✓</button>
      </div>
      
      <div class="attempts-display">
        محاولات متبقية: <span id="attempts-count">3</span>
      </div>
    `);
    
    // Get DOM elements
    this.targetDisplay = ui.get('target-display');
    this.availableNumbersEl = ui.get('available-numbers');
    this.calculationDisplay = ui.get('calculation-display');
    this.attemptsCount = ui.get('attempts-count');
    
    // Get operation buttons
    this.multiplyBtn = ui.get('multiply-btn');
    this.clearBtn = ui.get('clear-btn');
    this.submitBtn = ui.get('submit-btn');
    
    // Add event listeners
    this.multiplyBtn.addEventListener('click', () => this.addOperator('×'));
    this.clearBtn.addEventListener('click', () => this.clearCalculation());
    this.submitBtn.addEventListener('click', () => this.checkAnswer());
    
    // Show timer
    document.getElementById('challenge-timer').classList.remove('hidden');
    
    // Reset game state
    this.score = 0;
    this.level = 1;
    this.attempts = 3;
    this.targetNumber = 0;
    this.availableNumbers = [];
    this.selectedNumbers = [];
    this.currentCalculation = "";
    this.gameActive = true;
    this.puzzlesCompleted = 0;
    this.totalPuzzles = 10;
    this.remainingTime = 180;
    
    // Update UI
    document.getElementById('current-score').textContent = '0';
    document.getElementById('timer-display').textContent = '03:00';
    this.attemptsCount.textContent = '3';
    
    // Update progress
    updateProgress(this.puzzlesCompleted, this.totalPuzzles);
    
    // Generate the first puzzle
    this.generatePuzzle();
    
    // Start the timer
    this.startTimer();
    
    // Set up the p5.js canvas for animations
    this.setupCanvas();
  },
  
  // Set up the p5.js canvas
  setupCanvas: function() {
    if (window.targetNumberSketch) {
      window.targetNumberSketch.remove();
    }
    
    window.targetNumberSketch = new p5((sketch) => {
      sketch.setup = () => {
        const canvas = sketch.createCanvas(challengeSystem.canvasWidth, challengeSystem.canvasHeight);
        canvas.parent('sketch-container');
        sketch.textAlign(sketch.CENTER, sketch.CENTER);
        sketch.noLoop();
      };
      
      sketch.draw = () => {
        sketch.background(250, 250, 250);
        
        // Draw target visual
        sketch.fill(255);
        sketch.strokeWeight(3);
        sketch.stroke(231, 76, 60);
        sketch.circle(sketch.width/2, sketch.height/2, 200);
        
        sketch.fill(231, 76, 60);
        sketch.circle(sketch.width/2, sketch.height/2, 150);
        
        sketch.fill(255);
        sketch.circle(sketch.width/2, sketch.height/2, 100);
        
        sketch.fill(231, 76, 60);
        sketch.circle(sketch.width/2, sketch.height/2, 50);
        
        // Draw the target number
        sketch.textSize(48);
        sketch.fill(255);
        sketch.noStroke();
        sketch.text(this.targetNumber, sketch.width/2, sketch.height/2);
        
        // Draw level indicator
        sketch.textSize(18);
        sketch.fill(52, 152, 219);
        sketch.text(`المستوى: ${this.level}`, sketch.width/2, 30);
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
      if (challengeSystem.paused || !this.gameActive) return;
      
      this.remainingTime--;
      
      // Update the timer display
      const minutes = Math.floor(this.remainingTime / 60);
      const seconds = this.remainingTime % 60;
      timerDisplay.textContent = 
        (minutes < 10 ? '0' : '') + minutes + ':' + 
        (seconds < 10 ? '0' : '') + seconds;
      
      // Check if time is up
      if (this.remainingTime <= 0) {
        this.endGame();
      }
      
      // Last 30 seconds - highlight timer
      if (this.remainingTime <= 30) {
        timerDisplay.classList.add('warning');
      }
    }, 1000);
  },
  
  // Generate a new puzzle
  generatePuzzle: function() {
    // Generate target number based on level
    let maxTarget;
    switch (this.level) {
      case 1: maxTarget = 30; break;
      case 2: maxTarget = 60; break;
      case 3: maxTarget = 100; break;
      default: maxTarget = 150;
    }
    
    this.targetNumber = Math.floor(Math.random() * maxTarget) + 10;
    this.targetDisplay.textContent = this.targetNumber;
    
    // Generate available numbers
    this.availableNumbers = [];
    const numberCount = 5 + Math.min(2, this.level - 1); // More numbers at higher levels
    
    // Ensure the puzzle is solvable by including factors of the target number
    const factors = this.getFactors(this.targetNumber);
    
    // Add at least one pair of factors to make the puzzle solvable
    if (factors.length > 0) {
      const factorPair = factors[Math.floor(Math.random() * factors.length)];
      this.availableNumbers.push(factorPair[0], factorPair[1]);
    } else {
      // If target is prime, make it solvable another way
      this.availableNumbers.push(1, this.targetNumber);
    }
    
    // Add additional random numbers
    while (this.availableNumbers.length < numberCount) {
      const num = Math.floor(Math.random() * 9) + 1;
      this.availableNumbers.push(num);
    }
    
    // Shuffle the available numbers
    for (let i = this.availableNumbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.availableNumbers[i], this.availableNumbers[j]] = [this.availableNumbers[j], this.availableNumbers[i]];
    }
    
    // Reset selected numbers and calculation
    this.selectedNumbers = [];
    this.currentCalculation = "";
    this.calculationDisplay.textContent = "";
    
    // Update UI
    this.updateAvailableNumbersUI();
    
    // Update canvas
    if (window.targetNumberSketch) {
      window.targetNumberSketch.redraw();
    }
  },
  
  // Get all factor pairs of a number
  getFactors: function(num) {
    const factors = [];
    const limit = Math.sqrt(num);
    
    for (let i = 1; i <= limit; i++) {
      if (num % i === 0) {
        factors.push([i, num / i]);
      }
    }
    
    return factors;
  },
  
  // Update the available numbers UI
  updateAvailableNumbersUI: function() {
    this.availableNumbersEl.innerHTML = '';
    
    this.availableNumbers.forEach((number, index) => {
      const tile = document.createElement('div');
      tile.className = 'number-tile';
      tile.textContent = number;
      tile.dataset.index = index;
      tile.addEventListener('click', () => this.selectNumber(index));
      
      // If number is in selectedNumbers array, mark it as used
      if (this.selectedNumbers.includes(index)) {
        tile.classList.add('used');
      }
      
      this.availableNumbersEl.appendChild(tile);
    });
  },
  
  // Select a number to use in calculation
  selectNumber: function(index) {
    if (!this.gameActive || challengeSystem.paused) return;
    if (this.selectedNumbers.includes(index)) return; // Already used
    
    const number = this.availableNumbers[index];
    
    // Add to calculation
    if (this.currentCalculation === "") {
      this.currentCalculation = number.toString();
    } else {
      // If last character is an operator, add the number
      const lastChar = this.currentCalculation[this.currentCalculation.length - 1];
      if (lastChar === '×') {
        this.currentCalculation += number.toString();
      } else {
        // Can't add number without operator
        return;
      }
    }
    
    // Mark as selected
    this.selectedNumbers.push(index);
    
    // Update UI
    this.updateAvailableNumbersUI();
    this.calculationDisplay.textContent = this.currentCalculation;
  },
  
  // Add an operator to the calculation
  addOperator: function(operator) {
    if (!this.gameActive || challengeSystem.paused) return;
    
    // Only add operator if we have a number and not already an operator
    if (this.currentCalculation !== "" && 
        this.currentCalculation[this.currentCalculation.length - 1] !== '×') {
      this.currentCalculation += operator;
      this.calculationDisplay.textContent = this.currentCalculation;
    }
  },
  
  // Clear the current calculation
  clearCalculation: function() {
    if (!this.gameActive || challengeSystem.paused) return;
    
    this.currentCalculation = "";
    this.selectedNumbers = [];
    this.calculationDisplay.textContent = "";
    this.updateAvailableNumbersUI();
  },
  
  // Check if the answer is correct
  checkAnswer: function() {
    if (!this.gameActive || challengeSystem.paused) return;
    if (this.currentCalculation === "") return;
    
    try {
      // Replace × with * for JavaScript evaluation
      const calculation = this.currentCalculation.replace(/×/g, '*');
      const result = eval(calculation);
      
      if (result === this.targetNumber) {
        // Correct!
        this.puzzlesCompleted++;
        this.score += 50 + (this.level * 10);
        document.getElementById('current-score').textContent = this.score;
        
        // Update progress
        updateProgress(this.puzzlesCompleted, this.totalPuzzles);
        
        // Check for level up or game completion
        if (this.puzzlesCompleted % 3 === 0 && this.level < 4) {
          this.level++;
        }
        
        if (this.puzzlesCompleted >= this.totalPuzzles) {
          this.endGame();
          return;
        }
        
        // Generate new puzzle
        this.generatePuzzle();
        
        // Restore attempts
        this.attempts = 3;
        this.attemptsCount.textContent = this.attempts;
      } else {
        // Wrong answer
        this.attempts--;
        this.attemptsCount.textContent = this.attempts;
        
        if (this.attempts <= 0) {
          // Out of attempts, generate new puzzle
          this.generatePuzzle();
          this.attempts = 3;
          this.attemptsCount.textContent = this.attempts;
        } else {
          // Show feedback
          this.calculationDisplay.textContent = `${this.currentCalculation} = ${result} ≠ ${this.targetNumber}`;
          
          // Clear the calculation after a delay
          setTimeout(() => {
            this.clearCalculation();
          }, 2000);
        }
      }
    } catch (e) {
      // Invalid calculation
      this.calculationDisplay.textContent = "خطأ في الحساب";
      
      // Clear the calculation after a delay
      setTimeout(() => {
        this.clearCalculation();
      }, 2000);
    }
  },
  
  // End the game
  endGame: function() {
    if (!this.gameActive) return;
    
    this.gameActive = false;
    clearInterval(this.timerInterval);
    
    // Calculate remaining time bonus
    const timeBonus = Math.floor(this.remainingTime / 10);
    this.score += timeBonus;
    
    // Calculate stars based on puzzles completed
    let stars = 0;
    if (this.puzzlesCompleted >= 5) stars++;
    if (this.puzzlesCompleted >= 8) stars++;
    if (this.puzzlesCompleted >= this.totalPuzzles) stars++;
    
    // Show results
    endChallenge({
      score: this.score,
      time: 180 - this.remainingTime,
      correct: this.puzzlesCompleted,
      total: this.totalPuzzles,
      stars: stars
    });
  },
  
  // Pause the challenge
  pause: function() {
    // Nothing specific needed here
  },
  
  // Resume the challenge
  resume: function() {
    // Nothing specific needed here
  },
  
  // Clean up when leaving the challenge
  cleanup: function() {
    clearInterval(this.timerInterval);
    this.gameActive = false;
    
    if (window.targetNumberSketch) {
      window.targetNumberSketch.remove();
    }
  }
};
