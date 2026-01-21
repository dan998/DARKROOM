const symbols = ["☪️","✡️","☯️","🕎"];

let sequence = [];
let progress = 0;
let used = new Set();

/* Sounds */
const ambience = document.getElementById("ambience");
const whisper = document.getElementById("whisper");
const clickSound = document.getElementById("click");
const failSound = document.getElementById("fail");

/* Start ambience */
ambience.volume = 0.5;
ambience.play().catch(()=>{});

/* Generate non-repeating sequence */
function generateSequence(){
  sequence = [...symbols].sort(()=>0.5-Math.random()).slice(0,3);
}

/* Show wall vision once */
function showVision(){
  const vision = document.getElementById("vision");
  vision.textContent = sequence.join(" ");
  vision.style.opacity = 1;
  whisper.currentTime = 0;
  whisper.play().catch(()=>{});

  setTimeout(()=>{
    vision.style.opacity = 0;
  },2200);
}

/* Choose symbol */
function choose(symbol){
  clickSound.currentTime = 0;
  clickSound.play().catch(()=>{});

  const result = document.getElementById("result");

  if(used.has(symbol)){
    result.textContent = "The hall recoils from repetition.";
    return;
  }

  if(symbol === sequence[progress]){
    used.add(symbol);
    progress++;
    markUsed(symbol);

    if(progress === sequence.length){
      win();
    }
  } else {
    fail();
  }
}

/* Mark used */
function markUsed(symbol){
  document.querySelectorAll(".symbol").forEach(btn=>{
    if(btn.textContent === symbol){
      btn.classList.add("used");
    }
  });
}

/* Failure */
function fail(){
  failSound.currentTime = 0;
  failSound.play().catch(()=>{});

  document.body.classList.add("shake");
  document.getElementById("result").textContent =
    "Wrong. The witnesses turn away.";

  setTimeout(()=>{
    document.body.classList.remove("shake");
    reset();
  },700);
}

/* Reset level */
function reset(){
  progress = 0;
  used.clear();
  document.querySelectorAll(".symbol").forEach(b=>b.classList.remove("used"));
  showVision();
}

/* ✅ WIN — FIXED */
function win(){
  document.getElementById("result").innerHTML =
    "The hall opens.<br><strong>You may pass.</strong>";

  // ✅ MARK LEVEL 2 AS SOLVED
  localStorage.setItem("level2Solved", "true");

  // ✅ PREPARE LEVEL 3
  if (localStorage.getItem("level3Solved") === null) {
    localStorage.setItem("level3Solved", "false");
  }

  // Optional progression tracking
  localStorage.setItem("currentLevel", "2");

  setTimeout(showLoader,1200);
}

/* Loader */
function showLoader(){
  const loader = document.createElement("div");
  loader.style.position="fixed";
  loader.style.inset="0";
  loader.style.background="black";
  loader.style.display="flex";
  loader.style.flexDirection="column";
  loader.style.justifyContent="center";
  loader.style.alignItems="center";
  loader.style.color="#b30000";
  loader.innerHTML=`
    <p>Judging memory...</p>
    <div style="width:300px;height:10px;border:1px solid #550000;margin:15px;">
      <div id="bar" style="height:100%;width:0;background:#8b0000;"></div>
    </div>
    <span id="percent">0%</span>
  `;
  document.body.appendChild(loader);

  let p=0;
  const bar = loader.querySelector("#bar");
  const percent = loader.querySelector("#percent");

  const interval = setInterval(()=>{
    p += Math.floor(Math.random()*8)+4;
    if(p>=100) p=100;
    bar.style.width = p+"%";
    percent.textContent = p+"%";
    if(p===100){
      clearInterval(interval);
      window.location.href="level.html";
    }
  },300);
}

/* Init */
generateSequence();
setTimeout(showVision,800);