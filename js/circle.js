// Unit Circle and Trigonometric Functions Demonstration

let radius;
let angleText;
let sinText;
let cosText;

function setup() {
  let canvas = createCanvas(600, 400);
  canvas.parent('sketch-container');
  angleText = document.getElementById('angle-value');
  sinText = document.getElementById('sin-value');
  cosText = document.getElementById('cos-value');
  
  radius = min(width, height) * 0.35;
  
  // Set text alignment for p5 canvas
  textAlign(CENTER, CENTER);
  
  // Initial background
  background(255);
}

function draw() {
  background(255);
  translate(width/2, height/2); // Move origin to center
  
  // Draw the coordinate system
  strokeWeight(1);
  stroke(200);
  line(-width/2, 0, width/2, 0); // x-axis
  line(0, -height/2, 0, height/2); // y-axis
  
  // Draw text labels for axes
  fill(0);
  text("x", width/2 - 20, 20);
  text("y", 20, -height/2 + 20);
  
  // Draw the unit circle
  noFill();
  stroke(150);
  ellipse(0, 0, radius * 2, radius * 2);
  
  // Find angle based on mouse position
  let angle = atan2(mouseY - height/2, mouseX - width/2);
  
  // Calculate point on unit circle
  let x = cos(angle) * radius;
  let y = sin(angle) * radius;
  
  // Draw line from origin to point
  stroke(100, 100, 255);
  strokeWeight(2);
  line(0, 0, x, y);
  
  // Draw point on circle
  fill(255, 0, 0);
  stroke(255, 0, 0);
  ellipse(x, y, 8, 8);
  
  // Draw the sin line
  stroke(0, 255, 0);
  strokeWeight(2);
  line(x, y, x, 0);
  
  // Draw the cos line
  stroke(255, 0, 255);
  strokeWeight(2);
  line(x, y, 0, y);
  
  // Update labels
  let angleDegrees = degrees(angle).toFixed(1);
  if (angleDegrees < 0) angleDegrees = (360 + parseFloat(angleDegrees)).toFixed(1);
  
  angleText.textContent = 'الزاوية: ' + angleDegrees + ' درجة';
  sinText.textContent = 'الجيب (sin): ' + sin(angle).toFixed(3);
  cosText.textContent = 'جيب التمام (cos): ' + cos(angle).toFixed(3);
  
  // Add labels for sin and cos
  fill(0, 255, 0);
  noStroke();
  text("sin", x + 10, y/2);
  
  fill(255, 0, 255);
  noStroke();
  text("cos", x/2, y + 15);
}
