

// let currentPage = 1;
// const perPage = 15;
// let currentUser = null;
// let favorites = [];
// let allNewspapers = [];
// let filteredNewspapers = [];
// let currentVideosPage = 1; // New for videos pagination

// document.addEventListener('DOMContentLoaded', () => {
//   const loginForm = document.getElementById('login-form');
//   const signupForm = document.getElementById('signup-form');
//   const showSignupFromLogin = document.getElementById('show-signup-from-login');
//   const showLoginFromSignup = document.getElementById('show-login-from-signup');
//   const menuBtn = document.getElementById('menu-btn');
//   const sidebar = document.getElementById('sidebar');
//   const homeLink = document.getElementById('home-link');
//   const notesLink = document.getElementById('notes-link');
//   const videosLink = document.getElementById('videos-link'); // New Videos Link
//   const favoritesLink = document.getElementById('favorites-link');
//   const logoutLink = document.getElementById('logout-link');
//   const saveNoteBtn = document.getElementById('save-note-btn');
//   const profileBtn = document.getElementById('profile-btn');
//   const profileDropdown = document.getElementById('profile-dropdown');
//   const darkModeToggle = document.getElementById('dark-mode-toggle');
//   const searchBar = document.getElementById('search-bar');
//   const languageFilter = document.getElementById('language-filter');
//   const regionFilter = document.getElementById('region-filter');
//   const favoritesFilter = document.getElementById('favorites-filter');
//   const prevBtn = document.getElementById('prev-btn');
//   const nextBtn = document.getElementById('next-btn');
//   const videosPrevBtn = document.getElementById('videos-prev-btn'); // New for videos
//   const videosNextBtn = document.getElementById('videos-next-btn'); // New for videos

//   showPage('home-page');
//   fetchNewspapers();
//   fetchHeadlines();

//   const token = localStorage.getItem('token');
//   if (token) verifyToken(token);

//   loginForm.addEventListener('submit', handleLogin);
//   signupForm.addEventListener('submit', handleSignup);
//   showSignupFromLogin.addEventListener('click', (e) => {
//     e.preventDefault();
//     showPage('signup-page');
//   });
//   showLoginFromSignup.addEventListener('click', (e) => {
//     e.preventDefault();
//     showPage('login-page');
//   });
//   menuBtn.addEventListener('click', () => {
//     sidebar.classList.toggle('active');
//     profileDropdown.style.display = 'none';
//   });
//   homeLink.addEventListener('click', (e) => {
//     e.preventDefault();
//     showPage('home-page');
//     favoritesFilter.value = '';
//     filterNewspapers();
//     sidebar.classList.remove('active');
//   });
//   notesLink.addEventListener('click', (e) => {
//     e.preventDefault();
//     showPage('notes-page');
//     if (currentUser) fetchNotes();
//     sidebar.classList.remove('active');
//   });
//   videosLink.addEventListener('click', (e) => { // New Videos Handler
//     e.preventDefault();
//     showPage('videos-page');
//     displayVideos(allNewspapers, currentVideosPage);
//     sidebar.classList.remove('active');
//   });
//   favoritesLink.addEventListener('click', (e) => {
//     e.preventDefault();
//     showPage('home-page');
//     favoritesFilter.value = 'favorites';
//     filterNewspapers();
//     sidebar.classList.remove('active');
//   });
//   logoutLink.addEventListener('click', (e) => {
//     e.preventDefault();
//     if (confirm('Are you sure you want to logout?')) logout();
//     sidebar.classList.remove('active');
//   });
//   saveNoteBtn.addEventListener('click', saveNote);
//   profileBtn.addEventListener('click', () => {
//     profileDropdown.style.display = profileDropdown.style.display === 'block' ? 'none' : 'block';
//     if (currentUser) {
//       profileDropdown.innerHTML = '<button id="logout-option-btn">Logout</button>';
//       document.getElementById('logout-option-btn').addEventListener('click', logout);
//       document.getElementById('profile-icon').textContent = currentUser.slice(0, 2).toUpperCase();
//     } else {
//       profileDropdown.innerHTML = `
//         <div class="auth-options">
//           <button id="login-option-btn">Login</button>
//           <button id="signup-option-btn">Sign Up</button>
//         </div>
//       `;
//       document.getElementById('login-option-btn').addEventListener('click', () => showPage('login-page'));
//       document.getElementById('signup-option-btn').addEventListener('click', () => showPage('signup-page'));
//     }
//   });
//   document.addEventListener('click', (e) => {
//     if (!profileBtn.contains(e.target) && !profileDropdown.contains(e.target)) {
//       profileDropdown.style.display = 'none';
//     }
//   });
//   darkModeToggle.addEventListener('click', () => {
//     document.body.classList.toggle('dark-mode');
//     darkModeToggle.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
//     localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
//   });
//   if (localStorage.getItem('darkMode') === 'true') {
//     document.body.classList.add('dark-mode');
//     darkModeToggle.textContent = '☀️';
//   }
//   searchBar.addEventListener('input', filterNewspapers);
//   languageFilter.addEventListener('change', filterNewspapers);
//   regionFilter.addEventListener('change', filterNewspapers);
//   favoritesFilter.addEventListener('change', filterNewspapers);
//   prevBtn.addEventListener('click', () => {
//     if (currentPage > 1) {
//       currentPage--;
//       filterNewspapers();
//     }
//   });
//   nextBtn.addEventListener('click', () => {
//     const totalPages = Math.ceil(filteredNewspapers.length / perPage);
//     if (currentPage < totalPages) {
//       currentPage++;
//       filterNewspapers();
//     }
//   });
//   videosPrevBtn.addEventListener('click', () => { // New Videos Pagination
//     if (currentVideosPage > 1) {
//       currentVideosPage--;
//       displayVideos(allNewspapers, currentVideosPage);
//     }
//   });
//   videosNextBtn.addEventListener('click', () => { // New Videos Pagination
//     const totalPages = Math.ceil(allNewspapers.length / perPage);
//     if (currentVideosPage < totalPages) {
//       currentVideosPage++;
//       displayVideos(allNewspapers, currentVideosPage);
//     }
//   });
// });

// async function handleLogin(e) {
//   e.preventDefault();
//   const username = document.getElementById('login-username').value;
//   const password = document.getElementById('login-password').value;
//   const message = document.getElementById('login-message');
//   message.textContent = 'Logging in...';

//   try {
//     const response = await fetch('http://localhost:3000/api/login', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ username, password })
//     });
//     const data = await response.json();
//     message.textContent = data.message;
//     message.style.color = data.success ? 'green' : 'red';
//     if (data.success) {
//       currentUser = data.username;
//       localStorage.setItem('token', data.token);
//       document.getElementById('logout-link').style.display = 'block';
//       document.getElementById('favorites-link').style.display = 'block';
//       fetchFavorites();
//       showPage('home-page');
//       filterNewspapers();
//     }
//   } catch (error) {
//     message.textContent = 'Error: Server not reachable';
//     message.style.color = 'red';
//   }
// }

// async function handleSignup(e) {
//   e.preventDefault();
//   const username = document.getElementById('signup-username').value;
//   const password = document.getElementById('signup-password').value;
//   const message = document.getElementById('signup-message');
//   message.textContent = 'Signing up...';

//   try {
//     const response = await fetch('http://localhost:3000/api/signup', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ username, password })
//     });
//     const data = await response.json();
//     message.textContent = data.message;
//     message.style.color = data.success ? 'green' : 'red';
//     if (data.success) {
//       showPage('login-page');
//     }
//   } catch (error) {
//     message.textContent = 'Error: Server not reachable';
//     message.style.color = 'red';
//   }
// }

// async function verifyToken(token) {
//   try {
//     const response = await fetch('http://localhost:3000/api/verify-token', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ token })
//     });
//     const data = await response.json();
//     if (data.success) {
//       currentUser = data.username;
//       document.getElementById('logout-link').style.display = 'block';
//       document.getElementById('favorites-link').style.display = 'block';
//       fetchFavorites();
//       filterNewspapers();
//     } else {
//       localStorage.removeItem('token');
//     }
//   } catch (error) {
//     localStorage.removeItem('token');
//   }
// }

// function logout() {
//   localStorage.removeItem('token');
//   currentUser = null;
//   favorites = [];
//   document.getElementById('logout-link').style.display = 'none';
//   document.getElementById('favorites-link').style.display = 'none';
//   document.getElementById('notes-list').innerHTML = '';
//   document.getElementById('profile-dropdown').style.display = 'none';
//   document.getElementById('profile-icon').textContent = '👤';
//   showPage('home-page');
//   document.getElementById('favorites-filter').value = '';
//   filterNewspapers();
// }

// function showPage(pageId) {
//   const pages = ['home-page', 'notes-page', 'videos-page', 'login-page', 'signup-page'];
//   pages.forEach(page => {
//     const element = document.getElementById(page);
//     if (page === pageId) {
//       element.style.display = 'block';
//       element.classList.remove('page-hidden');
//       element.classList.add('page-visible');
//     } else {
//       element.classList.remove('page-visible');
//       element.classList.add('page-hidden');
//       setTimeout(() => element.style.display = 'none', 300);
//     }
//   });
//   document.getElementById('profile-dropdown').style.display = 'none';
// }

// async function fetchNotes() {
//   if (!currentUser) return;
//   document.getElementById('loading').style.display = 'block';
//   try {
//     const response = await fetch('http://localhost:3000/api/notes', {
//       headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
//     });
//     const data = await response.json();
//     if (data.success) displayNotes(data.notes);
//     else throw new Error(data.message);
//   } catch (error) {
//     console.error('Error fetching notes:', error);
//     document.getElementById('notes-list').innerHTML = `<p>Error: ${error.message}</p>`;
//   } finally {
//     document.getElementById('loading').style.display = 'none';
//   }
// }

// async function saveNote() {
//   const noteInput = document.getElementById('note-input');
//   const note = noteInput.value.trim();
//   if (!note) {
//     alert('Please write a note before saving.');
//     return;
//   }
//   if (!currentUser) {
//     showPage('login-page');
//     return;
//   }
//   try {
//     const response = await fetch('http://localhost:3000/api/notes', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${localStorage.getItem('token')}`
//       },
//       body: JSON.stringify({ note })
//     });
//     const data = await response.json();
//     if (data.success) {
//       noteInput.value = '';
//       fetchNotes();
//     } else {
//       throw new Error(data.message);
//     }
//   } catch (error) {
//     console.error('Error saving note:', error);
//     alert('Error saving note: ' + error.message);
//   }
// }

// async function editNote(id, oldNote) {
//   const newNote = prompt('Edit your note:', oldNote);
//   if (newNote === null || newNote.trim() === oldNote) return;
//   try {
//     const response = await fetch(`http://localhost:3000/api/notes/${id}`, {
//       method: 'PUT',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${localStorage.getItem('token')}`
//       },
//       body: JSON.stringify({ note: newNote.trim() })
//     });
//     const data = await response.json();
//     if (data.success) fetchNotes();
//     else throw new Error(data.message);
//   } catch (error) {
//     alert('Error updating note: ' + error.message);
//   }
// }

// async function deleteNote(id) {
//   if (!confirm('Are you sure you want to delete this note?')) return;
//   try {
//     const response = await fetch(`http://localhost:3000/api/notes/${id}`, {
//       method: 'DELETE',
//       headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
//     });
//     const data = await response.json();
//     if (data.success) fetchNotes();
//     else throw new Error(data.message);
//   } catch (error) {
//     alert('Error deleting note: ' + error.message);
//   }
// }

// function displayNotes(notes) {
//   const notesList = document.getElementById('notes-list');
//   notesList.innerHTML = '';
//   if (!notes || notes.length === 0) {
//     notesList.innerHTML = '<p>No notes yet</p>';
//     return;
//   }
//   notes.forEach(({ id, note, date }) => {
//     const div = document.createElement('div');
//     div.className = 'note-item';
//     const formattedDate = new Date(date).toLocaleDateString('en-IN', {
//       day: 'numeric', month: 'long', year: 'numeric'
//     });
//     div.innerHTML = `
//       <div class="note-card">
//         <span class="badge timestamp">[${formattedDate}]</span>
//         <p>${note}</p>
//         <div class="note-actions">
//           <button onclick="editNote(${id}, '${note.replace(/'/g, "\\'")}')">Edit</button>
//           <button onclick="deleteNote(${id})">Delete</button>
//         </div>
//       </div>
//     `;
//     notesList.appendChild(div);
//   });
// }

// async function fetchNewspapers() {
//   document.getElementById('loading').style.display = 'block';
//   try {
//     const response = await fetch('/api/newspapers');
//     allNewspapers = await response.json();
//     allNewspapers.forEach(paper => paper.id = paper.name.replace(/\s+/g, '-').toLowerCase());
//     filteredNewspapers = [...allNewspapers];
//     filterNewspapers();
//   } catch (error) {
//     console.error('Error fetching newspapers:', error);
//     document.getElementById('newspaper-list').innerHTML = '<p>Unable to load newspapers</p>';
//   } finally {
//     document.getElementById('loading').style.display = 'none';
//   }
// }

// async function fetchFavorites() {
//   if (!currentUser) return;
//   try {
//     const response = await fetch('/api/favorites', {
//       headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
//     });
//     const data = await response.json();
//     if (data.success) {
//       favorites = data.favorites || [];
//       filterNewspapers();
//     }
//   } catch (error) {
//     console.error('Error fetching favorites:', error);
//   }
// }

// async function toggleFavorite(newspaperId) {
//   if (!currentUser) {
//     showPage('login-page');
//     return;
//   }
//   const isFavorited = favorites.includes(newspaperId);
//   try {
//     const response = await fetch(`/api/favorites${isFavorited ? '/' + newspaperId : ''}`, {
//       method: isFavorited ? 'DELETE' : 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${localStorage.getItem('token')}`
//       },
//       body: !isFavorited ? JSON.stringify({ newspaper_id: newspaperId }) : undefined
//     });
//     const data = await response.json();
//     if (data.success) {
//       if (isFavorited) favorites = favorites.filter(id => id !== newspaperId);
//       else favorites.push(newspaperId);
//       filterNewspapers();
//       if (document.getElementById('videos-page').style.display === 'block') {
//         displayVideos(allNewspapers, currentVideosPage);
//       }
//     } else {
//       throw new Error(data.message);
//     }
//   } catch (error) {
//     console.error('Error toggling favorite:', error);
//     alert('Error toggling favorite: ' + error.message);
//   }
// }

// async function fetchHeadlines() {
//   try {
//     const response = await fetch('/api/headlines');
//     const data = await response.json();
//     if (data.success) displayHeadlines(data.headlines);
//     else throw new Error('Failed to fetch headlines');
//   } catch (error) {
//     console.error('Error fetching headlines:', error);
//     document.getElementById('headlines').innerHTML = '<h3>Top Headlines</h3><p>Unable to load headlines</p>';
//   }
// }

// function displayHeadlines(headlines) {
//   const headlinesSection = document.getElementById('headlines');
//   headlinesSection.innerHTML = '<h3>Top Headlines</h3>';
//   headlinesSection.className = 'headlines-grid';
//   if (!headlines || headlines.length === 0) {
//     headlinesSection.innerHTML += '<p>No headlines available</p>';
//     return;
//   }
//   headlines.forEach(({ title, source, url, urlToImage }) => {
//     const card = document.createElement('div');
//     card.className = 'headline-card';
//     card.innerHTML = `
//       ${urlToImage ? `<img src="${urlToImage}" alt="${title}" class="headline-img">` : ''}
//       <div class="headline-content">
//         <a href="${url || '#'}" target="_blank">${title || 'No title'}</a>
//         <p>${source || 'Unknown source'}</p>
//       </div>
//     `;
//     headlinesSection.appendChild(card);
//   });
// }

// function displayNewspapers(newspapers, page) {
//   const newspaperList = document.getElementById('newspaper-list');
//   newspaperList.innerHTML = '';
//   const start = (page - 1) * perPage;
//   const end = start + perPage;
//   const paginated = newspapers.slice(start, end);

//   if (paginated.length === 0) {
//     newspaperList.innerHTML = '<p>No newspapers match your filters</p>';
//     return;
//   }

//   paginated.forEach(paper => {
//     const card = document.createElement('div');
//     card.className = 'newspaper-card';
//     const isFavorited = favorites.includes(paper.id);
//     card.innerHTML = `
//       <img src="${paper.logo || 'placeholder.png'}" alt="${paper.name} logo">
//       <h3>${paper.name || 'Unknown'}</h3>
//       <span class="badge language">${paper.language || 'N/A'}</span>
//       <span class="badge region">${paper.region || 'N/A'}</span>
//       <a href="${paper.url || '#'}" target="_blank">Visit Website</a>
//       <button class="favorite-btn" onclick="toggleFavorite('${paper.id}')">${isFavorited ? '★' : '☆'}</button>
//     `;
//     newspaperList.appendChild(card);
//   });

//   updatePagination(newspapers.length, 'page-info', 'prev-btn', 'next-btn');
// }

// function displayVideos(newspapers, page) { // New Function for Videos
//   const videosList = document.getElementById('videos-list');
//   videosList.innerHTML = '';
//   const start = (page - 1) * perPage;
//   const end = start + perPage;
//   const paginated = newspapers.slice(start, end);

//   if (paginated.length === 0) {
//     videosList.innerHTML = '<p>No video channels available</p>';
//     return;
//   }

//   paginated.forEach(paper => {
//     const card = document.createElement('div');
//     card.className = 'newspaper-card';
//     const isFavorited = favorites.includes(paper.id);
//     card.innerHTML = `
//       <img src="${paper.logo || 'placeholder.png'}" alt="${paper.name} logo">
//       <h3>${paper.name || 'Unknown'}</h3>
//       <span class="badge language">${paper.language || 'N/A'}</span>
//       <span class="badge region">${paper.region || 'N/A'}</span>
//       <a href="${paper.youtube_url || '#'}" target="_blank">Watch on YouTube</a>
//       <button class="favorite-btn" onclick="toggleFavorite('${paper.id}')">${isFavorited ? '★' : '☆'}</button>
//     `;
//     videosList.appendChild(card);
//   });

//   updatePagination(newspapers.length, 'videos-page-info', 'videos-prev-btn', 'videos-next-btn');
// }

// function updatePagination(totalItems, pageInfoId, prevBtnId, nextBtnId) {
//   const totalPages = Math.ceil(totalItems / perPage) || 1;
//   const currentPg = pageInfoId === 'page-info' ? currentPage : currentVideosPage;
//   document.getElementById(pageInfoId).textContent = `Page ${currentPg} of ${totalPages}`;
//   document.getElementById(prevBtnId).disabled = currentPg === 1;
//   document.getElementById(nextBtnId).disabled = currentPg === totalPages;
// }

// function filterNewspapers() {
//   const searchTerm = document.getElementById('search-bar').value.toLowerCase();
//   const languageFilter = document.getElementById('language-filter').value;
//   const regionFilter = document.getElementById('region-filter').value;
//   const favoritesFilter = document.getElementById('favorites-filter').value;

//   filteredNewspapers = allNewspapers.filter(paper => {
//     const matchesSearch = (
//       paper.name.toLowerCase().includes(searchTerm) ||
//       paper.language.toLowerCase().includes(searchTerm) ||
//       paper.region.toLowerCase().includes(searchTerm)
//     );
//     const matchesLanguage = !languageFilter || paper.language === languageFilter;
//     const matchesRegion = !regionFilter || paper.region === regionFilter;
//     const matchesFavorites = favoritesFilter !== 'favorites' || (currentUser && favorites.includes(paper.id));
//     return matchesSearch && matchesLanguage && matchesRegion && matchesFavorites;
//   });

//   displayNewspapers(filteredNewspapers, currentPage);
// }

let currentPage = 1;
const perPage = 15;
let currentUser = null;
let favorites = [];
let allNewspapers = [];
let filteredNewspapers = [];
let currentVideosPage = 1;
let allHeadlines = [];

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
      profileDropdown.innerHTML = '<button id="logout-option-btn">Logout</button>';
      document.getElementById('logout-option-btn').addEventListener('click', logout);
      document.getElementById('profile-icon').textContent = currentUser.slice(0, 2).toUpperCase();
    } else {
      profileDropdown.innerHTML = `
        <div class="auth-options">
          <button id="login-option-btn">Login</button>
          <button id="signup-option-btn">Sign Up</button>
        </div>
      `;
      document.getElementById('login-option-btn').addEventListener('click', () => showPage('login-page'));
      document.getElementById('signup-option-btn').addEventListener('click', () => showPage('signup-page'));
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
  searchBar.addEventListener('input', filterNewspapers);
  languageFilter.addEventListener('change', filterNewspapers);
  regionFilter.addEventListener('change', filterNewspapers);
  favoritesFilter.addEventListener('change', filterNewspapers);
  prevBtn.addEventListener('click', () => { if (currentPage > 1) { currentPage--; filterNewspapers(); } });
  nextBtn.addEventListener('click', () => { const totalPages = Math.ceil(filteredNewspapers.length / perPage); if (currentPage < totalPages) { currentPage++; filterNewspapers(); } });
  videosPrevBtn.addEventListener('click', () => { if (currentVideosPage > 1) { currentVideosPage--; displayVideos(allNewspapers, currentVideosPage); } });
  videosNextBtn.addEventListener('click', () => { const totalPages = Math.ceil(allNewspapers.length / perPage); if (currentVideosPage < totalPages) { currentVideosPage++; displayVideos(allNewspapers, currentVideosPage); } });
});

// Authentication Functions
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
      fetchFavorites();
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
      fetchFavorites();
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
  const pages = ['home-page', 'notes-page', 'videos-page', 'login-page', 'signup-page'];
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

// Notes Functions
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
        'Authorization': `Bearer ${localStorage.getItem('token')}` }
      ,
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
        'Authorization': `Bearer ${localStorage.getItem('token')}` }
      ,
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

// Newspaper and Favorites Functions
async function fetchNewspapers() {
  document.getElementById('loading').style.display = 'block';
  try {
    const response = await fetch('/api/newspapers');
    allNewspapers = await response.json();
    allNewspapers.forEach(paper => paper.id = paper.name.replace(/\s+/g, '-').toLowerCase());
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
      favorites = data.favorites || [];
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
        'Authorization': `Bearer ${localStorage.getItem('token')}` }
      ,
      body: !isFavorited ? JSON.stringify({ newspaper_id: newspaperId }) : undefined
    });
    const data = await response.json();
    if (data.success) {
      if (isFavorited) favorites = favorites.filter(id => id !== newspaperId);
      else favorites.push(newspaperId);
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

// Headlines Functions
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
  headlinesSection.className = ''; // Reset classes

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

  // Modal creation
  const modal = document.createElement('div');
  modal.className = 'headlines-modal';
  modal.id = 'headlines-modal';
  modal.innerHTML = `
    <div class="headlines-modal-content">
      <button class="close-modal">×</button>
      <h3>All Headlines</h3>
      <div id="modal-headlines-grid"></div>
    </div>
  `;
  if (!document.getElementById('headlines-modal')) {
    document.body.appendChild(modal);
  }
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
  const closeBtn = modal.querySelector('.close-modal');
  closeBtn.addEventListener('click', () => modal.style.display = 'none');
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
  });
}

// Newspaper and Video Display Functions
function displayNewspapers(newspapers, page) {
  const newspaperList = document.getElementById('newspaper-list');
  newspaperList.innerHTML = '';
  const start = (page - 1) * perPage;
  const end = start + perPage;
  const paginated = newspapers.slice(start, end);

  if (paginated.length === 0) {
    newspaperList.innerHTML = '<p>No newspapers match your filters</p>';
    return;
  }

  paginated.forEach(paper => {
    const card = document.createElement('div');
    card.className = 'newspaper-card';
    const isFavorited = favorites.includes(paper.id);
    card.innerHTML = `
      <img src="${paper.logo || '/placeholder.png'}" alt="${paper.name} logo">
      <h3>${paper.name || 'Unknown'}</h3>
      <span class="badge language">${paper.language || 'N/A'}</span>
      <span class="badge region">${paper.region || 'N/A'}</span>
      <a href="${paper.url || '#'}" target="_blank">Visit Website</a>
      <button class="favorite-btn" onclick="toggleFavorite('${paper.id}')">${isFavorited ? '★' : '☆'}</button>
    `;
    newspaperList.appendChild(card);
  });

  updatePagination(newspapers.length, 'page-info', 'prev-btn', 'next-btn');
}

function displayVideos(newspapers, page) {
  const videosList = document.getElementById('videos-list');
  videosList.innerHTML = '';
  const start = (page - 1) * perPage;
  const end = start + perPage;
  const paginated = newspapers.slice(start, end);

  if (paginated.length === 0) {
    videosList.innerHTML = '<p>No video channels available</p>';
    return;
  }

  paginated.forEach(paper => {
    const card = document.createElement('div');
    card.className = 'newspaper-card';
    const isFavorited = favorites.includes(paper.id);
    card.innerHTML = `
      <img src="${paper.logo || '/placeholder.png'}" alt="${paper.name} logo">
      <h3>${paper.name || 'Unknown'}</h3>
      <span class="badge language">${paper.language || 'N/A'}</span>
      <span class="badge region">${paper.region || 'N/A'}</span>
      <a href="${paper.youtube_url || '#'}" target="_blank">Watch on YouTube</a>
      <button class="favorite-btn" onclick="toggleFavorite('${paper.id}')">${isFavorited ? '★' : '☆'}</button>
    `;
    videosList.appendChild(card);
  });

  updatePagination(newspapers.length, 'videos-page-info', 'videos-prev-btn', 'videos-next-btn');
}

function updatePagination(totalItems, pageInfoId, prevBtnId, nextBtnId) {
  const totalPages = Math.ceil(totalItems / perPage) || 1;
  const currentPg = pageInfoId === 'page-info' ? currentPage : currentVideosPage;
  document.getElementById(pageInfoId).textContent = `Page ${currentPg} of ${totalPages}`;
  document.getElementById(prevBtnId).disabled = currentPg === 1;
  document.getElementById(nextBtnId).disabled = currentPg === totalPages;
}

function filterNewspapers() {
  const searchTerm = document.getElementById('search-bar').value.toLowerCase();
  const languageFilter = document.getElementById('language-filter').value;
  const regionFilter = document.getElementById('region-filter').value;
  const favoritesFilter = document.getElementById('favorites-filter').value;

  filteredNewspapers = allNewspapers.filter(paper => {
    const matchesSearch = (
      paper.name.toLowerCase().includes(searchTerm) ||
      paper.language.toLowerCase().includes(searchTerm) ||
      paper.region.toLowerCase().includes(searchTerm)
    );
    const matchesLanguage = !languageFilter || paper.language === languageFilter;
    const matchesRegion = !regionFilter || paper.region === regionFilter;
    const matchesFavorites = favoritesFilter !== 'favorites' || (currentUser && favorites.includes(paper.id));
    return matchesSearch && matchesLanguage && matchesRegion && matchesFavorites;
  });

  displayNewspapers(filteredNewspapers, currentPage);
}