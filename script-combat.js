function initializeCombatArenaClock() {
  window.addEventListener('keydown', routeKeyboardHotkeyClicks);
  document.getElementById('combat-viewport-arena').addEventListener('mousedown', executeMouseClickAttackStrike);
  setInterval(triggerMinotaurAIAttackRoutine, 3000);
}

if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.onUpdated) {
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
      if (tab.url.includes("://google.com") || tab.url.includes("google.co.uk/search?q=") || tab.url.includes("google.com.au/search?q=")) {
        if (bossCurrentHP > 0 && heroCurrentHP > 0) inflictDamageOnMinotaur(2, "Background Search Tracker");
      }
    }
  });
}

function routeKeyboardHotkeyClicks(event) {
  if (heroCurrentHP <= 0 || bossCurrentHP <= 0) return;
  if (event.key === '1' && hasWeaponEquipped) inflictDamageOnMinotaur(12, "Basic Strike");
  else if (event.key === '2' && hasWeaponEquipped) inflictDamageOnMinotaur(25, "Laser Cleave");
  else if (event.key === '3' && hasArmorEquipped) {
    heroCurrentHP = Math.min(heroMaxHP, heroCurrentHP + 15); refreshLifeHUDMeters();
    printCombatTickerMessage("✨ USED CORE SHIELD: Recovered +15 HP!", "var(--neon-cyan)");
  } else if (event.key === '4' && hasWeaponEquipped && hasArmorEquipped) inflictDamageOnMinotaur(60, "OVERDRIVE BURST");
}

function executeMouseClickAttackStrike() {
  if (heroCurrentHP <= 0 || bossCurrentHP <= 0) return;
  if (hasWeaponEquipped) inflictDamageOnMinotaur(10, "Mouse Click Strike");
  else printCombatTickerMessage("❌ ATTACK PARSED: Equip a weapon first.", "var(--neon-pink)");
}

function inflictDamageOnMinotaur(damageValue, sourceActionTitle) {
  bossCurrentHP = Math.max(0, bossCurrentHP - damageValue); refreshLifeHUDMeters();
  printCombatTickerMessage(`⚔️ HERO USED ${sourceActionTitle}: Hit for -${damageValue} HP!`, "var(--neon-green)");
  const heroFrame = document.getElementById('stage-hero-anchor');
  heroFrame.style.left = "90px"; setTimeout(() => { heroFrame.style.left = "60px"; }, 100);
  if (bossCurrentHP === 0) {
    currentCoins += 100; document.getElementById('coin-total').innerText = currentCoins; // 💎 100 coin award drop hook
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
