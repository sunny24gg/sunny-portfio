/**
 * SUNNY PORTFOLIO — FIREBASE CONFIG & CLOUD SYNC SERVICE
 * Connects Live Portfolio & Admin Dashboard via Cloud Firestore
 * Project ID: sunnyportfilo
 */

(function () {
  'use strict';

  // User Firebase Web App Configuration
  const firebaseConfig = {
    apiKey: "AIzaSyDPZXcq6SaqeBwSQkhLfU7Sq1a5UxlEoZo",
    authDomain: "sunnyportfilo.firebaseapp.com",
    projectId: "sunnyportfilo",
    storageBucket: "sunnyportfilo.firebasestorage.app",
    messagingSenderId: "298074832477",
    appId: "1:298074832477:web:58d1920cdbb71c23e4d7b4",
    measurementId: "G-RYSZ7XKQBH"
  };

  let app = null;
  let db = null;
  let analytics = null;
  let isReady = false;

  try {
    if (typeof firebase !== 'undefined') {
      app = firebase.apps && firebase.apps.length ? firebase.app() : firebase.initializeApp(firebaseConfig);
      db = firebase.firestore();

      // Enable offline persistence if supported in browser environment
      try {
        db.enablePersistence({ synchronizeTabs: true }).catch(function (err) {
          if (err.code === 'failed-precondition') {
            console.warn('Firebase persistence: Multiple tabs open, using primary tab.');
          } else if (err.code === 'unimplemented') {
            console.warn('Firebase persistence: Browser does not support IndexedDB persistence.');
          }
        });
      } catch (persistenceErr) {
        // Safe ignore for environments without persistence
      }

      // Initialize analytics safely
      if (typeof firebase.analytics === 'function') {
        try {
          analytics = firebase.analytics(app);
        } catch (analyticsErr) {
          console.warn('Firebase Analytics Notice:', analyticsErr.message);
        }
      }

      isReady = true;
      console.log('🔥 Firebase Cloud Connected: sunnyportfilo (Firestore Active)');
    } else {
      console.warn('⚠️ Firebase SDK not loaded in DOM. Running with local fallback.');
    }
  } catch (err) {
    console.error('⚠️ Firebase Initialization Notice:', err);
  }

  // Unified Cloud Data Interface for Sunny Portfolio
  const SunnyFirebase = {
    isReady: function () {
      return isReady && db !== null;
    },
    getDb: function () {
      return db;
    },
    getAnalytics: function () {
      return analytics;
    },

    /* ==========================================================================
       1. MESSAGES & INQUIRIES
       ========================================================================== */
    sendInquiry: async function (inquiryData) {
      if (!this.isReady()) return null;
      try {
        const id = inquiryData.id || ('inq_' + Date.now());
        const payload = Object.assign({}, inquiryData, {
          id: id,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        await db.collection('inquiries').doc(id).set(payload, { merge: true });
        console.log('✅ Inquiry saved to Firebase Firestore:', id);
        return payload;
      } catch (e) {
        console.error('Error saving inquiry to Firebase:', e);
        throw e;
      }
    },

    subscribeInquiries: function (onData, onError) {
      if (!this.isReady()) return null;
      try {
        return db.collection('inquiries').onSnapshot(function (snapshot) {
          const inquiries = [];
          snapshot.forEach(function (doc) {
            inquiries.push(doc.data());
          });
          // Sort newest first by date string or timestamp
          inquiries.sort(function (a, b) {
            const dateA = a.date || '';
            const dateB = b.date || '';
            return dateB.localeCompare(dateA);
          });
          onData(inquiries);
        }, function (err) {
          console.warn('Firestore inquiries subscription notice:', err.message);
          if (onError) onError(err);
        });
      } catch (err) {
        console.warn('Failed to subscribe to inquiries:', err);
        return null;
      }
    },

    updateInquiryStatus: async function (id, newStatus) {
      if (!this.isReady()) return;
      try {
        await db.collection('inquiries').doc(id).update({
          status: newStatus,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log('✅ Updated inquiry status in Firestore:', id, newStatus);
      } catch (e) {
        console.error('Error updating inquiry status in Firebase:', e);
      }
    },

    deleteInquiry: async function (id) {
      if (!this.isReady()) return;
      try {
        await db.collection('inquiries').doc(id).delete();
        console.log('✅ Deleted inquiry from Firestore:', id);
      } catch (e) {
        console.error('Error deleting inquiry in Firebase:', e);
      }
    },

    clearAllInquiries: async function () {
      if (!this.isReady()) return;
      try {
        const snapshot = await db.collection('inquiries').get();
        const batch = db.batch();
        snapshot.forEach(function (doc) {
          batch.delete(doc.ref);
        });
        await batch.commit();
        console.log('✅ Cleared all inquiries in Firestore');
      } catch (e) {
        console.error('Error clearing inquiries in Firebase:', e);
      }
    },

    /* ==========================================================================
       2. CLIENT REVIEWS
       ========================================================================== */
    subscribeReviews: function (onData, onError) {
      if (!this.isReady()) return null;
      try {
        return db.collection('reviews').onSnapshot(function (snapshot) {
          const reviews = [];
          snapshot.forEach(function (doc) {
            reviews.push(doc.data());
          });
          // Sort newest first
          reviews.sort(function (a, b) {
            const dateA = a.date || '';
            const dateB = b.date || '';
            return dateB.localeCompare(dateA);
          });
          onData(reviews);
        }, function (err) {
          console.warn('Firestore reviews subscription notice:', err.message);
          if (onError) onError(err);
        });
      } catch (err) {
        console.warn('Failed to subscribe to reviews:', err);
        return null;
      }
    },

    saveReview: async function (reviewData) {
      if (!this.isReady()) return null;
      try {
        const id = reviewData.id || ('rev_' + Date.now());
        const payload = Object.assign({}, reviewData, {
          id: id,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        await db.collection('reviews').doc(id).set(payload, { merge: true });
        console.log('✅ Review published to Firebase Firestore:', id);
        return payload;
      } catch (e) {
        console.error('Error saving review to Firebase:', e);
        throw e;
      }
    },

    deleteReview: async function (id) {
      if (!this.isReady()) return;
      try {
        await db.collection('reviews').doc(id).delete();
        console.log('✅ Review deleted from Firestore:', id);
      } catch (e) {
        console.error('Error deleting review from Firebase:', e);
      }
    },

    clearAllReviews: async function () {
      if (!this.isReady()) return;
      try {
        const snapshot = await db.collection('reviews').get();
        const batch = db.batch();
        snapshot.forEach(function (doc) {
          batch.delete(doc.ref);
        });
        await batch.commit();
        console.log('✅ Cleared all reviews in Firestore');
      } catch (e) {
        console.error('Error clearing reviews in Firebase:', e);
      }
    },

    /* ==========================================================================
       3. PORTFOLIO STATS, SETTINGS & EVERY INFO
       ========================================================================== */
    subscribePortfolioInfo: function (onData, onError) {
      if (!this.isReady()) return null;
      try {
        return db.collection('portfolio_data').doc('info').onSnapshot(function (doc) {
          if (doc.exists) {
            onData(doc.data());
          }
        }, function (err) {
          console.warn('Firestore info subscription notice:', err.message);
          if (onError) onError(err);
        });
      } catch (err) {
        console.warn('Failed to subscribe to portfolio info:', err);
        return null;
      }
    },

    savePortfolioInfo: async function (stats, settings) {
      if (!this.isReady()) return;
      try {
        const payload = {
          stats: stats,
          settings: settings,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        await db.collection('portfolio_data').doc('info').set(payload, { merge: true });
        console.log('✅ Portfolio stats & info saved to Firebase Firestore');
      } catch (e) {
        console.error('Error saving portfolio info to Firebase:', e);
      }
    },

    /* ==========================================================================
       4. SEED INITIAL CLOUD DATABASE (If empty on first connection)
       ========================================================================== */
    seedIfEmpty: async function (defaultData) {
      if (!this.isReady()) return;
      try {
        // 1. Seed portfolio info doc
        const infoDoc = await db.collection('portfolio_data').doc('info').get();
        if (!infoDoc.exists && defaultData.stats) {
          await db.collection('portfolio_data').doc('info').set({
            stats: defaultData.stats,
            settings: defaultData.settings,
            seededAt: firebase.firestore.FieldValue.serverTimestamp()
          });
          console.log('🌱 Seeded initial portfolio info into Firebase');
        }

        // NOTE: Reviews and Inquiries now start empty — no dummy data seeded.
        // Real reviews are added via the portfolio "Write a Review" form.
        // Real inquiries come in from the portfolio contact form.
      } catch (e) {
        console.warn('Firebase seeding notice (safe to ignore if rules block initial batch):', e.message);
      }
    }
  };

  // Expose globally
  window.SunnyFirebase = SunnyFirebase;

})();
