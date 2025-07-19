const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp();

// Import services
const newsService = require('./src/services/newsService');
const notificationService = require('./src/services/notificationService');
const reportsService = require('./src/services/reportsService');

// Database reference
const db = admin.firestore();

/**
 * Trigger when a new report is created
 * Processes the report and sends notifications if needed
 */
exports.onReportCreated = functions.firestore
  .document('reports/{reportId}')
  .onCreate(async (snap, context) => {
    try {
      const reportData = snap.data();
      const reportId = context.params.reportId;
      
      console.log('New report created:', reportId);
      
      // Process the report (e.g., categorize, validate)
      await reportsService.processNewReport(reportId, reportData);
      
      // Send notification to relevant authorities
      if (reportData.category === 'Safety' || reportData.priority === 'high') {
        await notificationService.sendUrgentReportNotification(reportData);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error processing new report:', error);
      throw new functions.https.HttpsError('internal', 'Failed to process report');
    }
  });

/**
 * Scheduled function to scrape and update news
 * Runs every hour to fetch latest city news
 */
exports.updateCityNews = functions.pubsub
  .schedule('every 1 hours')
  .onRun(async (context) => {
    try {
      console.log('Starting scheduled news update...');
      
      // Fetch and process news
      const newsItems = await newsService.scrapeAndProcessNews();
      
      // Store in Firestore
      const batch = db.batch();
      newsItems.forEach((newsItem) => {
        const newsRef = db.collection('news').doc();
        batch.set(newsRef, {
          ...newsItem,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          source: 'automated'
        });
      });
      
      await batch.commit();
      
      console.log(`Updated ${newsItems.length} news items`);
      return { success: true, count: newsItems.length };
    } catch (error) {
      console.error('Error updating news:', error);
      throw error;
    }
  });

/**
 * HTTP function to send push notifications
 * Can be called from the frontend or other services
 */
exports.sendNotification = functions.https.onCall(async (data, context) => {
  try {
    // Verify authentication
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    
    const { title, body, tokens, data: notificationData } = data;
    
    if (!title || !body || !tokens) {
      throw new functions.https.HttpsError('invalid-argument', 'Missing required fields');
    }
    
    const result = await notificationService.sendToTokens(tokens, {
      title,
      body,
      data: notificationData || {}
    });
    
    return { success: true, result };
  } catch (error) {
    console.error('Error sending notification:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * HTTP function for AI processing (mocked for MVP)
 * In production, this would integrate with Gemini/Vertex AI
 */
exports.processWithAI = functions.https.onCall(async (data, context) => {
  try {
    const { type, content, mediaUrls } = data;
    
    // Mock AI processing - in production, integrate with Gemini API
    let result = {};
    
    switch (type) {
      case 'text_analysis':
        result = {
          sentiment: Math.random() > 0.5 ? 'positive' : 'negative',
          category: 'Infrastructure',
          priority: Math.random() > 0.7 ? 'high' : 'medium',
          summary: `AI Summary: ${content.substring(0, 100)}...`
        };
        break;
        
      case 'image_analysis':
        result = {
          objects: ['road', 'pothole', 'vehicle'],
          description: 'AI detected a pothole on the road with vehicles nearby',
          confidence: 0.87
        };
        break;
        
      default:
        throw new functions.https.HttpsError('invalid-argument', 'Unknown processing type');
    }
    
    return { success: true, result };
  } catch (error) {
    console.error('Error in AI processing:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * HTTP function to get traffic updates
 * Integrates with Google Maps API for real traffic data
 */
exports.getTrafficUpdates = functions.https.onCall(async (data, context) => {
  try {
    const { location, radius = 5000 } = data;
    
    // Mock traffic data - in production, integrate with Google Maps Traffic API
    const trafficUpdates = [
      {
        route: 'Main Street to Downtown',
        status: 'heavy',
        delay: '15 minutes',
        lastUpdated: new Date().toISOString(),
        location: {
          latitude: location.latitude + 0.01,
          longitude: location.longitude + 0.01
        }
      },
      {
        route: 'Highway 101 North',
        status: 'moderate',
        delay: '5 minutes',
        lastUpdated: new Date().toISOString(),
        location: {
          latitude: location.latitude - 0.01,
          longitude: location.longitude - 0.01
        }
      }
    ];
    
    return { success: true, traffic: trafficUpdates };
  } catch (error) {
    console.error('Error getting traffic updates:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * Cleanup function to remove old data
 * Runs daily to clean up old reports and news items
 */
exports.cleanupOldData = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      // Clean up old news items (older than 30 days)
      const oldNewsQuery = db.collection('news')
        .where('publishedAt', '<', thirtyDaysAgo);
      
      const oldNewsSnapshot = await oldNewsQuery.get();
      const deletePromises = [];
      
      oldNewsSnapshot.forEach((doc) => {
        deletePromises.push(doc.ref.delete());
      });
      
      await Promise.all(deletePromises);
      
      console.log(`Cleaned up ${deletePromises.length} old news items`);
      return { success: true, deletedItems: deletePromises.length };
    } catch (error) {
      console.error('Error cleaning up old data:', error);
      throw error;
    }
  });