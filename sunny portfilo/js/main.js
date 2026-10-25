/**
 * SUNNY PORTFOLIO — INTERACTIVE DUAL PERSONA JAVASCRIPT
 * Video Editor & Cinematic Filmmaker Modes
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // State
  let currentMode = localStorage.getItem('sunny_portfolio_mode') || 'editor';
  let soundEnabled = true;

  // DOM Elements
  const htmlRoot = document.documentElement;
  const navbar = document.getElementById('navbar');
  const btnModeEditor = document.getElementById('btnModeEditor');
  const btnModeFilmmaker = document.getElementById('btnModeFilmmaker');
  const btnQuickSwitch = document.getElementById('btnQuickSwitch');
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const soundToggle = document.getElementById('soundToggle');
  const toastContainer = document.getElementById('toastContainer');

  // Comparison Slider Elements
  const compareContainer = document.getElementById('compareContainer');
  const compareBeforeWrapper = document.getElementById('compareBeforeWrapper');
  const compareHandle = document.getElementById('compareHandle');

  // Contact Form
  const contactForm = document.getElementById('contactForm');
  const formFeedback = document.getElementById('formFeedback');

  /* ==========================================================================
     1. SYNTHETIC AUDIO SOUND EFFECTS (Web Audio API)
     ========================================================================== */
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx && (window.AudioContext || window.webkitAudioContext)) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  function playModeSwitchSound(mode) {
    if (!soundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      const now = audioCtx.currentTime;

      if (mode === 'editor') {
        // High-tech cyber snap: quick dual chirp
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);
        gainNode.gain.setValueAtTime(0.15, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else {
        // Cinematic warm shutter chime
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(560, now + 0.12);
        gainNode.gain.setValueAtTime(0.2, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      }
    } catch (e) {
      // Audio not permitted or supported; safely proceed silently
    }
  }

  function playClickSound() {
    if (!soundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      const now = audioCtx.currentTime;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);
      gainNode.gain.setValueAtTime(0.08, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.start(now);
      osc.stop(now + 0.04);
    } catch (e) {}
  }

  // Sound Toggle click
  if (soundToggle) {
    soundToggle.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      soundToggle.classList.toggle('muted', !soundEnabled);
      showToast(soundEnabled ? 'Sound Effects Enabled' : 'Sound Effects Muted', 'volume-2');
    });
  }

  /* ==========================================================================
     2. DUAL-PERSONA SWITCHER & PORTFOLIO DATA SYNC
     ========================================================================== */
  const PORTFOLIO_STORAGE_KEY = 'sunny_portfolio_data';

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

  let portfolioData = null;

  function loadPortfolioData() {
    const raw = localStorage.getItem(PORTFOLIO_STORAGE_KEY);
    if (raw) {
      try {
        portfolioData = JSON.parse(raw);
        if (!portfolioData.stats) portfolioData.stats = DEFAULT_PORTFOLIO_DATA.stats;
        if (!Array.isArray(portfolioData.reviews)) portfolioData.reviews = DEFAULT_PORTFOLIO_DATA.reviews;
        if (!Array.isArray(portfolioData.inquiries)) portfolioData.inquiries = DEFAULT_PORTFOLIO_DATA.inquiries;
      } catch (e) {
        portfolioData = JSON.parse(JSON.stringify(DEFAULT_PORTFOLIO_DATA));
      }
    } else {
      portfolioData = JSON.parse(JSON.stringify(DEFAULT_PORTFOLIO_DATA));
      localStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify(portfolioData));
    }
  }

  function renderPortfolioData(mode) {
    if (!portfolioData) loadPortfolioData();

    // 1. Dynamic Work Count & Stats
    const statWorks = document.getElementById('statDisplayWorks');
    const statSatisfaction = document.getElementById('statDisplaySatisfaction');
    const statFootage = document.getElementById('statDisplayFootage');
    const statExp = document.getElementById('statDisplayExp');
    const reviewsSatRate = document.getElementById('reviewsSatRate');

    if (statWorks) {
      statWorks.textContent = mode === 'filmmaker' 
        ? (portfolioData.stats.filmmakerWorks || "35+")
        : (portfolioData.stats.editorWorks || "150+");
    }

    if (statSatisfaction) {
      statSatisfaction.textContent = portfolioData.stats.clientSatisfaction || "99%";
    }

    if (reviewsSatRate) {
      reviewsSatRate.textContent = portfolioData.stats.clientSatisfaction || "99%";
    }

    if (statFootage) {
      statFootage.textContent = portfolioData.stats.footageCut || "1,500+";
    }

    if (statExp) {
      statExp.textContent = portfolioData.stats.yearsExp || "3+";
    }

    // 2. Render Client Reviews Grid
    const reviewsGrid = document.getElementById('portfolioReviewsGrid');
    if (reviewsGrid && Array.isArray(portfolioData.reviews)) {
      reviewsGrid.innerHTML = portfolioData.reviews.map(rev => {
        const isFilm = rev.category === 'filmmaker';
        const initials = rev.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
        const stars = '★'.repeat(rev.rating || 5);
        const categoryBadgeClass = isFilm ? 'filmmaker' : 'editor';
        const categoryIcon = isFilm ? 'clapperboard' : 'scissors';
        const categoryLabel = isFilm ? 'Filmmaking & Direction' : 'Video Editing & VFX';

        return `
          <div class="review-portfolio-card">
            <div>
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <span class="review-card-category-badge ${categoryBadgeClass}">
                  <i data-lucide="${categoryIcon}" style="width:12px; height:12px;"></i>
                  <span>${categoryLabel}</span>
                </span>
                <span style="color:#fbbf24; font-size:0.95rem; letter-spacing:0.1em;">${stars}</span>
              </div>
              <p class="review-quote-text">${rev.text}</p>
            </div>

            <div class="review-author-bottom">
              <div class="review-author-avatar">${initials}</div>
              <div>
                <div class="review-author-name">${rev.name}</div>
                <div class="review-author-role">${[rev.role, rev.company].filter(Boolean).join(' • ') || 'Verified Client'}</div>
              </div>
            </div>
          </div>
        `;
      }).join('');

      if (window.lucide) {
        window.lucide.createIcons();
      }
    }
  }

  // Initial Data Load
  loadPortfolioData();

  // Firebase Cloud Synchronization
  function setupFirebaseCloudSync() {
    if (!window.SunnyFirebase || !window.SunnyFirebase.isReady()) {
      return;
    }

    // 1. Seed cloud database if empty on initial load
    window.SunnyFirebase.seedIfEmpty(DEFAULT_PORTFOLIO_DATA);

    // 2. Real-time Reviews from Cloud Firestore
    window.SunnyFirebase.subscribeReviews(function (cloudReviews) {
      if (Array.isArray(cloudReviews) && cloudReviews.length > 0) {
        portfolioData.reviews = cloudReviews;
        localStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify(portfolioData));
        renderPortfolioData(currentMode);
      }
    });

    // 3. Real-time Stats & Portfolio Info from Cloud Firestore
    window.SunnyFirebase.subscribePortfolioInfo(function (cloudInfo) {
      if (cloudInfo) {
        if (cloudInfo.stats) {
          portfolioData.stats = Object.assign({}, portfolioData.stats, cloudInfo.stats);
        }
        if (cloudInfo.settings) {
          portfolioData.settings = Object.assign({}, portfolioData.settings, cloudInfo.settings);
        }
        localStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify(portfolioData));
        renderPortfolioData(currentMode);
      }
    });
  }

  setupFirebaseCloudSync();

  function setMode(mode, playAudio = true) {
    currentMode = mode;
    htmlRoot.setAttribute('data-mode', mode);
    localStorage.setItem('sunny_portfolio_mode', mode);

    // Update Desktop Toggle Buttons
    const desktopBtns = document.querySelectorAll('#modeToggle .mode-btn');
    desktopBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.target === mode);
    });

    // Update Mobile Toggle Buttons
    const mobileBtns = document.querySelectorAll('#modeToggleMobile .mode-btn');
    mobileBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.target === mode);
    });

    // Ensure all project cards are visible
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
      card.style.display = '';
    });

    // Render stats & reviews tailored to mode
    renderPortfolioData(mode);

    if (playAudio) {
      playModeSwitchSound(mode);
    }

    // Refresh Lucide Icons in case new elements became visible
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  // Initialize saved mode and stats
  setMode(currentMode, false);

  // Desktop Toggle Buttons
  if (btnModeEditor) {
    btnModeEditor.addEventListener('click', () => setMode('editor'));
  }
  if (btnModeFilmmaker) {
    btnModeFilmmaker.addEventListener('click', () => setMode('filmmaker'));
  }

  // Quick switch button in Hero card
  if (btnQuickSwitch) {
    btnQuickSwitch.addEventListener('click', () => {
      const nextMode = currentMode === 'editor' ? 'filmmaker' : 'editor';
      setMode(nextMode);
    });
  }

  // Mobile Toggle Buttons
  const mobileToggleBtns = document.querySelectorAll('#modeToggleMobile .mode-btn');
  mobileToggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.target;
      setMode(target);
    });
  });

  /* ==========================================================================
     3. NAVBAR SCROLL EFFECT & MOBILE DRAWER
     ========================================================================== */
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, { passive: true });

  if (hamburgerBtn && mobileDrawer) {
    hamburgerBtn.addEventListener('click', () => {
      const isOpen = mobileDrawer.classList.toggle('open');
      hamburgerBtn.classList.toggle('active', isOpen);
      playClickSound();
    });

    // Close mobile drawer on link click
    const mobileLinks = mobileDrawer.querySelectorAll('.mobile-link');
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('open');
        hamburgerBtn.classList.remove('active');
      });
    });
  }

  /* ==========================================================================
     4. INTERACTIVE COLOR GRADING & EDIT COMPARISON SLIDER
     ========================================================================== */
  if (compareContainer && compareBeforeWrapper && compareHandle) {
    let isDragging = false;

    function updateSlider(clientX) {
      const rect = compareContainer.getBoundingClientRect();
      let offsetX = clientX - rect.left;

      // Clamp within 0% to 100%
      if (offsetX < 0) offsetX = 0;
      if (offsetX > rect.width) offsetX = rect.width;

      const percentage = (offsetX / rect.width) * 100;
      compareBeforeWrapper.style.width = `${percentage}%`;
      compareHandle.style.left = `${percentage}%`;
    }

    // Mouse Events
    compareContainer.addEventListener('mousedown', (e) => {
      isDragging = true;
      updateSlider(e.clientX);
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      updateSlider(e.clientX);
    });

    // Touch Events for Mobile
    compareContainer.addEventListener('touchstart', (e) => {
      isDragging = true;
      if (e.touches[0]) updateSlider(e.touches[0].clientX);
    }, { passive: true });

    window.addEventListener('touchend', () => {
      isDragging = false;
    });

    window.addEventListener('touchmove', (e) => {
      if (!isDragging || !e.touches[0]) return;
      updateSlider(e.touches[0].clientX);
    }, { passive: true });
  }

  /* ==========================================================================
     5. WORK CARDS — ALWAYS SHOW ALL
     ========================================================================== */
  // All project cards are always visible (no filter)
  document.querySelectorAll('.project-card').forEach(card => {
    card.style.display = '';
  });

  /* ==========================================================================
     6. ONE-CLICK COPY TO CLIPBOARD & TOAST NOTIFICATION
     ========================================================================== */
  function showToast(message, iconName = 'check') {
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i data-lucide="${iconName}"></i><span>${message}</span>`;
    toastContainer.appendChild(toast);

    if (window.lucide) {
      window.lucide.createIcons();
    }

    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  const copyBtns = document.querySelectorAll('.btn-copy');
  copyBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
      const textToCopy = btn.dataset.copy;
      if (!textToCopy) return;

      try {
        await navigator.clipboard.writeText(textToCopy);
        playClickSound();
        showToast(`Copied to clipboard: ${textToCopy}`, 'copy');
        btn.querySelector('span').textContent = 'Copied!';
        setTimeout(() => {
          btn.querySelector('span').textContent = 'Copy';
        }, 2000);
      } catch (err) {
        // Fallback
        const textarea = document.createElement('textarea');
        textarea.value = textToCopy;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast(`Copied: ${textToCopy}`, 'copy');
      }
    });
  });

  /* ==========================================================================
     7. CONTACT FORM SUBMISSION (WITH DUAL FORM ORIGIN TRACKING & ADMIN SYNC)
     ========================================================================== */
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      playClickSound();

      const name = document.getElementById('senderName').value;
      const email = document.getElementById('senderEmail').value;
      const service = document.getElementById('projectType').value;
      const timeline = document.getElementById('projectBudget').value;
      const message = document.getElementById('senderMessage').value;

      // Determine form origin based on active mode
      const isFilmMode = currentMode === 'filmmaker';
      const formOriginLabel = isFilmMode ? 'Filmmaking Form' : 'Video Editor Form';

      // Save inquiry to portfolioData in localStorage for the Admin Dashboard
      if (!portfolioData) loadPortfolioData();
      if (!Array.isArray(portfolioData.inquiries)) portfolioData.inquiries = [];

      const newInquiry = {
        id: 'inq_' + Date.now(),
        name: name,
        email: email,
        service: service,
        sourceForm: formOriginLabel,
        mode: currentMode,
        timeline: timeline || 'Standard Turnaround',
        message: message,
        date: new Date().toISOString().slice(0, 16).replace('T', ' '),
        status: 'new'
      };

      portfolioData.inquiries.unshift(newInquiry);
      localStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify(portfolioData));

      // Save inquiry directly to Firebase Firestore Cloud
      if (window.SunnyFirebase && window.SunnyFirebase.isReady()) {
        window.SunnyFirebase.sendInquiry(newInquiry).then(function () {
          console.log('🔥 Live inquiry synced to Firebase Firestore');
        }).catch(function (err) {
          console.warn('Firebase sync notice:', err.message);
        });
      }

      // Construct direct mailto fallback link with prefilled details
      const subject = encodeURIComponent(`[${formOriginLabel}] Project Inquiry: ${service} by ${name}`);
      const body = encodeURIComponent(
        `Hi Sunny,\n\nOrigin: ${formOriginLabel}\nName: ${name}\nEmail: ${email}\nService: ${service}\nTimeline: ${timeline}\n\nProject Details:\n${message}\n\nLooking forward to hearing from you!`
      );
      const mailtoUrl = `mailto:srujanjai2243@gmail.com?subject=${subject}&body=${body}`;

      // Open email client
      window.location.href = mailtoUrl;

      // Show in-UI success state
      if (formFeedback) {
        formFeedback.className = 'form-feedback success';
        formFeedback.innerHTML = `
          <strong>Thank you, ${name}!</strong><br>
          Your inquiry from the <strong>${formOriginLabel}</strong> has been received and saved directly to Sunny's dashboard. Your mail client has also opened. You can also chat directly on WhatsApp at <strong>+91 8106904433</strong>.
        `;
        formFeedback.classList.remove('hidden');
      }

      showToast(`Inquiry sent from ${formOriginLabel}!`, 'send');
      contactForm.reset();
    });
  }

  // Cross-Tab Live Storage Sync (Updates Portfolio when Admin edits stats/reviews)
  window.addEventListener('storage', (e) => {
    if (e.key === PORTFOLIO_STORAGE_KEY) {
      loadPortfolioData();
      renderPortfolioData(currentMode);
    }
  });

  /* ==========================================================================
     8. AMBIENT PARTICLES (Filmmaker Golden Dust / Editor Cyber Sparks)
     ========================================================================== */
  const canvas = document.getElementById('ambientCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const particleCount = 45;

    class Particle {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 2.2 + 0.8;
        this.speedX = (Math.random() - 0.5) * 0.4;
        this.speedY = -(Math.random() * 0.5 + 0.2); // float upward
        this.alpha = Math.random() * 0.5 + 0.2;
        this.fadeSpeed = Math.random() * 0.006 + 0.002;
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.alpha += this.fadeSpeed;
        if (this.alpha > 0.8 || this.alpha < 0.1) {
          this.fadeSpeed = -this.fadeSpeed;
        }
        if (this.y < -10 || this.x < -10 || this.x > width + 10) {
          this.reset();
          this.y = height + 10;
        }
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        if (currentMode === 'editor') {
          ctx.fillStyle = `rgba(0, 242, 254, ${this.alpha * 0.7})`;
        } else {
          ctx.fillStyle = `rgba(245, 207, 104, ${this.alpha * 0.8})`;
        }
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    function animateParticles() {
      ctx.clearRect(0, 0, width, height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      requestAnimationFrame(animateParticles);
    }
    animateParticles();
  }

  /* ==========================================================================
     9. LIVE PORTFOLIO LEAVE A REVIEW MODAL LOGIC
     ========================================================================== */
  const liveReviewModal = document.getElementById('liveReviewModal');
  const btnOpenLiveReviewModal = document.getElementById('btnOpenLiveReviewModal');
  const btnSatWriteReview = document.getElementById('btnSatWriteReview');
  const btnCloseLiveReviewModal = document.getElementById('btnCloseLiveReviewModal');
  const btnCancelLiveReview = document.getElementById('btnCancelLiveReview');
  const liveReviewBackdrop = document.getElementById('liveReviewBackdrop');
  const liveReviewForm = document.getElementById('liveReviewForm');
  const liveStarPicker = document.getElementById('liveStarPicker');
  const liveRevRatingInput = document.getElementById('liveRevRating');
  const starRatingCaption = document.getElementById('starRatingCaption');

  function openLiveReviewModal() {
    if (!liveReviewModal) return;
    liveReviewModal.classList.add('open');
    liveReviewModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (window.lucide) window.lucide.createIcons();
    const firstInput = document.getElementById('liveRevName');
    if (firstInput) setTimeout(() => firstInput.focus(), 100);
  }

  function closeLiveReviewModal() {
    if (!liveReviewModal) return;
    liveReviewModal.classList.remove('open');
    liveReviewModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (btnOpenLiveReviewModal) {
    btnOpenLiveReviewModal.addEventListener('click', openLiveReviewModal);
  }
  if (btnSatWriteReview) {
    btnSatWriteReview.addEventListener('click', openLiveReviewModal);
  }
  if (btnCloseLiveReviewModal) {
    btnCloseLiveReviewModal.addEventListener('click', closeLiveReviewModal);
  }
  if (btnCancelLiveReview) {
    btnCancelLiveReview.addEventListener('click', closeLiveReviewModal);
  }
  if (liveReviewBackdrop) {
    liveReviewBackdrop.addEventListener('click', closeLiveReviewModal);
  }

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && liveReviewModal && liveReviewModal.classList.contains('open')) {
      closeLiveReviewModal();
    }
  });

  // Interactive Star Rating Picker
  if (liveStarPicker) {
    const starBtns = liveStarPicker.querySelectorAll('.star-btn');
    const captions = {
      1: "1.0 - Needs Improvement",
      2: "2.0 - Fair Collaboration",
      3: "3.0 - Good Experience",
      4: "4.0 - Very Good & Fast",
      5: "5.0 - Exceptional 5-Star Masterpiece"
    };

    function updateStarsDisplay(ratingVal) {
      starBtns.forEach(btn => {
        const btnVal = parseInt(btn.dataset.rating, 10);
        btn.classList.toggle('active', btnVal <= ratingVal);
      });
      if (liveRevRatingInput) liveRevRatingInput.value = ratingVal;
      if (starRatingCaption) starRatingCaption.textContent = captions[ratingVal] || `${ratingVal}.0 Star Rating`;
    }

    starBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const rating = parseInt(btn.dataset.rating, 10);
        updateStarsDisplay(rating);
        playClickSound();
      });

      btn.addEventListener('mouseenter', () => {
        const rating = parseInt(btn.dataset.rating, 10);
        starBtns.forEach(b => {
          const val = parseInt(b.dataset.rating, 10);
          b.classList.toggle('hovered', val <= rating);
        });
      });

      btn.addEventListener('mouseleave', () => {
        starBtns.forEach(b => b.classList.remove('hovered'));
      });
    });
  }

  // Handle Live Review Submission
  if (liveReviewForm) {
    liveReviewForm.addEventListener('submit', (e) => {
      e.preventDefault();
      playClickSound();

      const name = document.getElementById('liveRevName').value.trim();
      const rating = parseInt(document.getElementById('liveRevRating').value, 10) || 5;
      const text = document.getElementById('liveRevText').value.trim();

      if (!name || !text) return;

      const newReview = {
        id: 'rev_' + Date.now(),
        name: name,
        role: 'Verified Client',
        company: '',
        category: currentMode || 'editor',
        rating: rating,
        text: text,
        date: new Date().toISOString().slice(0, 10)
      };

      // 1. Add to local state & cache
      if (!portfolioData) loadPortfolioData();
      if (!Array.isArray(portfolioData.reviews)) portfolioData.reviews = [];
      portfolioData.reviews.unshift(newReview);
      localStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify(portfolioData));

      // 2. Push to Firebase Firestore Cloud
      if (window.SunnyFirebase && window.SunnyFirebase.isReady()) {
        window.SunnyFirebase.saveReview(newReview).then(() => {
          console.log('⭐ Live review published to Firebase Firestore');
        }).catch((err) => {
          console.warn('Firebase review sync notice:', err.message);
        });
      }

      // 3. Immediately re-render live portfolio reviews grid
      renderPortfolioData(currentMode);

      // 4. Reset & close modal
      liveReviewForm.reset();
      const defaultRating = 5;
      if (liveRevRatingInput) liveRevRatingInput.value = defaultRating;
      if (liveStarPicker) {
        liveStarPicker.querySelectorAll('.star-btn').forEach(b => b.classList.add('active'));
        if (starRatingCaption) starRatingCaption.textContent = "5.0 Star Rating";
      }
      closeLiveReviewModal();

      // 5. Show toast notification
      showToast('⭐ Thank you! Your review is now live on the portfolio!', 'star');

      // 6. Smooth scroll to reviews section so client sees their published review
      const reviewsSec = document.getElementById('reviews');
      if (reviewsSec) {
        reviewsSec.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }
});
