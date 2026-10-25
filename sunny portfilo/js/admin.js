/**
 * SUNNY PORTFOLIO — ADMIN DASHBOARD JAVASCRIPT
 * Handles authentication, inquiries from both forms, stats editing, reviews management, and portfolio controls.
 */

// Default Seed Data
const DEFAULT_PORTFOLIO_DATA = {
  stats: {
    editorWorks: "150+",
    editorWorksSub: "Commercial & Social Edits",
    filmmakerWorks: "35+",
    filmmakerWorksSub: "Short Films & Productions",
    yearsExp: "3+",
    yearsExpSub: "Years Industry Experience",
    clientSatisfaction: "99%",
    clientSatisfactionSub: "Client Satisfaction Rate",
    footageCut: "1,500+",
    footageCutSub: "Hours of Footage Rendered"
  },
  settings: {
    availability: "available",
    availabilityText: "Currently Available For Projects",
    availabilitySub: "Worldwide Remote Video Editing & On-Location Shoot Direction.",
    announcement: ""
  },
  reviews: [
    {
      id: "rev_1",
      name: "Arjun Mehta",
      role: "Content Creator & Founder",
      company: "Pulse Media (1.2M Subs)",
      category: "editor",
      rating: 5,
      text: "Sunny transformed our YouTube retention rates from 38% to over 65%. His pacing, motion tracking, and sound design are second to none in this industry.",
      date: "2026-09-15"
    },
    {
      id: "rev_2",
      name: "Sarah Jenkins",
      role: "Music Video Director & Artist",
      company: "Elysian Records UK",
      category: "filmmaker",
      rating: 5,
      text: "Working with Sunny on our narrative visual album was breathtaking. His eye for anamorphic lighting, camera movement, and emotional color grades brought tears to our eyes.",
      date: "2026-08-28"
    },
    {
      id: "rev_3",
      name: "Vikram Sethi",
      role: "Creative Director",
      company: "Apex Brand Studio",
      category: "editor",
      rating: 5,
      text: "Delivered a commercial 30s broadcast spot under a 48-hour deadline without breaking a sweat. The sound design alone elevated the entire production.",
      date: "2026-10-02"
    },
    {
      id: "rev_4",
      name: "Elena Rostova",
      role: "Indie Film Producer",
      company: "Silverlight Cine",
      category: "filmmaker",
      rating: 5,
      text: "Sunny's directorial vision is mature far beyond his years. Precise scene blocking, incredible work with actors, and a final Kodak 2383 grade that won festival honors.",
      date: "2026-10-18"
    }
  ],
  inquiries: [
    {
      id: "inq_1",
      name: "Rohan Gupta",
      email: "rohan.g@techflow.io",
      service: "video-editing",
      sourceForm: "Video Editor Form",
      mode: "editor",
      timeline: "2 weeks turnaround",
      message: "Looking for a high-retention video editor for our series of product launch videos and Instagram Reels. We love your style and attention to rhythm!",
      date: "2026-10-24 14:32",
      status: "new"
    },
    {
      id: "inq_2",
      name: "Maya Krishnan",
      email: "maya@indiefilms.co",
      service: "filmmaking",
      sourceForm: "Filmmaking Form",
      mode: "filmmaker",
      timeline: "Shoot starts next month",
      message: "We have a 15-minute narrative drama script ready and want Sunny to direct and oversee the cinematography in Mumbai/Hyderabad.",
      date: "2026-10-23 09:15",
      status: "contacted"
    }
  ]
};

// Storage Key
const STORAGE_KEY = 'sunny_portfolio_data';
const AUTH_KEY = 'sunny_admin_auth';

// Valid Credentials requested by user:
// username: sunny
// password: Sunny@24y
const VALID_USERNAME = "sunny";
const VALID_PASSWORD = "Sunny@24y";

// App State
let portfolioData = null;
let currentInquiryFilter = 'all';

// Initialize Data
function loadPortfolioData() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      portfolioData = JSON.parse(saved);
      // Ensure inquiries array exists
      if (!Array.isArray(portfolioData.inquiries)) {
        portfolioData.inquiries = DEFAULT_PORTFOLIO_DATA.inquiries;
      }
      if (!portfolioData.stats) {
        portfolioData.stats = DEFAULT_PORTFOLIO_DATA.stats;
      }
      if (!Array.isArray(portfolioData.reviews)) {
        portfolioData.reviews = DEFAULT_PORTFOLIO_DATA.reviews;
      }
      if (!portfolioData.settings) {
        portfolioData.settings = DEFAULT_PORTFOLIO_DATA.settings;
      }
    } catch (e) {
      portfolioData = JSON.parse(JSON.stringify(DEFAULT_PORTFOLIO_DATA));
    }
  } else {
    portfolioData = JSON.parse(JSON.stringify(DEFAULT_PORTFOLIO_DATA));
    savePortfolioData();
  }
}

function savePortfolioData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(portfolioData));
}

// Toast Helper
function showAdminToast(message, iconName = 'check') {
  const container = document.getElementById('adminToastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = 'admin-toast';
  toast.innerHTML = `<i data-lucide="${iconName}"></i><span>${message}</span>`;
  container.appendChild(toast);
  if (window.lucide) window.lucide.createIcons();
  setTimeout(() => {
    toast.remove();
  }, 3500);
}

// Document Ready
document.addEventListener('DOMContentLoaded', () => {
  loadPortfolioData();

  if (window.lucide) {
    window.lucide.createIcons();
  }

  // DOM Elements
  const loginView = document.getElementById('loginView');
  const dashboardView = document.getElementById('dashboardView');
  const loginForm = document.getElementById('loginForm');
  const usernameInput = document.getElementById('usernameInput');
  const passwordInput = document.getElementById('passwordInput');
  const togglePasswordBtn = document.getElementById('togglePasswordBtn');
  const loginAlert = document.getElementById('loginAlert');
  const btnLogout = document.getElementById('btnLogout');

  // Check existing session
  const isAuthenticated = sessionStorage.getItem(AUTH_KEY) === 'true';
  if (isAuthenticated) {
    showDashboard();
  } else {
    showLogin();
  }

  // Toggle Password Visibility
  if (togglePasswordBtn) {
    togglePasswordBtn.addEventListener('click', () => {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      togglePasswordBtn.innerHTML = type === 'password' 
        ? '<i data-lucide="eye"></i>' 
        : '<i data-lucide="eye-off"></i>';
      if (window.lucide) window.lucide.createIcons();
    });
  }

  // Login Handler
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const user = usernameInput.value.trim();
      const pass = passwordInput.value;

      if (user === VALID_USERNAME && pass === VALID_PASSWORD) {
        sessionStorage.setItem(AUTH_KEY, 'true');
        loginAlert.style.display = 'none';
        showDashboard();
        showAdminToast('Welcome back, Sunny! Admin session authenticated.', 'shield-check');
      } else {
        loginAlert.textContent = 'Invalid username or password. Please try again.';
        loginAlert.classList.add('error');
        loginAlert.style.display = 'flex';
        // Gentle shake effect
        const card = document.querySelector('.login-card');
        card.style.animation = 'none';
        setTimeout(() => {
          card.style.animation = 'shake 0.4s ease-in-out';
        }, 10);
      }
    });
  }

  // Logout Handler
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      sessionStorage.removeItem(AUTH_KEY);
      showLogin();
      showAdminToast('Logged out of Admin Console safely.', 'log-out');
    });
  }

  function showLogin() {
    loginView.style.display = 'flex';
    dashboardView.classList.remove('active');
  }

  function showDashboard() {
    loginView.style.display = 'none';
    dashboardView.classList.add('active');
    initDashboard();
  }

  // Initialize Dashboard Views
  function initDashboard() {
    setupSidebarTabs();
    renderOverviewKPIs();
    renderInquiries();
    renderStatsEditor();
    renderReviewsManager();
    renderPortfolioControls();

    // Deep link directly to specified tab from URL (e.g. ?tab=tabReviews or #tabReviews)
    const urlParams = new URLSearchParams(window.location.search);
    const requestedTab = urlParams.get('tab') || window.location.hash.replace('#', '');
    if (requestedTab) {
      activateTab(requestedTab);
    }
    if (urlParams.get('action') === 'add') {
      setTimeout(() => {
        const btnAdd = document.getElementById('btnOpenAddReview');
        if (btnAdd) btnAdd.click();
      }, 250);
    }

    if (window.lucide) window.lucide.createIcons();

    // Firebase Cloud Synchronization
    setupFirebaseAdminSync();
  }

  function setupFirebaseAdminSync() {
    if (!window.SunnyFirebase || !window.SunnyFirebase.isReady()) {
      const badge = document.getElementById('firebaseStatusBadge');
      if (badge) {
        badge.innerHTML = '<span class="fb-dot" style="background:#eab308; box-shadow:0 0 8px #eab308;"></span><span>Local Storage Mode</span>';
        badge.title = 'Running in offline/local mode. Check internet connection for Cloud sync.';
      }
      return;
    }

    // 1. Seed cloud database if empty on initial connection
    window.SunnyFirebase.seedIfEmpty(DEFAULT_PORTFOLIO_DATA);

    // 2. Real-time Inquiries from Cloud Firestore
    window.SunnyFirebase.subscribeInquiries(function (cloudInquiries) {
      if (Array.isArray(cloudInquiries)) {
        portfolioData.inquiries = cloudInquiries;
        savePortfolioData();
        renderInquiries();
        renderOverviewKPIs();
      }
    });

    // 3. Real-time Reviews from Cloud Firestore
    window.SunnyFirebase.subscribeReviews(function (cloudReviews) {
      if (Array.isArray(cloudReviews) && cloudReviews.length > 0) {
        portfolioData.reviews = cloudReviews;
        savePortfolioData();
        renderReviewsManager();
        renderOverviewKPIs();
      }
    });

    // 4. Real-time Portfolio Info (Stats & Settings) from Cloud Firestore
    window.SunnyFirebase.subscribePortfolioInfo(function (cloudInfo) {
      if (cloudInfo) {
        if (cloudInfo.stats) portfolioData.stats = Object.assign({}, portfolioData.stats, cloudInfo.stats);
        if (cloudInfo.settings) portfolioData.settings = Object.assign({}, portfolioData.settings, cloudInfo.settings);
        savePortfolioData();
        renderOverviewKPIs();
      }
    });
  }

  // Activate specific sidebar tab by ID or alias
  function activateTab(tabId) {
    if (!tabId) return;
    let target = tabId;
    if (target === 'reviews') target = 'tabReviews';
    if (target === 'inquiries') target = 'tabInquiries';
    if (target === 'stats') target = 'tabStats';
    if (target === 'controls') target = 'tabControls';
    if (target === 'overview') target = 'tabOverview';

    const tabBtns = document.querySelectorAll('.sidebar-tab-btn');
    const panes = document.querySelectorAll('.tab-pane');
    const targetPane = document.getElementById(target);
    if (!targetPane) return;

    tabBtns.forEach(b => {
      if (b.dataset.tab === target) {
        b.classList.add('active');
      } else {
        b.classList.remove('active');
      }
    });

    panes.forEach(p => {
      if (p.id === target) {
        p.classList.add('active');
      } else {
        p.classList.remove('active');
      }
    });

    if (window.lucide) window.lucide.createIcons();
  }

  // Sidebar Tab Switching
  function setupSidebarTabs() {
    const tabBtns = document.querySelectorAll('.sidebar-tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        activateTab(btn.dataset.tab);
      });
    });
  }

  // 1. Overview KPIs
  function renderOverviewKPIs() {
    const kpiWorks = document.getElementById('kpiTotalWorks');
    const kpiSatisfaction = document.getElementById('kpiSatisfaction');
    const kpiInquiries = document.getElementById('kpiInquiries');
    const kpiReviews = document.getElementById('kpiReviews');

    const totalWorks = (parseInt(portfolioData.stats.editorWorks) || 0) + (parseInt(portfolioData.stats.filmmakerWorks) || 0);
    if (kpiWorks) kpiWorks.textContent = `${totalWorks}+`;
    if (kpiSatisfaction) kpiSatisfaction.textContent = portfolioData.stats.clientSatisfaction || "99%";

    const newInquiriesCount = (portfolioData.inquiries || []).filter(i => i.status === 'new').length;
    if (kpiInquiries) kpiInquiries.textContent = (portfolioData.inquiries || []).length;
    
    // Update badge in sidebar and navbar
    const badge = document.getElementById('sidebarInquiryBadge');
    if (badge) {
      badge.textContent = `${newInquiriesCount} New`;
      badge.style.display = newInquiriesCount > 0 ? 'inline-block' : 'none';
    }

    if (kpiReviews) kpiReviews.textContent = (portfolioData.reviews || []).length;

    // Recent inquiries preview table
    renderRecentInquiriesOverview();
  }

  function renderRecentInquiriesOverview() {
    const container = document.getElementById('recentInquiriesList');
    if (!container) return;
    const list = portfolioData.inquiries || [];
    if (list.length === 0) {
      container.innerHTML = '<p class="empty-state">No inquiries received yet.</p>';
      return;
    }
    const recent = list.slice(0, 3);
    container.innerHTML = recent.map(item => `
      <div class="inquiry-card ${item.status === 'new' ? 'is-new' : ''}" style="margin-bottom: 0.85rem; padding: 1rem 1.25rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 0.5rem;">
          <div class="inquiry-badges">
            <span class="source-badge ${item.mode === 'filmmaker' ? 'filmmaker' : 'editor'}">
              <i data-lucide="${item.mode === 'filmmaker' ? 'clapperboard' : 'scissors'}"></i>
              ${item.sourceForm || (item.mode === 'filmmaker' ? 'Filmmaking Form' : 'Video Editor Form')}
            </span>
            <span class="status-badge ${item.status}">${item.status}</span>
          </div>
          <span class="inquiry-date">${item.date}</span>
        </div>
        <div style="font-weight: 700; color: #fff; font-size: 0.95rem;">${item.name} (${item.email})</div>
        <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.35rem;">${item.message.slice(0, 100)}...</p>
      </div>
    `).join('');
  }

  // 2. Inquiries Tab & Filters
  function renderInquiries() {
    const listContainer = document.getElementById('inquiriesFullList');
    if (!listContainer) return;

    let items = portfolioData.inquiries || [];

    if (currentInquiryFilter === 'editor') {
      items = items.filter(i => i.mode === 'editor' || (i.sourceForm && i.sourceForm.toLowerCase().includes('editor')));
    } else if (currentInquiryFilter === 'filmmaker') {
      items = items.filter(i => i.mode === 'filmmaker' || (i.sourceForm && i.sourceForm.toLowerCase().includes('film')));
    }

    if (items.length === 0) {
      listContainer.innerHTML = `
        <div class="empty-state">
          <i data-lucide="inbox"></i>
          <h4>No form inquiries found</h4>
          <p>Submissions from the portfolio contact form will appear here with form origin labels.</p>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    listContainer.innerHTML = items.map(inq => {
      const isFilmmaker = inq.mode === 'filmmaker' || (inq.sourceForm && inq.sourceForm.toLowerCase().includes('film'));
      const sourceLabel = inq.sourceForm || (isFilmmaker ? 'Filmmaking Form' : 'Video Editor Form');
      const sourceClass = isFilmmaker ? 'filmmaker' : 'editor';
      const iconName = isFilmmaker ? 'clapperboard' : 'scissors';

      return `
        <div class="inquiry-card ${inq.status === 'new' ? 'is-new' : ''}" data-id="${inq.id}">
          <div class="inquiry-card-header">
            <div class="inquiry-badges">
              <span class="source-badge ${sourceClass}">
                <i data-lucide="${iconName}"></i>
                <span>${sourceLabel}</span>
              </span>
              <span class="status-badge ${inq.status}">${inq.status}</span>
            </div>
            <span class="inquiry-date"><i data-lucide="clock" style="width:14px; height:14px; vertical-align:middle; margin-right:4px;"></i>${inq.date}</span>
          </div>

          <div class="inquiry-client-row">
            <span class="inquiry-name">${inq.name}</span>
            <a href="mailto:${inq.email}?subject=${encodeURIComponent('Regarding your project inquiry — Sunny')}" class="inquiry-email">
              <i data-lucide="mail"></i>
              ${inq.email}
            </a>
          </div>

          <div class="inquiry-service-scope">
            <span>Service: <strong>${inq.service || 'Creative Inquiry'}</strong></span>
            ${inq.timeline ? `<span>Timeline: <strong>${inq.timeline}</strong></span>` : ''}
          </div>

          <div class="inquiry-message-box">
            "${inq.message}"
          </div>

          <div class="inquiry-actions">
            ${inq.status === 'new' 
              ? `<button class="btn-action mark-contacted" onclick="window.markInquiryContacted('${inq.id}')">
                   <i data-lucide="check"></i> Mark Contacted
                 </button>` 
              : `<button class="btn-action" onclick="window.markInquiryNew('${inq.id}')">
                   <i data-lucide="rotate-ccw"></i> Mark New
                 </button>`
            }
            <a href="mailto:${inq.email}?subject=${encodeURIComponent('Sunny — Project Discussion')}&body=${encodeURIComponent(`Hi ${inq.name},\n\nThank you for reaching out through my portfolio ${sourceLabel}!\n\nI reviewed your request:\n"${inq.message}"\n\nI would love to collaborate. When are you free for a quick call?`)}" class="btn-action reply">
              <i data-lucide="send"></i> Reply via Email
            </a>
            <button class="btn-action delete" onclick="window.deleteInquiry('${inq.id}')">
              <i data-lucide="trash-2"></i> Delete
            </button>
          </div>
        </div>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();
  }

  // Filter pills
  const filterPills = document.querySelectorAll('#inquiryFilters .filter-pill');
  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentInquiryFilter = pill.dataset.filter;
      renderInquiries();
    });
  });

  // Global window functions for inquiry actions
  window.markInquiryContacted = (id) => {
    const inq = (portfolioData.inquiries || []).find(i => i.id === id);
    if (inq) {
      inq.status = 'contacted';
      savePortfolioData();
      if (window.SunnyFirebase && window.SunnyFirebase.isReady()) {
        window.SunnyFirebase.updateInquiryStatus(id, 'contacted');
      }
      renderInquiries();
      renderOverviewKPIs();
      showAdminToast('Inquiry marked as contacted.', 'check');
    }
  };

  window.markInquiryNew = (id) => {
    const inq = (portfolioData.inquiries || []).find(i => i.id === id);
    if (inq) {
      inq.status = 'new';
      savePortfolioData();
      if (window.SunnyFirebase && window.SunnyFirebase.isReady()) {
        window.SunnyFirebase.updateInquiryStatus(id, 'new');
      }
      renderInquiries();
      renderOverviewKPIs();
      showAdminToast('Inquiry set back to new.', 'clock');
    }
  };

  window.deleteInquiry = (id) => {
    if (confirm('Are you sure you want to remove this inquiry?')) {
      portfolioData.inquiries = (portfolioData.inquiries || []).filter(i => i.id !== id);
      savePortfolioData();
      if (window.SunnyFirebase && window.SunnyFirebase.isReady()) {
        window.SunnyFirebase.deleteInquiry(id);
      }
      renderInquiries();
      renderOverviewKPIs();
      showAdminToast('Inquiry deleted from Firebase & local.', 'trash-2');
    }
  };

  // Add Test Inquiries
  const btnAddTestEditor = document.getElementById('btnAddTestEditorInquiry');
  const btnAddTestFilmmaker = document.getElementById('btnAddTestFilmmakerInquiry');

  if (btnAddTestEditor) {
    btnAddTestEditor.addEventListener('click', () => {
      const now = new Date();
      const newInq = {
        id: 'inq_' + Date.now(),
        name: 'Alex Rivera (Demo)',
        email: 'alex@creativeagency.com',
        service: 'video-editing',
        sourceForm: 'Video Editor Form',
        mode: 'editor',
        timeline: 'Urgent — 3 days',
        message: 'Need a fast-paced viral style cut for a TikTok/Reels campaign. Loved your Premiere Pro and motion graphics portfolio!',
        date: now.toISOString().slice(0, 16).replace('T', ' '),
        status: 'new'
      };
      portfolioData.inquiries.unshift(newInq);
      savePortfolioData();
      if (window.SunnyFirebase && window.SunnyFirebase.isReady()) {
        window.SunnyFirebase.sendInquiry(newInq);
      }
      renderInquiries();
      renderOverviewKPIs();
      showAdminToast('Demo inquiry from Video Editor Form created & synced!', 'scissors');
    });
  }

  if (btnAddTestFilmmaker) {
    btnAddTestFilmmaker.addEventListener('click', () => {
      const now = new Date();
      const newInq = {
        id: 'inq_' + Date.now(),
        name: 'Kabir Varma (Demo)',
        email: 'kabir@cinevision.in',
        service: 'filmmaking',
        sourceForm: 'Filmmaking Form',
        mode: 'filmmaker',
        timeline: 'Production in 3 weeks',
        message: 'Looking for a director of photography and creative director for our upcoming indie narrative music video. S-Log3 and anamorphic look preferred.',
        date: now.toISOString().slice(0, 16).replace('T', ' '),
        status: 'new'
      };
      portfolioData.inquiries.unshift(newInq);
      savePortfolioData();
      if (window.SunnyFirebase && window.SunnyFirebase.isReady()) {
        window.SunnyFirebase.sendInquiry(newInq);
      }
      renderInquiries();
      renderOverviewKPIs();
      showAdminToast('Demo inquiry from Filmmaking Form created & synced!', 'clapperboard');
    });
  }

  // Clear All Inquiries
  const btnClearInquiries = document.getElementById('btnClearInquiries');
  if (btnClearInquiries) {
    btnClearInquiries.addEventListener('click', () => {
      if (confirm('Clear all inquiries from the dashboard?')) {
        portfolioData.inquiries = [];
        savePortfolioData();
        if (window.SunnyFirebase && window.SunnyFirebase.isReady()) {
          window.SunnyFirebase.clearAllInquiries();
        }
        renderInquiries();
        renderOverviewKPIs();
        showAdminToast('All inquiries cleared from Firebase & local.', 'check');
      }
    });
  }

  // 3. Work Done & Stats Manager
  function renderStatsEditor() {
    const inputEditorWorks = document.getElementById('statEditorWorks');
    const inputEditorSub = document.getElementById('statEditorWorksSub');
    const inputFilmWorks = document.getElementById('statFilmWorks');
    const inputFilmSub = document.getElementById('statFilmWorksSub');
    const inputYearsExp = document.getElementById('statYearsExp');
    const inputSatisfaction = document.getElementById('statSatisfaction');
    const inputFootageCut = document.getElementById('statFootageCut');

    const s = portfolioData.stats;
    if (inputEditorWorks) inputEditorWorks.value = s.editorWorks || "150+";
    if (inputEditorSub) inputEditorSub.value = s.editorWorksSub || "Commercial & Social Edits";
    if (inputFilmWorks) inputFilmWorks.value = s.filmmakerWorks || "35+";
    if (inputFilmSub) inputFilmSub.value = s.filmmakerWorksSub || "Short Films & Productions";
    if (inputYearsExp) inputYearsExp.value = s.yearsExp || "3+";
    if (inputSatisfaction) inputSatisfaction.value = s.clientSatisfaction || "99%";
    if (inputFootageCut) inputFootageCut.value = s.footageCut || "1,500+";

    updateLiveStatsPreview();

    // Attach input listeners for live preview update
    [inputEditorWorks, inputFilmWorks, inputYearsExp, inputSatisfaction, inputFootageCut].forEach(el => {
      if (el) el.addEventListener('input', updateLiveStatsPreview);
    });

    const statsForm = document.getElementById('statsForm');
    if (statsForm) {
      statsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        portfolioData.stats.editorWorks = inputEditorWorks.value.trim();
        portfolioData.stats.editorWorksSub = inputEditorSub.value.trim();
        portfolioData.stats.filmmakerWorks = inputFilmWorks.value.trim();
        portfolioData.stats.filmmakerWorksSub = inputFilmSub.value.trim();
        portfolioData.stats.yearsExp = inputYearsExp.value.trim();
        portfolioData.stats.clientSatisfaction = inputSatisfaction.value.trim();
        portfolioData.stats.footageCut = inputFootageCut.value.trim();

        savePortfolioData();

        // Sync updated stats to Firebase Cloud Firestore
        if (window.SunnyFirebase && window.SunnyFirebase.isReady()) {
          window.SunnyFirebase.savePortfolioInfo(portfolioData.stats, portfolioData.settings);
        }

        renderOverviewKPIs();
        updateLiveStatsPreview();
        showAdminToast('Portfolio work counts and stats saved to Firebase Cloud!', 'sparkles');
      });
    }
  }

  function updateLiveStatsPreview() {
    const p1 = document.getElementById('prevEditorVal');
    const p2 = document.getElementById('prevFilmVal');
    const p3 = document.getElementById('prevSatisfactionVal');
    const p4 = document.getElementById('prevFootageVal');

    const eW = document.getElementById('statEditorWorks');
    const fW = document.getElementById('statFilmWorks');
    const sat = document.getElementById('statSatisfaction');
    const fC = document.getElementById('statFootageCut');

    if (p1 && eW) p1.textContent = eW.value || "150+";
    if (p2 && fW) p2.textContent = fW.value || "35+";
    if (p3 && sat) p3.textContent = sat.value || "99%";
    if (p4 && fC) p4.textContent = fC.value || "1,500+";
  }

  // 4. Client Reviews Manager
  function renderReviewsManager() {
    const list = document.getElementById('reviewsAdminList');
    if (!list) return;

    const reviews = portfolioData.reviews || [];
    if (reviews.length === 0) {
      list.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <i data-lucide="star"></i>
          <h4>No client reviews yet</h4>
          <p>Click "Add New Client Review" to create your first client testimonial.</p>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    list.innerHTML = reviews.map(rev => {
      const isFilm = rev.category === 'filmmaker';
      const initials = rev.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
      const stars = '★'.repeat(rev.rating || 5);

      return `
        <div class="review-admin-card" data-id="${rev.id}">
          <div>
            <div class="review-card-top">
              <span class="source-badge ${isFilm ? 'filmmaker' : 'editor'}">
                <i data-lucide="${isFilm ? 'clapperboard' : 'scissors'}"></i>
                ${isFilm ? 'Filmmaking Review' : 'Video Editing Review'}
              </span>
              <div class="stars-row">${stars}</div>
            </div>

            <p class="review-text-quote">"${rev.text}"</p>
          </div>

          <div>
            <div class="review-author-info">
              <div class="review-avatar">${initials}</div>
              <div>
                <div class="review-author-name">${rev.name}</div>
                <div class="review-author-role">${[rev.role, rev.company].filter(Boolean).join(' • ') || 'Verified Client'}</div>
              </div>
            </div>

            <div class="review-card-actions">
              <span style="font-size:0.75rem; color:var(--text-muted); margin-right:auto;">
                ${rev.date || 'Recent'}
              </span>
              <button class="btn-action delete" onclick="window.deleteReview('${rev.id}')">
                <i data-lucide="trash-2"></i> Remove
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();
  }

  window.deleteReview = (id) => {
    if (confirm('Delete this client review?')) {
      portfolioData.reviews = (portfolioData.reviews || []).filter(r => r.id !== id);
      savePortfolioData();
      if (window.SunnyFirebase && window.SunnyFirebase.isReady()) {
        window.SunnyFirebase.deleteReview(id);
      }
      renderReviewsManager();
      renderOverviewKPIs();
      showAdminToast('Review deleted from Firebase & local.', 'trash-2');
    }
  };

  // Add Review Modal
  const btnOpenAddReview = document.getElementById('btnOpenAddReview');
  const reviewModal = document.getElementById('reviewModal');
  const btnCloseReviewModal = document.getElementById('btnCloseReviewModal');
  const addReviewForm = document.getElementById('addReviewForm');

  if (btnOpenAddReview && reviewModal) {
    btnOpenAddReview.addEventListener('click', () => {
      reviewModal.classList.add('open');
    });
  }

  if (btnCloseReviewModal && reviewModal) {
    btnCloseReviewModal.addEventListener('click', () => {
      reviewModal.classList.remove('open');
    });
  }

  if (addReviewForm) {
    addReviewForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('revName').value.trim();
      const role = document.getElementById('revRole').value.trim();
      const company = document.getElementById('revCompany').value.trim();
      const category = document.getElementById('revCategory').value;
      const rating = parseInt(document.getElementById('revRating').value) || 5;
      const text = document.getElementById('revText').value.trim();

      const newReview = {
        id: 'rev_' + Date.now(),
        name,
        role,
        company,
        category,
        rating,
        text,
        date: new Date().toISOString().slice(0, 10)
      };

      if (!portfolioData.reviews) portfolioData.reviews = [];
      portfolioData.reviews.unshift(newReview);
      savePortfolioData();

      // Save Review to Firebase Firestore
      if (window.SunnyFirebase && window.SunnyFirebase.isReady()) {
        window.SunnyFirebase.saveReview(newReview);
      }

      reviewModal.classList.remove('open');
      addReviewForm.reset();
      renderReviewsManager();
      renderOverviewKPIs();
      showAdminToast('New client review published to Firebase & Portfolio!', 'star');
    });
  }

  // 5. Portfolio Controls
  function renderPortfolioControls() {
    const selAvail = document.getElementById('controlAvailability');
    const inputAnnounce = document.getElementById('controlAnnouncement');
    const formControls = document.getElementById('portfolioControlsForm');

    if (selAvail) selAvail.value = portfolioData.settings.availability || 'available';
    if (inputAnnounce) inputAnnounce.value = portfolioData.settings.announcement || '';

    if (formControls) {
      formControls.addEventListener('submit', (e) => {
        e.preventDefault();
        portfolioData.settings.availability = selAvail.value;
        portfolioData.settings.announcement = inputAnnounce.value.trim();

        if (selAvail.value === 'available') {
          portfolioData.settings.availabilityText = "Currently Available For Projects";
          portfolioData.settings.availabilitySub = "Worldwide Remote Video Editing & On-Location Shoot Direction.";
        } else {
          portfolioData.settings.availabilityText = "Currently Booked / Limited Availability";
          portfolioData.settings.availabilitySub = "Accepting high-priority productions & bookings for next month.";
        }

        savePortfolioData();

        // Sync updated availability & settings to Firebase Cloud
        if (window.SunnyFirebase && window.SunnyFirebase.isReady()) {
          window.SunnyFirebase.savePortfolioInfo(portfolioData.stats, portfolioData.settings);
        }

        showAdminToast('Portfolio settings updated live & synced to Firebase!', 'settings');
      });
    }

    const btnResetDefaults = document.getElementById('btnResetDefaults');
    if (btnResetDefaults) {
      btnResetDefaults.addEventListener('click', () => {
        if (confirm('Reset portfolio stats, demo reviews, and inquiries to default values?')) {
          portfolioData = JSON.parse(JSON.stringify(DEFAULT_PORTFOLIO_DATA));
          savePortfolioData();
          initDashboard();
          showAdminToast('Portfolio reset to default showcase data.', 'refresh-cw');
        }
      });
    }
  }
});
