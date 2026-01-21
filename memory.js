// memory.js — Player Behavior Tracking System (UPGRADED + SAFE)

/* ================= INIT GUARD ================= */
(function initializeOnce(){
  if(!localStorage.getItem("huntedInitialized")){
    localStorage.clear();
    localStorage.setItem("huntedInitialized","true");
    localStorage.setItem("level1Solved","true"); // always unlocked
  }
})();

/* ================= LEVEL TEMPLATE ================= */
const DEFAULT_LEVEL = () => ({
  attempts: 0,
  failures: 0,
  hesitation: 0,
  inspectionTime: null,
  completionTime: null,
  firstSymbolOrder: [],
  mistakes: []
});

/* ================= MEMORY SYSTEM ================= */
const MemorySystem = {
  data: {
    sessionId: null,
    startTime: null,
    totalTime: 0,

    currentLevel: 1,
    levels: { 1: DEFAULT_LEVEL() },

    patterns: {
      hesitationTimes: [],
      clickSpeed: [],
      mistakeTypes: [],
      retryDelay: [],
      prefersVisual: false,
      trialAndError: 0,
      methodical: 0
    },

    profile: {
      trustScore: 1.0,
      patienceScore: 1.0,
      confidenceScore: 1.0,
      fearResponse: "unknown"
    },

    storyFragments: [],
    revealedTruths: [],
    liesTold: 0,
    trustBroken: false,
    endingPath: null
  },

  /* ================= CORE ================= */
  init(){
    this.load();

    if(!this.data.sessionId){
      this.data.sessionId =
        `hunted_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      this.data.startTime = Date.now();
    }

    if(!this.data.levels[this.data.currentLevel]){
      this.data.levels[this.data.currentLevel] = DEFAULT_LEVEL();
    }

    this.save();
    console.log("Memory System Initialized:", this.data.sessionId);
  },

  save(){
    try {
      localStorage.setItem("HUNTED_MEMORY", JSON.stringify(this.data));
    } catch(e){
      console.warn("Memory save failed:", e);
    }
  },

  load(){
    try {
      const raw = localStorage.getItem("HUNTED_MEMORY");
      if(!raw) return;

      const saved = JSON.parse(raw);
      this.data = {
        ...this.data,
        ...saved,
        levels: { ...this.data.levels, ...saved.levels }
      };
    } catch(e){
      console.warn("Memory load failed:", e);
    }
  },

  /* ================= EVENTS ================= */
  recordEvent(type, payload = {}){
    const now = Date.now();
    const lvlId = this.data.currentLevel;
    const lvl = this.data.levels[lvlId] ||= DEFAULT_LEVEL();

    switch(type){

      case "level_start":
        lvl.inspectionTime = now;
        break;

      case "inspect": {
        const hesitation = now - (lvl.inspectionTime || now);
        lvl.hesitation = hesitation;
        this.data.patterns.hesitationTimes.push(hesitation);

        if(hesitation > 10000){
          this.data.profile.fearResponse = "hesitant";
          this.data.profile.patienceScore *= 0.9;
        } else if(hesitation < 2000){
          this.data.profile.fearResponse = "rushed";
          this.data.profile.confidenceScore *= 0.9;
        }
        break;
      }

      case "attempt":
        lvl.attempts++;
        break;

      case "failure":
        lvl.failures++;
        lvl.mistakes.push({
          attempt: lvl.attempts,
          symbols: payload.symbols || [],
          time: now
        });
        if(lvl.failures > 2){
          this.data.profile.trustScore *= 0.9;
        }
        break;

      case "success":
        lvl.completionTime = now;
        this.data.profile.confidenceScore =
          Math.min(1, this.data.profile.confidenceScore * 1.1);
        this.updatePlayTime();
        break;

      case "symbol_rotate": {
        const last = this.data.patterns.clickSpeed.at(-1);
        const delta = last ? now - last.time : 0;
        this.data.patterns.clickSpeed.push({ time: now, delta });

        if(delta && delta < 300) this.data.patterns.trialAndError++;
        if(delta > 1000) this.data.patterns.methodical++;
        break;
      }
    }

    this.save();
  },

  /* ================= PROGRESSION ================= */
  markLevelComplete(level){
    localStorage.setItem(`level${level}Solved`, "true");
    localStorage.setItem(`level${level+1}Solved`, "true");
  },

  nextLevel(){
    const lvl = this.data.currentLevel;
    this.markLevelComplete(lvl);

    this.data.currentLevel++;
    this.data.levels[this.data.currentLevel] ||= DEFAULT_LEVEL();

    this.updatePlayTime();
    this.save();
  },

  isLevelUnlocked(level){
    return localStorage.getItem(`level${level}Solved`) === "true";
  },

  /* ================= RESET CONTROLS ================= */
  restartGame(){
    localStorage.clear();
    localStorage.setItem("huntedInitialized","true");
    localStorage.setItem("level1Solved","true");
    location.reload();
  },

  softReset(){
    this.data.currentLevel = 1;
    this.data.levels = { 1: DEFAULT_LEVEL() };
    localStorage.setItem("level1Solved","true");
    this.save();
  },

  /* ================= TIME ================= */
  updatePlayTime(){
    if(this.data.startTime){
      this.data.totalTime = Date.now() - this.data.startTime;
    }
  }
};

/* ================= AUTO INIT ================= */
MemorySystem.init();
window.memory = MemorySystem;

window.addEventListener("beforeunload", ()=>{
  MemorySystem.updatePlayTime();
  MemorySystem.save();
});