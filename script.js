let currentCoins = 200; // 💎 Initialized directly to 200 coins
let heroMaxHP = 100;
let heroCurrentHP = 100;
let bossMaxHP = 300;
let bossCurrentHP = 300;
let hasWeaponEquipped = false;
let hasArmorEquipped = false;

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('login-submit-btn').addEventListener('click', executeProfileLoginRegistration);
  document.getElementById('reg-gender').addEventListener('change', renderLiveBaseLayout);
  document.getElementById('reg-hair').addEventListener('change', renderLiveBaseLayout);
  document.getElementById('btn-cyber').addEventListener('click', () => triggerPurchaseProcess(30, 'Armor'));
  document.getElementById('btn-weapon').addEventListener('click', () => triggerPurchaseProcess(50, 'Weapon'));
  renderLiveBaseLayout();
});

function renderLiveBaseLayout() {
  const gender = document.getElementById('reg-gender').value;
  const hair = document.getElementById('reg-hair').value;
  document.getElementById('pixel-base-gender').className = 'pixel-layer ' + (gender === 'male' ? 'base-male-hd' : 'base-female-hd');
  document.getElementById('pixel-hair-node').className = 'pixel-layer ' + hair;
}

function executeProfileLoginRegistration() {
  const name = document.getElementById('reg-name').value.trim();
  if (name === "") { alert("Profile Error: Codename required."); return; }
  document.getElementById('hud-name').innerText = name.toUpperCase();
  document.getElementById('canvas-title').innerText = name;
  const canvasNode = document.getElementById('signup-preview-avatar');
  const targetStageAnchor = document.getElementById('stage-hero-anchor');
  if (canvasNode && targetStageAnchor) { canvasNode.style.transform = "scale(1.0)"; targetStageAnchor.appendChild(canvasNode); }
  document.getElementById('login-overlay-screen').style.display = "none";
  document.getElementById('main-cabinet-interface').style.display = "block";
  initializeCombatArenaClock();
}

function triggerPurchaseProcess(coinPrice, slotType) {
  if (currentCoins >= coinPrice) {
    currentCoins -= coinPrice; document.getElementById('coin-total').innerText = currentCoins;
    if (slotType === 'Armor') {
      hasArmorEquipped = true; document.getElementById('pixel-armor-node').className = 'pixel-layer armor-gold-guards';
      document.getElementById('skill-3').classList.remove('locked'); document.getElementById('btn-cyber').innerText = "EQUIPPED"; document.getElementById('btn-cyber').disabled = true;
    } else if (slotType === 'Weapon') {
      hasWeaponEquipped = true; document.getElementById('pixel-weapon-node').className = 'pixel-layer weapon-plasma-sword';
      document.getElementById('skill-1').classList.remove('locked'); document.getElementById('skill-2').classList.remove('locked'); document.getElementById('btn-weapon').innerText = "EQUIPPED"; document.getElementById('btn-weapon').disabled = true;
    }
    if (hasWeaponEquipped && hasArmorEquipped) document.getElementById('skill-4').classList.remove('locked');
  } else { alert("Insufficient coin balance."); }
}



