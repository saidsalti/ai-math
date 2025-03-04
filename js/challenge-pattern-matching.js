// Pattern Matching Challenge - Identify multiplication patterns and fill in the blanks

const PatternMatchingChallenge = {
  score: 0,
  level: 1,
  currentPattern: null,
  missingCells: [],
  selectedAnswer: null,
  gameActive: false,
  patternsCompleted: 0,
  totalPatterns: 12,
  timeLimit: 240, // 4 minutes
  remainingTime: 240,
  timerInterval: null,
  
  // Initialize the challenge
  initialize: function() {
    // Create UI for this challenge
    const ui = createChallengeUI(`
      <div class="pattern-container">
        <div class="pattern-grid" id="pattern-grid">
          <!-- Pattern cells will be generated here -->
        </div>
        
        <div class="pattern-options" id="pattern-options">
          <!-- Answer options will be generated here -->
        </div>
        
        <div class="pattern-info">
          <p>اكتشف النمط وأكمل القيم المفقودة</p>
          <p>المستوى: <span id="pattern-level">1</span></p>
        </div>
      </div>
    `);
    
    // Get DOM elements
    this.patternGrid = ui.get('pattern-grid');
    this.patternOptions = ui.get('pattern-options');
    this.patternLevelDisplay = ui.get('pattern-level');
    
    // Show timer
    document.getElementById('challenge-timer').classList.remove('hidden');
    
    // Reset game state
    this.score = 0;
    this.level = 1;
    this.currentPattern = null;
    this.missingCells = [];
    this.selectedAnswer = null;
    this.gameActive = true;
    this.patternsCompleted = 0;
    this.totalPatterns = 12;
    this.remainingTime = 240;
    
    // Update UI
    document.getElementById('current-score').textContent = '0';
    document.getElementById('timer-display').textContent = '04:00';
    this.patternLevelDisplay.textContent = '1';
    
    // Update progress
    updateProgress(0, this.totalPatterns);
    
    // Generate first pattern
    this.generatePattern();
    
    // Start timer
    this.startTimer();
  },
  
  // Generate a new pattern based on current level
  generatePattern: function() {
    const gridSize = 3 + Math.min(2, Math.floor(this.level / 2)); // Grid grows with level
    const patternArray = [];
    
    // Generate pattern based on level
    switch(this.level) {
      case 1: // Simple multiplication by 2
        for(let i = 0; i < gridSize * gridSize; i++) {
          patternArray.push((i + 1) * 2);
        }
        break;
        
      case 2: // Multiplication by 3
        for(let i = 0; i < gridSize * gridSize; i++) {
          patternArray.push((i + 1) * 3);
        }
        break;
        
      case 3: // Square numbers
        for(let i = 0; i < gridSize * gridSize; i++) {
          patternArray.push((i + 1) * (i + 1));
        }
        break;
        
      default: // Complex patterns
        const base = 1 + Math.floor(this.level / 2);
        for(let i = 0; i < gridSize * gridSize; i++) {
          patternArray.push((i + base) * base);
        }
    }
    
    this.currentPattern = {
      size: gridSize,
      values: patternArray,
      rule: `ضرب ${this.level <= 2 ? this.level + 1 : 'النمط'}`
    };
    
    // Select cells to hide (more with higher levels)
    const numMissing = 2 + Math.min(3, Math.floor(this.level / 2));
    this.missingCells = [];
    while(this.missingCells.length < numMissing) {
      const randomIndex = Math.floor(Math.random() * patternArray.length);
      if(!this.missingCells.includes(randomIndex)) {
        this.missingCells.push(randomIndex);
      }
    }
    
    // Create answer options
    this.createAnswerOptions();
    
    // Draw the pattern grid
    this.drawPatternGrid();
  },
  
  // Create answer options for missing cells
  createAnswerOptions: function() {
    this.patternOptions.innerHTML = '';
    
    // Get correct answers
    const correctAnswers = this.missingCells.map(index => 
      this.currentPattern.values[index]);
    
    // Add wrong options
    const allOptions = [...correctAnswers];
    while(allOptions.length < 6) {
      const wrongAnswer = correctAnswers[0] + 
        Math.floor(Math.random() * 5) * (Math.random() < 0.5 ? 1 : -1);
      if(!allOptions.includes(wrongAnswer) && wrongAnswer > 0) {
        allOptions.push(wrongAnswer);
      }
    }
    
    // Shuffle options
    for(let i = allOptions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allOptions[i], allOptions[j]] = [allOptions[j], allOptions[i]];
    }
    
    // Create option buttons
    allOptions.forEach(value => {
      const option = document.createElement('button');
      option.className = 'pattern-option';
      option.textContent = value;
      option.addEventListener('click', () => this.selectAnswer(value));
      this.patternOptions.appendChild(option);
    });
  },
  
  // Draw the pattern grid
  drawPatternGrid: function() {
    this.patternGrid.innerHTML = '';
    this.patternGrid.style.gridTemplateColumns = 
      `repeat(${this.currentPattern.size}, 1fr)`;
    
    this.currentPattern.values.forEach((value, index) => {
      const cell = document.createElement('div');
      cell.className = 'pattern-cell';
      
      if(this.missingCells.includes(index)) {
        cell.classList.add('missing');
        cell.dataset.index = index;
      } else {
        cell.textContent = value;
      }
      
      this.patternGrid.appendChild(cell);
    });
  },
  
  // Handle answer selection
  selectAnswer: function(value) {
    if(!this.gameActive || challengeSystem.paused) return;
    
    const missingCells = document.querySelectorAll('.pattern-cell.missing');
    const currentCell = Array.from(missingCells)
      .find(cell => !cell.textContent);
    
    if(currentCell) {
      currentCell.textContent = value;
      this.checkPatternCompletion();
    }
  },
  
  // Check if pattern is completed correctly
  checkPatternCompletion: function() {
    const missingCells = document.querySelectorAll('.pattern-cell.missing');
    const allFilled = Array.from(missingCells)
      .every(cell => cell.textContent);
    
    if(allFilled) {
      let allCorrect = true;
      
      missingCells.forEach(cell => {
        const index = parseInt(cell.dataset.index);
        const value = parseInt(cell.textContent);
        const correctValue = this.currentPattern.values[index];
        
        if(value === correctValue) {
          cell.classList.add('correct');
        } else {
          cell.classList.add('incorrect');
          allCorrect = false;
        }
      });
      
      if(allCorrect) {
        // Success!
        this.score += 50 + (this.level * 10);
        document.getElementById('current-score').textContent = this.score;
        this.patternsCompleted++;
        
        // Update progress
        updateProgress(this.patternsCompleted, this.totalPatterns);
        
        // Level up every 3 patterns
        if(this.patternsCompleted % 3 === 0) {
          this.level++;
          this.patternLevelDisplay.textContent = this.level;
        }
        
        // Check for game completion
        if(this.patternsCompleted >= this.totalPatterns) {
          this.endGame();
        } else {
          // Generate new pattern after delay
          setTimeout(() => {
            if(this.gameActive) this.generatePattern();
          }, 1000);
        }
      } else {
        // Wrong answer - generate new pattern after delay
        setTimeout(() => {
          if(this.gameActive) this.generatePattern();
        }, 1500);
      }
    }
  },
  
  // Start the timer
  startTimer: function() {
    if(this.timerInterval) clearInterval(this.timerInterval);
    
    const timerDisplay = document.getElementById('timer-display');
    
    this.timerInterval = setInterval(() => {
      if(challengeSystem.paused || !this.gameActive) return;
      
      this.remainingTime--;
      
      // Update timer display
      const minutes = Math.floor(this.remainingTime / 60);
      const seconds = this.remainingTime % 60;
      timerDisplay.textContent = 
        (minutes < 10 ? '0' : '') + minutes + ':' + 
        (seconds < 10 ? '0' : '') + seconds;
      
      // Check for time up
      if(this.remainingTime <= 0) {
        this.endGame();
      }
    }, 1000);
  },
  
  // End the game
  endGame: function() {
    if(!this.gameActive) return;
    
    this.gameActive = false;
    clearInterval(this.timerInterval);
    
    // Calculate stars based on patterns completed and time
    let stars = 0;
    if(this.patternsCompleted >= 6) stars++;
    if(this.patternsCompleted >= 9) stars++;
    if(this.patternsCompleted === this.totalPatterns) stars++;
    
    // Show results
    endChallenge({
      score: this.score,
      time: 240 - this.remainingTime,
      correct: this.patternsCompleted,
      total: this.totalPatterns,
      stars: stars
    });
  },
  
  // Pause and resume functions
  pause: function() {
    // Timer handling is done in the interval check
  },
  
  resume: function() {
    // Timer handling is done in the interval check
  },
  
  // Clean up
  cleanup: function() {
    clearInterval(this.timerInterval);
    this.gameActive = false;
  }
};