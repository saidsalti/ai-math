// Parabola Demonstration

let aSlider, bSlider, cSlider;
let aDisplay, bDisplay, cDisplay, equationDisplay;
let xScale = 20;  // Pixels per unit on x-axis
let yScale = 20;  // Pixels per unit on y-axis

function setup() {
  let canvas = createCanvas(600, 400);
  canvas.parent('sketch-container');
  
  // Get DOM elements
  aSlider = document.getElementById('a-value');
  bSlider = document.getElementById('b-value');
  cSlider = document.getElementById('c-value');
  
  aDisplay = document.getElementById('a-display');
  bDisplay = document.getElementById('b-display');
  cDisplay = document.getElementById('c-display');
  equationDisplay = document.getElementById('equation');
  
  // Add event listeners
  aSlider.addEventListener('input', updateEquation);
  bSlider.addEventListener('input', updateEquation);
  cSlider.addEventListener('input', updateEquation);
  
  updateEquation(); // Initialize display
  
  // Set up text properties
  textAlign(CENTER, CENTER);
}

function draw() {
  background(255);
  
  // Get slider values
  let a = parseFloat(aSlider.value);
  let b = parseFloat(bSlider.value);
  let c = parseFloat(cSlider.value);
  
  // Draw coordinate system
  translate(width/2, height/2);  // Move origin to center
  drawCoordinateSystem();
  
  // Draw parabola
  stroke(0, 100, 255);
  strokeWeight(2);
  noFill();
  
  beginShape();
  for (let x = -width/2; x < width/2; x++) {
    let xVal = x / xScale;
    let yVal = a * xVal * xVal + b * xVal + c;
    let y = -yVal * yScale;  // Negate because y-axis is inverted in canvas
    
    // Only include points within canvas
    if (y > -height/2 && y < height/2) {
      vertex(x, y);
    }
  }
  endShape();
}

function updateEquation() {
  let a = parseFloat(aSlider.value);
  let b = parseFloat(bSlider.value);
  let c = parseFloat(cSlider.value);
  
  aDisplay.textContent = a;
  bDisplay.textContent = b;
  cDisplay.textContent = c;
  
  // Format the equation string
  let equation = 'المعادلة: y = ';
  
  if (a !== 0) {
    if (a === 1) {
      equation += 'x²';
    } else if (a === -1) {
      equation += '-x²';
    } else {
      equation += a + 'x²';
    }
  }
  
  if (b !== 0) {
    if (b > 0 && a !== 0) {
      equation += ' + ';
    }
    
    if (b === 1) {
      equation += 'x';
    } else if (b === -1) {
      equation += '-x';
    } else {
      equation += b + 'x';
    }
  }
  
  if (c !== 0) {
    if (c > 0 && (a !== 0 || b !== 0)) {
      equation += ' + ';
    }
    equation += c;
  }
  
  // If equation is empty, it's y = 0
  if (equation === 'المعادلة: y = ' && a === 0 && b === 0 && c === 0) {
    equation += '0';
  }
  
  equationDisplay.textContent = equation;
}

function drawCoordinateSystem() {
  // Draw axes
  stroke(150);
  strokeWeight(1);
  
  // X-axis
  line(-width/2, 0, width/2, 0);
  // Y-axis
  line(0, -height/2, 0, height/2);
  
  // Draw ticks on x-axis
  for (let x = -floor((width/2) / xScale); x <= floor((width/2) / xScale); x++) {
    if (x !== 0) {  // Skip origin
      let xPos = x * xScale;
      line(xPos, -5, xPos, 5);
      fill(100);}  }}
      
      // Draw tick mark