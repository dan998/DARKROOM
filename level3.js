const symbols = ["☪️","✡️","☯️","🕎"];

let trueSequence = [];
let progress = 0;
let used = new Set();
let listening = true;

/* Sounds */
const ambience = document.getElementById("ambience");
const whispers = [
  document.getElementById("whisper1"),
  document.getElementById("whisper2"),
  document.getElementById("whisper3")
];
const failSound = document.getElementById("fail");

/* Start ambience */
ambience.volume = 0.5;
ambience.play();

/* Generate real sequence */
function generateSequence(){
  trueSequence = [...symbols].sort(()=>0.5-Math.random()).slice(0,3);
}

/* Fake visual illusion */
function startIllusion(){
  const illusion = document.getElementById("illusion");
  setInterval(()=>{
    illusion.textContent =
      symbols.sort(()=>0.5-Math.random()).slice(0,3).join(" ");
  },350);
}

/* Play whisper sequence */
function playWhispers(){
  let i = 0;
  function playNext(){
    if(i >= trueSequence.length){
      listening = false;
      document.getElementById("result").textContent =
        "The echoes fade. Now choose.";
      return;
    }
    whispers[i].play();
    i++;
    setTimeout(playNext,1400);
  }
  playNext();
}

/* Player choice */
function choose(symbol){
  if(listening){
    fail("You touched too early.");
    return;
  }

  if(used.has(symbol)){
    fail("The chamber rejects repetition.");
    return;
  }

  if(symbol === trueSequence[progress]){
    used.add(symbol);
    progress++;
    markUsed(symbol);

    if(progress === trueSequence.length){
      win();
    }
  } else {
    fail("The echo screams wrong.");
  }
}

/* Mark used */
function markUsed(symbol){
  document.querySelectorAll("button").forEach(btn=>{
    if(btn.textContent === symbol){
      btn.classList.add("used");
    }
  });
}

/* Fail */
function fail(msg){
  failSound.play();
  document.body.classList.add("shake");
  document.getElementById("result").textContent = msg;

  setTimeout(()=>{
    document.body.classList.remove("shake");
    reset();
  },800);
}

/* Reset */
function reset(){
  progress = 0;
  used.clear();
  listening = true;
  document.querySelectorAll("button").forEach(b=>b.classList.remove("used"));
  playWhispers();
}

/* Win */
function win(){
  document.getElementById("result").innerHTML =
    "The chamber falls silent.<br><strong>You endured.</strong>";
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
  loader.style.color="#8b0000";
  loader.innerHTML=`
    <p>Echoes judging...</p>
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
    p += Math.floor(Math.random()*7)+5;
    if(p>=100) p=100;
    bar.style.width = p+"%";
    percent.textContent = p+"%";
    if(p===100){
      clearInterval(interval);
      window.location.href="level4.html";
    }
  },300);
}

/* Init */
generateSequence();
startIllusion();
setTimeout(playWhispers,1000);