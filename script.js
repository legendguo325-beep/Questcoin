let currentCoins = 100;
let bossMaxHP = 300;
let bossCurrentHP = 300;

document.addEventListener('DOMContentLoaded', () => {
  // Lock system event listener nodes smoothly
  document.getElementById('login-submit-btn').addEventListener('click', executeProfileLoginRegistration);
  document.getElementById('reg-gender').addEventListener('change', processIdentityChange);
  document.getElementById('reg-hair').addEventListener('change', processHairChange);
  document.getElementById('boss-attack-btn').addEventListener('click', strikeBoss);
  document.getElementById('btn-cyber').addEventListener('click', () => buyItem(30, 'cyber', 'Armor'));
  document.getElementById('btn-weapon').addEventListener('click', () => buyItem(50, 'weapon', 'Weapon'));
});

function executeProfileLoginRegistration() {
  const chosenName = document.getElementById('reg-name').value.trim();
  if (chosenName === "") {
    alert("Profile Initialization Error: Codename cannot stand empty.");
    return;
  }

  document.getElementById('hud-name').innerText = chosenName.toUpperCase();
  document.getElementById('canvas-title').innerText = chosenName;
  
  processIdentityChange();
  processHairChange();

  document.getElementById('login-overlay-screen').style.display = "none";
  document.getElementById('main-cabinet-interface').style.display = "block";
  updateHUD();
}

function processIdentityChange() {
  const gender = document.getElementById('reg-gender').value;
  const bodyBaseNode = document.getElementById('pixel-body-base');
  
  // Custom baseline palette tweaks can be mapped right here if desired
  if (gender === 'female') {
    document.documentElement.style.setProperty('--outfit-dark', '#1e2d24'); // Switches jacket highlights to emerald hue
  } else {
    document.documentElement.style.setProperty('--outfit-dark', '#12131a'); // Reverts to traditional midnight charcoal darks
  }
}

function processHairChange() {
  const selectedHairClass = document.getElementById('reg-hair').value;
  document.getElementById('pixel-hair-node').className = 'pixel-layer ' + selectedHairClass;
}

function updateHUD() {
  document.getElementById('coin-total').innerText = currentCoins;
}

function strikeBoss() {
  if (bossCurrentHP <= 0) return;
  bossCurrentHP -= 1;
  
  const spriteNode = document.getElementById('boss-sprite');
  spriteNode.style.transform = "scale(0.8) rotate(5deg)";
  setTimeout(() => { spriteNode.style.transform = "none"; }, 60);

  document.getElementById('hp-text').innerText = bossCurrentHP;
  document.getElementById('boss-health-fill').style.width = ((bossCurrentHP / bossMaxHP) * 100) + "%";

  if (bossCurrentHP <= 0) {
    currentCoins += 50;
    updateHUD();
    spriteNode.innerText = "💀";
    document.getElementById('boss-attack-btn').disabled = true;
    document.getElementById('boss-attack-btn').innerText = "RAID DEFEATED";
  }
}

function buyItem(price, itemId, slotType) {
  if (currentCoins >= price) {
    currentCoins -= price;
    updateHUD();

    // 🟢 Magic Layer Stacking: Updates equipment class elements without wiping underneath styles!
    if (slotType === 'Armor') {
      document.getElementById('pixel-armor-node').className = 'pixel-layer armor-captain-cloak';
    } else if (slotType === 'Weapon') {
      document.getElementById('pixel-weapon-node').className = 'pixel-layer weapon-plasma-blade';
    }

    document.getElementById('active-perk').innerText = "⚡ PREMIUM EQUIPMENT DETECTED";
    const triggerBtn = document.getElementById(`btn-${itemId}`);
    triggerBtn.innerText = "EQUIPPED";
    triggerBtn.disabled = true;
  } else {
    alert("Transaction Denied: Accumulate more currency values via mainframe clicking cycles.");
  }
}

