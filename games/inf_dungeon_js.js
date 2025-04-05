const game = {
  player: {
    level: 1,
    maxHealth: 100,
    health: 100,
    attack: 10,
    defense: 5,
    xp: 0,
    nextLevelXp: 100,
    healPotions: 3,
    maxHealPotions: 3,
    energy: 100,
    equipment: null,
    skillCooldownTurn: 0,
    talents: {},
    shield: 0
  },
  monster: {
    name: "",
    level: 1,
    maxHealth: 30,
    health: 30,
    attack: 5,
    defense: 2,
    xpReward: 20
  },
  dungeonLevel: 1,
  kills: 0,
  gameOver: false,
  highscores: [],
  mode: "infinite"
};
const monsterTypes = [
  { name: "史萊姆", emoji: "🟢", attackMod: 0.8, defenseMod: 0.7, healthMod: 1 },
  { name: "哥布林", emoji: "👺", attackMod: 1, defenseMod: 1, healthMod: 1 },
  { name: "骷髏兵", emoji: "💀", attackMod: 1.2, defenseMod: 0.8, healthMod: 0.9 },
  { name: "蜘蛛", emoji: "🕷️", attackMod: 1.1, defenseMod: 0.9, healthMod: 0.8 },
  { name: "殭屍", emoji: "🧟", attackMod: 0.9, defenseMod: 1.1, healthMod: 1.2 },
  { name: "食人魔", emoji: "👹", attackMod: 1.3, defenseMod: 1.2, healthMod: 1.4 },
  { name: "幽靈", emoji: "👻", attackMod: 1.2, defenseMod: 1.3, healthMod: 0.7 },
  { name: "惡魔", emoji: "😈", attackMod: 1.4, defenseMod: 1.3, healthMod: 1.1 },
  { name: "巨龍", emoji: "🐉", attackMod: 1.6, defenseMod: 1.5, healthMod: 1.8 }
];
const bossTypes = [
  { name: "巨龍王", emoji: "🐉", attackMod: 2.0, defenseMod: 2.0, healthMod: 3.0 },
  { name: "魔王", emoji: "😈", attackMod: 2.2, defenseMod: 2.1, healthMod: 2.8 },
  { name: "亡靈君王", emoji: "💀", attackMod: 1.8, defenseMod: 2.5, healthMod: 3.2 }
];
const equipmentList = [
  { name: "銅劍", attackBonus: 3, defenseBonus: 0 },
  { name: "鐵盾", attackBonus: 0, defenseBonus: 3 },
  { name: "魔法法杖", attackBonus: 2, defenseBonus: 1 },
  { name: "輕甲", attackBonus: 0, defenseBonus: 2 },
  { name: "重甲", attackBonus: 0, defenseBonus: 4 }
];
const talentPool = [
  { type: "lifesteal", name: "吸血", description: "攻擊時回復 10% 造成傷害的生命值", percent: 0.1, upgrade: 0.05 },
  { type: "critical", name: "暴擊", description: "攻擊時有 15% 機率造成 50% 額外傷害", chance: 0.15, multiplier: 0.5, upgradeChance: 0.05, upgradeMultiplier: 0.1 },
  { type: "penetration", name: "穿透", description: "攻擊時額外造成 20% 當下傷害的真實傷害", percent: 0.2, upgrade: 0.05 },
  { type: "shield", name: "護盾", description: "受到傷害時獲得 30% 損失生命值的護盾", percent: 0.3, upgrade: 0.05 },
  { type: "bonusDamage", name: "附加傷害", description: "攻擊時有 10% 機率造成額外 5% 最大生命值傷害", chance: 0.1, percent: 0.05, upgradeChance: 0.05, upgradePercent: 0.02 }
];
const playerLevel = document.getElementById("player-level");
const playerXp = document.getElementById("player-xp");
const playerNextLevel = document.getElementById("player-next-level");
const dungeonLevel = document.getElementById("dungeon-level");
const playerHealthBar = document.getElementById("player-health-bar");
const playerHealth = document.getElementById("player-health");
const playerMaxHealth = document.getElementById("player-max-health");
const monsterName = document.getElementById("monster-name");
const monsterImage = document.getElementById("monster-image");
const monsterHealthBar = document.getElementById("monster-health-bar");
const monsterHealth = document.getElementById("monster-health");
const monsterMaxHealth = document.getElementById("monster-max-health");
const attackBtn = document.getElementById("attack-btn");
const skillBtn = document.getElementById("skill-btn");
const healBtn = document.getElementById("heal-btn");
const runBtn = document.getElementById("run-btn");
const combatLog = document.getElementById("combat-log");
const playerAttack = document.getElementById("player-attack");
const playerDefense = document.getElementById("player-defense");
const attackBar = document.getElementById("attack-bar");
const defenseBar = document.getElementById("defense-bar");
const killsCounter = document.getElementById("kills");
const monsterArea = document.getElementById("monster-area");
const highscoresList = document.getElementById("highscores-list");
const gameModeDisplay = document.getElementById("game-mode");
const modeBtn = document.getElementById("mode-btn");
function updateEnergyUI() {
  const playerEnergy = document.getElementById("player-energy");
  const playerEnergyBar = document.getElementById("player-energy-bar");
  playerEnergy.textContent = game.player.energy;
  playerEnergyBar.style.width = `${game.player.energy}%`;
}
function regenerateEnergy(amount) {
  game.player.energy = Math.min(100, game.player.energy + amount);
  updateEnergyUI();
}
function updateEquipmentUI() {
  const equipmentDisplay = document.getElementById("player-equipment");
  if(game.player.equipment) {
    equipmentDisplay.textContent = `${game.player.equipment.name} (攻擊 +${game.player.equipment.attackBonus}, 防禦 +${game.player.equipment.defenseBonus})`;
  } else {
    equipmentDisplay.textContent = "無";
  }
}
function showLoading() {
  monsterName.innerHTML = `<span class="loading-text">尋找怪物中 <span class="loading"></span></span>`;
  attackBtn.disabled = true;
  skillBtn.disabled = true;
  healBtn.disabled = true;
  runBtn.disabled = true;
}
function hideLoading() {
  attackBtn.disabled = false;
  skillBtn.disabled = game.player.skillCooldownTurn > 0;
  healBtn.disabled = game.player.healPotions <= 0;
  runBtn.disabled = false;
}
function updateUI() {
  playerLevel.textContent = game.player.level;
  playerXp.textContent = game.player.xp;
  playerNextLevel.textContent = game.player.nextLevelXp;
  dungeonLevel.textContent = game.dungeonLevel;
  playerHealth.textContent = Math.max(0, Math.floor(game.player.health));
  playerMaxHealth.textContent = game.player.maxHealth;
  playerHealthBar.style.width = `${(game.player.health / game.player.maxHealth) * 100}%`;
  monsterHealth.textContent = Math.max(0, Math.floor(game.monster.health));
  monsterMaxHealth.textContent = game.monster.maxHealth;
  monsterHealthBar.style.width = `${(game.monster.health / game.monster.maxHealth) * 100}%`;
  playerAttack.textContent = game.player.attack;
  playerDefense.textContent = game.player.defense;
  attackBar.style.width = `${Math.min(100, (game.player.attack / 50) * 100)}%`;
  defenseBar.style.width = `${Math.min(100, (game.player.defense / 50) * 100)}%`;
  killsCounter.textContent = game.kills;
  healBtn.textContent = `治療 (${game.player.healPotions}/${game.player.maxHealPotions})`;
  skillBtn.disabled = game.player.skillCooldownTurn > 0;
  if (game.player.healPotions <= 0) {
    healBtn.disabled = true;
  }
  if (game.gameOver) {
    attackBtn.disabled = true;
    skillBtn.disabled = true;
    healBtn.disabled = true;
    runBtn.disabled = true;
  }
  updateEnergyUI();
  updateEquipmentUI();
}
function endTurn() {
  if(game.player.skillCooldownTurn > 0) {
    game.player.skillCooldownTurn--;
  }
  updateUI();
}
function spawnMonster() {
  if (game.dungeonLevel % 10 === 0) {
    spawnBoss();
    return;
  }
  if (Math.random() < 0.35) {
    triggerRandomEvent();
    return;
  }
  const monsterLevel = Math.max(1, game.dungeonLevel + Math.floor(Math.random() * 3) - 1);
  const monsterIndex = Math.min(
    monsterTypes.length - 1,
    Math.floor(Math.random() * (game.dungeonLevel > 5 ? monsterTypes.length : Math.min(5, game.dungeonLevel + 2)))
  );
  const monsterType = monsterTypes[monsterIndex];
  game.monster.name = `${monsterType.name} Lv.${monsterLevel}`;
  game.monster.level = monsterLevel;
  game.monster.maxHealth = Math.floor(20 + (monsterLevel * 10) * monsterType.healthMod);
  game.monster.health = game.monster.maxHealth;
  game.monster.attack = Math.floor((5 + monsterLevel * 2) * monsterType.attackMod);
  game.monster.defense = Math.floor((2 + monsterLevel) * monsterType.defenseMod);
  game.monster.xpReward = Math.floor(15 + monsterLevel * 5);
  monsterName.textContent = game.monster.name;
  monsterImage.textContent = monsterType.emoji;
  addToLog(`你遇到了 ${game.monster.name}！`, "system");
  updateUI();
}
function spawnBoss() {
  const bossIndex = Math.floor(Math.random() * bossTypes.length);
  const bossType = bossTypes[bossIndex];
  const bossLevel = game.dungeonLevel;
  game.monster.name = `${bossType.name} Lv.${bossLevel}`;
  game.monster.level = bossLevel;
  game.monster.maxHealth = Math.floor(50 + (bossLevel * 15) * bossType.healthMod);
  game.monster.health = game.monster.maxHealth;
  game.monster.attack = Math.floor((10 + bossLevel * 3) * bossType.attackMod);
  game.monster.defense = Math.floor((5 + bossLevel * 2) * bossType.defenseMod);
  game.monster.xpReward = Math.floor(30 + bossLevel * 10);
  monsterName.textContent = game.monster.name;
  monsterImage.textContent = bossType.emoji;
  addToLog(`你遇到了 BOSS：${game.monster.name}！`, "system");
  updateUI();
}
function triggerRandomEvent() {
  const events = ["talent", "trap", "elite"];
  const eventType = events[Math.floor(Math.random() * events.length)];
  if(eventType === "talent") {
    triggerTalentEvent();
  } else if(eventType === "trap") {
    addToLog("你觸發了一個陷阱！", "system");
    const trapDamage = 20;
    game.player.health -= trapDamage;
    addToLog(`陷阱造成了 ${trapDamage} 點傷害！`, "monster");
    if(game.player.health <= 0) {
      gameOver();
      return;
    }
    updateUI();
    setTimeout(() => {
      spawnMonster();
      hideLoading();
    }, 1000);
  } else if(eventType === "elite") {
    addToLog("你遭遇了一個精英怪！", "system");
    const monsterLevel = Math.max(1, game.dungeonLevel + Math.floor(Math.random() * 3) - 1);
    const monsterIndex = Math.min(
      monsterTypes.length - 1,
      Math.floor(Math.random() * (game.dungeonLevel > 5 ? monsterTypes.length : Math.min(5, game.dungeonLevel + 2)))
    );
    const monsterType = monsterTypes[monsterIndex];
    game.monster.name = `精英${monsterType.name} Lv.${monsterLevel}`;
    game.monster.level = monsterLevel;
    game.monster.maxHealth = Math.floor(20 + (monsterLevel * 10) * monsterType.healthMod * 1.5);
    game.monster.health = game.monster.maxHealth;
    game.monster.attack = Math.floor((5 + monsterLevel * 2) * monsterType.attackMod * 1.5);
    game.monster.defense = Math.floor((2 + monsterLevel) * monsterType.defenseMod * 1.5);
    game.monster.xpReward = Math.floor((15 + monsterLevel * 5) * 2);
    monsterName.textContent = game.monster.name;
    monsterImage.textContent = monsterType.emoji;
    updateUI();
  }
}
async function triggerTalentEvent() {
  let optionsArr = [];
  let poolCopy = talentPool.slice();
  for (let i = 0; i < 3; i++) {
    let index = Math.floor(Math.random() * poolCopy.length);
    optionsArr.push(poolCopy[index]);
    poolCopy.splice(index, 1);
  }
  let message = "獲得天賦事件！請選擇一項:";
  let modalOptions = optionsArr.map((tal) => {
    return { label: tal.name + " - " + tal.description, value: tal };
  });
  let selected = await showModal(message, modalOptions);
  if (game.player.talents[selected.type]) {
    let t = game.player.talents[selected.type];
    if (selected.type === "lifesteal") {
      t.percent += selected.upgrade;
    } else if (selected.type === "critical") {
      t.chance += selected.upgradeChance;
      t.multiplier += selected.upgradeMultiplier;
    } else if (selected.type === "penetration") {
      t.percent += selected.upgrade;
    } else if (selected.type === "shield") {
      t.percent += selected.upgrade;
    } else if (selected.type === "bonusDamage") {
      t.chance += selected.upgradeChance;
      t.percent += selected.upgradePercent;
    }
    addToLog(`${selected.name} 升級！`, "system");
  } else {
    if (selected.type === "lifesteal") {
      game.player.talents[selected.type] = { type: selected.type, percent: selected.percent };
    } else if (selected.type === "critical") {
      game.player.talents[selected.type] = { type: selected.type, chance: selected.chance, multiplier: selected.multiplier };
    } else if (selected.type === "penetration") {
      game.player.talents[selected.type] = { type: selected.type, percent: selected.percent };
    } else if (selected.type === "shield") {
      game.player.talents[selected.type] = { type: selected.type, percent: selected.percent };
    } else if (selected.type === "bonusDamage") {
      game.player.talents[selected.type] = { type: selected.type, chance: selected.chance, percent: selected.percent };
    }
    addToLog(`獲得新天賦：${selected.name}`, "system");
  }
  setTimeout(() => {
    spawnMonster();
    hideLoading();
  }, 1000);
}
function showModal(message, options) {
  return new Promise((resolve) => {
    const modal = document.getElementById("input-modal");
    const modalMessage = document.getElementById("modal-message");
    const modalOptions = document.getElementById("modal-options");
    modalMessage.textContent = message;
    modalOptions.innerHTML = "";
    options.forEach(opt => {
      const btn = document.createElement("button");
      btn.textContent = opt.label;
      btn.addEventListener("click", () => {
        modal.style.display = "none";
        resolve(opt.value);
      });
      modalOptions.appendChild(btn);
    });
    modal.style.display = "flex";
  });
}
function obtainEquipment() {
  const equip = equipmentList[Math.floor(Math.random() * equipmentList.length)];
  game.player.equipment = equip;
  game.player.attack += equip.attackBonus;
  game.player.defense += equip.defenseBonus;
  addToLog(`你獲得了 ${equip.name}！攻擊力 +${equip.attackBonus}，防禦力 +${equip.defenseBonus}`, "system");
  updateEquipmentUI();
  updateUI();
}
async function playerAttackAction() {
  if (game.gameOver) return;
  let baseDamage = Math.max(1, game.player.attack - game.monster.defense / 2 + Math.floor(Math.random() * 5) - 2);
  if (game.player.talents["critical"]) {
    let crit = game.player.talents["critical"];
    if (Math.random() < crit.chance) {
      baseDamage = Math.floor(baseDamage * (1 + crit.multiplier));
      addToLog("暴擊！", "player");
    }
  }
  let bonusDamage = 0;
  if (game.player.talents["bonusDamage"]) {
    let bonus = game.player.talents["bonusDamage"];
    if (Math.random() < bonus.chance) {
      bonusDamage = Math.floor(game.monster.maxHealth * bonus.percent);
      addToLog("附加傷害觸發！", "player");
    }
  }
  let totalDamage = baseDamage + bonusDamage;
  if (game.player.talents["penetration"]) {
    let pen = game.player.talents["penetration"];
    let extra = Math.floor(totalDamage * pen.percent);
    totalDamage += extra;
    addToLog("穿透效果觸發！", "player");
  }
  game.monster.health -= totalDamage;
  if (game.player.talents["lifesteal"]) {
    let ls = game.player.talents["lifesteal"];
    let heal = Math.floor(totalDamage * ls.percent);
    game.player.health = Math.min(game.player.maxHealth, game.player.health + heal);
    addToLog(`吸血恢復 ${heal} 點生命`, "player");
  }
  monsterArea.classList.add("monster-animation");
  setTimeout(() => {
    monsterArea.classList.remove("monster-animation");
  }, 500);
  addToLog(`你對 ${game.monster.name} 造成了 ${totalDamage} 點傷害！`, "player");
  if (game.monster.health <= 0) {
    await monsterDefeated();
  } else {
    monsterAttack();
  }
  regenerateEnergy(10);
  updateUI();
}
function monsterAttack() {
  if (game.gameOver) return;
  let damage = Math.max(1, game.monster.attack - game.player.defense / 2 + Math.floor(Math.random() * 5) - 2);
  if(game.mode === "challenge") {
    damage = Math.floor(damage * 1.2);
  }
  let remainingDamage = damage;
  if (game.player.shield > 0) {
    if (game.player.shield >= remainingDamage) {
      game.player.shield -= remainingDamage;
      remainingDamage = 0;
      addToLog("護盾吸收了全部傷害", "system");
    } else {
      remainingDamage -= game.player.shield;
      addToLog(`護盾吸收了 ${game.player.shield} 點傷害`, "system");
      game.player.shield = 0;
    }
  }
  let actualDamage = remainingDamage;
  game.player.health -= actualDamage;
  if (game.player.talents["shield"]) {
    let sh = game.player.talents["shield"];
    let shieldValue = Math.floor(actualDamage * sh.percent);
    game.player.shield += shieldValue;
    addToLog(`獲得 ${shieldValue} 點護盾`, "system");
  }
  addToLog(`${game.monster.name} 對你造成了 ${damage} 點傷害！`, "monster");
  if (game.player.health <= 0) {
    gameOver();
    return;
  }
  updateUI();
  endTurn();
}
async function playerSkillAction() {
  if (game.gameOver) return;
  if(game.player.skillCooldownTurn > 0) {
    addToLog("技能正在冷卻中！", "system");
    return;
  }
  const skillCost = 30;
  if (game.player.energy < skillCost) {
    addToLog("能量不足，無法使用技能！", "system");
    return;
  }
  game.player.energy -= skillCost;
  updateEnergyUI();
  let damage = Math.max(1, Math.floor(game.player.attack * 1.8) - Math.floor(game.monster.defense / 2) + Math.floor(Math.random() * 5) - 2);
  game.monster.health -= damage;
  addToLog(`你使用技能對 ${game.monster.name} 造成了 ${damage} 點傷害！`, "player");
  game.player.skillCooldownTurn = 2;
  if (game.monster.health <= 0) {
    await monsterDefeated();
  } else {
    monsterAttack();
  }
  updateUI();
}
async function playerHeal() {
  if (game.player.healPotions <= 0 || game.gameOver) return;
  game.player.healPotions--;
  const healAmount = Math.floor(game.player.maxHealth * 0.4);
  game.player.health = Math.min(game.player.maxHealth, game.player.health + healAmount);
  addToLog(`你使用了治療藥水，恢復了 ${healAmount} 點生命值！`, "player");
  setTimeout(monsterAttack, 500);
  regenerateEnergy(5);
  updateUI();
}
function runAway() {
  if (game.gameOver) return;
  attackBtn.disabled = true;
  skillBtn.disabled = true;
  healBtn.disabled = true;
  runBtn.disabled = true;
  if (Math.random() < 0.5) {
    addToLog("你成功逃脫了！", "system");
    showLoading();
    setTimeout(() => {
      spawnMonster();
      hideLoading();
    }, 1000);
  } else {
    addToLog("你嘗試逃跑，但失敗了！", "system");
    attackBtn.disabled = false;
    skillBtn.disabled = game.player.skillCooldownTurn > 0;
    healBtn.disabled = game.player.healPotions <= 0;
    runBtn.disabled = false;
    setTimeout(monsterAttack, 500);
  }
}
async function monsterDefeated() {
  game.player.xp += game.monster.xpReward;
  game.kills++;
  addToLog(`你擊敗了 ${game.monster.name}！獲得 ${game.monster.xpReward} 點經驗值！`, "system");
  await checkLevelUp();
  game.dungeonLevel++;
  if (game.dungeonLevel % 3 === 0 && game.player.healPotions < game.player.maxHealPotions) {
    game.player.healPotions++;
    addToLog("你找到了一瓶治療藥水！", "system");
  }
  showLoading();
  setTimeout(() => {
    spawnMonster();
    hideLoading();
  }, 1000);
  updateUI();
}
async function checkLevelUp() {
  while (game.player.xp >= game.player.nextLevelXp) {
    let message = "升級了！請選擇一項升級：";
    let options = [
      { label: "攻擊力", value: "1" },
      { label: "防禦力", value: "2" },
      { label: "技能強化", value: "3" }
    ];
    let choice = await showModal(message, options);
    if (choice === "1") {
      const attackIncrease = Math.floor(Math.random() * 3) + 2;
      game.player.attack += attackIncrease;
      addToLog(`攻擊力提升 +${attackIncrease}`, "system");
    } else if (choice === "2") {
      const defenseIncrease = Math.floor(Math.random() * 2) + 1;
      game.player.defense += defenseIncrease;
      addToLog(`防禦力提升 +${defenseIncrease}`, "system");
    } else if (choice === "3") {
      game.player.attack = Math.floor(game.player.attack * 1.1);
      addToLog(`技能強化：攻擊力增加 10%`, "system");
    }
    game.player.level++;
    game.player.xp -= game.player.nextLevelXp;
    game.player.nextLevelXp = Math.floor(game.player.nextLevelXp * 1.5);
    game.player.maxHealth += Math.floor(game.player.maxHealth * 0.2);
    game.player.health = game.player.maxHealth;
    game.player.energy = 100;
    game.player.healPotions = game.player.maxHealPotions;
    addToLog(`你升級了！現在是 ${game.player.level} 等！`, "system");
    addToLog(`生命值上限提升，治療藥水補充！`, "system");
    updateUI();
  }
}
function gameOver() {
  game.gameOver = true;
  addToLog("你被擊敗了！遊戲結束！", "system");
  addToLog(`最終成績：等級 ${game.player.level}，地下城層數 ${game.dungeonLevel}，擊殺數 ${game.kills}`, "system");
  const gameOverDiv = document.createElement("div");
  gameOverDiv.className = "game-over";
  gameOverDiv.innerHTML = `
    <h2>遊戲結束</h2>
    <p>你被 ${game.monster.name} 擊敗了</p>
    <p>地下城層數: ${game.dungeonLevel} | 怪物擊殺數: ${game.kills}</p>
    <button id="restart-btn">重新開始</button>
  `;
  monsterArea.appendChild(gameOverDiv);
  document.getElementById("restart-btn").addEventListener("click", restartGame);
  saveScore();
}
function restartGame() {
  game.player.level = 1;
  game.player.maxHealth = 100;
  game.player.health = 100;
  game.player.attack = 10;
  game.player.defense = 5;
  game.player.xp = 0;
  game.player.nextLevelXp = 100;
  game.player.healPotions = 3;
  game.player.maxHealPotions = 3;
  game.player.energy = 100;
  game.player.equipment = null;
  game.player.talents = {};
  game.player.shield = 0;
  game.player.skillCooldownTurn = 0;
  game.dungeonLevel = 1;
  game.kills = 0;
  game.gameOver = false;
  combatLog.innerHTML = '<p class="system">歡迎來到無限地下城！準備好面對挑戰了嗎？</p>';
  const gameOverDiv = document.querySelector(".game-over");
  if (gameOverDiv) {
    gameOverDiv.remove();
  }
  showLoading();
  setTimeout(() => {
    spawnMonster();
    hideLoading();
  }, 1000);
  updateUI();
}
function addToLog(message, type) {
  const p = document.createElement("p");
  p.className = type;
  p.textContent = message;
  combatLog.appendChild(p);
  combatLog.scrollTop = combatLog.scrollHeight;
  while (combatLog.children.length > 50) {
    combatLog.removeChild(combatLog.firstChild);
  }
}
function saveScore() {
  const now = new Date();
  const dateStr = now.toLocaleDateString();
  const timeStr = now.toLocaleTimeString();
  const score = {
    date: dateStr,
    time: timeStr,
    level: game.player.level,
    dungeonLevel: game.dungeonLevel,
    kills: game.kills
  };
  let highscores = [];
  try {
    highscores = JSON.parse(localStorage.getItem("infiniteDungeonHighscores")) || [];
  } catch (e) {
    highscores = [];
  }
  highscores.push(score);
  highscores.sort((a, b) => b.dungeonLevel - a.dungeonLevel);
  if (highscores.length > 10) {
    highscores = highscores.slice(0, 10);
  }
  localStorage.setItem("infiniteDungeonHighscores", JSON.stringify(highscores));
  displayHighscores(highscores);
}
function loadHighscores() {
  let highscores = [];
  try {
    highscores = JSON.parse(localStorage.getItem("infiniteDungeonHighscores")) || [];
  } catch (e) {
    highscores = [];
  }
  displayHighscores(highscores);
}
function displayHighscores(highscores) {
  highscoresList.innerHTML = "";
  if (highscores.length === 0) {
    const li = document.createElement("li");
    li.textContent = "尚無記錄";
    highscoresList.appendChild(li);
    return;
  }
  highscores.forEach((score) => {
    const li = document.createElement("li");
    li.textContent = `${score.date} ${score.time} - 層數: ${score.dungeonLevel} | 等級: ${score.level} | 擊殺: ${score.kills}`;
    highscoresList.appendChild(li);
  });
}
modeBtn.addEventListener("click", () => {
  if(game.mode === "infinite") {
    game.mode = "challenge";
    gameModeDisplay.textContent = "挑戰模式";
    addToLog("模式切換為挑戰模式：怪物傷害增加20%。", "system");
  } else {
    game.mode = "infinite";
    gameModeDisplay.textContent = "無限地下城";
    addToLog("模式切換為無限地下城模式：隨機天賦事件出現機率較高。", "system");
  }
});
function initGame() {
  updateUI();
  loadHighscores();
  showLoading();
  setTimeout(() => {
    spawnMonster();
    hideLoading();
  }, 1000);
  attackBtn.addEventListener("click", playerAttackAction);
  skillBtn.addEventListener("click", playerSkillAction);
  healBtn.addEventListener("click", playerHeal);
  runBtn.addEventListener("click", runAway);
}

const fullscreenBtn = document.getElementById("fullscreen-btn");
const container = document.querySelector(".container");

fullscreenBtn.addEventListener("click", () => {
  if (!document.fullscreenElement) {
    container.requestFullscreen().catch(err => {
      addToLog(`全螢幕模式錯誤: ${err.message}`, "system");
    });
  } else {
    document.exitFullscreen();
  }
});

initGame();
