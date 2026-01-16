const symbols = ["☪️","✡️","☯️","🕎"];

let sequence = [];
let progress = 0;
let used = new Set();

/* Generate random non-repeating sequence */
function generateSequence(){
  sequence = symbols
    .sort(()=>0.5-Math.random())
    .slice(0,3); // can change to 4 later
}

/* Show vision briefly */
function showVision(){
  const vision = document.getElementById("vision");
  vision.textContent = sequence.join(" ");
  vision.style.opacity = 1;

  setTimeout(()=>{
    vision.style.opacity = 0;
  },2000);
}

/* Player chooses symbol */
function choose(symbol){
  const result = document.getElementById("result");

  if(used.has(symbol)){
    result.textContent = "The corridor rejects repetition.";
    return;
  }

  if(symbol === sequence[progress]){
    used.add(symbol);
    progress++;

    markUsed(symbol);

    if(progress === sequence.length){
      result.innerHTML = "The hall bows.<br><strong>You are allowed through.</strong>";
      setTimeout(()=>{
        window.location.href = "level3.html";
      },1500);
    }
  } else {
    fail();
  }
}

/* Mark symbol burned */
function markUsed(symbol){
  document.querySelectorAll(".symbol").forEach(btn=>{
    if(btn.textContent === symbol){
      btn.classList.add("used");
    }
  });
}

/* Failure */
function fail(){
  const result = document.getElementById("result");
  result.textContent = "Wrong. The corridor forgets you.";
  document.body.classList.add("shake");

  setTimeout(()=>{
    document.body.classList.remove("shake");
    resetLevel();
  },600);
}

/* Reset */
function resetLevel(){
  progress = 0;
  used.clear();
  document.querySelectorAll(".symbol").forEach(b=>b.classList.remove("used"));
  showVision();
}

/* Start Level */
generateSequence();
setTimeout(showVision,500);