let currentCoins = 100;

// ==========================================================================
// 🕹️ REAL-TIME ARCADE VECTOR ENGINE CORE CONFIGURATIONS
// ==========================================================================
let gameCanvas, ctx;
let gameLoopInterval;
let keysPressed = {};

// Hero Game-Loop State Metrics
let playerX = 80;
let playerY = 190;
let playerSpeed = 3.5;
let playerRadius = 14;
let playerMaxHP = 100;
let playerCurrentHP = 100;
let playerIsAttacking = false;
let playerAttackTimer = 0;

// Minotaur Boss Game-Loop State Metrics
let bossX = 380;
let bossY = 190;
let bossMaxHP = 100; 
let bossCurrentHP = 100;
let bossIsAttacking = false;
let bossAttackTimer = 0;
let bossAttackCooldown = 0;

// Dynamic Drawing Palette Configs
let chosenHairHexColor = "#3baee3";

document.addEventListener('DOMContentLoaded', () => {
  // Bind core interface execution event listener nodes securely
  document.getElementById('login-submit-btn').addEventListener('click', executeProfileLoginRegistration);
  document.getElementById('reg-gender').addEventListener('change', processIdentityChange);
  document.getElementById('reg-hair').addEventListener('change', processHairChange);
  document.getElementById('btn-cyber').addEventListener('click', () => buyItem(30, 'cyber', 'Acc'));
  document.getElementById('btn-weapon').addEventListener('click', () => buyItem(50, 'weapon', 'Weapon'));
  document.getElementById('respawn-arena-btn').addEventListener('click', resetBattleArenaSystem);

  // Initialize form modal values on fresh boot configurations
  processIdentityChange();
  processHairChange();
});

// ==========================================================================
// 🐙 CHROME EXTENSION REAL-TIME BACKGROUND GOOGLE SEARCH MONITOR
// ==========================================================================
if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.onUpdated) {
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
      // Address string analysis verifying live system search request patterns
      if (tab.url.includes("://google.com") || tab.url.includes("google.co.uk/search?q=") || tab.url.includes("google.com.au/search?q=")) {
        if (bossCurrentHP > 0 && playerCurrentHP > 0) {
          // Drops boss health pool by 1 point per actual background search query!
          bossCurrentHP -= 1;
          if (bossCurrentHP <= 0) {
            bossCurrentHP = 0;
            handleBossDefeatBounty();
          }
          // Safely update layout nodes if page context runs actively
          const hpTextNode = document.getElementById('hp-text');
          if (hpTextNode) hpTextNode.innerText = bossCurrentHP;
          const healthFillNode = document.getElementById('boss-health-fill');
          if (healthFillNode) healthFillNode.style.width = ((bossCurrentHP / bossMaxHP) * 100) + "%";
        }
      }
    }
  });
}

function executeProfileLoginRegistration() {
  const chosenName = document.getElementById('reg-name').value.trim();
  if (chosenName === "") {
    alert("Profile Initialization Error: Codename cannot stand empty.");
    return;
  }

  document.getElementById('hud-name').innerText = chosenName.toUpperCase();
  document.getElementById('canvas-title').innerText = chosenName;
  
  const liveCanvasElement = document.querySelector('.pixel-avatar-canvas');
  const dashboardWorkshopTarget = document.getElementById('dashboard-canvas-holder');
  
  if (liveCanvasElement && dashboardWorkshopTarget) {
    liveCanvasElement.style.transform = "scale(7.5)"; 
    dashboardWorkshopTarget.insertBefore(liveCanvasElement, document.getElementById('canvas-title'));
  }

  document.getElementById('login-overlay-screen').style.display = "none";
  document.getElementById('main-cabinet-interface').style.display = "block";
  updateHUD();

  // Run the 60-FPS action loop canvas initialization step
  initializeArcadeGameEngine();
}

function processIdentityChange() {
  const gender = document.getElementById('reg-gender').value;
  if (gender === 'female') {
    document.documentElement.style.setProperty('--sailor-red', '#ff5e97');
  } else {
    document.documentElement.style.setProperty('--sailor-red', '#cc2433');
  }
}
function processHairChange() {
  const selectedHairClass = document.getElementById('reg-hair').value;
  const hairLayerNode = document.getElementById('pixel-hair-node');
  if (hairLayerNode) {
    hairLayerNode.className = 'pixel-layer ' + selectedHairClass;
  }

  if (selectedHairClass === 'hair-anime-pink') chosenHairHexColor = "#e87fa3";
  else if (selectedHairClass === 'hair-anime-spiky') chosenHairHexColor = "#f58422";
  else chosenHairHexColor = "#3baee3";
}

function updateHUD() {
  document.getElementById('coin-total').innerText = currentCoins;
}

// ==========================================================================
// ⚔️ REAL-TIME INPUT LOOPS AND RENDERING MECHANICS
// ==========================================================================
function initializeArcadeGameEngine() {
  gameCanvas = document.getElementById('arcade-game-viewport');
  if (!gameCanvas) return;
  ctx = gameCanvas.getContext('2d');

  // Activate global window listening structures for input states
  window.addEventListener('keydown', (e) => { keysPressed[e.key.toLowerCase()] = true; });
  window.addEventListener('keyup', (e) => { keysPressed[e.key.toLowerCase()] = false; });
  gameCanvas.addEventListener('mousedown', triggerPlayerManualAttack);

  if (gameLoopInterval) clearInterval(gameLoopInterval);
  gameLoopInterval = setInterval(processArcadeGameFrameTick, 1000 / 60);
}

function processArcadeGameFrameTick() {
  updateGameStates();
  renderGameGraphics();
}

function updateGameStates() {
  if (playerCurrentHP <= 0 || bossCurrentHP <= 0) return;

  // Real-Time Position Vector Vector Changes
  if (keysPressed['w'] && playerY > playerRadius + 10) playerY -= playerSpeed;
  if (keysPressed['s'] && playerY < gameCanvas.height - playerRadius - 10) playerY += playerSpeed;
  if (keysPressed['a'] && playerX > playerRadius + 10) playerX -= playerSpeed;
  if (keysPressed['d'] && playerX < gameCanvas.width - playerRadius - 10) playerX += playerSpeed;

  if (playerIsAttacking) {
    playerAttackTimer--;
    if (playerAttackTimer <= 0) playerIsAttacking = false;
  }

  // Boss Cleave Strike Timer Loops
  if (bossAttackCooldown > 0) bossAttackCooldown--;
  if (bossIsAttacking) {
    bossAttackTimer--;
    if (bossAttackTimer <= 0) bossIsAttacking = false;
  }

  let dX = bossX - playerX;
  let dY = bossY - playerY;
  let gapDistance = Math.sqrt(dX * dX + dY * dY);

  // Trigger automated Minotaur radial sweeping slashes if player walks into hot-zone boundaries
  if (gapDistance < 85 && bossAttackCooldown <= 0 && !bossIsAttacking) {
    triggerBossSwipeAttack();
  }
}

function triggerPlayerManualAttack() {
  if (playerCurrentHP <= 0 || bossCurrentHP <= 0 || playerIsAttacking) return;

  playerIsAttacking = true;
  playerAttackTimer = 12;

  let dX = bossX - playerX;
  let dY = bossY - playerY;
  let currentDistance = Math.sqrt(dX * dX + dY * dY);

  if (currentDistance < 70) {
    bossCurrentHP -= 10; 
    if (bossCurrentHP <= 0) {
      bossCurrentHP = 0;
      handleBossDefeatBounty();
    }
  }
}

function triggerBossSwipeAttack() {
  bossIsAttacking = true;
  bossAttackTimer = 20; 
  bossAttackCooldown = 90; 

  let dX = playerX - bossX;
  let dY = playerY - bossY;
  let gapDistance = Math.sqrt(dX * dX + dY * dY);

  if (gapDistance < 85) {
    playerCurrentHP -= 20;
    if (playerCurrentHP <= 0) {
      playerCurrentHP = 0;
      document.getElementById('player-hp-badge').innerText = "HERO DEFEATED";
      document.getElementById('player-hp-badge').style.background = "rgba(255,0,127,0.2)";
      document.getElementById('player-hp-badge').style.color = "var(--neon-pink)";
      document.getElementById('respawn-arena-btn').style.display = "block";
    }
  }
}

function handleBossDefeatBounty() {
  currentCoins += 50;
  updateHUD();
  document.getElementById('player-hp-badge').innerText = "BOSS VANQUISHED";
  alert("VICTORY! Slay milestone complete. +50 Arcade Coins secured.");
}

function renderGameGraphics() {
  ctx.fillStyle = "#0c0d14"; ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);

  // Draw Arena Floor Mesh
  ctx.strokeStyle = "rgba(255, 255, 255, 0.03)"; ctx.lineWidth = 1;
  for (let g = 0; g < gameCanvas.width; g += 20) {
    ctx.beginPath(); ctx.moveTo(g, 0); ctx.lineTo(g, gameCanvas.height); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, g); ctx.lineTo(gameCanvas.width, g); ctx.stroke();
  }

  // GRAPHICS GENERATOR: DRAW PLAYER CHIBI UNIT
  if (playerCurrentHP > 0) {
    ctx.fillStyle = "rgba(0,0,0,0.4)"; ctx.beginPath(); ctx.arc(playerX, playerY + 12, 10, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#ffffff"; ctx.fillRect(playerX - 8, playerY, 16, 12); 
    ctx.fillStyle = "#cc2433"; ctx.fillRect(playerX - 3, playerY, 6, 4);    
    ctx.fillStyle = "#fff3e3"; ctx.beginPath(); ctx.arc(playerX, playerY - 4, 8, 0, Math.PI * 2); ctx.fill(); 

    ctx.fillStyle = chosenHairHexColor;
    ctx.fillRect(playerX - 9, playerY - 12, 18, 7);
    ctx.fillRect(playerX - 9, playerY - 8, 3, 8); ctx.fillRect(playerX + 6, playerY - 8, 3, 8);
    ctx.fillStyle = "#ff5e97"; ctx.fillRect(playerX - 4, playerY - 6, 2, 3); ctx.fillRect(playerX + 2, playerY - 6, 2, 3); 

    if (playerIsAttacking) {
      ctx.strokeStyle = "rgba(0, 237, 215, 0.8)"; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(playerX, playerY, 32, -Math.PI / 4, Math.PI / 4); ctx.stroke();
    }
    ctx.fillStyle = "#000000"; ctx.fillRect(playerX - 15, playerY - 22, 30, 4);
    ctx.fillStyle = "var(--neon-green)"; ctx.fillRect(playerX - 15, playerY - 22, (playerCurrentHP / playerMaxHP) * 30, 4);
  } else {
    ctx.font = "14px Arial"; ctx.fillText("💀", playerX - 6, playerY);
  }

  // GRAPHICS GENERATOR: DRAW MINOTAUR OVERLORD
  if (bossCurrentHP > 0) {
    ctx.fillStyle = "rgba(0,0,0,0.5)"; ctx.beginPath(); ctx.arc(bossX, bossY + 18, 16, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#5c4033"; ctx.fillRect(bossX - 16, bossY - 4, 32, 24); 
    ctx.fillStyle = "#8b5a2b"; ctx.fillRect(bossX - 12, bossY - 18, 24, 16); 
    ctx.fillStyle = "#ff0055"; ctx.fillRect(bossX - 7, bossY - 14, 3, 3); ctx.fillRect(bossX + 4, bossY - 14, 3, 3); 
    ctx.fillStyle = "#ffffff"; 
    ctx.fillRect(bossX - 15, bossY - 24, 4, 8); ctx.fillRect(bossX - 15, bossY - 24, 8, 4); 
    ctx.fillRect(bossX + 11, bossY - 24, 4, 8); ctx.fillRect(bossX + 7, bossY - 24, 8, 4);  

    if (bossIsAttacking) {
      ctx.strokeStyle = "rgba(255, 0, 127, 0.75)"; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.arc(bossX, bossY, 55, Math.PI - 0.8, Math.PI + 0.8); ctx.stroke(); 
    }
    ctx.fillStyle = "#000000"; ctx.fillRect(bossX - 25, bossY - 34, 50, 5);
    ctx.fillStyle = "var(--neon-pink)"; ctx.fillRect(bossX - 25, bossY - 34, (bossCurrentHP / bossMaxHP) * 50, 5);
  } else {
    ctx.font = "24px Arial"; ctx.fillText("☠️", bossX - 12, bossY + 4);
  }
}

function resetBattleArenaSystem() {
  playerCurrentHP = playerMaxHP; bossCurrentHP = bossMaxHP;
  playerX = 80; playerY = 190; bossX = 380; bossY = 190;
  document.getElementById('player-hp-badge').innerText = "HERO ALIVE";
  document.getElementById('player-hp-badge').style.background = "rgba(57,255,20,0.2)";
  document.getElementById('player-hp-badge').style.color = "var(--neon-green)";
  document.getElementById('respawn-arena-btn').style.display = "none";
}

function buyItem(price, itemId, slotType) {
  if (currentCoins >= price) {
    currentCoins -= price;
    updateHUD();

    if (slotType === 'Acc') {
      document.getElementById('pixel-acc-node').className = 'pixel-layer acc-black-bow';
    } else if (slotType === 'Weapon') {
      document.getElementById('pixel-weapon-node').className = 'pixel-layer weapon-plasma-blade';
      playerSpeed = 5.0; 
    }

    document.getElementById('active-perk').innerText = "⚡ COSMETIC AMENDMENTS EQUIPPED";
    const triggerBtn = document.getElementById(`btn-${itemId}`);
    triggerBtn.innerText = "EQUIPPED";
    triggerBtn.disabled = true;
  } else {
    alert("Transaction Denied: Accumulate more currency values via mainframe clicking cycles.");
  }
}


