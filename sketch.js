// Constants
const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 600;
const PLAYER_WIDTH = 35;
const PLAYER_HEIGHT = 35;
const ENEMY_WIDTH = 40;
const ENEMY_HEIGHT = 40;
const BULLET_WIDTH = 5;
const BULLET_HEIGHT = 5;
const PLAYER_SPEED = 7;
const ENEMY_SPEED = 1.5;
const BULLET_SPEED = 12;
const SHOOT_COOLDOWN = 7;
const SHOOT_PROBABILITY = 0.005;
const ENEMY_DROP = 15;
const POWERUP_TYPES = ["TRIPLE_SHOT", "SHIELD", "SPEED_BOOST", "BOMB", "JEET_STOMPER"];
const POWERUP_DURATION = 300; // 5 seconds at 60fps
const POWERUP_PROBABILITY = 0.3;
const COMBO_DURATION = 120; // 2 seconds to maintain combo
const MEME_PHRASES = [
  "TO THE MOON!",
  "HODL!",
  "DIAMOND HANDS!",
  "REKT!",
  "NOT FINANCIAL ADVICE!",
  "SER...!",
  "NGMI!",
  "WAGMI!",
  "APE IN!",
  "FOMO!"
];
const STARTING_LIVES = 5;
const INVINCIBILITY_DURATION = 90;

// Add these constants for the frame
const FRAME_COLOR = [40, 40, 45];
const FRAME_ACCENT = [60, 60, 65];
const FRAME_WIDTH = 800;
const FRAME_HEIGHT = 800;
const CONSOLE_NAME = "TURBO 3000";

// Adjust the enemy bullet speed constant
const ENEMY_BULLET_SPEED = 3; // Reduced from the default speed

// Add Supabase configuration variables
const SUPABASE_URL = "https://uvrqckecrensqyhsghli.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2cnFja2VjcmVuc3F5aHNnaGxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA1NDgyODksImV4cCI6MjA1NjEyNDI4OX0.CJ4VgbAFmSy5NgpfX8rAP26NVLUwc1s1TSnoaXlzwsc";
let supabase = null;
let leaderboard = [];
let isLoadingLeaderboard = true; // Flag to track if leaderboard is loading

// Game states and variables
let gameState = "start";
let score = 0;
let lives = STARTING_LIVES;
let waveNumber = 1;
let enemyDirection = 1; // 1 for right, -1 for left
let powerups = [];
let activePowerups = [];
let combo = 0;
let comboTimer = 0;
let lastKillTime = 0;
let memeTexts = [];
let highScore = 0;
let gameShakeAmount = 0;

// Game objects
let player;
let enemies = [];
let playerBullets = [];
let enemyBullets = [];
let stars = [];

// Enemy types
const ENEMY_TYPES = [
  "GasTank",
  "RugMat",
  "NewsTicker",
  "LiquidityAnchor",
  "PopUpBox"
];

// Add these witty descriptions for each enemy type
const ENEMY_DESCRIPTIONS = {
  "GasTank": [
    "JEET STOMPED!",
    "JEET REKT!",
    "JEET ELIMINATED!"
  ],
  "RugMat": [
    "Rug put back!",
    "No 100x for you!",
    "Scam exposed!"
  ],
  "NewsTicker": [
    "Red candles defeated!",
    "Green candles only!",
    "Bearish trend reversed!",
    "FUD chart destroyed!"
  ],
  "LiquidityAnchor": [
    "Whale harpooned!",
    "Market manipulation stopped!",
    "Liquidity freed!"
  ],
  "PopUpBox": [
    "Ad blocked!",
    "Popup popped!",
    "Spam deleted!"
  ]
};

// Add these variables for name entry
let playerName = "";
let isEnteringName = false;
let nameEntryComplete = false;
let cursorBlinkTimer = 0;
const MAX_NAME_LENGTH = 20;

// Add a variable to track how long the game over screen has been shown
let gameOverTimer = 0;
const MIN_GAME_OVER_DURATION = 300; // 5 seconds at 60fps

// Global variables for game state
window.gameState = "start";
window.leftPressed = false;
window.rightPressed = false;
window.firePressed = false;

// Add this at the top of sketch.js, right after the global variables
window.forceRestartGame = function() {
  console.log("Force restarting game");
  
  // First reset to start screen
  updateGameState("start");
  
  // Then immediately transition to playing
  setTimeout(function() {
    updateGameState("playing");
    
    // Reset all game variables
    score = 0;
    lives = STARTING_LIVES;
    waveNumber = 1;
    enemyDirection = 1;
    player = new Player();
    enemies = [];
    playerBullets = [];
    enemyBullets = [];
    powerups = [];
    activePowerups = [];
    combo = 0;
    comboTimer = 0;
    memeTexts = [];
    gameShakeAmount = 0;
    isEnteringName = false;
    nameEntryComplete = false;
    playerName = "";
    gameOverTimer = 0;
    
    // Initialize the first wave
    initializeWave();
  }, 10); // Short delay to ensure state change is processed
};

// Add this at the top of your sketch.js file, right after the global variables
window.hardRestart = function() {
  console.log("Hard restart triggered");
  
  // Force reset all game state variables
  updateGameState("start");
  score = 0;
  lives = STARTING_LIVES;
  waveNumber = 1;
  enemyDirection = 1;
  player = new Player();
  enemies = [];
  playerBullets = [];
  enemyBullets = [];
  powerups = [];
  activePowerups = [];
  combo = 0;
  comboTimer = 0;
  memeTexts = [];
  gameShakeAmount = 0;
  isEnteringName = false;
  nameEntryComplete = false;
  playerName = "";
  gameOverTimer = 0;
  
  // Initialize the first wave
  initializeWave();
  
  // Force transition to playing state after a short delay
  setTimeout(function() {
    updateGameState("playing");
  }, 100);
};

// **Player Class**
class Player {
  constructor() {
    this.x = CANVAS_WIDTH / 2;
    this.y = CANVAS_HEIGHT - 50;
    this.width = PLAYER_WIDTH;
    this.height = PLAYER_HEIGHT;
    this.speed = PLAYER_SPEED;
    this.cooldown = 0;
    this.hasShield = false;
    this.tripleShot = false;
    this.speedBoost = false;
    this.normalSpeed = PLAYER_SPEED;
    this.invincible = false;
    this.invincibilityTimer = 0;
    this.flickerState = true;
    this.jeetStomper = false;
    this.jeetStomperDuration = 0;
  }

  draw() {
    // Yellow frog with flicker effect when invincible
    push();
    
    // Rocket flames effect
    fill(255, 69, 0, 200); // Orange-red flame
    noStroke();
    
    // Animated flames
    let flameHeight = 10 + sin(frameCount * 0.2) * 5;
    let flameWidth = this.width * 0.6;
    
    // Main flame
    beginShape();
    vertex(this.x, this.y + this.height/2);
    vertex(this.x - flameWidth/2, this.y + this.height/2 + flameHeight/2);
    vertex(this.x, this.y + this.height/2 + flameHeight);
    vertex(this.x + flameWidth/2, this.y + this.height/2 + flameHeight/2);
    endShape(CLOSE);
    
    // Inner flame (yellow)
    fill(255, 255, 0, 180);
    let innerFlameHeight = flameHeight * 0.6;
    let innerFlameWidth = flameWidth * 0.6;
    beginShape();
    vertex(this.x, this.y + this.height/2);
    vertex(this.x - innerFlameWidth/2, this.y + this.height/2 + innerFlameHeight/2);
    vertex(this.x, this.y + this.height/2 + innerFlameHeight);
    vertex(this.x + innerFlameWidth/2, this.y + this.height/2 + innerFlameHeight/2);
    endShape(CLOSE);
    
    // Shield effect
    if (this.hasShield) {
      fill(0, 191, 255, 100);
      ellipse(this.x, this.y, this.width * 2.5, this.height * 2);
    }
    
    // Flicker when invincible
    if (this.invincible) {
      if (frameCount % 6 < 3) { // Flicker effect
        this.flickerState = false;
      } else {
        this.flickerState = true;
      }
    } else {
      this.flickerState = true;
    }
    
    if (this.flickerState) {
      // Smooth rendering with anti-aliasing
      smooth();
      
      // Body - yellow-green ellipse
      fill(220, 220, 0);
      ellipse(this.x, this.y, this.width * 1.5, this.height);
      
      // Eyes - two white circles with black pupils
      fill(255);
      ellipse(this.x - this.width/3, this.y - this.height/4, this.width/3, this.height/3);
      ellipse(this.x + this.width/3, this.y - this.height/4, this.width/3, this.height/3);
      
      // Pupils
      fill(0);
      ellipse(this.x - this.width/3, this.y - this.height/4, this.width/6, this.height/6);
      ellipse(this.x + this.width/3, this.y - this.height/4, this.width/6, this.height/6);
      
      // Mouth - curved line with thicker stroke for better visibility
      stroke(0);
      strokeWeight(2);
      noFill();
      arc(this.x, this.y, this.width/2, this.height/4, 0, PI);
      noStroke();
      strokeWeight(1);
      
      // Legs - small ellipses on sides
      fill(180, 180, 0);
      ellipse(this.x - this.width/1.5, this.y, this.width/3, this.height/4);
      ellipse(this.x + this.width/1.5, this.y, this.width/3, this.height/4);
    }
    
    // Speed boost effect (turbo visual)
    if (this.speedBoost) {
      // Turbo boost flames
      fill(255, 165, 0, 150); // Orange base
      
      // Multiple flame layers
      for (let i = 0; i < 3; i++) {
        let flicker = sin(frameCount * 0.3 + i) * 5;
        let alpha = 150 - i * 30;
        fill(255, 165 - i * 30, 0, alpha);
        
        beginShape();
        vertex(this.x - this.width/2, this.y);
        vertex(this.x - this.width - 10 - flicker, this.y - this.height/4);
        vertex(this.x - this.width - 15 - flicker, this.y);
        vertex(this.x - this.width - 10 - flicker, this.y + this.height/4);
        endShape(CLOSE);
        
        beginShape();
        vertex(this.x + this.width/2, this.y);
        vertex(this.x + this.width + 10 + flicker, this.y - this.height/4);
        vertex(this.x + this.width + 15 + flicker, this.y);
        vertex(this.x + this.width + 10 + flicker, this.y + this.height/4);
        endShape(CLOSE);
      }
      
      // Small turbo icon above player
      push();
      translate(this.x, this.y - this.height);
      
      // Turbo text
      fill(255);
      textSize(10);
      textAlign(CENTER);
      text("TURBO", 0, -5);
      
      // Mini turbocharger
      fill(220, 220, 220);
      ellipse(0, 5, 8, 8);
      fill(50, 50, 50);
      ellipse(0, 5, 3, 3);
      pop();
    }
    
    // Triple shot indicator
    if (this.tripleShot) {
      fill(255, 0, 255);
      ellipse(this.x, this.y - this.height/2, 8, 8); // Bigger indicator
    }
    
    // Add JEET_STOMPER visual effect
    if (this.jeetStomper && frameCount % 10 < 5) {
      fill(255, 0, 0, 150);
      ellipse(this.x, this.y - this.height/2, this.width/2, this.height/2);
      textSize(10);
      fill(255);
      textAlign(CENTER);
      text("STOMP", this.x, this.y - this.height/2 + 3);
    }
    
    pop();
  }

  move() {
    // Use window to access global variables
    if (keyIsDown(LEFT_ARROW) || window.leftPressed) {
      this.x -= this.speed;
    }
    if (keyIsDown(RIGHT_ARROW) || window.rightPressed) {
      this.x += this.speed;
    }
    this.x = constrain(this.x, this.width / 2, CANVAS_WIDTH - this.width / 2);
  }

  shoot() {
    if ((keyIsDown(32) || window.firePressed) && this.cooldown === 0) {
      if (this.tripleShot) {
        playerBullets.push(new PlayerBullet(this.x, this.y - this.height / 2));
        playerBullets.push(new PlayerBullet(this.x - 10, this.y - this.height / 3, -0.3));
        playerBullets.push(new PlayerBullet(this.x + 10, this.y - this.height / 3, 0.3));
        gameShakeAmount = 3;
      } else {
        playerBullets.push(new PlayerBullet(this.x, this.y - this.height / 2));
      }
      this.cooldown = SHOOT_COOLDOWN;
    }
  }

  update() {
    this.move();
    this.shoot();
    this.updatePowerups();
    
    // Update invincibility
    if (this.invincible) {
      this.invincibilityTimer--;
      if (this.invincibilityTimer <= 0) {
        this.invincible = false;
      }
    }
    
    if (this.cooldown > 0) {
      this.cooldown--;
    }
  }

  checkCollisions() {
    // Skip collision check if invincible
    if (this.invincible) return;
    
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
      let bullet = enemyBullets[i];
      if (rectanglesOverlap(this, bullet)) {
        enemyBullets.splice(i, 1);
        
        if (this.hasShield) {
          // Shield absorbs the hit
          memeTexts.push(new MemeText(this.x, this.y - 20, "BLOCKED!", 15, [0, 191, 255]));
          // Remove shield after one hit
          this.hasShield = false;
          for (let i = activePowerups.length - 1; i >= 0; i--) {
            if (activePowerups[i].type === "SHIELD") {
              activePowerups.splice(i, 1);
              break;
            }
          }
        } else {
          lives--;
          // Reset combo when hit
          combo = 0;
          comboTimer = 0;
          
          // Add screen shake for impact
          gameShakeAmount = 10;
          
          // Make player invincible briefly
          this.invincible = true;
          this.invincibilityTimer = INVINCIBILITY_DURATION;
          
          if (lives <= 0) {
            updateGameState("game over");
            // Update high score
            if (score > highScore) {
              highScore = score;
              // Add a celebratory message
              memeTexts.push(new MemeText(width/2, height/2 - 100, "NEW HIGH SCORE!", 30, [255, 215, 0]));
            }
          }
        }
      }
    }
    
    // Check for powerup collection
    for (let i = powerups.length - 1; i >= 0; i--) {
      let powerup = powerups[i];
      if (rectanglesOverlap(this, powerup)) {
        // Apply powerup effect
        this.applyPowerup(powerup.type);
        powerups.splice(i, 1);
        
        // Add meme text
        memeTexts.push(new MemeText(this.x, this.y - 30, "POWER UP!", 20, [255, 255, 0]));
      }
    }
  }
  
  applyPowerup(type) {
    // Add to active powerups
    activePowerups.push({
      type: type,
      duration: type === "JEET_STOMPER" ? 600 : POWERUP_DURATION // 10 seconds for JEET_STOMPER
    });
    
    switch(type) {
      case "TRIPLE_SHOT":
        this.tripleShot = true;
        break;
      case "SHIELD":
        this.hasShield = true;
        break;
      case "SPEED_BOOST":
        this.speedBoost = true;
        this.speed = this.normalSpeed * 1.5;
        break;
      case "BOMB":
        // Clear all enemies on screen
        for (let enemy of enemies) {
          score += 5;
          // Create explosion effect
          memeTexts.push(new MemeText(enemy.x, enemy.y, "BOOM!", 15, [255, 0, 0]));
        }
        enemies = [];
        enemyBullets = [];
        gameShakeAmount = 15;
        break;
      case "JEET_STOMPER":
        this.jeetStomper = true;
        this.jeetStomperDuration = 600; // 10 seconds
        break;
    }
  }
  
  updatePowerups() {
    for (let i = activePowerups.length - 1; i >= 0; i--) {
      let powerup = activePowerups[i];
      powerup.duration--;
      
      if (powerup.duration <= 0) {
        // Remove powerup effect
        switch(powerup.type) {
          case "TRIPLE_SHOT":
            this.tripleShot = false;
            break;
          case "SHIELD":
            this.hasShield = false;
            break;
          case "SPEED_BOOST":
            this.speedBoost = false;
            this.speed = this.normalSpeed;
            break;
        }
        
        activePowerups.splice(i, 1);
      }
    }
    
    // Update JEET_STOMPER effect
    if (this.jeetStomper) {
      this.jeetStomperDuration--;
      
      // Auto-kill any Jeet enemies that spawn
      for (let i = enemies.length - 1; i >= 0; i--) {
        if (enemies[i].type === "GasTank") {
          // Create explosion effect
          memeTexts.push(new MemeText(enemies[i].x, enemies[i].y, "AUTO-STOMPED!", 20, [255, 0, 0]));
          // Add score
          score += 15;
          // Remove the enemy
          enemies.splice(i, 1);
          // Add screen shake
          gameShakeAmount = 2;
        }
      }
      
      if (this.jeetStomperDuration <= 0) {
        this.jeetStomper = false;
        // Remove from active powerups
        for (let i = activePowerups.length - 1; i >= 0; i--) {
          if (activePowerups[i].type === "JEET_STOMPER") {
            activePowerups.splice(i, 1);
            break;
          }
        }
      }
    }
  }
}

// **Enemy Class**
class Enemy {
  constructor(x, y, type = null) {
    this.x = x;
    this.y = y;
    this.width = this.getEnemySize().width;
    this.height = this.getEnemySize().height;
    this.speed = ENEMY_SPEED;
    this.type = type || ENEMY_TYPES[Math.floor(random(ENEMY_TYPES.length))];
    this.health = this.getInitialHealth();
    this.shootProbability = SHOOT_PROBABILITY;
    this.specialCooldown = 0;
  }

  getInitialHealth() {
    switch(this.type) {
      case "GasTank": return 2;
      case "RugMat": return 1;
      case "NewsTicker": return 1;
      case "LiquidityAnchor": return 2;
      case "PopUpBox": return 1;
      default: return 1;
    }
  }

  getEnemySize() {
    switch(this.type) {
      case "GasTank": 
        return { width: ENEMY_WIDTH * 1.8, height: ENEMY_HEIGHT * 1.8 };
      case "RugMat": 
        return { width: ENEMY_WIDTH * 2.2, height: ENEMY_HEIGHT * 1.4 };
      case "NewsTicker": 
        return { width: ENEMY_WIDTH * 2.0, height: ENEMY_HEIGHT * 1.2 };
      case "LiquidityAnchor": 
        return { width: ENEMY_WIDTH * 1.8, height: ENEMY_HEIGHT * 2.0 };
      case "PopUpBox": 
        return { width: ENEMY_WIDTH * 1.7, height: ENEMY_HEIGHT * 1.7 };
      default: 
        return { width: ENEMY_WIDTH, height: ENEMY_HEIGHT };
    }
  }

  draw() {
    switch(this.type) {
      case "GasTank":
        // Brown human outline with "JEET" label
        push();
        
        // Body - brown human silhouette
        fill(139, 69, 19); // Brown
        
        // Head
        ellipse(this.x, this.y - this.height/3, this.width/2.5, this.width/2.5);
        
        // Body
        beginShape();
        // Neck
        vertex(this.x - this.width/6, this.y - this.height/5);
        vertex(this.x + this.width/6, this.y - this.height/5);
        // Torso
        vertex(this.x + this.width/3, this.y + this.height/6);
        vertex(this.x + this.width/4, this.y + this.height/3);
        // Legs
        vertex(this.x, this.y + this.height/2.2);
        vertex(this.x - this.width/4, this.y + this.height/3);
        vertex(this.x - this.width/3, this.y + this.height/6);
        endShape(CLOSE);
        
        // Arms
        beginShape();
        vertex(this.x - this.width/6, this.y - this.height/8);
        vertex(this.x - this.width/2.5, this.y);
        vertex(this.x - this.width/3, this.y + this.height/10);
        vertex(this.x - this.width/8, this.y - this.height/10);
        endShape(CLOSE);
        
        beginShape();
        vertex(this.x + this.width/6, this.y - this.height/8);
        vertex(this.x + this.width/2.5, this.y);
        vertex(this.x + this.width/3, this.y + this.height/10);
        vertex(this.x + this.width/8, this.y - this.height/10);
        endShape(CLOSE);
        
        // "JEET" label - large and prominent
        fill(255, 255, 255); // White text
        textSize(this.width/3);
        textAlign(CENTER);
        textStyle(BOLD);
        text("JEET", this.x, this.y + this.height/8);
        textStyle(NORMAL);
        
        // Toxic fumes (keep these for visual effect)
        for (let i = 0; i < 3; i++) {
          let offset = sin(frameCount * 0.1 + i) * 5;
          fill(0, 255, 0, 100 - i * 20); // Green transparent
          ellipse(this.x + offset, this.y + this.height/2 + i*8, this.width/2 - i*5, this.height/4 - i*2);
        }
        
        pop();
        break;
        
      case "RugMat":
        // Frayed, rolled-up carpet
        push();
        // Rug body
        fill(139, 0, 0); // Dark red
        rect(this.x - this.width/2, this.y - this.height/3, this.width, this.height/1.5, 5);
        
        // Rug pattern
        stroke(255, 215, 0); // Gold
        strokeWeight(2);
        for (let i = 1; i < 5; i++) {
          line(this.x - this.width/2, this.y - this.height/3 + i*this.height/7, 
               this.x + this.width/2, this.y - this.height/3 + i*this.height/7);
        }
        noStroke();
        
        // "RUG" label - larger and more prominent
        fill(255, 215, 0); // Gold
        textSize(this.width/3); // Increased from width/4
        textAlign(CENTER);
        text("RUG", this.x, this.y); // Changed from "100x" to "RUG"
        
        // "100x" label - smaller, below the RUG text
        textSize(this.width/5);
        text("100x", this.x, this.y + this.height/4);
        
        // Frayed edges
        stroke(139, 0, 0);
        strokeWeight(2);
        for (let i = 0; i < 8; i++) {
          let x = this.x - this.width/2 + i*this.width/7;
          line(x, this.y + this.height/6, x, this.y + this.height/3);
        }
        noStroke();
        pop();
        break;
        
      case "NewsTicker":
        // Stock chart with downward trend
        push();
        // Ticker body
        fill(30, 30, 30); // Dark gray
        rect(this.x - this.width/2, this.y - this.height/2, this.width, this.height, 5);
        
        // Screen with red chart background
        fill(20, 0, 0); // Dark red background
        rect(this.x - this.width/2 + 10, this.y - this.height/2 + 10, this.width - 20, this.height - 20, 3);
        
        // Draw stock chart grid lines
        stroke(100, 0, 0);
        strokeWeight(1);
        // Horizontal grid lines
        for (let i = 1; i < 4; i++) {
          let y = this.y - this.height/2 + 10 + i * (this.height - 20)/4;
          line(this.x - this.width/2 + 10, y, this.x + this.width/2 - 10, y);
        }
        // Vertical grid lines
        for (let i = 1; i < 4; i++) {
          let x = this.x - this.width/2 + 10 + i * (this.width - 20)/4;
          line(x, this.y - this.height/2 + 10, x, this.y + this.height/2 - 10);
        }
        
        // Draw downward trend line
        stroke(255, 0, 0);
        strokeWeight(3);
        beginShape();
        // Start high on the left
        vertex(this.x - this.width/2 + 15, this.y - this.height/2 + 15);
        // Add some volatility with small ups and downs, but overall downtrend
        vertex(this.x - this.width/4, this.y - this.height/6);
        vertex(this.x, this.y);
        vertex(this.x + this.width/4, this.y + this.height/6);
        // End low on the right
        vertex(this.x + this.width/2 - 15, this.y + this.height/2 - 15);
        endShape();
        
        // Draw downward arrow at the end of the chart
        fill(255, 0, 0);
        noStroke();
        triangle(
          this.x + this.width/2 - 15, this.y + this.height/2 - 15,
          this.x + this.width/2 - 25, this.y + this.height/2 - 25,
          this.x + this.width/2 - 5, this.y + this.height/2 - 25
        );
        
        // "PANIC SELL" text
        fill(255, 0, 0);
        textSize(this.height/4);
        textAlign(CENTER);
        textStyle(BOLD);
        text("PANIC", this.x, this.y - this.height/6);
        text("SELL", this.x, this.y + this.height/6);
        textStyle(NORMAL);
        
        // Blinking indicator light
        if (frameCount % 10 < 5) {
          fill(255, 0, 0); // Red light
        } else {
          fill(100, 0, 0); // Dim red
        }
        ellipse(this.x + this.width/2 - 10, this.y - this.height/2 + 10, 8, 8);
        pop();
        break;
        
      case "LiquidityAnchor":
        // Colossal anchor
        push();
        // Anchor body
        fill(80, 80, 100); // Steel gray
        
        // Draw the anchor shape
        strokeWeight(3);
        stroke(60, 60, 80);
        // Center rod
        line(this.x, this.y - this.height/2, this.x, this.y + this.height/3);
        // Top ring
        noFill();
        ellipse(this.x, this.y - this.height/2 + 10, this.width/4, this.width/4);
        
        // Arms
        fill(80, 80, 100);
        beginShape();
        vertex(this.x, this.y);
        vertex(this.x - this.width/2, this.y);
        vertex(this.x - this.width/3, this.y + this.height/3);
        endShape(CLOSE);
        
        beginShape();
        vertex(this.x, this.y);
        vertex(this.x + this.width/2, this.y);
        vertex(this.x + this.width/3, this.y + this.height/3);
        endShape(CLOSE);
        
        // ETH symbol
        noStroke();
        fill(0, 100, 255);
        textSize(this.width/4);
        textAlign(CENTER);
        text("Ξ", this.x, this.y - 5);
        
        // ETH drips
        fill(0, 100, 255, 150); // Blue transparent
        for (let i = 0; i < 3; i++) {
          let yOffset = (frameCount/2 + i*20) % 40;
          ellipse(this.x, this.y + this.height/3 + yOffset, 8, 12);
        }
        pop();
        break;
        
      case "PopUpBox":
        // Flickering neon-edged pop-up
        push();
        // Popup window
        if (frameCount % 10 < 8) {
          fill(220, 220, 220, 240); // Light gray
        } else {
          fill(180, 180, 180, 240); // Darker gray (flicker)
        }
        rect(this.x - this.width/2, this.y - this.height/2, this.width, this.height, 5);
        
        // Window title bar
        fill(100, 100, 255);
        rect(this.x - this.width/2, this.y - this.height/2, this.width, this.height/5, 5, 5, 0, 0);
        
        // Neon edge
        strokeWeight(3);
        if (frameCount % 15 < 10) {
          stroke(0, 255, 255, 200); // Cyan
        } else {
          stroke(255, 0, 255, 200); // Magenta
        }
        noFill();
        rect(this.x - this.width/2, this.y - this.height/2, this.width, this.height, 5);
        
        // X button
        fill(255, 0, 0);
        noStroke();
        rect(this.x + this.width/2 - this.width/8, this.y - this.height/2, this.width/8, this.height/5, 0, 5, 0, 0);
        
        // X symbol
        stroke(255);
        strokeWeight(2);
        line(this.x + this.width/2 - this.width/16 - 5, this.y - this.height/2 + this.height/10 - 5,
             this.x + this.width/2 - this.width/16 + 5, this.y - this.height/2 + this.height/10 + 5);
        line(this.x + this.width/2 - this.width/16 + 5, this.y - this.height/2 + this.height/10 - 5,
             this.x + this.width/2 - this.width/16 - 5, this.y - this.height/2 + this.height/10 + 5);
        
        // Popup content - scam text
        noStroke();
        fill(0);
        textSize(this.width/10);
        textAlign(CENTER);
        text("FREE ETH!", this.x, this.y);
        textSize(this.width/12);
        text("CLICK NOW!!!", this.x, this.y + this.height/4);
        
        // Fake button
        fill(0, 255, 0);
        rect(this.x - this.width/4, this.y + this.height/3, this.width/2, this.height/6, 5);
        fill(0);
        textSize(this.width/12);
        text("CLAIM", this.x, this.y + this.height/3 + this.height/12);
        pop();
        break;
        
      default:
        // Default enemy (fallback)
        fill(0, 255, 0); // Green circle
        ellipse(this.x, this.y, this.width, this.height);
    }
  }

  update() {
    this.x += this.speed * enemyDirection;
    
    // Special abilities based on enemy type
    if (this.specialCooldown <= 0) {
      this.useSpecialAbility();
      this.specialCooldown = floor(random(60, 180)); // 1-3 seconds cooldown
    } else {
      this.specialCooldown--;
    }
    
    // Regular shooting
    if (random(1) < this.shootProbability) {
      this.shoot();
    }
  }
  
  shoot() {
    enemyBullets.push(new EnemyBullet(this.x, this.y + this.height / 2, this.type));
  }
  
  useSpecialAbility() {
    switch(this.type) {
      case "GasTank":
        // Fee Fumes - shoot multiple bullets in a spread
        if (random(1) < 0.3) {
          for (let i = -1; i <= 1; i++) {
            let bullet = new EnemyBullet(this.x, this.y + this.height / 2, this.type);
            bullet.xSpeed = i * 2;
            enemyBullets.push(bullet);
          }
        }
        break;
        
      case "RugMat":
        // Fake Coins - shoot a spread of misleading projectiles
        if (random(1) < 0.2) {
          for (let i = 0; i < 3; i++) {
            let bullet = new EnemyBullet(this.x, this.y + this.height / 2, this.type);
            bullet.xSpeed = random(-3, 3);
            bullet.speed = random(BULLET_SPEED * 0.5, BULLET_SPEED * 1.5);
            enemyBullets.push(bullet);
          }
        }
        break;
        
      case "NewsTicker":
        // Panic Blast - faster bullets
        if (random(1) < 0.2) {
          let bullet = new EnemyBullet(this.x, this.y + this.height / 2, this.type);
          bullet.speed = BULLET_SPEED * 1.5;
          enemyBullets.push(bullet);
        }
        break;
        
      case "LiquidityAnchor":
        // Dump Wave - large, slow bullet
        if (random(1) < 0.15) {
          let bullet = new EnemyBullet(this.x, this.y + this.height / 2, this.type);
          bullet.width *= 2;
          bullet.height *= 2;
          bullet.speed *= 0.7;
          enemyBullets.push(bullet);
        }
        break;
        
      case "PopUpBox":
        // Clone Boxes - spawn multiple bullets
        if (random(1) < 0.25) {
          for (let i = 0; i < 2; i++) {
            let bullet = new EnemyBullet(
              this.x + random(-20, 20), 
              this.y + this.height / 2 + random(0, 20), 
              this.type
            );
            enemyBullets.push(bullet);
          }
        }
        break;
    }
  }
}

// **PlayerBullet Class**
class PlayerBullet {
  constructor(x, y, xSpeed = 0) {
    this.x = x;
    this.y = y;
    this.width = BULLET_WIDTH;
    this.height = BULLET_HEIGHT;
    this.speed = -BULLET_SPEED; // Moves upward
    this.xSpeed = xSpeed;
  }

  draw() {
    fill(255, 255, 0); // Yellow rectangle for player bullet
    rect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
  }

  update() {
    this.y += this.speed;
    this.x += this.xSpeed * BULLET_SPEED;
  }

  isOffScreen() {
    return this.y < 0;
  }
}

// **EnemyBullet Class**
class EnemyBullet {
  constructor(x, y, enemyType = null) {
    this.x = x;
    this.y = y;
    this.width = BULLET_WIDTH;
    this.height = BULLET_HEIGHT;
    this.speed = ENEMY_BULLET_SPEED; // Use the new slower speed
    this.enemyType = enemyType;
    this.xSpeed = 0; // Horizontal movement
  }

  draw() {
    switch(this.enemyType) {
      case "GasTank":
        // Toxic green bullet
        fill(0, 255, 0, 200); // Semi-transparent green
        ellipse(this.x, this.y, this.width * 1.5, this.height * 1.5);
        break;
        
      case "RugMat":
        // Fake coin
        fill(255, 215, 0); // Gold
        ellipse(this.x, this.y, this.width, this.height);
        break;
        
      case "NewsTicker":
        // Red headline bullet
        fill(255, 0, 0);
        textSize(8);
        textAlign(CENTER);
        text("FUD", this.x, this.y);
        break;
        
      case "LiquidityAnchor":
        // Blue droplet
        fill(0, 0, 255);
        beginShape();
        vertex(this.x, this.y - this.height);
        vertex(this.x - this.width, this.y);
        vertex(this.x, this.y + this.height);
        vertex(this.x + this.width, this.y);
        endShape(CLOSE);
        break;
        
      case "PopUpBox":
        // Pop-up bullet
        fill(200, 200, 200);
        rect(this.x - this.width, this.y - this.height, this.width * 2, this.height * 2);
        // Red X
        fill(255, 0, 0);
        line(this.x - 2, this.y - 2, this.x + 2, this.y + 2);
        line(this.x + 2, this.y - 2, this.x - 2, this.y + 2);
        break;
        
      default:
        // Default red bullet
        fill(255, 0, 0);
        rect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
    }
  }

  update() {
    this.y += this.speed;
    this.x += this.xSpeed; // Add horizontal movement
  }

  isOffScreen() {
    return this.y > CANVAS_HEIGHT || this.x < 0 || this.x > CANVAS_WIDTH;
  }
}

// **Star Class**
class Star {
  constructor(x, y, size) {
    this.x = x;
    this.y = y;
    this.size = size;
  }

  draw() {
    fill(255); // White circle for star
    ellipse(this.x, this.y, this.size, this.size);
  }
}

// **Collision Detection Helper**
function rectanglesOverlap(rect1, rect2) {
  return (
    rect1.x - rect1.width / 2 < rect2.x + rect2.width / 2 &&
    rect1.x + rect1.width / 2 > rect2.x - rect2.width / 2 &&
    rect1.y - rect1.height / 2 < rect2.y + rect2.height / 2 &&
    rect1.y + rect1.height / 2 > rect2.y - rect2.height / 2
  );
}

// **Initialize Wave Function**
function initializeWave() {
  enemies = [];
  
  // Cap the number of enemies in later waves
  let rows = min(waveNumber, 3); // Cap at 3 rows
  let cols = min(5, 3 + Math.floor(waveNumber / 3)); // Start with fewer columns in early waves
  
  let startX = 100; // Increased from 70
  let startY = 80;  // Increased from 60
  let spacingX = 150; // Increased from 110
  let spacingY = 120; // Increased from 70
  
  // Add a life bonus every few waves
  if (waveNumber % 3 === 0 && waveNumber > 0) {
    lives++;
    memeTexts.push(new MemeText(width/2, height/2 - 100, "EXTRA LIFE!", 30, [255, 0, 0]));
  }
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      let x = startX + col * spacingX;
      let y = startY + row * spacingY;
      
      // Assign specific enemy types based on row or randomly
      let enemyType;
      if (waveNumber <= 5) {
        // First few waves: specific types per row for easier learning
        enemyType = ENEMY_TYPES[row % ENEMY_TYPES.length];
      } else {
        // Later waves: random types for variety
        enemyType = ENEMY_TYPES[Math.floor(random(ENEMY_TYPES.length))];
      }
      
      enemies.push(new Enemy(x, y, enemyType));
    }
  }
}

// **Setup Function**
function setup() {
    // Create canvas with initial size
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
        const containerWidth = window.innerWidth;
        const containerHeight = window.innerHeight * 0.7;
        const aspectRatio = Math.min(containerWidth / 800, containerHeight / 800);
        const newWidth = Math.floor(800 * aspectRatio);
        const newHeight = Math.floor(800 * aspectRatio);
        createCanvas(newWidth, newHeight);
    } else {
        createCanvas(800, 800);
    }
    frameRate(60);
    smooth(); // Enable anti-aliasing for smoother rendering
    player = new Player();
    // Generate static star field
    for (let i = 0; i < 100; i++) {
        stars.push(new Star(random(CANVAS_WIDTH), random(CANVAS_HEIGHT), random(1, 3)));
    }
    
    // Debug available Supabase objects
    console.log("Available Supabase objects:");
    console.log("window.supabase:", typeof window.supabase);
    
    // Initialize Supabase with better error handling
    try {
        console.log("Attempting to initialize Supabase...");
        
        // Check if supabaseConfig is available from the imported file
        if (typeof supabaseConfig !== 'undefined' && typeof createClient === 'function') {
            console.log("Using supabaseConfig:", supabaseConfig);
            
            // Use the values from supabaseConfig
            supabase = createClient(
                supabaseConfig.supabaseUrl, 
                supabaseConfig.supabaseKey
            );
            
            console.log("Supabase client created with config values");
            
            // Test connection and fetch leaderboard
            testSupabaseConnection().then(connected => {
                if (connected) {
                    console.log("Supabase connection verified, fetching leaderboard...");
                    fetchLeaderboard();
                } else {
                    console.log("Supabase connection test failed");
                    isLoadingLeaderboard = false;
                }
            });
        } else {
            console.error("supabaseConfig or createClient not available");
            isLoadingLeaderboard = false;
        }
    } catch (e) {
        console.error("Supabase initialization failed completely:", e);
        console.log("Game will run without leaderboard functionality");
        isLoadingLeaderboard = false;
    }
    
    // Make the control variables global
    window.leftPressed = leftPressed;
    window.rightPressed = rightPressed;
    window.firePressed = firePressed;
    
    // Make sure resetGame is accessible globally
    window.resetGame = function() {
        console.log("Reset game called from window.resetGame");
        score = 0;
        lives = STARTING_LIVES;
        waveNumber = 1;
        enemyDirection = 1;
        player = new Player();
        enemies = [];
        playerBullets = [];
        enemyBullets = [];
        powerups = [];
        activePowerups = [];
        combo = 0;
        comboTimer = 0;
        memeTexts = [];
        gameShakeAmount = 0;
        isEnteringName = false;
        nameEntryComplete = false;
        playerName = "";
        gameOverTimer = 0;
        initializeWave();
    };
    
    // Fetch leaderboard data when the game starts
    fetchLeaderboard();
}

function windowResized() {
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
        const containerWidth = window.innerWidth;
        const containerHeight = window.innerHeight * 0.7;
        const aspectRatio = Math.min(containerWidth / 800, containerHeight / 800);
        const newWidth = Math.floor(800 * aspectRatio);
        const newHeight = Math.floor(800 * aspectRatio);
        resizeCanvas(newWidth, newHeight);
    } else {
        resizeCanvas(800, 800);
    }
}

// **Draw Function**
function draw() {
  // Check if buttons are pressed
  if (window.leftPressed || window.rightPressed || window.firePressed) {
    if (gameState === "start") {
      console.log("Button pressed, starting game");
      updateGameState("playing");
      resetGame();
    }
  }
  
  background(30, 30, 35); // Dark background for the console
  
  // Draw the console frame
  drawConsoleFrame();
  
  // Set up a translation to center the game canvas within the frame
  push();
  translate((FRAME_WIDTH - CANVAS_WIDTH) / 2, (FRAME_HEIGHT - CANVAS_HEIGHT) / 2 - 30);
  
  // Apply screen shake effect
  if (gameShakeAmount > 0) {
    translate(random(-gameShakeAmount, gameShakeAmount), random(-gameShakeAmount, gameShakeAmount));
    gameShakeAmount *= 0.9;
    if (gameShakeAmount < 0.5) gameShakeAmount = 0;
  }
  
  // Draw the game background
  fill(0);
  rect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  
  // Draw stars
  for (let star of stars) {
    star.draw();
  }

  if (gameState === "start") {
    // Start screen with shadow effect
    textAlign(CENTER);
    
    // Title with shadow
    fill(0); // Shadow
    textSize(42);
    text("Turbo vs. The Trenches", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 48);
    
    // Subtitle with shadow
    textSize(22);
    text("Press any key to start", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 52);
    
    // Welcome message with shadow
    textSize(26);
    text("Welcome Frens!", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 92);
    
    // Title in bright color
    fill(255, 255, 0); // Yellow main text
    textSize(40);
    text("Turbo vs. The Trenches", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 50);
    
    // Subtitle in white
    fill(255); // White
    textSize(20);
    text("Press any key to start", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50);
    
    // Welcome message in green
    fill(50, 255, 50); // Bright green
    textSize(24);
    text("Welcome Frens!", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 90);
    
    // Draw a much larger frog character at the bottom of the screen
    push();
    let frogX = CANVAS_WIDTH / 2;
    let frogY = CANVAS_HEIGHT - 100; // Moved to near the bottom of the screen
    let frogSize = 60; // Keep the larger size
    
    // Rocket flames effect
    fill(255, 69, 0, 200); // Orange-red flame
    noStroke();
    
    // Animated flames
    let flameHeight = 20 + sin(frameCount * 0.2) * 8;
    let flameWidth = frogSize * 0.6;
    
    // Main flame
    beginShape();
    vertex(frogX, frogY + frogSize/2);
    vertex(frogX - flameWidth/2, frogY + frogSize/2 + flameHeight/2);
    vertex(frogX, frogY + frogSize/2 + flameHeight);
    vertex(frogX + flameWidth/2, frogY + frogSize/2 + flameHeight/2);
    endShape(CLOSE);
    
    // Inner flame (yellow)
    fill(255, 255, 0, 180);
    let innerFlameHeight = flameHeight * 0.6;
    let innerFlameWidth = flameWidth * 0.6;
    beginShape();
    vertex(frogX, frogY + frogSize/2);
    vertex(frogX - innerFlameWidth/2, frogY + frogSize/2 + innerFlameHeight/2);
    vertex(frogX, frogY + frogSize/2 + innerFlameHeight);
    vertex(frogX + innerFlameWidth/2, frogY + frogSize/2 + innerFlameHeight/2);
    endShape(CLOSE);
    
    // Body
    fill(220, 220, 0);
    ellipse(frogX, frogY, frogSize * 1.5, frogSize);
    
    // Eyes
    fill(255);
    ellipse(frogX - frogSize/3, frogY - frogSize/4, frogSize/3, frogSize/3);
    ellipse(frogX + frogSize/3, frogY - frogSize/4, frogSize/3, frogSize/3);
    
    // Pupils
    fill(0);
    ellipse(frogX - frogSize/3, frogY - frogSize/4, frogSize/6, frogSize/6);
    ellipse(frogX + frogSize/3, frogY - frogSize/4, frogSize/6, frogSize/6);
    
    // Mouth
    stroke(0);
    strokeWeight(3);
    noFill();
    arc(frogX, frogY, frogSize/2, frogSize/4, 0, PI);
    noStroke();
    
    // Legs
    fill(180, 180, 0);
    ellipse(frogX - frogSize/1.5, frogY, frogSize/3, frogSize/4);
    ellipse(frogX + frogSize/1.5, frogY, frogSize/3, frogSize/4);
    
    pop();
  } else if (gameState === "playing") {
    // Playing state
    player.update();
    player.draw();
    player.checkCollisions();

    // Update and draw enemies
    for (let enemy of enemies) {
      enemy.update();
      enemy.draw();
    }

    // Enemy movement logic
    let leftmost = min(enemies.map(e => e.x - e.width / 2));
    let rightmost = max(enemies.map(e => e.x + e.width / 2));
    if (rightmost >= CANVAS_WIDTH || leftmost <= 0) {
      enemyDirection *= -1;
      for (let enemy of enemies) {
        enemy.y += ENEMY_DROP;
      }
    }

    // Update and draw player bullets with collision
    for (let i = playerBullets.length - 1; i >= 0; i--) {
      let bullet = playerBullets[i];
      bullet.update();
      bullet.draw();
      if (bullet.isOffScreen()) {
        playerBullets.splice(i, 1);
      } else {
        for (let j = enemies.length - 1; j >= 0; j--) {
          let enemy = enemies[j];
          if (rectanglesOverlap(bullet, enemy)) {
            playerBullets.splice(i, 1);
            enemy.health--;
            
            if (enemy.health <= 0) {
              // Score based on enemy type
              let pointValue = 10;
              switch(enemy.type) {
                case "GasTank": 
                  pointValue = 15; 
                  // Special chance to drop JEET_STOMPER powerup when killing a Jeet
                  if (random() < 0.4) { // 40% chance
                    let jeetPowerup = new PowerUp(enemy.x, enemy.y);
                    jeetPowerup.type = "JEET_STOMPER";
                    powerups.push(jeetPowerup);
                    memeTexts.push(new MemeText(enemy.x, enemy.y + 20, "JEET STOMPER UNLOCKED!", 16, [255, 100, 0]));
                  }
                  break;
                case "RugMat": pointValue = 10; break;
                case "NewsTicker": pointValue = 10; break;
                case "LiquidityAnchor": pointValue = 25; break;
                case "PopUpBox": pointValue = 5; break;
              }
              
              // Add witty description when enemy is destroyed - MUCH LARGER SIZE
              let descriptions = ENEMY_DESCRIPTIONS[enemy.type];
              let randomDescription = descriptions[Math.floor(random(descriptions.length))];
              memeTexts.push(new MemeText(enemy.x, enemy.y - 15, randomDescription, 24, [255, 255, 0])); // Increased from 16 to 24
              
              // Check for combo
              let currentTime = frameCount;
              if (currentTime - lastKillTime < COMBO_DURATION) {
                combo++;
                comboTimer = COMBO_DURATION;
                
                // Bonus points for combo
                pointValue = pointValue * (1 + combo * 0.1);
                
                // Show combo text
                if (combo > 1) {
                  let comboText = combo + "x COMBO!";
                  memeTexts.push(new MemeText(enemy.x, enemy.y - 20, comboText, 15 + combo, [255, 255, 0]));
                }
              } else {
                combo = 1;
                comboTimer = COMBO_DURATION;
              }
              
              lastKillTime = currentTime;
              
              // Add random meme phrase on kill
              if (random() < 0.3) {
                let phrase = MEME_PHRASES[Math.floor(random(MEME_PHRASES.length))];
                memeTexts.push(new MemeText(enemy.x, enemy.y, phrase, 12, [255, 255, 255]));
              }
              
              // Chance to drop powerup
              if (random() < POWERUP_PROBABILITY) {
                powerups.push(new PowerUp(enemy.x, enemy.y));
              }
              
              score += Math.floor(pointValue);
              enemies.splice(j, 1);
              
              // Add screen shake for impact
              gameShakeAmount = 3;
              break;
            }
          }
        }
      }
    }

    // Update and draw enemy bullets
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
      let bullet = enemyBullets[i];
      bullet.update();
      bullet.draw();
      if (bullet.isOffScreen()) {
        enemyBullets.splice(i, 1);
      }
    }

    // Check for wave completion
    if (enemies.length === 0) {
      waveNumber++;
      initializeWave();
    }

    // Check for game over condition
    for (let enemy of enemies) {
      if (enemy.y + enemy.height / 2 >= player.y - player.height / 2) {
        updateGameState("game over");
        break;
      }
    }

    // Update combo timer
    updateCombo();

    // Update and draw powerups
    for (let i = powerups.length - 1; i >= 0; i--) {
      let powerup = powerups[i];
      powerup.update();
      powerup.draw();
      if (powerup.isOffScreen()) {
        powerups.splice(i, 1);
      }
    }
    
    // Update and draw meme texts
    for (let i = memeTexts.length - 1; i >= 0; i--) {
      let memeText = memeTexts[i];
      memeText.update();
      memeText.draw();
      if (memeText.isDead()) {
        memeTexts.splice(i, 1);
      }
    }

    // Enhanced UI with combo display
    textAlign(LEFT);
    fill(255);
    textSize(20);
    text("Score: " + score, 20, 20);
    textAlign(RIGHT);
    text("Lives: " + lives, CANVAS_WIDTH - 20, 20);
    
    // Display combo
    
    // Display active powerups
    textAlign(LEFT);
    fill(255);
    textSize(12);
    let powerupY = 40;
    for (let powerup of activePowerups) {
      let timeLeft = Math.ceil(powerup.duration / 60);
      text(powerup.type + ": " + timeLeft + "s", 20, powerupY);
      powerupY += 15;
    }

    // Spawn bonus powerups
    spawnBonusPowerup();
  } else if (gameState === "game over") {
    // Increment the game over timer
    gameOverTimer++;
    
    // Enhanced game over screen with better visuals
    push();
    
    // Semi-transparent overlay
    fill(0, 0, 0, 200);
    rect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Center all text
    textAlign(CENTER, CENTER);
    
    // Simplified Game Over title with cleaner glow effect - MOVED UP
    // Shadow/glow (just 3 layers instead of 10)
    for (let i = 3; i > 0; i--) {
      fill(255, 0, 0, 100);
      textSize(52);
      text("Game Over", CANVAS_WIDTH / 2 + i, CANVAS_HEIGHT / 2 - 180 + i); // Moved up 80px
    }
    
    // Main text - crisp and clear
    fill(255, 0, 0);
    textSize(50);
    text("Game Over", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 180); // Moved up 80px
    
    // Score display with animation - MOVED UP and extended animation duration
    fill(255);
    textSize(30);
    text("Final Score:", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 120); // Moved up 90px
    
    // Fixed score counter animation with longer duration
    let animationDuration = 180; // 3 seconds at 60fps
    let animationProgress = min(1, gameOverTimer / animationDuration);
    let displayScore = floor(score * animationProgress);
    
    fill(255, 255, 0);
    textSize(50);
    text(displayScore, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 70); // Moved up 90px
    
    // High score with trophy icon - MOVED UP
    fill(255, 215, 0);
    textSize(25);
    text("High Score: " + highScore, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20); // Moved up 90px
    
    // Trophy icon if new high score - MOVED UP
    if (score > highScore - 1) {
      push();
      translate(CANVAS_WIDTH / 2 - 120, CANVAS_HEIGHT / 2 - 25); // Moved up 90px
      fill(255, 215, 0);
      // Trophy cup
      rect(-10, -15, 20, 25, 2);
      rect(-15, -20, 30, 10, 5);
      // Trophy handles
      ellipse(-15, -10, 10, 15);
      ellipse(15, -10, 10, 15);
      pop();
    }
    
    // Name entry section - MOVED UP
    if (!nameEntryComplete) {
      if (!isEnteringName) {
        fill(255);
        textSize(20);
        text("Enter your name:", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20); // Moved up 90px
        
        // Name entry button
        fill(50, 50, 50);
        rect(CANVAS_WIDTH / 2 - 100, CANVAS_HEIGHT / 2 + 30, 200, 40, 5); // Moved up 90px
        
        fill(255);
        textSize(18);
        text("Click to enter name", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 55); // Moved up 90px
      } else {
        // Name entry field
        fill(255);
        textSize(20);
        text("Enter your name:", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20); // Moved up 90px
        
        // Name entry box
        fill(50, 50, 50);
        rect(CANVAS_WIDTH / 2 - 150, CANVAS_HEIGHT / 2 + 30, 300, 40, 5); // Moved up 90px
        
        // Display entered name with blinking cursor
        fill(255);
        textSize(18);
        textAlign(LEFT);
        
        // Blink cursor every 30 frames
        cursorBlinkTimer = (cursorBlinkTimer + 1) % 60;
        let displayText = playerName;
        if (cursorBlinkTimer < 30) {
          displayText += "|";
        }
        
        text(displayText, CANVAS_WIDTH / 2 - 140, CANVAS_HEIGHT / 2 + 55); // Moved up 90px
        
        // Instructions
        textAlign(CENTER);
        textSize(14);
        text("Press ENTER when done", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 80); // Moved up 90px
      }
    } else {
      // Display entered name
      fill(255);
      textSize(20);
      text("Player: " + playerName, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20); // Moved up 90px
      
      // Draw leaderboard - MOVED UP
      drawLeaderboard();
    }
    
    // Function to draw the Turbo Gods message
    function drawTurboGodsMessage() {
      fill(0, 255, 255); // Cyan color for a mystical feel
      textSize(22);
      textAlign(CENTER, CENTER); // Ensure text is centered both horizontally and vertically
      text("May the Turbo Gods Bring You Green Candles", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 230);
    }
    
    // Draw the Turbo Gods message
    drawTurboGodsMessage();
    
    // Only show restart button after minimum duration
    if (nameEntryComplete && gameOverTimer > MIN_GAME_OVER_DURATION) {
      let pulseSize = sin(frameCount * 0.1) * 2;
      fill(50, 50, 50);
      rect(CANVAS_WIDTH / 2 - 100, CANVAS_HEIGHT / 2 + 250, 200, 50, 10); // Centered
      
      fill(255);
      textSize(18 + pulseSize);
      textAlign(CENTER, CENTER); // Ensure text is centered both horizontally and vertically
      text("Press ENTER to restart", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 275); // Centered
    } else if (nameEntryComplete) {
      // Show a "wait" message until minimum duration is reached
      let remainingTime = ceil((MIN_GAME_OVER_DURATION - gameOverTimer) / 60);
      fill(200, 200, 200);
      textSize(16);
      textAlign(CENTER, CENTER);
      text("Restart available in " + remainingTime + "s", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 275);
    }
    
    pop();
    
    // Update and draw any remaining meme texts
    for (let i = memeTexts.length - 1; i >= 0; i--) {
      let memeText = memeTexts[i];
      memeText.update();
      memeText.draw();
      if (memeText.isDead()) {
        memeTexts.splice(i, 1);
      }
    }
  }
  
  pop(); // End the translation
}

// **Key Pressed Function**
function keyPressed() {
  if (gameState === "start") {
    // Start game on any key
    updateGameState("playing");
    resetGame();
  } else if (gameState === "game over") {
    if (isEnteringName) {
      // Handle name entry
      if (keyCode === ENTER) {
        // Complete name entry and save score
        completeNameEntry();
      } else if (keyCode === BACKSPACE) {
        // Remove last character
        playerName = playerName.slice(0, -1);
      } else if (keyCode >= 32 && keyCode <= 126 && playerName.length < MAX_NAME_LENGTH) {
        // Add character if it's a printable ASCII character and name isn't too long
        playerName += key;
      }
    } else if (nameEntryComplete && keyCode === ENTER && gameOverTimer > MIN_GAME_OVER_DURATION) {
      // Restart game after name entry is complete AND minimum duration has passed
      updateGameState("playing");
      resetGame();
    }
  }
}

// Function to reset the game
function resetGame() {
    score = 0;
    lives = STARTING_LIVES;
    waveNumber = 1;
    enemyDirection = 1;
    player = new Player();
    enemies = [];
    playerBullets = [];
    enemyBullets = [];
    powerups = [];
    activePowerups = [];
    combo = 0;
    comboTimer = 0;
    memeTexts = [];
    gameShakeAmount = 0;
    isEnteringName = false;
    nameEntryComplete = false;
    playerName = "";
    gameOverTimer = 0;
    initializeWave();
}

// Make resetGame globally accessible
window.resetGame = resetGame;

// Add a new PowerUp class
class PowerUp {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 15;
    this.height = 15;
    this.type = POWERUP_TYPES[Math.floor(random(POWERUP_TYPES.length))];
    this.speed = 2;
    this.rotation = 0;
  }
  
  update() {
    this.y += this.speed;
    this.rotation += 0.05;
  }
  
  draw() {
    push();
    translate(this.x, this.y);
    rotate(this.rotation);
    
    switch(this.type) {
      case "TRIPLE_SHOT":
        fill(255, 0, 255); // Magenta
        triangle(-8, 8, 0, -8, 8, 8);
        break;
      case "SHIELD":
        fill(0, 191, 255); // Deep sky blue
        arc(0, 0, 16, 16, PI, TWO_PI);
        break;
      case "SPEED_BOOST":
        // Turbocharger icon
        // Main turbo body
        fill(220, 220, 220); // Silver
        ellipse(0, 0, 14, 14);
        
        // Center hole
        fill(50, 50, 50); // Dark gray
        ellipse(0, 0, 6, 6);
        
        // Intake pipe
        fill(180, 180, 180);
        rect(-10, -3, 6, 6, 1);
        
        // Exhaust pipe
        fill(180, 180, 180);
        rect(4, -3, 6, 6, 1);
        
        // Compressor blades (animated)
        stroke(100, 100, 100);
        strokeWeight(1);
        for (let i = 0; i < 4; i++) {
          let angle = frameCount * 0.2 + i * PI/2;
          line(0, 0, 3 * cos(angle), 3 * sin(angle));
        }
        noStroke();
        break;
      case "BOMB":
        fill(255, 0, 0); // Red
        ellipse(0, 0, 12, 12);
        stroke(0);
        line(0, -6, 0, -10);
        noStroke();
        break;
      case "JEET_STOMPER":
        // Boot shape
        fill(139, 69, 19); // Brown
        rect(-6, -2, 12, 10, 2, 2, 0, 0); // Boot top
        fill(101, 67, 33); // Darker brown
        rect(-8, 8, 16, 4, 0, 0, 2, 2); // Boot sole
        // Red "X" over a small Jeet silhouette
        fill(255, 0, 0, 200);
        ellipse(0, -6, 6, 6); // Head
        line(-4, -4, 4, 4);
        line(4, -4, -4, 4);
        break;
    }
    
    pop();
  }
  
  isOffScreen() {
    return this.y > CANVAS_HEIGHT;
  }
}

// Add a MemeText class for floating text effects
class MemeText {
  constructor(x, y, text, size = 20, color = [255, 255, 255]) {
    this.x = x;
    this.y = y;
    this.text = text;
    this.size = size;
    this.color = color;
    this.alpha = 255;
    this.life = 60; // 1 second
    this.xSpeed = random(-1, 1);
    this.ySpeed = -2;
  }
  
  update() {
    this.x += this.xSpeed;
    this.y += this.ySpeed;
    this.life--;
    this.alpha = map(this.life, 0, 60, 0, 255);
  }
  
  draw() {
    push();
    textAlign(CENTER);
    textSize(this.size);
    fill(this.color[0], this.color[1], this.color[2], this.alpha);
    text(this.text, this.x, this.y);
    pop();
  }
  
  isDead() {
    return this.life <= 0;
  }
}

// Add a helper function to spawn extra powerups periodically
function spawnBonusPowerup() {
  if (frameCount % 600 === 0 && gameState === "playing") { // Every 10 seconds
    let x = random(50, width - 50);
    let y = 50;
    powerups.push(new PowerUp(x, y));
    memeTexts.push(new MemeText(x, y - 20, "BONUS!", 15, [255, 215, 0]));
  }
}

// Add a function to draw the console frame
function drawConsoleFrame() {
  // Draw the outer console frame
  push();
  
  // Main console body - extend it lower to incorporate the buttons
  fill(FRAME_COLOR);
  noStroke();
  rect(0, 0, FRAME_WIDTH, FRAME_HEIGHT + 60, 20); // Added 60px to height
  
  // Game screen area (slightly inset)
  fill(FRAME_ACCENT);
  rect((FRAME_WIDTH - CANVAS_WIDTH) / 2 - 10, 
       (FRAME_HEIGHT - CANVAS_HEIGHT) / 2 - 40, 
       CANVAS_WIDTH + 20, 
       CANVAS_HEIGHT + 50, 
       15);
  
  // Console name at the top
  fill(255, 255, 0);
  textSize(24);
  textAlign(CENTER);
  text(CONSOLE_NAME, FRAME_WIDTH / 2, 35);
  
  // Small decorative lights
  fill(0, 255, 0, 150); // Green LED
  ellipse(FRAME_WIDTH - 40, 30, 10, 10);
  
  fill(255, 0, 0, frameCount % 60 < 30 ? 200 : 50); // Blinking red LED
  ellipse(FRAME_WIDTH - 70, 30, 8, 8);
  
  pop();
}

// Function to draw the control buttons
function drawControlButtons() {
  let buttonY = FRAME_HEIGHT - 70;
  let centerX = FRAME_WIDTH / 2;
  
  // Left arrow
  fill(80, 80, 85);
  rect(centerX - 140, buttonY, 40, 40, 5);
  fill(255);
  triangle(
    centerX - 130, buttonY + 20,
    centerX - 110, buttonY + 10,
    centerX - 110, buttonY + 30
  );
  textSize(12);
  text("MOVE", centerX - 120, buttonY + 50);
  
  // Right arrow
  fill(80, 80, 85);
  rect(centerX - 80, buttonY, 40, 40, 5);
  fill(255);
  triangle(
    centerX - 50, buttonY + 20,
    centerX - 70, buttonY + 10,
    centerX - 70, buttonY + 30
  );
  
  // Space bar
  fill(80, 80, 85);
  rect(centerX + 20, buttonY, 100, 40, 5);
  fill(255);
  textSize(14);
  text("FIRE", centerX + 70, buttonY + 25);
  textSize(12);
  text("SPACE", centerX + 70, buttonY + 50);
}

// Add mousePressed function to handle clicking on the name entry button
function mousePressed() {
  // Start the game from the start screen with a mouse click
  if (gameState === "start") {
    updateGameState("playing");
    resetGame();
    return;
  }
  
  // Handle game over restart with mouse click
  if (gameState === "game over" && nameEntryComplete && gameOverTimer > MIN_GAME_OVER_DURATION) {
    // Check if click is within the restart button area
    let buttonX = CANVAS_WIDTH / 2 - 100;
    let buttonY = CANVAS_HEIGHT / 2 + 120; // Position of the restart button
    let buttonWidth = 200;
    let buttonHeight = 40;
    
    // Adjust for canvas position within the frame
    let adjustedMouseX = mouseX - (FRAME_WIDTH - CANVAS_WIDTH) / 2;
    let adjustedMouseY = mouseY - ((FRAME_HEIGHT - CANVAS_HEIGHT) / 2 - 30);
    
    if (adjustedMouseX >= buttonX && 
        adjustedMouseX <= buttonX + buttonWidth &&
        adjustedMouseY >= buttonY && 
        adjustedMouseY <= buttonY + buttonHeight) {
      // Restart the game
      updateGameState("playing");
      resetGame();
      return;
    }
  }
  
  // Existing code for name entry button
  if (gameState === "game over" && !isEnteringName && !nameEntryComplete) {
    // Check if click is within the name entry button
    let buttonX = CANVAS_WIDTH / 2 - 100;
    let buttonY = CANVAS_HEIGHT / 2 + 30; // Updated position
    let buttonWidth = 200;
    let buttonHeight = 40;
    
    // Adjust for canvas position within the frame
    let adjustedMouseX = mouseX - (FRAME_WIDTH - CANVAS_WIDTH) / 2;
    let adjustedMouseY = mouseY - ((FRAME_HEIGHT - CANVAS_HEIGHT) / 2 - 30);
    
    if (adjustedMouseX >= buttonX && 
        adjustedMouseX <= buttonX + buttonWidth &&
        adjustedMouseY >= buttonY && 
        adjustedMouseY <= buttonY + buttonHeight) {
      isEnteringName = true;
      playerName = "";
    }
  }
}

// Also, let's add a visible restart button to the game over screen
// Find the section that draws the game over screen and add this:
function drawGameOverScreen() {
  // ... existing game over screen code ...
  
  // Add a visible restart button if name entry is complete
  if (nameEntryComplete && gameOverTimer > MIN_GAME_OVER_DURATION) {
    // Draw restart button
    fill(50, 150, 50); // Green button
    rect(CANVAS_WIDTH / 2 - 100, CANVAS_HEIGHT / 2 + 120, 200, 40, 10);
    
    // Button text
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(20);
    text("PLAY AGAIN", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 140);
    
    // Check if the button is clicked
    if (mouseIsPressed) {
      let buttonX = CANVAS_WIDTH / 2 - 100;
      let buttonY = CANVAS_HEIGHT / 2 + 120;
      let buttonWidth = 200;
      let buttonHeight = 40;
      
      // Adjust for canvas position
      let adjustedMouseX = mouseX - (FRAME_WIDTH - CANVAS_WIDTH) / 2;
      let adjustedMouseY = mouseY - ((FRAME_HEIGHT - CANVAS_HEIGHT) / 2 - 30);
      
      if (adjustedMouseX >= buttonX && 
          adjustedMouseX <= buttonX + buttonWidth &&
          adjustedMouseY >= buttonY && 
          adjustedMouseY <= buttonY + buttonHeight) {
        // Restart the game
        updateGameState("playing");
        resetGame();
      }
    }
  }
}

// Debug function to check what's available in the global scope
function debugSupabase() {
  console.log("Debugging Supabase:");
  console.log("window.supabase:", typeof window.supabase);
  console.log("window.supabaseJs:", typeof window.supabaseJs);
  console.log("window.createClient:", typeof window.createClient);
  
  // Check if the Supabase object has a createClient method
  if (typeof window.supabase !== 'undefined') {
    console.log("supabase.createClient:", typeof window.supabase.createClient);
  }
}

// Initialize Supabase client - simplified approach
function initSupabase() {
  try {
    // Check if supabase is available
    if (typeof createClient !== 'function') {
      console.error("Supabase createClient function not available");
      return false;
    }
    
    // Create the Supabase client
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log("Supabase client created:", supabase);
    return true;
  } catch (e) {
    console.error("Error initializing Supabase:", e);
    return false;
  }
}

// Function to save score to leaderboard
async function saveScore(name, score) {
  if (!supabase) {
    console.error("Cannot save score: Supabase client not initialized");
    return;
  }
  
  console.log(`Saving score: ${name} - ${score}`);
  
  try {
    const { data, error } = await supabase
      .from('leaderboard')
      .insert([
        { player_name: name, score: score, game_date: new Date().toISOString() }
      ]);
      
    if (error) {
      console.error("Error saving score:", error);
    } else {
      console.log("Score saved successfully:", data);
      // Refresh leaderboard after saving
      await fetchLeaderboard();
    }
  } catch (err) {
    console.error("Exception saving score:", err);
  }
}

// Function to fetch top scores
async function fetchLeaderboard() {
  try {
    console.log("Fetching leaderboard data directly...");
    
    // Check if supabase client exists
    if (!supabase) {
      console.error("Supabase client not initialized");
      isLoadingLeaderboard = false;
      return;
    }
    
    // Use the correct syntax for querying the leaderboard table
    let { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .order('score', { ascending: false })
      .limit(10);
    
    console.log("Raw leaderboard response:", { data, error });
    
    if (error) {
      console.error("Error fetching leaderboard:", error);
      isLoadingLeaderboard = false;
      return;
    }
    
    if (!data || data.length === 0) {
      console.log("No leaderboard data returned");
      isLoadingLeaderboard = false;
      return;
    }
    
    // Store the data and log success
    leaderboard = data;
    console.log("Leaderboard data fetched successfully:", leaderboard);
    
    // Set loading flag to false
    isLoadingLeaderboard = false;
  } catch (e) {
    console.error("Exception fetching leaderboard:", e);
    isLoadingLeaderboard = false;
  }
}

// Modify the name entry completion to save score
function completeNameEntry() {
  isEnteringName = false;
  nameEntryComplete = true;
  
  // Save score to Supabase
  if (playerName.trim() !== "") {
    saveScore(playerName, score);
  }
}

// Add leaderboard display to the game over screen
function drawLeaderboard() {
  fill(30, 30, 50);
  rect(CANVAS_WIDTH / 2 - 150, CANVAS_HEIGHT / 2 + 40, 300, 160, 10);
  
  fill(255, 215, 0);
  textSize(20);
  textAlign(CENTER);
  text("TOP TURBOS", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 65);
  
  // Debug info
  console.log("Drawing leaderboard. supabase:", supabase ? "exists" : "null", 
              "leaderboard:", leaderboard ? `has ${leaderboard.length} entries` : "empty",
              "isLoadingLeaderboard:", isLoadingLeaderboard);
  
  // Check if we have leaderboard data
  if (leaderboard && leaderboard.length > 0) {
    textAlign(LEFT);
    fill(255);
    textSize(16);
    
    for (let i = 0; i < Math.min(leaderboard.length, 5); i++) {
      const entry = leaderboard[i];
      const yPos = CANVAS_HEIGHT / 2 + 95 + (i * 25);
      
      // Rank
      text((i + 1) + ".", CANVAS_WIDTH / 2 - 130, yPos);
      
      // Name (handle both field name formats)
      const playerName = entry.player_name || entry.name || "Unknown";
      const displayName = playerName.length > 12 
        ? playerName.substring(0, 12) + "..." 
        : playerName;
      text(displayName, CANVAS_WIDTH / 2 - 100, yPos);
      
      // Score (right-aligned)
      textAlign(RIGHT);
      text(entry.score, CANVAS_WIDTH / 2 + 130, yPos);
      textAlign(LEFT);
    }
  } else if (isLoadingLeaderboard) {
    fill(255);
    textSize(16);
    text("Loading leaderboard...", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 95);
  } else {
    fill(255);
    textSize(16);
    text("No scores yet. Be the first!", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 95);
  }
  
  // Add a refresh button
  fill(50, 100, 200);
  rect(CANVAS_WIDTH / 2 + 100, CANVAS_HEIGHT / 2 + 40, 40, 20, 5);
  fill(255);
  textSize(12);
  textAlign(CENTER, CENTER);
  text("Refresh", CANVAS_WIDTH / 2 + 120, CANVAS_HEIGHT / 2 + 50);
  
  // Check if refresh button is clicked
  if (mouseIsPressed) {
    let buttonX = CANVAS_WIDTH / 2 + 100;
    let buttonY = CANVAS_HEIGHT / 2 + 40;
    let buttonWidth = 40;
    let buttonHeight = 20;
    
    // Adjust for canvas position
    let adjustedMouseX = mouseX - (FRAME_WIDTH - CANVAS_WIDTH) / 2;
    let adjustedMouseY = mouseY - ((FRAME_HEIGHT - CANVAS_HEIGHT) / 2 - 30);
    
    if (adjustedMouseX >= buttonX && 
        adjustedMouseX <= buttonX + buttonWidth &&
        adjustedMouseY >= buttonY && 
        adjustedMouseY <= buttonY + buttonHeight) {
      console.log("Refresh button clicked, fetching leaderboard...");
      isLoadingLeaderboard = true;
      fetchLeaderboard();
    }
  }
}

// Test Supabase connection
async function testSupabaseConnection() {
  try {
    console.log("Testing Supabase connection...");
    // Try a simple query to test the connection
    const { data, error } = await supabase
      .from('leaderboard')  // Use 'leaderboard' instead of 'scores'
      .select('count')
      .limit(1);
    
    if (error) {
      console.error("Supabase connection test failed:", error);
      return false;
    }
    
    console.log("Supabase connection successful:", data);
    return true;
  } catch (e) {
    console.error("Exception during Supabase connection test:", e);
    return false;
  }
}

// Update the updateCombo function to remove the floating text
function updateCombo() {
  if (comboTimer > 0) {
    comboTimer--;
    if (comboTimer === 0) {
      combo = 0;
    }
  }
  
  // Display combo counter (only in HUD, not as floating text)
  if (combo > 1) {
    push();
    textAlign(LEFT);
    textSize(16);
    fill(255, 255, 0);
    text("Combo: " + combo + "x", 20, 80);
    pop();
  }
}

// Update the enemy hit function to remove the combo text
function handleEnemyHit(enemy, bullet, bulletIndex) {
  // Remove the bullet
  playerBullets.splice(bulletIndex, 1);
  
  // Reduce enemy health
  enemy.health--;
  
  // Add screen shake for impact
  gameShakeAmount = 2;
  
  // If enemy is destroyed
  if (enemy.health <= 0) {
    // Update combo
    combo++;
    comboTimer = COMBO_DURATION;
    
    // Calculate score with combo multiplier
    let scoreGain = 10 * combo;
    score += scoreGain;
    
    // Add score text (but not combo text)
    memeTexts.push(new MemeText(enemy.x, enemy.y, "+" + scoreGain, 15, [255, 255, 0]));
    
    // Add witty destruction message based on enemy type
    if (ENEMY_DESCRIPTIONS[enemy.type]) {
      let messages = ENEMY_DESCRIPTIONS[enemy.type];
      let randomMessage = messages[Math.floor(Math.random() * messages.length)];
      memeTexts.push(new MemeText(enemy.x, enemy.y - 20, randomMessage, 15, [255, 255, 255]));
    }
    
    // Chance to drop a powerup
    if (random() < POWERUP_PROBABILITY) {
      powerups.push(new PowerUp(enemy.x, enemy.y));
    }
    
    // Remove the enemy
    return true;
  }
  
  return false;
}

// Look for the function that displays the leaderboard
// It might be called displayLeaderboard or something similar

// Find where the leaderboard is being displayed and modify the error message
function displayLeaderboard() {
  // If leaderboard data is available, display it
  if (leaderboardData && leaderboardData.length > 0) {
    // Display leaderboard as normal
    textAlign(CENTER);
    fill(255, 255, 0);
    textSize(24);
    text("TOP TURBOS", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 100);
    
    // Display leaderboard entries
    textAlign(LEFT);
    fill(255);
    textSize(16);
    let yPos = CANVAS_HEIGHT / 2 - 60;
    for (let i = 0; i < Math.min(leaderboardData.length, 5); i++) {
      let entry = leaderboardData[i];
      text((i + 1) + ". " + entry.name + " - " + entry.score, CANVAS_WIDTH / 2 - 100, yPos);
      yPos += 25;
    }
  } else {
    // Display a more friendly message when leaderboard is unavailable
    textAlign(CENTER);
    fill(255, 255, 0);
    textSize(24);
    text("TOP TURBOS", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 100);
    
    fill(255);
    textSize(16);
    text("Loading scores...", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 60);
    
    // Add a small note about refreshing
    textSize(14);
    fill(200);
    text("Scores will appear after your first game", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 30);
  }
}

// Also look for the fetchLeaderboard function and make sure it's handling errors properly
async function fetchLeaderboard() {
  try {
    // Existing code to fetch leaderboard
    const { data, error } = await supabase
      .from('scores')
      .select('*')
      .order('score', { ascending: false })
      .limit(10);
    
    if (error) {
      console.error("Error fetching leaderboard:", error);
      return;
    }
    
    leaderboardData = data;
    console.log("Leaderboard data:", leaderboardData);
  } catch (e) {
    console.error("Exception fetching leaderboard:", e);
  }
}

// Find where gameState is defined and make sure it's exposed to the window object
// Add this near the top of your sketch.js file, where gameState is defined

// Make sure gameState is accessible from window
function updateGameState(newState) {
  gameState = newState;
  window.gameState = newState;
  console.log("Game state updated to:", newState);
}

// Then find all places where gameState is changed and replace them with updateGameState
// For example:
// gameState = "playing"; becomes updateGameState("playing");
// gameState = "game over"; becomes updateGameState("game over");
// gameState = "start"; becomes updateGameState("start");

// Add this function for manual debugging
window.checkLeaderboard = async function() {
  console.log("Manually checking leaderboard...");
  
  if (!supabase) {
    console.error("Supabase client not initialized");
    return;
  }
  
  try {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .order('score', { ascending: false });
    
    console.log("Manual leaderboard check result:", { data, error });
    
    if (data && data.length > 0) {
      console.log("Leaderboard entries found:", data.length);
      data.forEach((entry, i) => {
        console.log(`${i+1}. ${entry.player_name || 'Unknown'}: ${entry.score}`);
      });
    } else {
      console.log("No leaderboard entries found");
    }
  } catch (e) {
    console.error("Error in manual leaderboard check:", e);
  }
};

// Now let's create a direct Supabase initialization function that doesn't rely on external files
function directInitSupabase() {
  try {
    console.log("Directly initializing Supabase with hardcoded credentials");
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log("Supabase client created directly:", supabase);
    return true;
  } catch (e) {
    console.error("Error in direct Supabase initialization:", e);
    return false;
  }
}

// In the setup function, replace the Supabase initialization with this:
try {
  console.log("Attempting direct Supabase initialization...");
  
  // Use direct initialization with hardcoded credentials
  supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  console.log("Supabase client created directly:", supabase);
  
  // Immediately fetch leaderboard
  fetchLeaderboard();
} catch (e) {
  console.error("Supabase initialization failed completely:", e);
  console.log("Game will run without leaderboard functionality");
  isLoadingLeaderboard = false;
}

// Add this function to your sketch.js file
window.resizeCanvas = function(w, h) {
  resizeCanvas(w, h);
  console.log("Canvas resized to", w, "x", h);
  
  // You might need to adjust game elements based on the new canvas size
  // For example, recalculate player position, etc.
};