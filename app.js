/**
 * Sidney Lokker 5000 - Hoofdlogica
 * Activeert onweerstaanbare honden om Sidney te lokken!
 */

// Fallback hondenlijst mocht de publieke API onverhoopt offline zijn
const FALLBACK_DOGS = [
  {
    url: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80",
    breed: "Vrolijke Beagle"
  },
  {
    url: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80",
    breed: "Knuffelige Franse Bulldog"
  },
  {
    url: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80",
    breed: "Gouden Retriever"
  },
  {
    url: "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&w=800&q=80",
    breed: "Lieve Corgi"
  },
  {
    url: "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=800&q=80",
    breed: "Speelse Mopshond"
  }
];

// Sidney reactieberichten voor extra sfeer en humor
const SIDNEY_REACTIONS = [
  { title: "Sidney Gespot!", text: "Sidney kijkt al op en kan deze hond absoluut niet weerstaan!" },
  { title: "Volle Treffer! 🎯", text: "Sidney roept: 'Awwwww, kijk nou hoe schattig!'" },
  { title: "Sidney is Gelokt! 🏃‍♂️💨", text: "Sidney laat alles vallen en rent al naar de voordeur!" },
  { title: "Maximale Lokkracht Bereikt!", text: "Sidney is 100% afgeleid en smelt ter plekke!" },
  { title: "Sidney Biedt Al Koekjes Aan! 🍪", text: "Onweerstaanbare blik gedetecteerd. Sidney is helemaal om!" },
  { title: "Critical Hit op Sidney! ✨", text: "Sidney vraagt direct: 'Mogen we deze hond adopteren?!'" }
];

// Lokale toestand
let state = {
  count: parseInt(localStorage.getItem('sidney_lok_count') || '0', 10),
  soundEnabled: localStorage.getItem('sidney_sound_enabled') !== 'false',
  isLoading: false,
  currentImageUrl: ""
};

// DOM Elementen
const lureButton = document.getElementById('lureButton');
const soundToggle = document.getElementById('soundToggle');
const soundIcon = document.getElementById('soundIcon');
const soundText = document.getElementById('soundText');
const systemStatus = document.getElementById('systemStatus');

const placeholderState = document.getElementById('placeholderState');
const loadingState = document.getElementById('loadingState');
const dogResultState = document.getElementById('dogResultState');
const loadingMessage = document.getElementById('loadingMessage');

const dogImage = document.getElementById('dogImage');
const dogBreedBadge = document.getElementById('dogBreedBadge');
const sidneyAlertTitle = document.getElementById('sidneyAlertTitle');
const sidneyAlertText = document.getElementById('sidneyAlertText');

const anotherDogBtn = document.getElementById('anotherDogBtn');
const saveDogBtn = document.getElementById('saveDogBtn');

const lureCountEl = document.getElementById('lureCount');
const lurePowerEl = document.getElementById('lurePower');

// Geluidseffecten via Web Audio API (100% offline & betrouwbaar)
let audioCtx = null;

function initAudio() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

function playDogBarkSound() {
  if (!state.soundEnabled) return;
  try {
    initAudio();
    if (!audioCtx) return;

    const now = audioCtx.currentTime;

    // Speelse 'Woof / Bark' synthesizer
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();

    osc.type = 'sawtooth';
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(320, now);
    filter.Q.setValueAtTime(3, now);

    // Toonhoogte modulatie (stijgt en daalt snel, net als een vrolijke blaf)
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.05);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.18);

    // Volume envelope
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.35, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.23);

    // Korte tweede 'woof-echo' voor extra realisme
    setTimeout(() => {
      if (!audioCtx || !state.soundEnabled) return;
      const t2 = audioCtx.currentTime;
      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      const filter2 = audioCtx.createBiquadFilter();

      osc2.type = 'sawtooth';
      filter2.type = 'bandpass';
      filter2.frequency.setValueAtTime(380, t2);

      osc2.frequency.setValueAtTime(240, t2);
      osc2.frequency.exponentialRampToValueAtTime(460, t2 + 0.04);
      osc2.frequency.exponentialRampToValueAtTime(160, t2 + 0.15);

      gain2.gain.setValueAtTime(0, t2);
      gain2.gain.linearRampToValueAtTime(0.25, t2 + 0.02);
      gain2.gain.exponentialRampToValueAtTime(0.001, t2 + 0.17);

      osc2.connect(filter2);
      filter2.connect(gain2);
      gain2.connect(audioCtx.destination);

      osc2.start(t2);
      osc2.stop(t2 + 0.18);
    }, 140);
  } catch (err) {
    console.warn("Audio playback error:", err);
  }
}

// Converteer Dog CEO API URL naar leesbaar hondenras (bijv. "retriever-golden" -> "Golden Retriever")
function extractBreedFromUrl(url) {
  try {
    const match = url.match(/breeds\/([^/]+)/);
    if (!match) return "Onweerstaanbare Rashond";

    const rawBreed = match[1];
    const parts = rawBreed.split('-');
    if (parts.length > 1) {
      // bijv. "retriever-golden" -> "Golden Retriever"
      return `${capitalize(parts[1])} ${capitalize(parts[0])}`;
    }
    return capitalize(parts[0]);
  } catch (e) {
    return "Lieve Hond";
  }
}

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// Maak rondvliegende hondenpootjes / confetti effecten bij de knop
function spawnPawParticles(originX, originY) {
  const particles = ['🐾', '🐶', '🦴', '✨', '💖'];
  const count = 12;

  for (let i = 0; i < count; i++) {
    const particle = document.createElement('span');
    particle.className = 'paw-particle';
    particle.textContent = particles[Math.floor(Math.random() * particles.length)];

    // Bereken willekeurige spreiding
    const angle = Math.random() * 2 * Math.PI;
    const distance = 60 + Math.random() * 110;
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance;
    const rot = (Math.random() - 0.5) * 180;

    particle.style.setProperty('--tx', `${tx}px`);
    particle.style.setProperty('--ty', `${ty}px`);
    particle.style.setProperty('--rot', `${rot}deg`);

    particle.style.left = `${originX}px`;
    particle.style.top = `${originY}px`;

    document.body.appendChild(particle);

    setTimeout(() => {
      particle.remove();
    }, 850);
  }
}

// Update de dashboard tellers
function updateStatsUI() {
  lureCountEl.textContent = state.count;
  // Lokkracht groeit per hond tot 5000%
  const power = Math.min(5000, Math.max(100, state.count * 100));
  lurePowerEl.textContent = `${power}%`;
}

// Wissel tussen scherm statussen
function showScreenState(status) {
  placeholderState.hidden = status !== 'placeholder';
  loadingState.hidden = status !== 'loading';
  dogResultState.hidden = status !== 'result';

  if (status === 'loading') {
    systemStatus.textContent = 'BEZIG MET LOKKEN...';
    systemStatus.style.color = 'var(--primary)';
  } else if (status === 'result') {
    systemStatus.textContent = 'SIDNEY SUCCESVOL GELOKT!';
    systemStatus.style.color = 'var(--accent-green)';
  } else {
    systemStatus.textContent = 'STANDBY - KLAAR VOOR ACTIE';
    systemStatus.style.color = 'var(--accent-cyan)';
  }
}

// Haal hondenfoto op met timeout en fallbacks
async function fetchDogWithFallback() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4500);

  try {
    const response = await fetch('https://dog.ceo/api/breeds/image/random', {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();

    if (data.status === 'success' && data.message) {
      return {
        url: data.message,
        breed: extractBreedFromUrl(data.message)
      };
    }
    throw new Error('Ongeldige API reactie');
  } catch (err) {
    console.warn("Dog CEO API kon niet worden geladen of timeout; fallback wordt gebruikt:", err);
    // Kies willekeurige fallback
    const randomIndex = Math.floor(Math.random() * FALLBACK_DOGS.length);
    return FALLBACK_DOGS[randomIndex];
  }
}

// Hoofdfunctie: Lok Sidney met een hond
async function triggerLure(event) {
  if (state.isLoading) return;
  state.isLoading = true;

  // Speel blafgeluid af en toon partikels
  playDogBarkSound();

  const rect = (event && event.currentTarget) ? event.currentTarget.getBoundingClientRect() : lureButton.getBoundingClientRect();
  const originX = rect.left + rect.width / 2;
  const originY = rect.top + rect.height / 2;
  spawnPawParticles(originX, originY);

  // Verhoog teller en sla op
  state.count++;
  localStorage.setItem('sidney_lok_count', state.count.toString());
  updateStatsUI();

  // Schakel naar loading scherm
  showScreenState('loading');
  dogImage.classList.remove('loaded');

  try {
    const dogData = await fetchDogWithFallback();
    state.currentImageUrl = dogData.url;

    // Wacht tot de afbeelding daadwerkelijk geladen is voor een vloeiende weergave
    await new Promise((resolve) => {
      const img = new Image();
      img.onload = resolve;
      img.onerror = resolve; // Doorgaan ook bij load issue
      img.src = dogData.url;
    });

    dogImage.src = dogData.url;
    dogBreedBadge.textContent = dogData.breed;

    // Kies willekeurige grappige reactie
    const reaction = SIDNEY_REACTIONS[Math.floor(Math.random() * SIDNEY_REACTIONS.length)];
    sidneyAlertTitle.textContent = reaction.title;
    sidneyAlertText.textContent = reaction.text;

    showScreenState('result');

    // Fade-in effect
    requestAnimationFrame(() => {
      dogImage.classList.add('loaded');
    });

  } catch (error) {
    console.error("Fout bij ophalen:", error);
    showScreenState('placeholder');
  } finally {
    state.isLoading = false;
  }
}

// Geluid knop toggle
function setupAudioToggle() {
  function renderSoundState() {
    if (state.soundEnabled) {
      soundIcon.textContent = '🔊';
      soundText.textContent = 'Geluid: Aan';
      soundToggle.setAttribute('aria-pressed', 'true');
    } else {
      soundIcon.textContent = '🔇';
      soundText.textContent = 'Geluid: Uit';
      soundToggle.setAttribute('aria-pressed', 'false');
    }
  }

  soundToggle.addEventListener('click', () => {
    state.soundEnabled = !state.soundEnabled;
    localStorage.setItem('sidney_sound_enabled', state.soundEnabled.toString());
    renderSoundState();
    if (state.soundEnabled) {
      initAudio();
      playDogBarkSound();
    }
  });

  renderSoundState();
}

// Knoppen en interacties instellen
function initApp() {
  updateStatsUI();
  setupAudioToggle();

  lureButton.addEventListener('click', (e) => {
    triggerLure(e);
  });

  anotherDogBtn.addEventListener('click', (e) => {
    triggerLure(e);
  });

  saveDogBtn.addEventListener('click', async () => {
    if (!state.currentImageUrl) return;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(state.currentImageUrl);
        const originalText = saveDogBtn.innerHTML;
        saveDogBtn.innerHTML = '<span>✅</span> Gekopieerd!';
        setTimeout(() => {
          saveDogBtn.innerHTML = originalText;
        }, 2000);
      } else {
        window.open(state.currentImageUrl, '_blank');
      }
    } catch (err) {
      window.open(state.currentImageUrl, '_blank');
    }
  });

  // Toegankelijkheid: Toetsenbordondersteuning (Spatie / Enter)
  document.addEventListener('keydown', (e) => {
    if ((e.code === 'Space' || e.code === 'Enter') && document.activeElement === lureButton) {
      // Reeds standaard browsergedrag voor buttons, geen duplicate calls nodig
    }
  });
}

// Start applicatie zodra DOM geladen is
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
