let inspected = false;
let solved = false;

const symbols = ["","","",""];
const hints = [
  "Faith blinded them; shadows fell in 1147.",
  "Knowledge invited hunters; scholars vanished in 1349.",
  "Balance was a lie; harmony betrayed souls in 1620.",
  "The flame revealed souls; darkness consumed the unworthy in 1793."
];

let chosen = [];
let correctOrder = [];
let userSlots = ["","",""];

// Sounds
const ambience = document.getElementById("ambience");
const rotateSound = document.getElementById("rotate");
const doorCreak = document.getElementById("doorCreak");
const doorJump = document.getElementById("doorJump");
const whisper = document.getElementById("whisper");
const wrongClick = document.getElementById("wrongClick");

function inspect(){
  inspected = true;

  if(ambience) { ambience.volume=0.5; ambience.play(); }
  if(whisper) { whisper.volume=0.4; whisper.play(); }

  // Pick 3 symbols randomly for puzzle
  chosen = symbols.sort(()=>0.5-Math.random()).slice(0,3);
  correctOrder = [...chosen];

  // Random hints
  let shuffledHints = hints.sort(()=>0.5-Math.random()).slice(0,3);
  let hintHTML = "";
  chosen.forEach((s,i)=> hintHTML += `<strong>${s}</strong> — ${shuffledHints[i]}<br>`);
  document.getElementById("clues").innerHTML = hintHTML;

  // Reset slots
  document.querySelectorAll(".slot").forEach((el)=> el.textContent="?");
  userSlots = ["","",""];
  document.getElementById("result").textContent = "Select the symbols in order. Do not repeat symbols!";
}

function pick(sym){
  if(solved) return;

  if(userSlots.includes(sym)){
    if(wrongClick){ wrongClick.currentTime=0; wrongClick.play(); }
    document.getElementById("result").textContent = "You cannot pick the same symbol twice!";
    return;
  }

  for(let i=0;i<3;i++){
    if(userSlots[i]===""){
      userSlots[i]=sym;
      document.getElementById("slot"+i).textContent=sym;
      if(rotateSound){ rotateSound.currentTime=0; rotateSound.play(); }
      break;
    }
  }
}

function check(){
  if(!inspected){
    document.getElementById("result").textContent = "The door waits for understanding.";
    return;
  }

  if(userSlots.includes("")){
    document.getElementById("result").textContent = "All slots must be filled.";
    if(wrongClick){ wrongClick.currentTime=0; wrongClick.play(); }
    return;
  }

  let ok = true;
  for(let i=0;i<3;i++){ if(userSlots[i]!==correctOrder[i]) ok=false; }

  if(ok){
    solved=true;
    document.getElementById("result").innerHTML = "The lock clicks.<br><strong>You may pass.</strong>";
    if(doorCreak){ doorCreak.play(); setTimeout(()=>doorJump.play(),600); }

    // Loader to next level
    setTimeout(()=>{
      const loader=document.createElement("div");
      loader.classList.add("loaderOverlay");
      loader.innerHTML=`
        <p>The room exhales...</p>
        <div class="bar-container">
          <div class="bar-fill"></div>
          <div class="blood"></div>
        </div>
        <span id="percent">0%</span>`;
      document.body.appendChild(loader);

      const fill = loader.querySelector(".bar-fill");
      const percentText = loader.querySelector("#percent");
      let progress=0;
      const interval = setInterval(()=>{
        progress+=Math.floor(Math.random()*8)+3;
        if(progress>=100) progress=100;
        fill.style.width = progress+"%";
        percentText.innerText = progress+"%";
        if(progress>=100){ clearInterval(interval); window.location.href="level2.html"; }
      },300);
    },800);

  } else {
    document.getElementById("result").textContent = "The lock resists. Look at the wall again.";
    if(wrongClick){ wrongClick.currentTime=0; wrongClick.play(); }
  }
}