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
  reviews: [],
  inquiries: [],
  todoWorks: []
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
let currentTodoFilter = 'all';

// Initialize Data
function loadPortfolioData() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      portfolioData = JSON.parse(saved);
      // Ensure inquiries array exists and strip out default demo inquiries
      if (!Array.isArray(portfolioData.inquiries)) {
        portfolioData.inquiries = [];
      } else {
        portfolioData.inquiries = portfolioData.inquiries.filter(i => i.id !== 'inq_1' && i.id !== 'inq_2');
      }
      if (!portfolioData.stats) {
        portfolioData.stats = DEFAULT_PORTFOLIO_DATA.stats;
      }
      // Ensure reviews data is reset to empty
      portfolioData.reviews = [];
      // Ensure todoWorks array exists
      if (!Array.isArray(portfolioData.todoWorks)) {
        portfolioData.todoWorks = [];
      }
      if (!portfolioData.settings) {
        portfolioData.settings = DEFAULT_PORTFOLIO_DATA.settings;
      }
      savePortfolioData();
    } catch (e) {
      portfolioData = JSON.parse(JSON.stringify(DEFAULT_PORTFOLIO_DATA));
      portfolioData.reviews = [];
      savePortfolioData();
    }
  } else {
    portfolioData = JSON.parse(JSON.stringify(DEFAULT_PORTFOLIO_DATA));
    portfolioData.reviews = [];
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
    renderTodoWorksManager();
    setupTodoWorksEvents();
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
      if (Array.isArray(cloudReviews)) {
        portfolioData.reviews = cloudReviews.filter(r => !['rev_1', 'rev_2', 'rev_3', 'rev_4'].includes(r.id));
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
    if (target === 'todo' || target === 'todoWorks' || target === 'works') target = 'tabTodoWorks';
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
    const kpiTodo = document.getElementById('kpiTodoWorks');
    const kpiTodoVal = document.getElementById('kpiTodoValue');

    const totalWorks = (parseInt(portfolioData.stats.editorWorks) || 0) + (parseInt(portfolioData.stats.filmmakerWorks) || 0);
    if (kpiWorks) kpiWorks.textContent = `${totalWorks}+`;
    if (kpiSatisfaction) kpiSatisfaction.textContent = portfolioData.stats.clientSatisfaction || "99%";

    const newInquiriesCount = (portfolioData.inquiries || []).filter(i => i.status === 'new').length;
    if (kpiInquiries) kpiInquiries.textContent = (portfolioData.inquiries || []).length;
    
    // Update inquiries badge in sidebar
    const inqBadge = document.getElementById('sidebarInquiryBadge');
    if (inqBadge) {
      inqBadge.textContent = `${newInquiriesCount} New`;
      inqBadge.style.display = newInquiriesCount > 0 ? 'inline-block' : 'none';
    }

    if (kpiReviews) kpiReviews.textContent = (portfolioData.reviews || []).length;

    // Update To-Do KPIs
    const todoList = portfolioData.todoWorks || [];
    const pendingWorks = todoList.filter(w => w.status !== 'completed');
    if (kpiTodo) kpiTodo.textContent = pendingWorks.length;
    if (kpiTodoVal) {
      kpiTodoVal.textContent = `${pendingWorks.length} active deliverable${pendingWorks.length === 1 ? '' : 's'}`;
    }

    const todoBadge = document.getElementById('sidebarTodoBadge');
    if (todoBadge) {
      todoBadge.textContent = `${pendingWorks.length}`;
      todoBadge.style.display = pendingWorks.length > 0 ? 'inline-block' : 'none';
    }

    // Recent overview widgets
    renderOverviewTodos();
    renderRecentInquiriesOverview();
  }

  // ==========================================
  // TO-DO WORKS MANAGER (ADMIN PANEL ONLY)
  // ==========================================
  function renderOverviewTodos() {
    const container = document.getElementById('overviewTodoList');
    if (!container) return;
    const allWorks = portfolioData.todoWorks || [];
    const activeWorks = allWorks.filter(w => w.status !== 'completed');

    if (activeWorks.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="padding: 1.5rem 1rem;">
          <i data-lucide="check-circle" style="color:var(--green); width:32px; height:32px; margin-bottom:0.5rem;"></i>
          <p style="color:var(--text-secondary); font-size:0.9rem;">No active to-do works. All deliverables are up to date!</p>
          <button class="btn-ghost" onclick="window.openTodoModal()" style="margin-top:0.75rem; font-size:0.82rem; padding:0.4rem 0.85rem;">
            <i data-lucide="plus"></i> Add New Work
          </button>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    const previewItems = activeWorks.slice(0, 4);
    container.innerHTML = previewItems.map(work => {
      const isProgress = work.status === 'in_progress';
      const statusLabel = isProgress ? 'In Progress' : 'Pending';
      const statusBadgeClass = isProgress ? 'in_progress' : 'pending';

      return `
        <div class="overview-todo-item">
          <div style="min-width:0; flex:1;">
            <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.25rem;">
              <span class="todo-badge ${statusBadgeClass}">${statusLabel}</span>
              <strong style="color:#fff; font-size:0.95rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(work.name)}</strong>
            </div>
            <div style="font-size:0.8rem; color:var(--text-secondary); line-height:1.4;">${escapeHtml(work.desc).slice(0, 80)}${work.desc.length > 80 ? '...' : ''}</div>
          </div>
          <div style="text-align:right; flex-shrink:0;">
            <div class="todo-amount-badge" style="font-size:0.8rem; padding:0.25rem 0.5rem;">${escapeHtml(work.amount)}</div>
            <div style="font-size:0.75rem; color:var(--text-muted); margin-top:0.25rem;">
              <i data-lucide="clock" style="width:11px; height:11px; vertical-align:middle;"></i> ${escapeHtml(work.time)}
            </div>
          </div>
        </div>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();
  }

  function renderTodoWorksManager() {
    const listContainer = document.getElementById('todoWorksList');
    if (!listContainer) return;

    const works = portfolioData.todoWorks || [];

    // Calculate Summary Stats
    const totalCount = works.length;
    const pendingCount = works.filter(w => w.status === 'pending').length;
    const progressCount = works.filter(w => w.status === 'in_progress').length;
    const completedCount = works.filter(w => w.status === 'completed').length;

    // Sum amount if numbers or extract numeric digits
    let totalNumericAmount = 0;
    works.forEach(w => {
      if (w.amount) {
        const cleaned = w.amount.replace(/[^0-9.]/g, '');
        const val = parseFloat(cleaned);
        if (!isNaN(val)) totalNumericAmount += val;
      }
    });

    const statTotal = document.getElementById('todoStatTotal');
    const statPending = document.getElementById('todoStatPending');
    const statProgress = document.getElementById('todoStatProgress');
    const statCompleted = document.getElementById('todoStatCompleted');
    const statAmount = document.getElementById('todoStatAmount');

    if (statTotal) statTotal.textContent = totalCount;
    if (statPending) statPending.textContent = pendingCount;
    if (statProgress) statProgress.textContent = progressCount;
    if (statCompleted) statCompleted.textContent = completedCount;
    if (statAmount) {
      statAmount.textContent = totalNumericAmount > 0 
        ? `₹${totalNumericAmount.toLocaleString()}` 
        : (works.length > 0 ? works[0].amount : '₹0');
    }

    // Filter items
    let filteredWorks = works;
    if (currentTodoFilter === 'pending') {
      filteredWorks = works.filter(w => w.status === 'pending');
    } else if (currentTodoFilter === 'in_progress') {
      filteredWorks = works.filter(w => w.status === 'in_progress');
    } else if (currentTodoFilter === 'completed') {
      filteredWorks = works.filter(w => w.status === 'completed');
    }

    if (filteredWorks.length === 0) {
      listContainer.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1; padding: 3rem 1.5rem;">
          <i data-lucide="check-square" style="width:40px; height:40px; color:var(--cyan); margin-bottom:0.75rem;"></i>
          <h4>No To-Do Works Found</h4>
          <p style="color:var(--text-secondary); max-width:400px; margin:0 auto 1.25rem;">
            ${currentTodoFilter === 'all' 
              ? 'You have not added any project works yet. Click below to add your first client deliverable with name, description, amount, and deadline.' 
              : 'No works matching the "' + currentTodoFilter.replace('_', ' ') + '" status filter.'}
          </p>
          <button class="btn-primary" onclick="window.openTodoModal()" style="max-width:200px; margin:0 auto;">
            <i data-lucide="plus-circle"></i>
            <span>Add To-Do Work</span>
          </button>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    listContainer.innerHTML = filteredWorks.map(work => {
      let statusBadgeHtml = '';
      if (work.status === 'completed') {
        statusBadgeHtml = `<span class="todo-badge completed"><i data-lucide="check-circle-2"></i> Completed</span>`;
      } else if (work.status === 'in_progress') {
        statusBadgeHtml = `<span class="todo-badge in_progress"><i data-lucide="play-circle"></i> In Progress</span>`;
      } else {
        statusBadgeHtml = `<span class="todo-badge pending"><i data-lucide="clock"></i> Pending</span>`;
      }

      // Next status toggle label
      let nextStatus = 'in_progress';
      let nextStatusLabel = 'Start Work';
      let nextStatusIcon = 'play';
      if (work.status === 'pending') {
        nextStatus = 'in_progress';
        nextStatusLabel = 'In Progress';
        nextStatusIcon = 'play-circle';
      } else if (work.status === 'in_progress') {
        nextStatus = 'completed';
        nextStatusLabel = 'Mark Done';
        nextStatusIcon = 'check';
      } else {
        nextStatus = 'pending';
        nextStatusLabel = 'Reopen';
        nextStatusIcon = 'rotate-ccw';
      }

      return `
        <div class="todo-work-card status-${work.status || 'pending'}" data-id="${work.id}">
          <div>
            <div class="todo-card-top">
              ${statusBadgeHtml}
              <div style="font-size:0.75rem; color:var(--text-muted);">
                ${work.createdAt || 'Active'}
              </div>
            </div>

            <h3 class="todo-card-title">${escapeHtml(work.name)}</h3>
            <p class="todo-card-desc">${escapeHtml(work.desc)}</p>

            <div class="todo-meta-strip">
              <span class="todo-amount-badge" title="Project Amount">
                <i data-lucide="badge-dollar-sign"></i>
                <span>${escapeHtml(work.amount)}</span>
              </span>
              <span class="todo-time-badge" title="Estimated Time / Deadline">
                <i data-lucide="clock"></i>
                <span>${escapeHtml(work.time)}</span>
              </span>
            </div>
          </div>

          <div class="todo-card-actions">
            <button type="button" class="btn-todo-status" onclick="window.cycleTodoStatus('${work.id}', '${nextStatus}')" title="Change work status">
              <i data-lucide="${nextStatusIcon}"></i>
              <span>${nextStatusLabel}</span>
            </button>

            <div class="todo-actions-right">
              <button type="button" class="btn-action edit" onclick="window.editTodoWork('${work.id}')" title="Edit this work">
                <i data-lucide="edit-2"></i> Edit
              </button>
              <button type="button" class="btn-action delete" onclick="window.deleteTodoWork('${work.id}')" title="Delete work">
                <i data-lucide="trash-2"></i>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();
  }

  function setupTodoWorksEvents() {
    // Open Add Modal Button
    const btnAdd = document.getElementById('btnOpenAddTodoWork');
    if (btnAdd) {
      btnAdd.addEventListener('click', () => {
        window.openTodoModal();
      });
    }

    // Close Modal Button
    const btnClose = document.getElementById('btnCloseTodoModal');
    if (btnClose) {
      btnClose.addEventListener('click', () => {
        closeTodoModal();
      });
    }

    // Modal background click
    const modal = document.getElementById('todoWorkModal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeTodoModal();
      });
    }

    // Form Submit
    const form = document.getElementById('todoWorkForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        saveTodoWork();
      });
    }

    // Filter Pills
    const filterPills = document.querySelectorAll('#todoFilters .filter-pill');
    filterPills.forEach(pill => {
      pill.addEventListener('click', () => {
        filterPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        currentTodoFilter = pill.dataset.filter || 'all';
        renderTodoWorksManager();
      });
    });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  window.openTodoModal = function(workId = null) {
    const modal = document.getElementById('todoWorkModal');
    const heading = document.getElementById('todoModalHeading');
    const inputId = document.getElementById('todoWorkId');
    const inputName = document.getElementById('todoWorkName');
    const inputDesc = document.getElementById('todoWorkDesc');
    const inputAmount = document.getElementById('todoWorkAmount');
    const inputTime = document.getElementById('todoWorkTime');
    const selectStatus = document.getElementById('todoWorkStatus');

    if (!modal) return;

    if (workId) {
      const work = (portfolioData.todoWorks || []).find(w => w.id === workId);
      if (work) {
        if (heading) heading.textContent = 'Edit To-Do Work';
        if (inputId) inputId.value = work.id;
        if (inputName) inputName.value = work.name || '';
        if (inputDesc) inputDesc.value = work.desc || '';
        if (inputAmount) inputAmount.value = work.amount || '';
        if (inputTime) inputTime.value = work.time || '';
        if (selectStatus) selectStatus.value = work.status || 'pending';
      }
    } else {
      if (heading) heading.textContent = 'Add New To-Do Work';
      if (inputId) inputId.value = '';
      if (inputName) inputName.value = '';
      if (inputDesc) inputDesc.value = '';
      if (inputAmount) inputAmount.value = '';
      if (inputTime) inputTime.value = '';
      if (selectStatus) selectStatus.value = 'pending';
    }

    modal.classList.add('open');
    if (window.lucide) window.lucide.createIcons();
    setTimeout(() => {
      if (inputName) inputName.focus();
    }, 100);
  };

  function closeTodoModal() {
    const modal = document.getElementById('todoWorkModal');
    if (modal) modal.classList.remove('open');
  }

  function saveTodoWork() {
    const inputId = document.getElementById('todoWorkId');
    const inputName = document.getElementById('todoWorkName');
    const inputDesc = document.getElementById('todoWorkDesc');
    const inputAmount = document.getElementById('todoWorkAmount');
    const inputTime = document.getElementById('todoWorkTime');
    const selectStatus = document.getElementById('todoWorkStatus');

    const name = inputName ? inputName.value.trim() : '';
    const desc = inputDesc ? inputDesc.value.trim() : '';
    const amount = inputAmount ? inputAmount.value.trim() : '';
    const time = inputTime ? inputTime.value.trim() : '';
    const status = selectStatus ? selectStatus.value : 'pending';
    const id = inputId && inputId.value ? inputId.value : ('work_' + Date.now());

    if (!name || !desc || !amount || !time) {
      alert('Please fill out all fields (Work Name, Description, Amount, and Time).');
      return;
    }

    if (!Array.isArray(portfolioData.todoWorks)) {
      portfolioData.todoWorks = [];
    }

    const existingIdx = portfolioData.todoWorks.findIndex(w => w.id === id);
    const nowStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    if (existingIdx >= 0) {
      portfolioData.todoWorks[existingIdx] = {
        ...portfolioData.todoWorks[existingIdx],
        name,
        desc,
        amount,
        time,
        status,
        updatedAt: nowStr
      };
      showAdminToast(`Work "${name}" updated successfully!`, 'check-circle');
    } else {
      portfolioData.todoWorks.unshift({
        id,
        name,
        desc,
        amount,
        time,
        status,
        createdAt: nowStr
      });
      showAdminToast(`New work "${name}" added to To-Do Works!`, 'plus-circle');
    }

    savePortfolioData();
    closeTodoModal();
    renderTodoWorksManager();
    renderOverviewKPIs();
  }

  window.editTodoWork = function(id) {
    window.openTodoModal(id);
  };

  window.deleteTodoWork = function(id) {
    const work = (portfolioData.todoWorks || []).find(w => w.id === id);
    const title = work ? work.name : 'this item';
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      portfolioData.todoWorks = (portfolioData.todoWorks || []).filter(w => w.id !== id);
      savePortfolioData();
      renderTodoWorksManager();
      renderOverviewKPIs();
      showAdminToast('To-Do Work deleted.', 'trash-2');
    }
  };

  window.cycleTodoStatus = function(id, newStatus) {
    const work = (portfolioData.todoWorks || []).find(w => w.id === id);
    if (!work) return;
    work.status = newStatus;
    savePortfolioData();
    renderTodoWorksManager();
    renderOverviewKPIs();
    const statusText = newStatus === 'completed' ? 'Completed' : (newStatus === 'in_progress' ? 'In Progress' : 'Pending');
    showAdminToast(`Status changed to "${statusText}"`, 'check');
  };

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

          ${(inq.projectLink || inq.attachedFile) ? `
          <div class="inquiry-attach-row">
            ${inq.projectLink ? `
              <a href="${inq.projectLink}" target="_blank" rel="noopener noreferrer" class="inq-attach-chip link">
                <i data-lucide="link-2"></i>
                <span>Project Link</span>
                <i data-lucide="external-link" style="width:11px;height:11px;opacity:0.6;"></i>
              </a>` : ''}
            ${inq.attachedFile ? `
              <span class="inq-attach-chip file">
                <i data-lucide="file-check"></i>
                <span>${inq.attachedFile}</span>
              </span>` : ''}
          </div>` : ''}

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

  // Helper: Render 5-star set with filled & unfilled SVG stars and rating-based color theme for Admin
  function renderAdminStarsHTML(rating) {
    const r = Math.min(5, Math.max(1, parseInt(rating, 10) || 5));
    const starFilled = '<svg class="star-svg filled" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
    const starUnfilled = '<svg class="star-svg unfilled" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
    let starsHtml = '';
    for (let i = 1; i <= 5; i++) {
      starsHtml += (i <= r) ? starFilled : starUnfilled;
    }
    return `
      <div class="stars-badge rating-${r}" title="${r} out of 5 stars">
        <span style="display:inline-flex; gap:2px;">${starsHtml}</span>
        <span>${r}.0</span>
      </div>
    `;
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
      const starsBadge = renderAdminStarsHTML(rev.rating || 5);

      return `
        <div class="review-admin-card" data-id="${rev.id}">
          <div>
            <div class="review-card-top">
              <span class="source-badge ${isFilm ? 'filmmaker' : 'editor'}">
                <i data-lucide="${isFilm ? 'clapperboard' : 'scissors'}"></i>
                ${isFilm ? 'Filmmaking Review' : 'Video Editing Review'}
              </span>
              ${starsBadge}
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
