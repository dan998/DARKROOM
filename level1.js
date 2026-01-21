// =======================
// LEVEL 1 — HAUNTED PUZZLE
// =======================

// GAME STATE
let inspected = false;
let solved = false;
let startTime = Date.now();
let hintCorruption = 0;

// Symbols
const symbols = ["☪️", "✡️", "☯️", "🕎"];
let chosen = [];
let correctOrder = [];
let slotIndex = [0, 0, 0];

// =======================
// HINT SYSTEM
// =======================
const hintTemplates = [
  (order) => `
    Scratched into the wall, left to right:<br><br>
    <strong style="letter-spacing:15px;color:#b30000;font-size:1.3rem;">
      ${order.join(" ")}
    </strong><br><br>
    <span style="color:#777">The wall feels cold.</span>
  `,
  (order) => `
    Beneath old blood stains, symbols repeat:<br><br>
    <strong style="letter-spacing:15px;color:#8b0000;font-size:1.3rem;">
      ${order.join(" ")}
    </strong><br><br>
    <span style="color:#666">Some marks look newer than others.</span>
  `,
  (order) => `
    The pattern is etched deeply, as if clawed:<br><br>
    <strong style="letter-spacing:15px;color:#b30000;font-size:1.3rem;">
      ${order.join(" ")}
    </strong><br><br>
    <span style="color:#555">Do not trust movement.</span>
  `
];

// Corrupt hint after mistakes
function corruptOrder(order) {
  if (hintCorruption < 1) return order;
  return [...order].sort(() => Math.random() - 0.5);
}

// Show hint temporarily
function showHint(duration = 3000) {
  const template = hintTemplates[Math.floor(Math.random() * hintTemplates.length)];
  const visibleOrder =
    Math.random() < hintCorruption * 0.25 ? corruptOrder(correctOrder) : correctOrder;

  const storyEl = document.getElementById("story");

  if (window.memory && typeof memory.getAdaptiveHint === "function") {
    storyEl.innerHTML = memory.getAdaptiveHint(template(visibleOrder), { corruption: hintCorruption });
  } else {
    storyEl.innerHTML = template(visibleOrder);
  }

  // Remove hint after duration
  setTimeout(() => {
    storyEl.innerHTML = "";
  }, duration);
}

// =======================
// SYMBOL RESHUFFLE
// =======================
function reshuffleSymbols() {
  chosen = [...chosen].sort(() => 0.5 - Math.random());
  slotIndex = slotIndex.map(() => Math.floor(Math.random() * chosen.length));

  document.querySelectorAll(".symbolDisplay").forEach((el, i) => {
    el.textContent = chosen[slotIndex[i]];
    el.classList.add("flicker");
    setTimeout(() => el.classList.remove("flicker"), 120);
  });
}

// =======================
// AUDIO
// =======================
function playSound(id) {
  try {
    const a = document.getElementById(id);
    if (a) { a.currentTime = 0; a.play().catch(() => {}); }
  } catch {}
}

// =======================
// INIT LEVEL
// =======================
function initLevel() {
  if (window.memory) {
    if (typeof memory.recordEvent === "function") memory.recordEvent("level_start", { level: 1 });
    if (typeof memory.getEnvironmentalFragment === "function") {
      document.getElementById("environmentFragment").textContent = memory.getEnvironmentalFragment();
    }
  }

  document.addEventListener("keydown", (e) => {
    if (e.altKey && e.key === "d" && window.memory && typeof memory.showDebug === "function") memory.showDebug();
    if (e.altKey && e.key === "r") {
      if (confirm("Reset all memory?")) {
        if (window.memory && typeof memory.clear === "function") memory.clear();
        localStorage.clear();
        location.reload();
      }
    }
  });
}

window.addEventListener("DOMContentLoaded", initLevel);

// =======================
// INSPECT PUZZLE
// =======================
function inspect() {
  if (inspected) return;

  inspected = true;
  playSound("clickSound");

  // Pick 3 random symbols for puzzle
  chosen = [...symbols].sort(() => 0.5 - Math.random()).slice(0, 3);
  correctOrder = [...chosen];

  if (window.memory && memory.data && memory.data.levels) {
    memory.data.levels[1].firstSymbolOrder = [...correctOrder];
    if (typeof memory.recordEvent === "function") memory.recordEvent("inspect");
  }

  document.getElementById("slotPuzzle").classList.add("show");

  // SHOW HINT BEFORE SHUFFLE
  showHint(4000); // show for 4 seconds

  // THEN RANDOMIZE SLOT DISPLAY
  slotIndex = [0, 1, 2]; // reset indices
  reshuffleSymbols();     // shuffle symbols in slots

  document.getElementById("result").innerHTML =
    `<span style="color:#8b0000">›</span> The room watches you remember.`;

  document.getElementById("inspectBtn").disabled = true;

  if (window.memory && typeof memory.save === "function") memory.save();
}

// =======================
// ROTATE SLOT
// =======================
function rotateSlot(i, dir) {
  if (solved) return;

  playSound("clickSound");
  slotIndex[i] =
    dir === "up"
      ? (slotIndex[i] - 1 + chosen.length) % chosen.length
      : (slotIndex[i] + 1) % chosen.length;

  const display = document.querySelectorAll(".symbolDisplay")[i];
  display.textContent = chosen[slotIndex[i]];

  setTimeout(reshuffleSymbols, 180);
}

// =======================
// CHECK PUZZLE
// =======================
function checkSlots() {
  if (solved) return;

  playSound("clickSound");

  let ok = true;
  for (let i = 0; i < 3; i++) {
    if (chosen[slotIndex[i]] !== correctOrder[i]) ok = false;
  }

  if (ok) {
    solved = true;
    playSound("successSound");

    localStorage.setItem("level1Solved", "true");
    if (localStorage.getItem("level2Solved") === null) localStorage.setItem("level2Solved", "false");

    document.getElementById("result").innerHTML = `
      <span style="color:#00aa00">✓ The lock yields.</span><br>
      <em>The room exhales.</em>
    `;
    document.getElementById("door").classList.add("open");

    setTimeout(() => window.location.href = "level.html", 2500);
  } else {
    playSound("errorSound");
    hintCorruption += 0.5;

    document.body.classList.add("glitch");
    setTimeout(() => document.body.classList.remove("glitch"), 250);

    document.getElementById("result").innerHTML =
      `<span style="color:#ff0000">✗ Wrong. The wall shifts.</span>`;

    showHint(2000);
    setTimeout(reshuffleSymbols, 250);
  }

  if (window.memory && typeof memory.save === "function") memory.save();
}

// =======================
// DOOR INTERACTION
// =======================
function tryDoor() {
  playSound("clickSound");
  document.getElementById("result").innerHTML =
    !inspected
      ? `<span style="color:#8b0000">The door ignores you.</span>`
      : `<span style="color:#8b0000">Not yet.</span>`;
}

// =======================
// LOADING SCREEN
// =======================
function showLoadingScreen() {
  document.getElementById("loadingScreen").style.display = "flex";
  if (window.memory && typeof memory.nextLevel === "function") memory.nextLevel();
}