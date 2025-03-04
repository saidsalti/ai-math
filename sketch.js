// P5.js sketch

// Setup function runs once when the program starts
function setup() {
  // Create canvas and attach it to the sketch-container element
  let canvas = createCanvas(800, 600);
  canvas.parent('sketch-container');
  
  // Set background color
  background(240);
}

// Draw function runs continuously after setup() unless noLoop() is called
function draw() {
  // Your drawing code goes here
  
  // Example: Draw a circle that follows the mouse
  fill(0, 120, 255);
  noStroke();
  ellipse(mouseX, mouseY, 50, 50);
}
