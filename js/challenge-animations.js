// Shared animations for the challenge system

const ChallengeAnimations = {
    // Particle system for celebrations
    createParticleSystem: function(sketch, x, y, color) {
        return {
            particles: [],
            
            emit: function(count) {
                for (let i = 0; i < count; i++) {
                    this.particles.push({
                        x: x,
                        y: y,
                        vx: sketch.random(-3, 3),
                        vy: sketch.random(-8, -2),
                        size: sketch.random(4, 12),
                        color: color || [
                            sketch.random(100, 255),
                            sketch.random(100, 255),
                            sketch.random(100, 255)
                        ],
                        alpha: 255,
                        rotation: sketch.random(sketch.TWO_PI)
                    });
                }
            },
            
            update: function() {
                for (let i = this.particles.length - 1; i >= 0; i--) {
                    let p = this.particles[i];
                    p.x += p.vx;
                    p.y += p.vy;
                    p.vy += 0.2; // gravity
                    p.alpha -= 2;
                    p.rotation += 0.1;
                    
                    if (p.alpha <= 0) {
                        this.particles.splice(i, 1);
                    }
                }
            },
            
            draw: function() {
                this.particles.forEach(p => {
                    sketch.push();
                    sketch.translate(p.x, p.y);
                    sketch.rotate(p.rotation);
                    sketch.noStroke();
                    sketch.fill(p.color[0], p.color[1], p.color[2], p.alpha);
                    sketch.rect(-p.size/2, -p.size/2, p.size, p.size);
                    sketch.pop();
                });
            }
        };
    },

    // Star burst animation
    createStarBurst: function(sketch, x, y) {
        return {
            points: [],
            alpha: 255,
            size: 0,
            maxSize: 100,
            
            init: function() {
                for (let i = 0; i < 8; i++) {
                    this.points.push({
                        angle: (i * sketch.TWO_PI) / 8,
                        length: 0,
                        maxLength: sketch.random(30, 50)
                    });
                }
            },
            
            update: function() {
                let growing = false;
                this.points.forEach(p => {
                    if (p.length < p.maxLength) {
                        p.length += 2;
                        growing = true;
                    }
                });
                
                if (!growing) {
                    this.alpha -= 5;
                }
                
                this.size = Math.min(this.size + 4, this.maxSize);
                
                return this.alpha > 0;
            },
            
            draw: function() {
                sketch.push();
                sketch.translate(x, y);
                
                // Draw outer burst
                sketch.noFill();
                sketch.stroke(255, 215, 0, this.alpha);
                sketch.strokeWeight(2);
                
                sketch.beginShape();
                this.points.forEach(p => {
                    let px = Math.cos(p.angle) * p.length;
                    let py = Math.sin(p.angle) * p.length;
                    sketch.vertex(px, py);
                });
                sketch.endShape(sketch.CLOSE);
                
                // Draw center glow
                let innerAlpha = this.alpha * 0.5;
                sketch.noStroke();
                sketch.fill(255, 215, 0, innerAlpha);
                sketch.circle(0, 0, this.size);
                
                sketch.pop();
            }
        };
    },

    // Progress bar animation
    animateProgressBar: function(element, fromPercent, toPercent, duration) {
        const startTime = performance.now();
        
        requestAnimationFrame(function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const currentPercent = fromPercent + (toPercent - fromPercent) * progress;
            element.style.width = currentPercent + '%';
            
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        });
    },

    // Level up animation
    showLevelUpAnimation: function(sketch, text, callback) {
        const animation = {
            text: text,
            y: sketch.height,
            alpha: 255,
            scale: 0.5,
            complete: false,
            
            update: function() {
                if (this.y > sketch.height/2) {
                    this.y -= (this.y - sketch.height/2) * 0.1;
                    this.scale += (1.5 - this.scale) * 0.1;
                } else {
                    this.alpha -= 5;
                    if (this.alpha <= 0) {
                        this.complete = true;
                        if (callback) callback();
                    }
                }
            },
            
            draw: function() {
                sketch.push();
                sketch.textAlign(sketch.CENTER, sketch.CENTER);
                sketch.textSize(40 * this.scale);
                sketch.fill(255, 215, 0, this.alpha);
                sketch.noStroke();
                sketch.text(this.text, sketch.width/2, this.y);
                
                // Add glow effect
                sketch.drawingContext.shadowBlur = 20;
                sketch.drawingContext.shadowColor = 'rgba(255, 215, 0, 0.5)';
                sketch.text(this.text, sketch.width/2, this.y);
                sketch.drawingContext.shadowBlur = 0;
                
                sketch.pop();
            }
        };
        
        return animation;
    }
};

// Make globally available
window.ChallengeAnimations = ChallengeAnimations;
