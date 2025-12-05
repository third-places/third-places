// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {

// Intro screen management
let currentIntroScreen = 0;
const totalIntroScreens = 2;
let introAutoAdvanceTimer = null;
let dataPreloaded = false;

// 🔥 REPLACE WITH YOUR JSON BIN CREDENTIALS
const BIN_ID = '6930a8ef43b1c97be9d5e9d7';
const API_KEY = '$2a$10$g1dt5Gx9rBAekKMLpAb2Qeu8EeOAjATgYXWCh/vfbR65ab45ZAUUy';

// Location data
const locations = [
  { id: 'library', label: 'Library', icon: '📚' },
  { id: 'cafe', label: 'Cafe', icon: '☕' },
  { id: 'gym', label: 'Gym', icon: '💪' },
  { id: 'religious', label: 'Religious\nSpace', icon: '🙏' },
  { id: 'bar', label: 'Bar', icon: '🍷' },
  { id: 'park', label: 'Park', icon: '🌳' },
  { id: 'museum', label: 'Museum', icon: '🏛️' }
];

// New reasons data
const reasons = [
  { id: 'open', label: "It's open and inviting", color: '#f4b5c5' },
  { id: 'comfortable', label: "It's comfortable and informal", color: '#f4d77e' },
  { id: 'convenient', label: "It's convenient", color: '#a8c5e8' },
  { id: 'unpretentious', label: "It's unpretentious", color: '#f4d3a8' },
  { id: 'regulars', label: 'There are regulars', color: '#e8e8e8' },
  { id: 'conversation', label: 'Conversation is the main activity', color: '#d4e8d4' },
  { id: 'laughter', label: 'Laughter is frequent', color: '#f4c4d0' }
];

// State
let selected = [];
let votes = {};
let totalVotes = 0;
let showingResults = false;
let isTransitioning = false; // ADD THIS


// DOM elements
let shapesGrid;
let nextButton;
let buttonText;
let selectedCount;

// State for reasons voting
let reasonsSelected = [];
let reasonsVotes = {};
let reasonsTotalVotes = 0;

// Progress bar helpers - ADD THESE HERE
function showProgressBar(duration) {
  const progressBar = document.getElementById('progressBar');
  const progressFill = progressBar.querySelector('.progress-bar-fill');
  
  progressBar.style.display = 'block';
  progressFill.style.transition = `transform ${duration}ms linear`;
  progressFill.style.transform = 'scaleX(1)';
  
  // Trigger animation
  setTimeout(() => {
    progressFill.style.transform = 'scaleX(0)';
  }, 10);
}

function hideProgressBar() {
  const progressBar = document.getElementById('progressBar');
  progressBar.style.display = 'none';
  const progressFill = progressBar.querySelector('.progress-bar-fill');
  progressFill.style.transition = 'none';
  progressFill.style.transform = 'scaleX(1)';
}

// Splash screen animation
function initSplash() {
  const splashImages = document.getElementById('splashImages');
  const splashIcons = document.getElementById('splashIcons');
  
const imagePositions = [
  { top: '5%', left: '5%', width: '400px', height: '300px', delay: '0s' },
  { top: '15%', right: '8%', width: '350px', height: '280px', delay: '2s' },
  { top: '60%', left: '10%', width: '450px', height: '320px', delay: '4s' },
  { top: '65%', right: '15%', width: '380px', height: '290px', delay: '6s' },
  { top: '35%', left: '2%', width: '320px', height: '250px', delay: '8s' },
  { top: '40%', right: '3%', width: '420px', height: '310px', delay: '10s' },
  { top: '10%', left: '15%', width: '370px', height: '280px', delay: '12s' },
  { top: '55%', right: '10%', width: '400px', height: '300px', delay: '14s' }
];
// Array of your image filenames (put your actual image files in the same folder as index.html)
const imageFiles = ['bell-in-hand-1.jpg', 'bellinhand-2.webp', 'bostoncommons-1.webp', 'bostoncommons.webp', 'bpl-2.jpg', 'bpl-3.jpg', 'bpl.jpg', 'caffenero.webp', 'lynx.jpg', 'mfa-2.jpg', 'mfa.jpg', 'trinitychurch.jpg'];

imagePositions.forEach((pos, index) => {
  const box = document.createElement('div');
  box.className = 'splash-image-box';
  box.style.top = pos.top;
  if (pos.left) box.style.left = pos.left;
  if (pos.right) box.style.right = pos.right;
  box.style.width = pos.width;
  box.style.height = pos.height;
  box.style.animationDelay = pos.delay;
  
  // Add image inside the box
  box.style.backgroundImage = `url('${imageFiles[index % imageFiles.length]}')`;
  box.style.backgroundSize = 'cover';
  box.style.backgroundPosition = 'center';
  
  splashImages.appendChild(box);
});
  
  // Generate random icon circles
  const iconPositions = [
    { top: '12%', left: '35%', size: '60px', delay: '1.5s', color: '#f4d3a8' },
    { top: '25%', right: '25%', size: '80px', delay: '3.5s', color: '#e8b5c5' },
    { top: '72%', left: '45%', size: '50px', delay: '2.5s', color: '#8aabc4' },
    { top: '80%', right: '35%', size: '70px', delay: '4.5s', color: '#f4d77e' },
    { top: '45%', left: '15%', size: '55px', delay: '0.5s', color: '#f0c4d0' }
  ];
  
  iconPositions.forEach(pos => {
    const circle = document.createElement('div');
    circle.className = 'splash-icon-circle';
    circle.style.top = pos.top;
    if (pos.left) circle.style.left = pos.left;
    if (pos.right) circle.style.right = pos.right;
    circle.style.width = pos.size;
    circle.style.height = pos.size;
    circle.style.backgroundColor = pos.color;
    circle.style.animationDelay = pos.delay;
    splashIcons.appendChild(circle);
  });
  
// Get Started button
document.getElementById('splashButton').addEventListener('click', () => {
  document.getElementById('splashContainer').style.display = 'none';
  document.getElementById('introContainer').style.display = 'flex';
  initIntro(); // <-- ADD THIS LINE to start intro when button is clicked
});
}

// Start splash screen
initSplash();

// Start intro AND preload data
// Start intro AND preload data
// Start intro AND preload data
async function initIntro() {
  const introContainer = document.getElementById('introContainer');
  
  // Force reflow to restart the animation
  const firstScreen = document.querySelector('.intro-screen[data-screen="0"]');
  firstScreen.classList.remove('active');
  
  // Use setTimeout to trigger animation after display
  setTimeout(() => {
    firstScreen.classList.add('active');
  }, 50);
  
  // Show progress bar IMMEDIATELY before any async operations
  showProgressBar(3000);
  
  // Start the timer immediately (don't wait for loadVotes)
  introAutoAdvanceTimer = setTimeout(() => {
    nextIntroScreen();
  }, 3000);
  
  // Set up click handler
  introContainer.addEventListener('click', () => {
    clearTimeout(introAutoAdvanceTimer);
    nextIntroScreen();
  });
  
  // Load votes in the background (doesn't block the timer)
  await loadVotes();
  dataPreloaded = true;
}
function nextIntroScreen() {
  const screens = document.querySelectorAll('.intro-screen');
  
  if (currentIntroScreen >= totalIntroScreens) {
    return;
  }
  
  hideProgressBar(); // Hide when clicking or advancing
  
  const currentScreen = screens[currentIntroScreen];
  currentScreen.classList.add('exiting');
  
  setTimeout(() => {
    currentScreen.classList.remove('active', 'exiting');
    currentIntroScreen++;
    
    if (currentIntroScreen >= totalIntroScreens) {
      clearTimeout(introAutoAdvanceTimer);
      document.getElementById('introContainer').classList.add('hidden');
      document.getElementById('mainContainer').style.display = 'flex';
      init();
    } else {
      const nextScreen = screens[currentIntroScreen];
      nextScreen.classList.add('active');
      
      showProgressBar(3000); // Show for next screen
      introAutoAdvanceTimer = setTimeout(() => {
        nextIntroScreen();
      }, 3000);
    }
  }, 800);
}

async function init() {
  shapesGrid = document.getElementById('shapesGrid');
  nextButton = document.getElementById('nextButton');
  buttonText = document.getElementById('buttonText');
  selectedCount = document.getElementById('selectedCount');
  
  if (!dataPreloaded) {
    await loadVotes();
  }
  
  renderShapes();
  setupEventListeners();
}

async function loadVotes() {
  try {
    const response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
      headers: { 'X-Master-Key': API_KEY }
    });
    
    if (response.ok) {
      const data = await response.json();
      votes = data.record.votes || {};
      totalVotes = data.record.total || 0;
      console.log('Loaded votes:', votes, 'Total:', totalVotes);
    } else {
      initializeVotes();
    }
  } catch (error) {
    console.error('Error loading votes:', error);
    initializeVotes();
  }
}

function initializeVotes() {
  votes = {};
  locations.forEach(loc => {
    votes[loc.id] = 0;
  });
  totalVotes = 0;
}

function renderShapes() {
  shapesGrid.innerHTML = '';
  
  locations.forEach((location, index) => {
    const shapeItem = document.createElement('div');
    shapeItem.className = 'shape-item';
    shapeItem.dataset.id = location.id;
    shapeItem.style.width = '160px';
    shapeItem.style.height = '160px';
    shapeItem.style.opacity = '0'; // Start invisible
    shapeItem.style.animationDelay = `${0.3 + (index * 0.1)}s`; // Set delay directly
    
// Remove animation after it completes so selection states work
shapeItem.addEventListener('animationend', function() {
  this.style.animation = 'none';
  this.style.opacity = ''; // Remove inline style so CSS can control it
});
    
    const shapeContent = document.createElement('div');
    shapeContent.className = 'shape-content';
    shapeContent.innerHTML = `
      <div class="icon">${location.icon}</div>
      <div class="label">${location.label}</div>
    `;
    
    const resultsContent = document.createElement('div');
    resultsContent.className = 'results-content';
    const percentage = getPercentage(location.id);
    const count = votes[location.id] || 0;
    resultsContent.innerHTML = `
      <div class="percentage">${percentage}%</div>
      <div class="vote-count">${count} votes</div>
    `;
    
    shapeItem.appendChild(shapeContent);
    shapeItem.appendChild(resultsContent);
    shapeItem.addEventListener('click', () => toggleSelection(location.id));
    
    shapesGrid.appendChild(shapeItem);
  });
}

function toggleSelection(id) {
  if (showingResults) return;
  
  const shapeItem = document.querySelector(`[data-id="${id}"]`);
  
  if (selected.includes(id)) {
    selected = selected.filter(s => s !== id);
    shapeItem.classList.remove('selected');
  } else {
    selected.push(id);
    shapeItem.classList.add('selected');
  }
  
  updateSelectedCount();
}

function updateSelectedCount() {
  if (selected.length > 0) {
    selectedCount.textContent = `${selected.length} selected`;
  } else {
    selectedCount.textContent = '';
  }
}

async function submitVotes() {
  if (selected.length > 0) {
    const newVotes = { ...votes };
    selected.forEach(id => {
      newVotes[id] = (newVotes[id] || 0) + 1;
    });
    const newTotal = totalVotes + 1;
    
    votes = newVotes;
    totalVotes = newTotal;
    
    showResults();
    
    try {
      const getCurrentData = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
        headers: { 'X-Master-Key': API_KEY }
      });
      
      const currentData = getCurrentData.ok ? await getCurrentData.json() : { record: {} };
      
      await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': API_KEY
        },
        body: JSON.stringify({
          ...currentData.record,
          votes: newVotes,
          total: newTotal
        })
      });
      
      console.log('Saved votes successfully');
    } catch (error) {
      console.error('Error saving votes:', error);
    }
  } else {
    showResults();
  }
}

function showResults() {
  showingResults = true;
  document.body.classList.add('showing-results');
  
  locations.forEach(location => {
    const shapeItem = document.querySelector(`[data-id="${location.id}"]`);
    const size = getShapeSize(location.id);
    
    const iconSize = size * 0.25;
    const labelSize = size * 0.09;
    const percentageSize = size * 0.16;
    const voteCountSize = size * 0.07;
    
    shapeItem.style.width = size + 'px';
    shapeItem.style.height = size + 'px';
    
    const resultsContent = shapeItem.querySelector('.results-content');
    const percentage = getPercentage(location.id);
    const count = votes[location.id] || 0;
    resultsContent.innerHTML = `
      <div class="icon" style="font-size: ${iconSize}px; top: ${-iconSize * 0.3}px; left: ${-iconSize * 0.3}px;">${location.icon}</div>
      <div class="label" style="font-size: ${labelSize}px; margin-bottom: ${size * 0.05}px;">${location.label}</div>
      <div class="percentage" style="font-size: ${percentageSize}px; margin-bottom: ${size * 0.02}px;">${percentage}%</div>
      <div class="vote-count" style="font-size: ${voteCountSize}px;">${count} votes</div>
    `;
    
    resultsContent.style.width = '100%';
    resultsContent.style.height = '100%';
  });
  
  buttonText.textContent = 'Next';
}

function getShapeSize(locationId) {
  const voteCount = votes[locationId] || 0;
  const maxVotes = Math.max(...Object.values(votes), 1);
  const minSize = 100;
  const maxSize = 260;
  return minSize + ((voteCount / maxVotes) * (maxSize - minSize));
}

function getPercentage(locationId) {
  const totalAllVotes = Object.values(votes).reduce((sum, v) => sum + v, 0);
  if (totalAllVotes === 0) return 0;
  return Math.round(((votes[locationId] || 0) / totalAllVotes) * 100);
}

function setupEventListeners() {
  nextButton.addEventListener('click', () => {
    if (isTransitioning) return; // Prevent double-clicks
    
    if (showingResults) {
      isTransitioning = true;
      showFinalScreen();
      setTimeout(() => {
        isTransitioning = false;
      }, 1000);
    } else {
      isTransitioning = true;
      submitVotes();
      setTimeout(() => {
        isTransitioning = false;
      }, 2000); // Longer timeout for vote submission
    }
  });
}

function showFinalScreen() {
  document.getElementById('mainContainer').style.display = 'none';
  document.getElementById('finalContainer').style.display = 'block';
  
  
  const finalNextButton = document.getElementById('finalNextButton');
  if (finalNextButton && !finalNextButton.hasAttribute('data-listener')) {
    finalNextButton.setAttribute('data-listener', 'true');
    finalNextButton.addEventListener('click', () => {
      showWordIntro();
    });
  }
}



function getMiniCircleSize(locationId) {
  const voteCount = votes[locationId] || 0;
  const maxVotes = Math.max(...Object.values(votes), 1);
  const minSize = 80;
  const maxSize = 140;
  return minSize + ((voteCount / maxVotes) * (maxSize - minSize));
}

function showWordIntro() {
  document.getElementById('finalContainer').style.display = 'none';
  const wordIntroContainer = document.getElementById('wordIntroContainer');
  wordIntroContainer.style.display = 'flex';
  
  showProgressBar(3000); // Add this
  
  let hasAdvanced = false;
  
  const autoAdvanceTimer = setTimeout(() => {
    if (!hasAdvanced) {
      hasAdvanced = true;
      hideProgressBar(); // Add this
      wordIntroContainer.style.display = 'none';
      showReasonsVoting();
    }
  }, 3000);
  
  const clickHandler = () => {
    if (!hasAdvanced) {
      hasAdvanced = true;
      clearTimeout(autoAdvanceTimer);
      hideProgressBar(); // Add this
      wordIntroContainer.style.display = 'none';
      showReasonsVoting();
    }
    wordIntroContainer.removeEventListener('click', clickHandler);
  };
  
  wordIntroContainer.addEventListener('click', clickHandler);
}
async function showReasonsVoting() {
  await loadReasonsVotes();
  
  document.getElementById('reasonsContainer').style.display = 'flex';
  renderReasons();
  setupReasonsListeners();
}

async function loadReasonsVotes() {
  try {
    const response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
      headers: { 'X-Master-Key': API_KEY }
    });
    
    if (response.ok) {
      const data = await response.json();
      reasonsVotes = data.record.reasonsVotes || {};
      reasonsTotalVotes = data.record.reasonsTotal || 0;
      console.log('Loaded reasons votes:', reasonsVotes);
    } else {
      initializeReasonsVotes();
    }
  } catch (error) {
    console.error('Error loading reasons votes:', error);
    initializeReasonsVotes();
  }
}

function initializeReasonsVotes() {
  reasonsVotes = {};
  reasons.forEach(reason => {
    reasonsVotes[reason.id] = 0;
  });
  reasonsTotalVotes = 0;
}

function renderReasons() {
  const reasonsGrid = document.getElementById('reasonsGrid');
  reasonsGrid.innerHTML = '';
  
  reasons.forEach((reason, index) => {
    const pill = document.createElement('div');
    pill.className = 'reason-pill';
    pill.dataset.id = reason.id;
    pill.style.backgroundColor = reason.color;
    pill.textContent = reason.label;
    pill.style.animationDelay = (index * 0.08) + 's';
    
    pill.addEventListener('click', () => toggleReason(reason.id));
    
    reasonsGrid.appendChild(pill);
    
    setTimeout(() => {
      pill.classList.add('animate-in');
    }, 10);
  });
}

function toggleReason(id) {
  const pill = document.querySelector(`.reason-pill[data-id="${id}"]`);
  
  if (reasonsSelected.includes(id)) {
    reasonsSelected = reasonsSelected.filter(r => r !== id);
    pill.classList.remove('selected');
  } else {
    if (reasonsSelected.length < 3) {
      reasonsSelected.push(id);
      pill.classList.add('selected');
    }
  }
  
  updateReasonsCount();
}

function updateReasonsCount() {
  const count = document.getElementById('reasonsSelectedCount');
  count.textContent = reasonsSelected.length > 0 ? `${reasonsSelected.length} selected` : '';
}

function setupReasonsListeners() {
  const nextButton = document.getElementById('reasonsNextButton');
  nextButton.addEventListener('click', submitReasons);
}

async function submitReasons() {
  if (reasonsSelected.length > 0) {
    const newVotes = { ...reasonsVotes };
    reasonsSelected.forEach(id => {
      newVotes[id] = (newVotes[id] || 0) + 1;
    });
    const newTotal = reasonsTotalVotes + 1;
    
    reasonsVotes = newVotes;
    reasonsTotalVotes = newTotal;
    
    showReasonsResults();
    
    try {
      const response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
        headers: { 'X-Master-Key': API_KEY }
      });
      
      const currentData = response.ok ? await response.json() : {};
      
      await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': API_KEY
        },
        body: JSON.stringify({
          ...currentData.record,
          reasonsVotes: newVotes,
          reasonsTotal: newTotal
        })
      });
      
      console.log('Saved reasons votes');
    } catch (error) {
      console.error('Error saving reasons:', error);
    }
  } else {
    showReasonsResults();
  }
}

function showReasonsResults() {
  document.getElementById('reasonsContainer').style.display = 'none';
  document.getElementById('reasonsResultsContainer').style.display = 'flex';
  
  renderReasonsResults();
  
  const resultsNextButton = document.getElementById('reasonsResultsNextButton');
  if (!resultsNextButton.hasAttribute('data-listener')) {
    resultsNextButton.setAttribute('data-listener', 'true');
    resultsNextButton.addEventListener('click', () => {
      showQuoteScreen();
    });
  }
}

function renderReasonsResults() {
  const resultsGrid = document.getElementById('reasonsResultsGrid');
  resultsGrid.innerHTML = '';
  
  reasons.forEach((reason, index) => {
    const count = reasonsVotes[reason.id] || 0;
    const percentage = reasonsTotalVotes > 0 
      ? Math.round((count / reasonsTotalVotes) * 100) 
      : 0;
    const widthPercent = reasonsTotalVotes > 0
      ? (count / Math.max(...Object.values(reasonsVotes), 1)) * 100
      : 0;
    
    const resultPill = document.createElement('div');
    resultPill.className = 'result-pill';
    resultPill.innerHTML = `
      <div class="result-pill-fill" style="width: 0%; background-color: ${reason.color}; transition: width 1.5s ease-out ${index * 0.1}s;"></div>
      <span class="result-pill-label">${reason.label}</span>
      <span class="result-pill-percentage">${percentage}%</span>
    `;
    
    resultsGrid.appendChild(resultPill);
    
    setTimeout(() => {
      const fillElement = resultPill.querySelector('.result-pill-fill');
      fillElement.style.width = widthPercent + '%';
    }, 50);
  });
}

function showQuoteScreen() {
  document.getElementById('reasonsResultsContainer').style.display = 'none';
  document.getElementById('quoteContainer').style.display = 'block';
  
  const quoteNextButton = document.getElementById('quoteNextButton');
  if (quoteNextButton && !quoteNextButton.hasAttribute('data-listener')) {
    quoteNextButton.setAttribute('data-listener', 'true');
    quoteNextButton.addEventListener('click', () => {
      showCTAScreen();
    });
  }
}

function showCTAScreen() {
  document.getElementById('quoteContainer').style.display = 'none';
  const ctaContainer = document.getElementById('ctaContainer');
  
  if (ctaContainer) {
    ctaContainer.style.display = 'block';
    
    const resetButton = document.getElementById('resetButton');
    if (resetButton && !resetButton.hasAttribute('data-listener')) {
      resetButton.setAttribute('data-listener', 'true');
      resetButton.addEventListener('click', () => {
        location.reload();
      });
    }
  } else {
    console.error('CTA container not found!');
  }
}

}); // End DOMContentLoaded


