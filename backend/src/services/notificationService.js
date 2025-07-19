const admin = require('firebase-admin');

class NotificationService {
  constructor() {
    this.messaging = admin.messaging();
  }

  /**
   * Send notification to specific tokens
   */
  async sendToTokens(tokens, notification) {
    try {
      const message = {
        notification: {
          title: notification.title,
          body: notification.body
        },
        data: notification.data || {},
        tokens: Array.isArray(tokens) ? tokens : [tokens]
      };

      const response = await this.messaging.sendMulticast(message);
      
      console.log('Notification sent successfully:', {
        successCount: response.successCount,
        failureCount: response.failureCount
      });

      return response;
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }

  /**
   * Send notification to all users in a topic
   */
  async sendToTopic(topic, notification) {
    try {
      const message = {
        notification: {
          title: notification.title,
          body: notification.body
        },
        data: notification.data || {},
        topic: topic
      };

      const response = await this.messaging.send(message);
      console.log('Topic notification sent successfully:', response);
      
      return response;
    } catch (error) {
      console.error('Error sending topic notification:', error);
      throw error;
    }
  }

  /**
   * Send urgent notification for high-priority reports
   */
  async sendUrgentReportNotification(reportData) {
    try {
      const notification = {
        title: '🚨 Urgent Report Alert',
        body: `${reportData.category}: ${reportData.title}`,
        data: {
          type: 'urgent_report',
          reportId: reportData.id || 'unknown',
          category: reportData.category,
          location: JSON.stringify(reportData.location)
        }
      };

      // Send to authorities topic
      await this.sendToTopic('authorities', notification);
      
      // Send to nearby users topic if location available
      if (reportData.location) {
        const nearbyTopic = `location_${Math.floor(reportData.location.latitude * 100)}_${Math.floor(reportData.location.longitude * 100)}`;
        await this.sendToTopic(nearbyTopic, {
          ...notification,
          title: '📍 Report Near You',
          body: `New ${reportData.category} report: ${reportData.title}`
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Error sending urgent report notification:', error);
      throw error;
    }
  }

  /**
   * Send news alert notification
   */
  async sendNewsAlert(newsData) {
    try {
      const notification = {
        title: `📰 ${newsData.category.toUpperCase()} Alert`,
        body: newsData.title,
        data: {
          type: 'news_alert',
          newsId: newsData.id,
          category: newsData.category,
          priority: newsData.priority,
          location: newsData.location ? JSON.stringify(newsData.location) : null
        }
      };

      // Send based on priority and category
      if (newsData.priority === 'high') {
        await this.sendToTopic('all_users', notification);
      } else {
        await this.sendToTopic(`category_${newsData.category}`, notification);
      }

      return { success: true };
    } catch (error) {
      console.error('Error sending news alert:', error);
      throw error;
    }
  }

  /**
   * Send traffic update notification
   */
  async sendTrafficAlert(trafficData) {
    try {
      const notification = {
        title: '🚦 Traffic Update',
        body: `${trafficData.route}: ${trafficData.status} traffic, ${trafficData.delay} delay`,
        data: {
          type: 'traffic_alert',
          route: trafficData.route,
          status: trafficData.status,
          delay: trafficData.delay,
          location: JSON.stringify(trafficData.location)
        }
      };

      // Send to traffic topic
      await this.sendToTopic('traffic_updates', notification);
      
      return { success: true };
    } catch (error) {
      console.error('Error sending traffic alert:', error);
      throw error;
    }
  }

  /**
   * Send weather alert notification
   */
  async sendWeatherAlert(weatherData) {
    try {
      const notification = {
        title: '🌤️ Weather Alert',
        body: weatherData.description,
        data: {
          type: 'weather_alert',
          severity: weatherData.severity,
          description: weatherData.description
        }
      };

      // Send based on severity
      if (weatherData.severity === 'high') {
        await this.sendToTopic('all_users', notification);
      } else {
        await this.sendToTopic('weather_updates', notification);
      }

      return { success: true };
    } catch (error) {
      console.error('Error sending weather alert:', error);
      throw error;
    }
  }

  /**
   * Subscribe user to notification topics based on preferences
   */
  async subscribeToTopics(userToken, preferences) {
    try {
      const subscriptionPromises = [];

      // Default topics
      subscriptionPromises.push(
        this.messaging.subscribeToTopic([userToken], 'all_users')
      );

      // Category-based subscriptions
      if (preferences.categories) {
        preferences.categories.forEach(category => {
          subscriptionPromises.push(
            this.messaging.subscribeToTopic([userToken], `category_${category}`)
          );
        });
      }

      // Location-based subscription
      if (preferences.location) {
        const locationTopic = `location_${Math.floor(preferences.location.latitude * 100)}_${Math.floor(preferences.location.longitude * 100)}`;
        subscriptionPromises.push(
          this.messaging.subscribeToTopic([userToken], locationTopic)
        );
      }

      // Feature-based subscriptions
      if (preferences.traffic) {
        subscriptionPromises.push(
          this.messaging.subscribeToTopic([userToken], 'traffic_updates')
        );
      }

      if (preferences.weather) {
        subscriptionPromises.push(
          this.messaging.subscribeToTopic([userToken], 'weather_updates')
        );
      }

      await Promise.all(subscriptionPromises);
      
      console.log('User subscribed to topics successfully');
      return { success: true };
    } catch (error) {
      console.error('Error subscribing to topics:', error);
      throw error;
    }
  }

  /**
   * Unsubscribe user from topics
   */
  async unsubscribeFromTopics(userToken, topics) {
    try {
      const unsubscriptionPromises = topics.map(topic =>
        this.messaging.unsubscribeFromTopic([userToken], topic)
      );

      await Promise.all(unsubscriptionPromises);
      
      console.log('User unsubscribed from topics successfully');
      return { success: true };
    } catch (error) {
      console.error('Error unsubscribing from topics:', error);
      throw error;
    }
  }

  /**
   * Send batch notifications
   */
  async sendBatchNotifications(notifications) {
    try {
      const promises = notifications.map(notif => {
        if (notif.type === 'token') {
          return this.sendToTokens(notif.tokens, notif.notification);
        } else if (notif.type === 'topic') {
          return this.sendToTopic(notif.topic, notif.notification);
        }
        return Promise.resolve();
      });

      const results = await Promise.allSettled(promises);
      
      const successCount = results.filter(r => r.status === 'fulfilled').length;
      const failureCount = results.filter(r => r.status === 'rejected').length;

      console.log(`Batch notifications: ${successCount} succeeded, ${failureCount} failed`);
      
      return { 
        success: true, 
        successCount, 
        failureCount,
        results 
      };
    } catch (error) {
      console.error('Error sending batch notifications:', error);
      throw error;
    }
  }
}

module.exports = new NotificationService();