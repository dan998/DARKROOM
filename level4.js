const symbols = ["☪️","✡️","☯️","🕎"];
const correctOrder = ["☪️","☯️","✡️"];

let picks = [];
let inspected = false;
let firstInspect = true;
let locked = false;

/* Elements */
const inspectBtn = document.getElementById("inspectBtn");
const wall = document.getElementById("wall");
const slots = document.querySelectorAll(".slot");
const result = document.getElementById("result");

const ambient = document.getElementById("ambient");
const inspectSnd = document.getElementById("inspectSnd");
const correctSnd = document.getElementById("correctSnd");
const wrongSnd = document.getElementById("wrongSnd");

/* Ambient */
ambient.volume = 0.4;
ambient.play().catch(()=>{});

/* Inspect room */
inspectBtn.onclick = () => {
  if (locked) return;

  inspectSnd.currentTime = 0;
  inspectSnd.play();

  inspected = true;
  wall.classList.remove("hidden");

  /* 🔥 MEMORY LIE SYSTEM */
  if (!firstInspect) {
    const spans = wall.querySelectorAll("span");
    const scrambled = [...symbols]
      .sort(()=>0.5 - Math.random())
      .slice(0,3);

    spans.forEach((s,i)=> s.textContent = scrambled[i]);
  }

  setTimeout(()=>{
    wall.classList.add("hidden");
    firstInspect = false;
  }, firstInspect ? 2500 : 1200);
};

/* Pick symbol — replace slots instead of locking */
function pick(symbol){
  if (locked) return;

  if (picks.length < 3) {
    picks.push(symbol);
    slots[picks.length - 1].textContent = symbol;
  } else {
    /* Shift-left correction system */
    picks.shift();
    picks.push(symbol);

    slots.forEach((s,i)=>{
      s.textContent = picks[i] || "?";
    });
  }
}

/* Door logic */
document.getElementById("doorBtn").onclick = () => {
  if (locked) return;

  if(!inspected){
    result.textContent = "The room ignores the uncurious.";
    return;
  }

  if (arraysEqual(picks, correctOrder)) {
    locked = true;
    correctSnd.play();
    result.innerHTML = "<strong>The chamber opens.</strong>";
    win();
  } else {
    wrongSnd.play();
    result.textContent = "The wall denies you.";
    punishmentReset();
  }
};

/* Compare arrays */
function arraysEqual(a,b){
  return a.length === b.length && a.every((v,i)=>v===b[i]);
}

/* Punishment reset */
function punishmentReset(){
  picks = [];
  slots.forEach(s=>s.textContent="?");

  /* Wall forgets faster now */
  inspected = false;
}

/* WIN */
function win(){
  /* Progression */
  localStorage.setItem("level4Solved","true");

  if (localStorage.getItem("level5Solved") === null) {
    localStorage.setItem("level5Solved","false");
  }

  localStorage.setItem("currentLevel","4");

  setTimeout(loadNext, 1000);
}

/* Loader */
function loadNext(){
  const loader = document.getElementById("loader");
  const fill = loader.querySelector(".fill");
  const percent = document.getElementById("percent");

  loader.classList.remove("hidden");
  let p = 0;

  const i = setInterval(()=>{
    p += Math.floor(Math.random()*8) + 4;
    if (p > 100) p = 100;

    fill.style.width = p + "%";
    percent.textContent = p + "%";

    if(p >= 100){
      clearInterval(i);
      window.location.href = "level.html";
    }
  }, 250);
}