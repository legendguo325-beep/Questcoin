// MEMORY STATE MANAGEMENT GLOBAL REGISTERS
let currentCoins = 100;
let bossMaxHP = 300;
let bossCurrentHP = 300;

const baselineGenderAvatars = {
  male: '🧑‍🚀',
  female: '👩‍🚀'
};

// FLOW DIRECTION A: PROFILE LOGIN PROCESSING ENGINE
function executeProfileLoginRegistration() {
  const chosenName = document.getElementById('reg-name').value.trim();
  const chosenGender = document.getElementById('reg-gender').value;
  const chosenHair = document.getElementById('reg-hair').value;

  if (chosenName === "") {
    alert("Profile Initialization Error: Codename cannot stand empty.");
    return;
  }

  // Bind parameters straight into main page hud interface elements
  document.getElementById('hud-name').innerText = chosenName.toUpperCase();
  document.getElementById('canvas-title').innerText = chosenName;
  document.getElementById('canvas-sprite').innerText = baselineGenderAvatars[chosenGender];
  document.getElementById('canvas-hair').innerText = chosenHair;

  // Clear Gating screen layers and fade operational system grids into active view
  document.getElementById('login-overlay-screen').style.display = "none";
  document.getElementById('main-cabinet-interface').style.display = "block";
  
  updateHUD();
}

function updateHUD() {
  document.getElementById('coin-total').innerText = currentCoins;
}

// FLOW DIRECTION B: MANUAL HIT PROCESS COMBAT ROUTINES
function strikeBoss() {
  if (bossCurrentHP <= 0) return;

  bossCurrentHP -= 1;
  const spriteNode = document.getElementById('boss-sprite');
  
  // Launch Crimson Impact Filter Effects
  spriteNode.style.filter = "invert(17%) sepia(99%) saturate(7391%) hue-rotate(344deg) brightness(86%) contrast(116%)";
  spriteNode.style.transform = "scale(0.85)";

  setTimeout(() => {
    spriteNode.style.filter = "none";
    spriteNode.style.transform = "none";
  }, 60);

  document.getElementById('hp-text').innerText = bossCurrentHP;
  document.getElementById('boss-health-fill').style.width = ((bossCurrentHP / bossMaxHP) * 100) + "%";

  if (bossCurrentHP <= 0) {
    currentCoins += 50;
    updateHUD();

    spriteNode.innerText = "💀";
    document.getElementById('boss-label').innerText = "NODE EXCAVATED / DESTROYED";
    document.getElementById('boss-attack-btn').disabled = true;
    document.getElementById('boss-attack-btn').innerText = "RAID COMPLETE";
    alert("RAID DEFEATED! 50 Coins transferred securely into user wallet ledger balances.");
  }
}

// FLOW DIRECTION C: VENDOR PURCHASING ENGINE HOOKS
function buyItem(price, itemId, slotType, skinGlyph) {
  if (currentCoins >= price) {
    currentCoins -= price;
    updateHUD();

    // Dynamically render item changes right onto the hero's avatar template
    if (slotType === 'Skin') {
      document.getElementById('canvas-sprite').innerText = skinGlyph;
    } else if (slotType === 'Weapon') {
      // Append weapon glyph alongside character metadata display strings
      document.getElementById('canvas-title').innerText += ` [${skinGlyph}]`;
    }

    document.getElementById('active-perk').innerText = "⚡ PREMIUM ARMAMENTS LOCKED";
    
    const triggerBtn = document.getElementById(`btn-${itemId}`);
    triggerBtn.innerText = "EQUIPPED";
    triggerBtn.disabled = true;
  } else {
    alert("Transaction Denied: Accumulate more currency values via mainframe clicking cycles.");
  }
}
