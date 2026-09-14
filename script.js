let currentCoins = 200;
let heroMaxHP = 100;
let heroCurrentHP = 100;
let bossMaxHP = 300;
let bossCurrentHP = 300;
let hasWeaponEquipped = false;
let hasArmorEquipped = false;

// ==========================================================================
// ⏱️ COOLDOWN STATE METRICS (TRACKED IN MILLISECONDS)
// ==========================================================================
let cooldownTimers = {
  clickAttack: 0,
  skill1: 0,
  skill2: 0,
  skill3: 0,
  skill4: 0
};

const COOLDOWN_DURATIONS = {
  clickAttack: 150,  // 🟢 Tiny spammable 0.15 second cooldown!
  skill1: 1500,      // 1.5 seconds
  skill2: 4000,      // 4.0 seconds
  skill3: 6000,      // 6.0 seconds
  skill4: 10000      // 10.0 seconds
};

document.addEventListener('DOMContentLoaded', () => {
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(['questAccount'], (result) => {
      if (result.questAccount) {
        loadSavedAccountData(result.questAccount);
      }
    });
  }

  document.getElementById('login-submit-btn').addEventListener('click', executeProfileRegistration);
  document.getElementById('google-auth-btn').addEventListener('click', simulateGoogleSignIn);
  document.getElementById('reg-gender').addEventListener('change', renderLiveBaseLayout);
  document.getElementById('reg-hair').addEventListener('change', renderLiveBaseLayout);
  document.getElementById('btn-cyber').addEventListener('click', () => triggerPurchaseProcess(30, 'Armor'));
  document.getElementById('btn-weapon').addEventListener('click', () => triggerPurchaseProcess(50, 'Weapon'));
  document.getElementById('logout-btn').addEventListener('click', clearAccountSession);

  // Initialize click managers directly on the hotbar slot cards
  document.getElementById('skill-1').addEventListener('click', () => triggerHotkeyCast('1'));
  document.getElementById('skill-2').addEventListener('click', () => triggerHotkeyCast('2'));
  document.getElementById('skill-3').addEventListener('click', () => triggerPurchaseProcess(30, 'Armor')); // Prevents standalone card errors
  document.getElementById('skill-4').addEventListener('click', () => triggerHotkeyCast('4'));

  renderLiveBaseLayout();
});

// BACKGROUND BROWSER CHROME TABS LISTENERS
if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.onUpdated) {
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
      if (tab.url.includes("://google.com") || tab.url.includes("google.co.uk/search?q=") || tab.url.includes("google.com.au/search?q=")) {
        if (bossCurrentHP > 0 && heroCurrentHP > 0) {
          inflictDamageOnMinotaur(2, "Background Search Tracker");
        }
      }
    }
  });
}

function renderLiveBaseLayout() {
  const gender = document.getElementById('reg-gender').value;
  const hair = document.getElementById('reg-hair').value;
  document.getElementById('pixel-base-gender').className = 'pixel-layer ' + (gender === 'male' ? 'base-male-hd' : 'base-female-hd');
  document.getElementById('pixel-hair-node').className = 'pixel-layer ' + hair;
}

function simulateGoogleSignIn() {
  const googleNames = ["Alpha_Runner", "Cyber_Gamer", "Pixel_Hero", "Grid_Walker"];
  const randomGoogleUser = googleNames[Math.floor(Math.random() * googleNames.length)];
  document.getElementById('reg-name').value = randomGoogleUser;
  document.getElementById('gate-main-title').innerText = "✅ GOOGLE AUTH SUCCESS";
  document.getElementById('gate-main-title').style.color = "var(--neon-green)";
  document.getElementById('gate-sub-title').innerText = `Connected as: ${randomGoogleUser}@gmail.com. Configure character traits below to complete sync.`;
}

function executeProfileRegistration() {
  const name = document.getElementById('reg-name').value.trim();
  if (name === "") { alert("Profile Error: Codename parameters cannot remain vacant."); return; }
  const gender = document.getElementById('reg-gender').value;
  const hair = document.getElementById('reg-hair').value;

  const accountProfile = { username: name, gender: gender, hair: hair, coins: currentCoins };
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.set({ 'questAccount': accountProfile });
  }
  loadSavedAccountData(accountProfile);
}

function loadSavedAccountData(profileObj) {
  currentCoins = profileObj.coins || 200;
  document.getElementById('hud-name').innerText = profileObj.username.toUpperCase();
  document.getElementById('canvas-title').innerText = profileObj.username;

  const canvasNode = document.getElementById('signup-preview-avatar');
  const targetStageAnchor = document.getElementById('stage-hero-anchor');
  if (canvasNode && targetStageAnchor) {
    canvasNode.style.transform = "scale(1.0)";
    targetStageAnchor.appendChild(canvasNode);
  }

  const targetWorkshopHolder = document.getElementById('dashboard-canvas-holder');
  if (canvasNode && targetWorkshopHolder) {
    const mirrorClone = canvasNode.cloneNode(true);
    mirrorClone.style.transform = "scale(5.5)";
    mirrorClone.style.margin = "35px 0";
    targetWorkshopHolder.insertBefore(mirrorClone, document.getElementById('canvas-title'));
  }

  document.getElementById('login-overlay-screen').style.display = "none";
  document.getElementById('main-cabinet-interface').style.display = "block";
  document.getElementById('pixel-base-gender').className = 'pixel-layer ' + (profileObj.gender === 'male' ? 'base-male-hd' : 'base-female-hd');
  document.getElementById('pixel-hair-node').className = 'pixel-layer ' + profileObj.hair;
  
  updateHUD();
  initializeCombatArenaClock();
}
function clearAccountSession() {
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.remove(['questAccount'], () => { location.reload(); });
  } else { location.reload(); }
}

function initializeCombatArenaClock() {
  window.addEventListener('keydown', (e) => { routeKeyboardHotkeyClicks(e); });
  document.getElementById('combat-viewport-arena').addEventListener('mousedown', executeMouseClickAttackStrike);
  setInterval(triggerMinotaurAIAttackRoutine, 3000);
}

function routeKeyboardHotkeyClicks(event) {
  if (["1", "2", "3", "4"].includes(event.key)) {
    triggerHotkeyCast(event.key);
  }
}

// ⚔️ MOVEMENT FREE MOUSE ATTACK (TINY SPAMMABLE COOLDOWN MATRIX)
function executeMouseClickAttackStrike() {
  if (heroCurrentHP <= 0 || bossCurrentHP <= 0) return;

  const activeTime = Date.now();
  if (activeTime < cooldownTimers.clickAttack) {
    return; // Block input if clicked faster than 150ms!
  }

  if (hasWeaponEquipped) {
    cooldownTimers.clickAttack = activeTime + COOLDOWN_DURATIONS.clickAttack;
    inflictDamageOnMinotaur(4, "Spammable Saber Strike"); // Quick strikes deal small chip damage
  } else {
    printCombatTickerMessage("❌ ATTACK REJECTED: Equip weapon armaments first.", "var(--neon-pink)");
  }
}

// Unified casting router with active cooldown checks
function triggerHotkeyCast(keyString) {
  if (heroCurrentHP <= 0 || bossCurrentHP <= 0) return;
  const currentTime = Date.now();

  if (keyString === '1' && hasWeaponEquipped) {
    if (currentTime < cooldownTimers.skill1) return;
    cooldownTimers.skill1 = currentTime + COOLDOWN_DURATIONS.skill1;
    inflictDamageOnMinotaur(12, "Plasma Slash");
    applyVisualCooldownEffect('skill-1', COOLDOWN_DURATIONS.skill1);
  } 
  else if (keyString === '2' && hasWeaponEquipped) {
    if (currentTime < cooldownTimers.skill2) return;
    cooldownTimers.skill2 = currentTime + COOLDOWN_DURATIONS.skill2;
    inflictDamageOnMinotaur(25, "Laser Cleave");
    applyVisualCooldownEffect('skill-2', COOLDOWN_DURATIONS.skill2);
  } 
  else if (keyString === '3' && hasArmorEquipped) {
    if (currentTime < cooldownTimers.skill3) return;
    cooldownTimers.skill3 = currentTime + COOLDOWN_DURATIONS.skill3;
    heroCurrentHP = Math.min(heroMaxHP, heroCurrentHP + 15);
    refreshLifeHUDMeters();
    printCombatTickerMessage("✨ USED CORE SHIELD: Recovered +15 HP!", "var(--neon-cyan)");
    applyVisualCooldownEffect('skill-3', COOLDOWN_DURATIONS.skill3);
  } 
  else if (keyString === '4' && hasWeaponEquipped && hasArmorEquipped) {
    if (currentTime < cooldownTimers.skill4) return;
    cooldownTimers.skill4 = currentTime + COOLDOWN_DURATIONS.skill4;
    inflictDamageOnMinotaur(60, "OVERDRIVE BURST");
    applyVisualCooldownEffect('skill-4', COOLDOWN_DURATIONS.skill4);
  }
}

function applyVisualCooldownEffect(elementId, durationMs) {
  const slotNode = document.getElementById(elementId);
  if (!slotNode) return;

  slotNode.style.pointerEvents = "none";
  slotNode.style.opacity = "0.4";
  
  let timeRemaining = durationMs / 1000;
  const labelContainer = slotNode.querySelector('.skill-perk');
  const originalText = labelContainer.innerText;

  let cdInterval = setInterval(() => {
    timeRemaining -= 0.1;
    labelContainer.innerText = `CD: ${timeRemaining.toFixed(1)}s`;

    if (timeRemaining <= 0) {
      clearInterval(cdInterval);
      slotNode.style.pointerEvents = "auto";
      slotNode.style.opacity = "1";
      labelContainer.innerText = originalText;
    }
  }, 100);
}

function inflictDamageOnMinotaur(damageValue, sourceActionTitle) {
  bossCurrentHP = Math.max(0, bossCurrentHP - damageValue);
  refreshLifeHUDMeters();
  printCombatTickerMessage(`⚔️ HERO USED ${sourceActionTitle}: Hit for -${damageValue} HP!`, "var(--neon-green)");

  const heroFrame = document.getElementById('stage-hero-anchor');
  heroFrame.style.left = "90px"; setTimeout(() => { heroFrame.style.left = "60px"; }, 100);

  if (bossCurrentHP === 0) {
    currentCoins += 100; updateHUD(); saveCurrentWalletState();
    printCombatTickerMessage("🏆 VICTORY! Minotaur liquidated. +100 Coins secured!", "var(--neon-green)");
    alert("VICTORY! Overlord Slain.");
  }
}

function triggerMinotaurAIAttackRoutine() {
  if (bossCurrentHP <= 0 || heroCurrentHP <= 0) return;
  const waveOverlay = document.getElementById('boss-cleave-swipe-fx');
  waveOverlay.classList.add('sweep-run'); setTimeout(() => { waveOverlay.classList.remove('sweep-run'); }, 250);
  heroCurrentHP = Math.max(0, heroCurrentHP - 15); refreshLifeHUDMeters();
  printCombatTickerMessage("🚨 WARNING: Minotaur swung Heavy Cleave! (-15 HP)", "var(--neon-pink)");
  const flashPanel = document.getElementById('combat-action-flash-fx');
  flashPanel.classList.add('hurt-red'); setTimeout(() => { flashPanel.classList.remove('hurt-red'); }, 120);
  if (heroCurrentHP === 0) alert("GAME OVER: Your hero took a fatal cleave strike!");
}

function refreshLifeHUDMeters() {
  document.getElementById('ui-player-hp-fill').style.width = heroCurrentHP + "%";
  document.getElementById('ui-player-hp-text').innerText = `${heroCurrentHP}/${heroMaxHP}`;
  document.getElementById('ui-boss-hp-fill').style.width = ((bossCurrentHP / bossMaxHP) * 100) + "%";
  document.getElementById('ui-boss-hp-text').innerText = `${bossCurrentHP}/${bossMaxHP}`;
}

function printCombatTickerMessage(textStr, htmlHexColor) {
  const badge = document.getElementById('combat-feedback-ticker');
  if (badge) { badge.innerText = textStr.toUpperCase(); badge.style.color = htmlHexColor; }
}

function updateHUD() { document.getElementById('coin-total').innerText = currentCoins; }

function saveCurrentWalletState() {
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(['questAccount'], (result) => {
      if (result.questAccount) {
        let updatedAccount = result.questAccount;
        updatedAccount.coins = currentCoins;
        chrome.storage.local.set({ 'questAccount': updatedAccount });
      }
    });
  }
}

function triggerPurchaseProcess(coinPrice, slotType) {
  if (currentCoins >= coinPrice) {
    currentCoins -= coinPrice; updateHUD(); saveCurrentWalletState();
    if (slotType === 'Armor') {
      hasArmorEquipped = true; document.getElementById('pixel-armor-node').className = 'pixel-layer armor-gold-guards';
      const s3 = document.getElementById('skill-3'); s3.classList.remove('locked'); s3.classList.add('unlocked');
      s3.querySelector('.skill-label').innerText = "Shield Deflect"; s3.querySelector('.skill-perk').innerText = "Ready";
      document.getElementById('btn-cyber').innerText = "EQUIPPED"; document.getElementById('btn-cyber').disabled = true;
    } else if (slotType === 'Weapon') {
      hasWeaponEquipped = true; document.getElementById('pixel-weapon-node').className = 'pixel-layer weapon-plasma-sword';
      const s1 = document.getElementById('skill-1'); s1.classList.remove('locked'); s1.classList.add('unlocked');
      s1.querySelector('.skill-label').innerText = "Plasma Slash"; s1.querySelector('.skill-perk').innerText = "Ready";
      const s2 = document.getElementById('skill-2'); s2.classList.remove('locked'); s2.classList.add('unlocked');
      s2.querySelector('.skill-label').innerText = "Laser Burst"; s2.querySelector('.skill-perk').innerText = "Ready";
      document.getElementById('btn-weapon').innerText = "EQUIPPED"; document.getElementById('btn-weapon').disabled = true;
    }
    if (hasWeaponEquipped && hasArmorEquipped) {
      const s4 = document.getElementById('skill-4'); s4.classList.remove('locked'); s4.classList.add('unlocked');
      s4.querySelector('.skill-label').innerText = "Overdrive Burst"; s4.querySelector('.skill-perk').innerText = "Ready";
    }
  } else { alert("Insufficient coin balance."); }
}




