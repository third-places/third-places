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

// State
let selected = [];
let votes = {};
let totalVotes = 0;
let showingResults = false;

// DOM elements
let shapesGrid;
let nextButton;
let buttonText;
let selectedCount;

// Start intro AND preload data
async function initIntro() {
  const introContainer = document.getElementById('introContainer');
  
  // Preload data during intro screens
  await loadVotes();
  dataPreloaded = true;
  
  // Auto-advance every 3 seconds
  function autoAdvance() {
    introAutoAdvanceTimer = setTimeout(() => {
      nextIntroScreen();
    }, 3000);
  }
  
  // Click to advance
  introContainer.addEventListener('click', () => {
    clearTimeout(introAutoAdvanceTimer);
    nextIntroScreen();
  });
  
  // Start auto-advance
  autoAdvance();
}

function nextIntroScreen() {
  const screens = document.querySelectorAll('.intro-screen');
  
  // Add this safety check
  if (currentIntroScreen >= totalIntroScreens) {
    return; // Already done, don't proceed
  }
  
  const currentScreen = screens[currentIntroScreen];
  
  // Exit animation for current screen
  currentScreen.classList.add('exiting');
  
  // Wait for exit animation to finish, THEN show next screen
  setTimeout(() => {
    currentScreen.classList.remove('active', 'exiting');
    currentIntroScreen++;
    
    if (currentIntroScreen >= totalIntroScreens) {
      // Done with intro, show main content
      clearTimeout(introAutoAdvanceTimer); // Clear any pending timers
      document.getElementById('introContainer').classList.add('hidden');
      document.getElementById('mainContainer').style.display = 'flex';
      init(); // Initialize the voting app
    } else {
      // Show next screen AFTER previous one is gone
      const nextScreen = screens[currentIntroScreen];
      nextScreen.classList.add('active');
      
      // Auto-advance to next
      introAutoAdvanceTimer = setTimeout(() => {
        nextIntroScreen();
      }, 3000);
    }
  }, 800);
}

// Start intro on page load
initIntro();

// Initialize
async function init() {
  shapesGrid = document.getElementById('shapesGrid');
  nextButton = document.getElementById('nextButton');
  buttonText = document.getElementById('buttonText');
  selectedCount = document.getElementById('selectedCount');
  
  // Only load if we haven't preloaded
  if (!dataPreloaded) {
    await loadVotes();
  }
  
  renderShapes();
  setupEventListeners();
}

// Load votes from JSON Bin
async function loadVotes() {
  try {
    const response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
      headers: { 'X-Master-Key': API_KEY }
    });
    
    if (response.ok) {
      const data = await response.json();
      votes = data.record.votes || {};
      totalVotes = data.record.total || 0;
      console.log('Loaded votes:', votes, 'Total:', totalVotes); // Debug log
    } else {
      console.log('Failed to load, initializing empty');
      initializeVotes();
    }
  } catch (error) {
    console.error('Error loading votes:', error);
    initializeVotes();
  }
}

// Initialize empty votes
function initializeVotes() {
  votes = {};
  locations.forEach(loc => {
    votes[loc.id] = 0;
  });
  totalVotes = 0;
}

// Render shapes
function renderShapes() {
  shapesGrid.innerHTML = '';
  
  locations.forEach(location => {
    const shapeItem = document.createElement('div');
    shapeItem.className = 'shape-item';
    shapeItem.dataset.id = location.id;
    shapeItem.style.width = '160px';
    shapeItem.style.height = '160px';
    
    // Input view
    const shapeContent = document.createElement('div');
    shapeContent.className = 'shape-content';
    shapeContent.innerHTML = `
      <div class="icon">${location.icon}</div>
      <div class="label">${location.label}</div>
    `;
    
    // Results view
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

// Toggle selection
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

// Update selected count
function updateSelectedCount() {
  if (selected.length > 0) {
    selectedCount.textContent = `${selected.length} selected`;
  } else {
    selectedCount.textContent = '';
  }
}

// Submit votes
// Submit votes
// Submit votes
async function submitVotes() {
  if (selected.length > 0) {
    const newVotes = { ...votes };
    selected.forEach(id => {
      newVotes[id] = (newVotes[id] || 0) + 1;
    });
    const newTotal = totalVotes + 1;
    
    // Update local state immediately for instant feedback
    votes = newVotes;
    totalVotes = newTotal;
    
    // Show results right away
    showResults();
    
    // Save to JSON Bin in the background (don't wait for it)
    fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': API_KEY
      },
      body: JSON.stringify({ votes: newVotes, total: newTotal })
    }).then(response => {
      if (response.ok) {
        console.log('Saved votes successfully');
      } else {
        console.error('Error saving votes');
      }
    }).catch(error => {
      console.error('Error saving votes:', error);
    });
  } else {
    // No selection, just show results
    showResults();
  }
}

// Show results
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
  
  // Update button text for results screen
  buttonText.textContent = 'Next';
}

// Reset and go back
function reset() {
  showingResults = false;
  document.body.classList.remove('showing-results');
  selected = [];
  
  document.querySelectorAll('.shape-item').forEach(item => {
    item.style.width = '160px';
    item.style.height = '160px';
    item.classList.remove('selected');
  });
  
  buttonText.textContent = 'Next';
  selectedCount.textContent = '';
  
  loadVotes().then(() => {
    renderShapes();
  });
}

// Calculate shape size based on votes
function getShapeSize(locationId) {
  const voteCount = votes[locationId] || 0;
  const maxVotes = Math.max(...Object.values(votes), 1);
  const minSize = 100;
  const maxSize = 260;
  return minSize + ((voteCount / maxVotes) * (maxSize - minSize));
}

// Calculate percentage
function getPercentage(locationId) {
  const totalAllVotes = Object.values(votes).reduce((sum, v) => sum + v, 0);
  if (totalAllVotes === 0) return 0;
  return Math.round(((votes[locationId] || 0) / totalAllVotes) * 100);
}

// Setup event listeners
function setupEventListeners() {
  nextButton.addEventListener('click', () => {
    if (showingResults) {
      // Go to final screen instead of reset
      showFinalScreen();
    } else {
      submitVotes();
    }
  });
}

// Show final screen
function showFinalScreen() {
  // Hide results
  document.getElementById('mainContainer').style.display = 'none';
  
  // Show final screen
  const finalContainer = document.getElementById('finalContainer');
  finalContainer.style.display = 'flex';
  
  // Render mini circles
  renderMiniCircles();
  
  // Setup final next button
  document.getElementById('finalNextButton').addEventListener('click', () => {
    // Reset everything and go back to intro
    location.reload();
  });
}

// Render mini circles with results
function renderMiniCircles() {
  const miniGrid = document.getElementById('miniShapesGrid');
  miniGrid.innerHTML = '';
  
  locations.forEach((location, index) => {
    const size = getMiniCircleSize(location.id);
    const percentage = getPercentage(location.id);
    const count = votes[location.id] || 0;
    const iconSize = size * 0.25;
    
    const miniShape = document.createElement('div');
    miniShape.className = 'mini-shape-item';
    miniShape.dataset.id = location.id;
    miniShape.style.width = size + 'px';
    miniShape.style.height = size + 'px';
    miniShape.style.animationDelay = (index * 0.1) + 's';
    
    // Get color from your existing color scheme
    const colorMap = {
      'library': '#e8b5c5',
      'cafe': '#f4d77e',
      'gym': '#8aabc4',
      'religious': '#f4d3a8',
      'bar': '#8aabc4',
      'park': '#f4d3a8',
      'museum': '#e8b5c5'
    };
    
    miniShape.style.backgroundColor = colorMap[location.id];
    
    miniShape.innerHTML = `
      <div class="mini-icon" style="font-size: ${iconSize}px;">${location.icon}</div>
      <div class="mini-content">
        <div class="mini-label">${location.label}</div>
        <div class="mini-percentage">${percentage}%</div>
        <div class="mini-vote-count">${count} votes</div>
      </div>
    `;
    
    miniGrid.appendChild(miniShape);
  });
}

// Calculate mini circle size (smaller scale)
function getMiniCircleSize(locationId) {
  const voteCount = votes[locationId] || 0;
  const maxVotes = Math.max(...Object.values(votes), 1);
  const minSize = 80;
  const maxSize = 140;
  return minSize + ((voteCount / maxVotes) * (maxSize - minSize));
}

// Calculate mini circle size (smaller scale)
function getMiniCircleSize(locationId) {
  const voteCount = votes[locationId] || 0;
  const maxVotes = Math.max(...Object.values(votes), 1);
  const minSize = 60;
  const maxSize = 120;
  return minSize + ((voteCount / maxVotes) * (maxSize - minSize));
}
