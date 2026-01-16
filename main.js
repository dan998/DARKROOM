// ================== DOM ELEMENTS ==================
const ambience = document.getElementById("ambience");
const whisper = document.getElementById("whisper");

const landing = document.querySelector(".landing");
const loader = document.querySelector(".loader");
const fill = document.querySelector(".bar-fill");
const percentText = document.getElementById("percent");
const hauntedImages = document.querySelectorAll(".haunted-images img");
const blood = document.querySelector(".blood");

// Optional scary sound
const doorNoise = new Audio("audio/door.mp3");
doorNoise.volume = 0.4;

// ================== AMBIENCE ==================
document.body.addEventListener("click", () => {
  ambience.volume = 0.4;
  ambience.play().catch(e => console.log("Ambience play error:", e));
}, { once:true });

// ================== HAUNTED IMAGE FLASH ==================
function flashHauntedImage() {
  hauntedImages.forEach(img => img.classList.remove("flash-active"));
  const randomIndex = Math.floor(Math.random() * hauntedImages.length);
  hauntedImages[randomIndex].classList.add("flash-active");

  if(Math.random() < 0.15) { // 15% chance door creak
    doorNoise.currentTime = 0;
    doorNoise.play().catch(e => console.log("Door sound error:", e));
  }
}

let flashInterval;

// ================== START GAME / LOADER ==================
function startGame() {
  // Play whisper
  whisper.volume = 0.7;
  whisper.play().catch(e => console.log("Whisper play error:", e));

  // Hide landing, show loader
  landing.classList.remove("active");
  loader.classList.add("active");

  flashInterval = setInterval(flashHauntedImage, 700);

  let progress = 0;
  const loadInterval = setInterval(() => {
    progress += Math.floor(Math.random() * 8) + 3;
    if(progress >= 100) progress = 100;

    fill.style.width = progress + "%";
    percentText.innerText = progress + "%";

    const dripSpeed = 1 - (progress / 150);
    blood.style.animationDuration = dripSpeed + "s";

    if(progress === 100) {
      clearInterval(loadInterval);
      clearInterval(flashInterval);

      // Final door sound
      doorNoise.currentTime = 0;
      doorNoise.play();

      setTimeout(() => {
        window.location.href = "game.html";
      }, 800);
    }
  }, 300);
}