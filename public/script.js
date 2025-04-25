let currentPage = 1;
const perPage = 15;
let currentUser = null;
let favorites = [];
let allNewspapers = [];
let filteredNewspapers = [];
let currentVideosPage = 1;
let allHeadlines = [];
let isRendering = false;

// Predefined top 20 news channels for videos page only
const topNewsChannels = [
  { id: 'aajtak', name: 'Aaj Tak', logo: '/newschanel_logo/aaj-tak-logo1.png', youtube_url: 'https://www.youtube.com/@aajtaktv', language: 'Hindi', region: 'India' },
  { id: 'indiatv', name: 'India TV', logo: '/newschanel_logo/india_tv_logo.jpg', youtube_url: 'https://www.youtube.com/@indiatv', language: 'Hindi', region: 'India' },
  { id: 'zeenews', name: 'Zee News', logo: '/newschanel_logo/zee-news-logo.webp', youtube_url: 'https://www.youtube.com/@zeenews', language: 'Hindi', region: 'India' },
  { id: 'bbc', name: 'BBC News', logo: '/newschanel_logo/BBC_News-Logo.png', youtube_url: 'https://www.youtube.com/@BBCNews', language: 'English', region: 'Global' },
  { id: 'abp', name: 'ABP News', logo: '/newschanel_logo/Abp_news_logo.jpg', youtube_url: 'https://www.youtube.com/@abpnews', language: 'Hindi', region: 'India' },
  { id: 'ndtv', name: 'NDTV', logo: '/newschanel_logo/ndtv_logo.jpg', youtube_url: 'https://www.youtube.com/@ndtv', language: 'English', region: 'India' },
  { id: 'republic', name: 'Republic TV', logo: '/newschanel_logo/republic_tv_logo.jpg', youtube_url: 'https://www.youtube.com/@republic', language: 'English', region: 'India' },
  { id: 'news18', name: 'News18 India', logo: '/newschanel_logo/News-18-India-logo.webp', youtube_url: 'https://www.youtube.com/@news18India', language: 'Hindi', region: 'India' },
  { id: 'timesnow', name: 'Times Now', logo: '/newschanel_logo/Times_Now-logo.webp', youtube_url: 'https://www.youtube.com/@timesnow', language: 'English', region: 'India' },
  
  { id: 'aljazeera', name: 'Al Jazeera English', logo: 'https://upload.wikimedia.org/wikipedia/en/f/f2/Aljazeera_eng.svg', youtube_url: 'https://www.youtube.com/@aljazeeraenglish', language: 'English', region: 'Global' },
  
  { id: 'india_today', name: 'India Today', logo: '/newschanel_logo/india_today_logo.jpg', youtube_url: 'https://www.youtube.com/@indiatoday', language: 'English', region: 'India' },
  { id: 'news24', name: 'News24', logo: '/newschanel_logo/News-24-Live-logo.png', youtube_url: 'https://www.youtube.com/@News24', language: 'Hindi', region: 'India' },
  { id: 'tv9', name: 'TV9 Bharatvarsh', logo: '/newschanel_logo/BHARATVARSH-OLD-LOGO.png', youtube_url: 'https://www.youtube.com/@TV9Bharatvarsh', language: 'Hindi', region: 'India' },
  
 
  { id: 'ddnews', name: 'DD News', logo: '/newschanel_logo/dd-news-logo.jpg', youtube_url: 'https://www.youtube.com/@DDNewsOfficial', language: 'Hindi', region: 'India' },
  
];

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  const showSignupFromLogin = document.getElementById('show-signup-from-login');
  const showLoginFromSignup = document.getElementById('show-login-from-signup');
  const menuBtn = document.getElementById('menu-btn');
  const sidebar = document.getElementById('sidebar');
  const homeLink = document.getElementById('home-link');
  const notesLink = document.getElementById('notes-link');
  const videosLink = document.getElementById('videos-link');
  const favoritesLink = document.getElementById('favorites-link');
  const logoutLink = document.getElementById('logout-link');
  const saveNoteBtn = document.getElementById('save-note-btn');
  const profileBtn = document.getElementById('profile-btn');
  const profileDropdown = document.getElementById('profile-dropdown');
  const darkModeToggle = document.getElementById('dark-mode-toggle');
  const searchBar = document.getElementById('search-bar');
  const languageFilter = document.getElementById('language-filter');
  const regionFilter = document.getElementById('region-filter');
  const favoritesFilter = document.getElementById('favorites-filter');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const videosPrevBtn = document.getElementById('videos-prev-btn');
  const videosNextBtn = document.getElementById('videos-next-btn');

  showPage('home-page');
  fetchNewspapers();
  fetchHeadlines();

  const token = localStorage.getItem('token');
  if (token) verifyToken(token);

  loginForm.addEventListener('submit', handleLogin);
  signupForm.addEventListener('submit', handleSignup);
  showSignupFromLogin.addEventListener('click', (e) => { e.preventDefault(); showPage('signup-page'); });
  showLoginFromSignup.addEventListener('click', (e) => { e.preventDefault(); showPage('login-page'); });
  menuBtn.addEventListener('click', () => { sidebar.classList.toggle('active'); profileDropdown.style.display = 'none'; });
  homeLink.addEventListener('click', (e) => { e.preventDefault(); showPage('home-page'); favoritesFilter.value = ''; filterNewspapers(); sidebar.classList.remove('active'); });
  notesLink.addEventListener('click', (e) => { e.preventDefault(); showPage('notes-page'); if (currentUser) fetchNotes(); sidebar.classList.remove('active'); });
  videosLink.addEventListener('click', (e) => { e.preventDefault(); showPage('videos-page'); displayVideos(allNewspapers, currentVideosPage); sidebar.classList.remove('active'); });
  favoritesLink.addEventListener('click', (e) => { e.preventDefault(); showPage('home-page'); favoritesFilter.value = 'favorites'; filterNewspapers(); sidebar.classList.remove('active'); });
  logoutLink.addEventListener('click', (e) => { e.preventDefault(); if (confirm('Are you sure you want to logout?')) logout(); sidebar.classList.remove('active'); });
  saveNoteBtn.addEventListener('click', saveNote);
  profileBtn.addEventListener('click', () => {
    profileDropdown.style.display = profileDropdown.style.display === 'block' ? 'none' : 'block';
    if (currentUser) {
      profileDropdown.innerHTML = `
        <div class="auth-options">
          <button id="account-option-btn">Your Account</button>
          <button id="history-option-btn">History</button>
          <button id="logout-option-btn">Logout</button>
        </div>
      `;
      document.getElementById('account-option-btn').addEventListener('click', () => {
        showPage('account-page');
        displayAccountInfo();
      });
      document.getElementById('history-option-btn').addEventListener('click', () => {
        showPage('history-page');
        fetchVisitHistory();
      });
      document.getElementById('logout-option-btn').addEventListener('click', logout);
      document.getElementById('profile-icon').textContent = currentUser.slice(0, 2).toUpperCase();
    } else {
      profileDropdown.innerHTML = `
        <div class="auth-options">
          <button id="account-option-btn">Your Account</button>
          <button id="login-option-btn">Login</button>
          <button id="signup-option-btn">Sign Up</button>
          <button id="history-option-btn">History</button>
        </div>
      `;
      document.getElementById('account-option-btn').addEventListener('click', () => showPage('login-page'));
      document.getElementById('login-option-btn').addEventListener('click', () => showPage('login-page'));
      document.getElementById('signup-option-btn').addEventListener('click', () => showPage('signup-page'));
      document.getElementById('history-option-btn').addEventListener('click', () => showPage('login-page'));
    }
  });
  document.addEventListener('click', (e) => {
    if (!profileBtn.contains(e.target) && !profileDropdown.contains(e.target)) profileDropdown.style.display = 'none';
  });
  darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    darkModeToggle.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
  });
  if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
    darkModeToggle.textContent = '☀️';
  }
  searchBar.addEventListener('input', debounce(filterNewspapers, 300));
  languageFilter.addEventListener('change', debounce(filterNewspapers, 300));
  regionFilter.addEventListener('change', debounce(filterNewspapers, 300));
  favoritesFilter.addEventListener('change', debounce(filterNewspapers, 300));
  prevBtn.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      displayNewspapers(filteredNewspapers, currentPage);
    }
  });
  nextBtn.addEventListener('click', () => {
    const totalPages = Math.ceil(filteredNewspapers.length / perPage);
    if (currentPage < totalPages) {
      currentPage++;
      displayNewspapers(filteredNewspapers, currentPage);
    }
  });
  videosPrevBtn.addEventListener('click', () => { if (currentVideosPage > 1) { currentVideosPage--; displayVideos(allNewspapers, currentVideosPage); } });
  videosNextBtn.addEventListener('click', () => {
    const totalPages = Math.ceil((allNewspapers.filter(paper => paper.youtube_url).length + topNewsChannels.length) / perPage);
    if (currentVideosPage < totalPages) {
      currentVideosPage++;
      displayVideos(allNewspapers, currentVideosPage);
    }
  });

  const modal = document.getElementById('headlines-modal');
  if (modal) {
    modal.querySelector('.close-modal').addEventListener('click', () => modal.style.display = 'none');
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.style.display = 'none';
    });
  }

  // Add date and day display
  function updateDateTime() {
    const now = new Date();
    const dateOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    const dayOptions = { weekday: 'long' };
    
    document.getElementById('current-date').textContent = now.toLocaleDateString('en-IN', dateOptions);
    document.getElementById('current-day').textContent = now.toLocaleDateString('en-IN', dayOptions);
  }
  
  updateDateTime();
  // Update every 24 hours to reflect new date
  setInterval(updateDateTime, 24 * 60 * 60 * 1000);
});

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

async function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;
  const message = document.getElementById('login-message');
  message.textContent = 'Logging in...';
  try {
    const response = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await response.json();
    message.textContent = data.message;
    message.style.color = data.success ? 'green' : 'red';
    if (data.success) {
      currentUser = data.username;
      localStorage.setItem('token', data.token);
      document.getElementById('logout-link').style.display = 'block';
      document.getElementById('favorites-link').style.display = 'block';
      await fetchFavorites();
      showPage('home-page');
      filterNewspapers();
    }
  } catch (error) {
    message.textContent = 'Error: Server not reachable';
    message.style.color = 'red';
  }
}

async function handleSignup(e) {
  e.preventDefault();
  const username = document.getElementById('signup-username').value;
  const password = document.getElementById('signup-password').value;
  const message = document.getElementById('signup-message');
  message.textContent = 'Signing up...';
  try {
    const response = await fetch('http://localhost:3000/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await response.json();
    message.textContent = data.message;
    message.style.color = data.success ? 'green' : 'red';
    if (data.success) {
      showPage('login-page');
    }
  } catch (error) {
    message.textContent = 'Error: Server not reachable';
    message.style.color = 'red';
  }
}

async function verifyToken(token) {
  try {
    const response = await fetch('http://localhost:3000/api/verify-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });
    const data = await response.json();
    if (data.success) {
      currentUser = data.username;
      document.getElementById('logout-link').style.display = 'block';
      document.getElementById('favorites-link').style.display = 'block';
      await fetchFavorites();
      filterNewspapers();
    } else {
      localStorage.removeItem('token');
    }
  } catch (error) {
    localStorage.removeItem('token');
  }
}

function logout() {
  localStorage.removeItem('token');
  currentUser = null;
  favorites = [];
  document.getElementById('logout-link').style.display = 'none';
  document.getElementById('favorites-link').style.display = 'none';
  document.getElementById('notes-list').innerHTML = '';
  document.getElementById('profile-dropdown').style.display = 'none';
  document.getElementById('profile-icon').textContent = '👤';
  showPage('home-page');
  document.getElementById('favorites-filter').value = '';
  filterNewspapers();
}

function showPage(pageId) {
  const pages = ['home-page', 'notes-page', 'videos-page', 'login-page', 'signup-page', 'account-page', 'history-page'];
  pages.forEach(page => {
    const element = document.getElementById(page);
    if (page === pageId) {
      element.style.display = 'block';
      element.classList.remove('page-hidden');
      element.classList.add('page-visible');
    } else {
      element.classList.remove('page-visible');
      element.classList.add('page-hidden');
      setTimeout(() => element.style.display = 'none', 300);
    }
  });
  document.getElementById('profile-dropdown').style.display = 'none';
}

function displayAccountInfo() {
  const accountUsername = document.getElementById('account-username');
  accountUsername.textContent = `Username: ${currentUser || 'Not logged in'}`;
  const logoutBtn = document.getElementById('logout-from-account');
  logoutBtn.addEventListener('click', logout);
}

async function fetchNotes() {
  if (!currentUser) return;
  document.getElementById('loading').style.display = 'block';
  try {
    const response = await fetch('http://localhost:3000/api/notes', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const data = await response.json();
    if (data.success) displayNotes(data.notes);
    else throw new Error(data.message);
  } catch (error) {
    console.error('Error fetching notes:', error);
    document.getElementById('notes-list').innerHTML = `<p>Error: ${error.message}</p>`;
  } finally {
    document.getElementById('loading').style.display = 'none';
  }
}

async function saveNote() {
  const noteInput = document.getElementById('note-input');
  const note = noteInput.value.trim();
  if (!note) {
    alert('Please write a note before saving.');
    return;
  }
  if (!currentUser) {
    showPage('login-page');
    return;
  }
  try {
    const response = await fetch('http://localhost:3000/api/notes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ note })
    });
    const data = await response.json();
    if (data.success) {
      noteInput.value = '';
      fetchNotes();
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Error saving note:', error);
    alert('Error saving note: ' + error.message);
  }
}

async function editNote(id, oldNote) {
  const newNote = prompt('Edit your note:', oldNote);
  if (newNote === null || newNote.trim() === oldNote) return;
  try {
    const response = await fetch(`http://localhost:3000/api/notes/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ note: newNote.trim() })
    });
    const data = await response.json();
    if (data.success) fetchNotes();
    else throw new Error(data.message);
  } catch (error) {
    alert('Error updating note: ' + error.message);
  }
}

async function deleteNote(id) {
  if (!confirm('Are you sure you want to delete this note?')) return;
  try {
    const response = await fetch(`http://localhost:3000/api/notes/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const data = await response.json();
    if (data.success) fetchNotes();
    else throw new Error(data.message);
  } catch (error) {
    alert('Error deleting note: ' + error.message);
  }
}

function displayNotes(notes) {
  const notesList = document.getElementById('notes-list');
  notesList.innerHTML = '';
  if (!notes || notes.length === 0) {
    notesList.innerHTML = '<p>No notes yet</p>';
    return;
  }
  notes.forEach(({ id, note, date }) => {
    const div = document.createElement('div');
    div.className = 'note-item';
    const formattedDate = new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
    div.innerHTML = `
      <div class="note-card">
        <span class="badge timestamp">[${formattedDate}]</span>
        <p>${note}</p>
        <div class="note-actions">
          <button onclick="editNote(${id}, '${note.replace(/'/g, "\\'")}')">Edit</button>
          <button onclick="deleteNote(${id})">Delete</button>
        </div>
      </div>
    `;
    notesList.appendChild(div);
  });
}

async function saveVisit(newspaperId) {
  if (!currentUser) return;
  try {
    const response = await fetch('http://localhost:3000/api/visits', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ newspaper_id: newspaperId })
    });
    const data = await response.json();
    if (!data.success) {
      console.error('Error saving visit:', data.message);
    }
  } catch (error) {
    console.error('Error saving visit:', error);
  }
}

async function fetchVisitHistory() {
  if (!currentUser) {
    showPage('login-page');
    return;
  }
  document.getElementById('loading').style.display = 'block';
  try {
    const response = await fetch('http://localhost:3000/api/visits', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const data = await response.json();
    if (data.success) {
      displayVisitHistory(data.visits);
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Error fetching visit history:', error);
    document.getElementById('history-list').innerHTML = `<p>Error: ${error.message}</p>`;
  } finally {
    document.getElementById('loading').style.display = 'none';
  }
}

function displayVisitHistory(visits) {
  const historyList = document.getElementById('history-list');
  historyList.innerHTML = '';
  if (!visits || visits.length === 0) {
    historyList.innerHTML = '<p>No visit history yet</p>';
    return;
  }
  visits.forEach(({ newspaper_id, visit_date }) => {
    const newspaper = allNewspapers.find(paper => paper.id === newspaper_id);
    if (!newspaper) return;
    const div = document.createElement('div');
    div.className = 'note-item';
    const formattedDate = new Date(visit_date).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: 'numeric'
    });
    div.innerHTML = `
      <div class="note-card">
        <span class="badge timestamp">[${formattedDate}]</span>
        <p>${newspaper.name}</p>
        <a href="${newspaper.url || '#'}" target="_blank">Visit Again</a>
      </div>
    `;
    historyList.appendChild(div);
  });
}

async function fetchNewspapers() {
  document.getElementById('loading').style.display = 'block';
  try {
    const response = await fetch('/api/newspapers');
    allNewspapers = await response.json();
    allNewspapers = Array.from(new Map(allNewspapers.map(paper => [paper.id, paper])).values());
    console.log('Fetched newspapers:', allNewspapers.length, 'unique IDs');
    filteredNewspapers = [...allNewspapers];
    filterNewspapers();
  } catch (error) {
    console.error('Error fetching newspapers:', error);
    document.getElementById('newspaper-list').innerHTML = '<p>Unable to load newspapers</p>';
  } finally {
    document.getElementById('loading').style.display = 'none';
  }
}

async function fetchFavorites() {
  if (!currentUser) return;
  try {
    const response = await fetch('/api/favorites', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const data = await response.json();
    if (data.success) {
      favorites = Array.from(new Set(data.favorites || []));
      console.log('Fetched favorites:', favorites);
      filterNewspapers();
    }
  } catch (error) {
    console.error('Error fetching favorites:', error);
  }
}

async function toggleFavorite(newspaperId) {
  if (!currentUser) {
    showPage('login-page');
    return;
  }
  const isFavorited = favorites.includes(newspaperId);
  try {
    const response = await fetch(`/api/favorites${isFavorited ? '/' + newspaperId : ''}`, {
      method: isFavorited ? 'DELETE' : 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: !isFavorited ? JSON.stringify({ newspaper_id: newspaperId }) : undefined
    });
    const data = await response.json();
    if (data.success) {
      if (isFavorited) {
        favorites = favorites.filter(id => id !== newspaperId);
      } else if (!favorites.includes(newspaperId)) {
        favorites.push(newspaperId);
      }
      console.log('Updated favorites:', favorites);
      filterNewspapers();
      if (document.getElementById('videos-page').style.display === 'block') {
        displayVideos(allNewspapers, currentVideosPage);
      }
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Error toggling favorite:', error);
    alert('Error toggling favorite: ' + error.message);
  }
}

async function fetchHeadlines() {
  document.getElementById('loading').style.display = 'block';
  try {
    const response = await fetch('http://localhost:3000/api/headlines');
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const data = await response.json();
    console.log('Fetched headlines:', data);
    if (data.success) {
      allHeadlines = data.headlines;
      displayHeadlines(allHeadlines.slice(0, 3));
    } else {
      throw new Error(data.message || 'Failed to fetch headlines');
    }
  } catch (error) {
    console.error('Error fetching headlines:', error);
    document.getElementById('headlines').innerHTML = '<h3>Top Headlines</h3><p>Unable to load headlines: ' + error.message + '</p>';
  } finally {
    document.getElementById('loading').style.display = 'none';
  }
}

function displayHeadlines(headlines) {
  const headlinesSection = document.getElementById('headlines');
  headlinesSection.innerHTML = '<h3>Top Headlines</h3>';
  headlinesSection.className = '';

  const headlinesGrid = document.createElement('div');
  headlinesGrid.className = 'headlines-grid';

  if (!headlines || headlines.length === 0) {
    headlinesGrid.innerHTML = '<p>No headlines available</p>';
  } else {
    headlines.slice(0, 3).forEach(({ title, url }) => {
      const card = document.createElement('div');
      card.className = 'headline-card';
      card.innerHTML = `<a href="${url || '#'}" target="_blank">${title || 'No title'}</a>`;
      headlinesGrid.appendChild(card);
    });
  }
  headlinesSection.appendChild(headlinesGrid);

  const seeMoreLink = document.createElement('a');
  seeMoreLink.className = 'see-more-link';
  seeMoreLink.href = '#';
  seeMoreLink.textContent = 'More';
  seeMoreLink.addEventListener('click', (e) => {
    e.preventDefault();
    showMoreHeadlines();
  });
  headlinesSection.appendChild(seeMoreLink);
}

function showMoreHeadlines() {
  const modal = document.getElementById('headlines-modal');
  const modalGrid = document.getElementById('modal-headlines-grid');
  modalGrid.innerHTML = '';

  if (!allHeadlines || allHeadlines.length === 0) {
    modalGrid.innerHTML = '<p>No additional headlines available</p>';
  } else {
    allHeadlines.forEach(({ title, source, url, publishedAt }) => {
      const card = document.createElement('div');
      card.className = 'headline-card';
      const date = publishedAt ? new Date(publishedAt).toLocaleDateString('en-IN') : 'No date';
      card.innerHTML = `
        <a href="${url || '#'}" target="_blank">${title || 'No title'}</a>
        <p>${source || 'Unknown source'} - ${date}</p>
      `;
      modalGrid.appendChild(card);
    });
  }

  modal.style.display = 'block';
}

async function fetchNewspaperHeadlines(newspaperId) {
  try {
    const response = await fetch(`http://localhost:3000/api/newspaper-headlines/${newspaperId}`);
    const data = await response.json();
    if (data.success) {
      return data.headlines.slice(0, 3);
    } else {
      throw new Error(data.message || 'Failed to fetch headlines');
    }
  } catch (error) {
    console.error(`Error fetching headlines for ${newspaperId}:`, error);
    return [
      { title: 'Headlines not available', url: '#', publishedAt: '2025-04-20' },
      { title: 'Headlines not available', url: '#', publishedAt: '2025-04-20' },
      { title: 'Headlines not available', url: '#', publishedAt: '2025-04-20' }
    ];
  }
}

async function displayNewspapers(newspapers, page) {
  if (isRendering) {
    console.log('Rendering in progress, skipping displayNewspapers');
    return;
  }
  isRendering = true;

  const newspaperList = document.getElementById('newspaper-list');
  newspaperList.innerHTML = ''; // Clear DOM
  const start = (page - 1) * perPage;
  const end = Math.min(start + perPage, newspapers.length);
  const paginated = newspapers.slice(start, end);

  console.log(`Displaying page ${page}: ${paginated.length} newspapers (start: ${start}, end: ${end})`);
  console.log('Paginated newspaper IDs:', paginated.map(p => p.id));

  if (paginated.length === 0) {
    newspaperList.innerHTML = '<p>No newspapers match your filters</p>';
    isRendering = false;
    updatePagination(newspapers.length, 'page-info', 'prev-btn', 'next-btn', currentPage);
    return;
  }

  let renderedCount = 0;
  for (const paper of paginated) {
    if (renderedCount >= perPage) {
      console.warn(`Stopped rendering at ${perPage} newspapers`);
      break;
    }
    const card = document.createElement('div');
    card.className = 'newspaper-card';
    card.dataset.id = paper.id;
    const isFavorited = favorites.includes(paper.id);
    const headlines = await fetchNewspaperHeadlines(paper.id);
    let headlinesHTML = '<div class="card-headlines">';
    headlines.forEach(({ title, url }) => {
      headlinesHTML += `<a href="${url || '#'}" target="_blank" class="card-headline">${title || 'No title'}</a>`;
    });
    headlinesHTML += '</div>';

    card.innerHTML = `
      <img src="${paper.logo || '/placeholder.png'}" alt="${paper.name} logo">
      ${headlinesHTML}
      <div class="card-actions">
        <a href="${paper.url || '#'}" target="_blank" onclick="saveVisit('${paper.id}')">Visit Website</a>
        <button class="favorite-btn" onclick="toggleFavorite('${paper.id}')">${isFavorited ? '★' : '☆'}</button>
      </div>
    `;
    newspaperList.appendChild(card);
    renderedCount++;
  }

  const renderedCards = newspaperList.querySelectorAll('.newspaper-card');
  console.log(`DOM verification: ${renderedCards.length} cards rendered`);
  if (renderedCards.length > perPage) {
    console.warn(`Excess cards detected! Expected ${perPage}, found ${renderedCards.length}`);
    Array.from(renderedCards).slice(perPage).forEach(card => card.remove());
  }
  console.log('Rendered card IDs:', Array.from(renderedCards).map(card => card.dataset.id));

  updatePagination(newspapers.length, 'page-info', 'prev-btn', 'next-btn', page);
  isRendering = false;
}

async function displayVideos(newspapers, page) {
  if (isRendering) {
    console.log('Rendering in progress, skipping displayVideos');
    return;
  }
  isRendering = true;

  const videosList = document.getElementById('videos-list');
  // Combine top news channels with newspapers that have youtube_url
  const channelsWithVideos = [
    ...topNewsChannels,
    ...newspapers.filter(paper => paper.youtube_url && !topNewsChannels.some(top => top.id === paper.id))
  ];
  const start = (page - 1) * perPage;
  const end = Math.min(start + perPage, channelsWithVideos.length);
  let paginated = channelsWithVideos.slice(start, end).slice(0, perPage);

  // Prioritize top news channels on the first page
  if (page === 1) {
    const topIds = topNewsChannels.map(channel => channel.id);
    paginated = [
      ...channelsWithVideos.filter(paper => topIds.includes(paper.id)),
      ...channelsWithVideos.filter(paper => !topIds.includes(paper.id))
    ].slice(0, perPage);
  }

  console.log(`Displaying videos page ${page}: ${paginated.length} newspapers`);
  console.log('Paginated video newspaper IDs:', paginated.map(p => p.id));

  videosList.innerHTML = '';
  if (paginated.length === 0) {
    videosList.innerHTML = '<p>No video channels available</p>';
    isRendering = false;
    updatePagination(channelsWithVideos.length, 'videos-page-info', 'videos-prev-btn', 'videos-next-btn', currentVideosPage);
    return;
  }

  let renderedCount = 0;
  for (const paper of paginated) {
    if (renderedCount >= perPage) {
      console.warn(`Stopped rendering at ${perPage} videos`);
      break;
    }
    const card = document.createElement('div');
    card.className = 'newspaper-card';
    card.dataset.id = paper.id;
    const isFavorited = favorites.includes(paper.id);

    card.innerHTML = `
      <img src="${paper.logo || '/placeholder.png'}" alt="${paper.name} logo">
      <div class="card-actions">
        <a href="${paper.youtube_url}" target="_blank">Watch News on YouTube</a>
        <button class="favorite-btn" onclick="toggleFavorite('${paper.id}')">${isFavorited ? '★' : '☆'}</button>
      </div>
    `;
    videosList.appendChild(card);
    renderedCount++;
  }

  const renderedCards = videosList.querySelectorAll('.newspaper-card');
  console.log(`DOM verification (videos): ${renderedCards.length} cards rendered`);
  if (renderedCards.length > perPage) {
    console.warn(`Excess video cards detected! Expected ${perPage}, found ${renderedCards.length}`);
    Array.from(renderedCards).slice(perPage).forEach(card => card.remove());
  }
  console.log('Rendered video card IDs:', Array.from(renderedCards).map(card => card.dataset.id));

  updatePagination(channelsWithVideos.length, 'videos-page-info', 'videos-prev-btn', 'videos-next-btn', page);
  isRendering = false;
}

function updatePagination(totalItems, pageInfoId, prevBtnId, nextBtnId, currentPage) {
  const totalPages = Math.ceil(totalItems / perPage);
  const pageInfo = document.getElementById(pageInfoId);
  const prevBtn = document.getElementById(prevBtnId);
  const nextBtn = document.getElementById(nextBtnId);

  pageInfo.textContent = `Page ${currentPage} of ${totalPages || 1}`;
  prevBtn.disabled = currentPage <= 1;
  nextBtn.disabled = currentPage >= totalPages;
}

function filterNewspapers() {
  const search = document.getElementById('search-bar').value.toLowerCase();
  const language = document.getElementById('language-filter').value;
  const region = document.getElementById('region-filter').value;
  const favoritesOnly = document.getElementById('favorites-filter').value === 'favorites';

  console.log('Filtering with:', { search, language, region, favoritesOnly, favorites });

  filteredNewspapers = allNewspapers.filter(paper => {
    const matchesSearch = paper.name.toLowerCase().includes(search);
    const matchesLanguage = !language || paper.language === language;
    const matchesRegion = !region || paper.region === region;
    const matchesFavorites = !favoritesOnly || favorites.includes(paper.id);
    return matchesSearch && matchesLanguage && matchesRegion && matchesFavorites;
  });

  filteredNewspapers = Array.from(new Map(filteredNewspapers.map(paper => [paper.id, paper])).values());

  console.log('Filtered newspapers:', filteredNewspapers.length, 'IDs:', filteredNewspapers.map(p => p.id));

  // Reset to page 1 when filters change
  currentPage = 1;
  displayNewspapers(filteredNewspapers, currentPage);
}