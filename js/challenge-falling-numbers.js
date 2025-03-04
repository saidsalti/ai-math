// Falling Numbers Challenge - Stop falling numbers by selecting the correct multiplication result

const FallingNumbersChallenge = {
  score: 0,
  level: 1,
  lives: 3,
  gameActive: false,
  fallingNumbers: [],
  cannonOptions: [],
  currentEquations: [],
  spawnRate: 3000, // ms between spawns
  spawnTimer: 0,
  maxFallingNumbers: 5,
  cannonSelected: null,
  speed: 1,
  levelProgress: 0,
  levelTarget: 5, // Numbers to clear before level increase
  spawnInterval: null,
  
  // Initialize the challenge
  initialize: function() {
    // Create UI for this challenge
    const ui = createChallengeUI(`
      <div class="falling-area" id="falling-area">
        <!-- Falling numbers will appear here -->
      </div>
      <div class="cannon-options" id="cannon-options">
        <!-- Cannon options will be generated here -->
      </div>
      <div class="lives-display">
        <span id="heart1">❤️</span>
        <span id="heart2">❤️</span>
        <span id="heart3">❤️</span>
      </div>
      <div class="level-display">
        المستوى: <span id="level-number">1</span>
      </div>
    `);
    
    // Get DOM elements
    this.fallingArea = ui.get('falling-area');
    this.cannonOptionsEl = ui.get('cannon-options');
    this.hearts = [ui.get('heart1'), ui.get('heart2'), ui.get('heart3')];
    this.levelNumberEl = ui.get('level-number');
    
    // Reset game state
    this.score = 0;
    this.level = 1;
    this.lives = 3;
    this.gameActive = true;
    this.fallingNumbers = [];
    this.cannonOptions = [];
    this.currentEquations = [];
    this.spawnRate = 3000;
    this.spawnTimer = 0;
    this.maxFallingNumbers = 5;
    this.cannonSelected = null;
    this.speed = 1;
    this.levelProgress = 0;
    this.levelTarget = 5;
    
    // Update UI
    document.getElementById('current-score').textContent = '0';
    this.levelNumberEl.textContent = '1';
    this.updateLivesDisplay();
    
    // Hide timer (not used in this challenge)
    document.getElementById('challenge-timer').classList.add('hidden');
    
    // Update progress
    updateProgress(0, this.levelTarget);
    
    // Generate initial cannon options
    this.generateCannonOptions();
    
    // Start spawning numbers
    this.startSpawning();
    
    // Set up the p5.js canvas for animations
    this.setupCanvas();
  },
  
  // Set up the p5.js canvas
  setupCanvas: function() {
    if (window.fallingNumbersSketch) {
      window.fallingNumbersSketch.remove();
    }
    
    window.fallingNumbersSketch = new p5((sketch) => {
      sketch.setup = () => {
        const canvas = sketch.createCanvas(challengeSystem.canvasWidth, challengeSystem.canvasHeight);
        canvas.parent('sketch-container');
      };
      
      sketch.draw = () => {
        if (!this.gameActive || challengeSystem.paused) return;
        
        sketch.background(240, 248, 255);
        
        // Draw falling numbers
        this.fallingNumbers.forEach(number => {
          this.drawFallingNumber(sketch, number);
          
          // Move the number down
          if (!challengeSystem.paused) {
            number.y += number.speed;
          }
          
          // Check if the number reached the bottom
          if (number.y > sketch.height - 30) {
            this.numberReachedBottom(number);
          }
        });
        
        // Draw cannon
        sketch.fill(100, 149, 237);
        sketch.noStroke();
        sketch.rect(sketch.width/2 - 25, sketch.height - 50, 50, 30, 5);
        
        // Draw selected cannon number
        if (this.cannonSelected !== null) {
          sketch.fill(255);
          sketch.textSize(20);
          sketch.textAlign(sketch.CENTER, sketch.CENTER);
          sketch.text(this.cannonSelected, sketch.width/2, sketch.height - 35);
          
          // Draw aiming line
          sketch.stroke(100, 149, 237, 100);
          sketch.strokeWeight(2);
          sketch.line(sketch.width/2, sketch.height - 50, sketch.mouseX, sketch.mouseY);
        }
        
        // Mouse click to shoot
        sketch.mousePressed = () => {
          if (this.cannonSelected !== null && this.gameActive && !challengeSystem.paused) {
            this.shootCannon(sketch.mouseX, sketch.mouseY);
          }
        };
      };
    });
  },
  
  // Start spawning falling numbers
  startSpawning: function() {
    // Clear any existing interval
    if (this.spawnInterval) {
      clearInterval(this.spawnInterval);
    }
    
    // Spawn first number immediately
    this.spawnFallingNumber();
    
    // Set interval for spawning numbers
    this.spawnInterval = setInterval(() => {
      if (challengeSystem.paused || !this.gameActive) return;
      
      // Only spawn if we haven't reached max
      if (this.fallingNumbers.length < this.maxFallingNumbers) {
        this.spawnFallingNumber();
      }
    }, this.spawnRate);
  },
  
  // Spawn a new falling number
  spawnFallingNumber: function() {
    if (!this.gameActive) return;
    
    const p5Inst = window.fallingNumbersSketch;
    if (!p5Inst) return;
    
    // Generate a multiplication problem based on level
    const maxNum = 2 + this.level;
    const num1 = Math.floor(Math.random() * maxNum) + 1;
    const num2 = Math.floor(Math.random() * maxNum) + 1;
    const result = num1 * num2;
    
    // Position randomly along x-axis
    const x = p5Inst.random(50, p5Inst.width - 50);
    
    // Create falling number object
    const fallingNumber = {
      x: x,
      y: -50, // Start above the canvas
      equation: `${num1}×${num2}`,
      result: result,
      speed: p5Inst.random(0.5, 1.5) * this.speed,
      color: [p5Inst.random(100, 255), p5Inst.random(100, 255), p5Inst.random(100, 255)],
      radius: 35,
      hit: false,
      hitAnimation: 0
    };
    
    this.fallingNumbers.push(fallingNumber);
    
    // Add this result to cannon options if not already present
    if (!this.cannonOptions.includes(result) && this.cannonOptions.length < 4) {
      this.cannonOptions.push(result);
      this.updateCannonOptionsUI();
    }
  },
  
  // Draw a falling number
  drawFallingNumber: function(sketch, number) {
    if (number.hit) {
      // Draw hit animation
      number.hitAnimation += 5;
      const alpha = Math.max(0, 255 - number.hitAnimation * 5);
      sketch.fill(46, 204, 113, alpha);
      sketch.noStroke();
      sketch.circle(number.x, number.y, number.radius * 2 + number.hitAnimation);
      
      if (number.hitAnimation > 50) {
        // Remove from array after animation completes
        const index = this.fallingNumbers.indexOf(number);
        if (index !== -1) {
          this.fallingNumbers.splice(index, 1);
        }
      }
    } else {
      // Draw normal falling number
      sketch.fill(number.color[0], number.color[1], number.color[2]);
      sketch.stroke(255);
      sketch.strokeWeight(2);
      sketch.circle(number.x, number.y, number.radius * 2);
      
      // Draw the equation text
      sketch.fill(255);
      sketch.noStroke();
      sketch.textSize(14);
      sketch.textAlign(sketch.CENTER, sketch.CENTER);
      sketch.text(number.equation, number.x, number.y);
    }
  },
  
  // Generate cannon options (answer choices)
  generateCannonOptions: function() {
    this.cannonOptions = [];
    
    // Add unique results from falling numbers
    this.fallingNumbers.forEach(number => {
      if (!this.cannonOptions.includes(number.result) && this.cannonOptions.length < 3) {
        this.cannonOptions.push(number.result);
      }
    });
    
    // Add random options if needed
    while (this.cannonOptions.length < 4) {
      const maxNum = 2 + this.level;
      const num1 = Math.floor(Math.random() * maxNum) + 1;
      const num2 = Math.floor(Math.random() * maxNum) + 1;
      const result = num1 * num2;
      
      if (!this.cannonOptions.includes(result)) {
        this.cannonOptions.push(result);
      }
    }
    
    // Shuffle the options
    for (let i = this.cannonOptions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cannonOptions[i], this.cannonOptions[j]] = [this.cannonOptions[j], this.cannonOptions[i]];
    }
    
    // Update the UI
    this.updateCannonOptionsUI();
  },
  
  // Update the cannon options UI
  updateCannonOptionsUI: function() {
    this.cannonOptionsEl.innerHTML = '';
    
    this.cannonOptions.forEach(option => {
      const button = document.createElement('button');
      button.className = 'cannon-option';
      button.textContent = option;
      button.addEventListener('click', () => this.selectCannonOption(option));
      this.cannonOptionsEl.appendChild(button);
    });
  },
  
  // Select a cannon option (answer)
  selectCannonOption: function(option) {
    if (!this.gameActive || challengeSystem.paused) return;
    
    this.cannonSelected = option;
    
    // Update UI to show selected option
    const buttons = this.cannonOptionsEl.querySelectorAll('.cannon-option');
    buttons.forEach(button => {
      if (parseInt(button.textContent) === option) {
        button.classList.add('selected');
      } else {
        button.classList.remove('selected');
      }
    });
  },
  
  // Shoot cannon at a specific target
  shootCannon: function(targetX, targetY) {
    let hit = false;
    let hitNumber = null;
    
    // Check collision with falling numbers
    for (let i = 0; i < this.fallingNumbers.length; i++) {
      const number = this.fallingNumbers[i];
      if (number.hit) continue;
      
      const distance = Math.sqrt(
        Math.pow(targetX - number.x, 2) + 
        Math.pow(targetY - number.y, 2)
      );
      
      if (distance < number.radius) {
        // Hit!
        if (number.result === this.cannonSelected) {
          // Correct answer!
          hit = true;
          hitNumber = number;
          number.hit = true;
          break;
        } else {
          // Wrong answer - penalty
          this.loseLife();
          // Reset cannon selection
          this.cannonSelected = null;
          const buttons = this.cannonOptionsEl.querySelectorAll('.cannon-option');
          buttons.forEach(button => button.classList.remove('selected'));
          return;
        }
      }
    }
    
    if (hit && hitNumber) {
      // Success!
      this.score += 10 * this.level;
      document.getElementById('current-score').textContent = this.score;
      
      // Increase level progress
      this.levelProgress++;
      updateProgress(this.levelProgress, this.levelTarget);
      
      // Check for level up
      if (this.levelProgress >= this.levelTarget) {
        this.levelUp();
      }
      
      // Reset cannon after successful hit
      this.cannonSelected = null;
      const buttons = this.cannonOptionsEl.querySelectorAll('.cannon-option');
      buttons.forEach(button => button.classList.remove('selected'));
      
      // Generate new cannon options periodically
      if (Math.random() < 0.3) {
        this.generateCannonOptions();
      }
    }
  },
  
  // Handle when a number reaches the bottom
  numberReachedBottom: function(number) {
    // Remove the number
    const index = this.fallingNumbers.indexOf(number);
    if (index !== -1) {
      this.fallingNumbers.splice(index, 1);
    }
    
    // Penalty for missing
    this.loseLife();
  },
  
  // Lose a life
  loseLife: function() {
    if (this.lives > 0) {
      this.lives--;
      this.updateLivesDisplay();
      
      if (this.lives <= 0) {
        this.endGame();
      }
    }
  },
  
  // Update lives display
  updateLivesDisplay: function() {
    for (let i = 0; i < this.hearts.length; i++) {
      if (i < this.lives) {
        this.hearts[i].textContent = "❤️";
        this.hearts[i].classList.remove('lost');
      } else {
        this.hearts[i].textContent = "💔";
        this.hearts[i].classList.add('lost');
      }
    }
  },
  
  // Level up!
  levelUp: function() {
    this.level++;
    this.levelNumberEl.textContent = this.level;
    this.levelProgress = 0;
    updateProgress(0, this.levelTarget);
    
    // Increase difficulty
    this.speed *= 1.2;
    this.spawnRate = Math.max(1500, this.spawnRate - 300);
    this.maxFallingNumbers = Math.min(8, this.maxFallingNumbers + 1);
    
    // Update spawn interval
    clearInterval(this.spawnInterval);
    this.startSpawning();
    
    // If reaching level 5 or 10, add an extra life
    if (this.level === 5 || this.level === 10) {
      this.lives = Math.min(3, this.lives + 1);
      this.updateLivesDisplay();
    }
  },
  
  // End the game
  endGame: function() {
    this.gameActive = false;
    clearInterval(this.spawnInterval);
    
    // Calculate stars based on level and score
    let stars = 0;
    if (this.level >= 5) stars++;
    if (this.level >= 8) stars++;
    if (this.score >= 500) stars++;
    
    // Show results
    endChallenge({
      score: this.score,
      time: 0, // Time isn't tracked in this challenge
      correct: this.levelProgress + (this.level - 1) * this.levelTarget, // Total numbers shot
      total: this.levelProgress + (this.level - 1) * this.levelTarget + (3 - this.lives), // Total + misses
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
    clearInterval(this.spawnInterval);
    this.gameActive = false;
    
    if (window.fallingNumbersSketch) {
      window.fallingNumbersSketch.remove();
    }
  }
};