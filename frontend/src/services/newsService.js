import { collection, addDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from './firebase';

class NewsService {
  // Get news/alerts
  async getNews(limitCount = 20) {
    try {
      const q = query(
        collection(db, 'news'),
        orderBy('publishedAt', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      const news = [];
      
      querySnapshot.forEach((doc) => {
        news.push({
          id: doc.id,
          ...doc.data()
        });
      });

      // If no news in database, return mock data
      if (news.length === 0) {
        return { success: true, news: this.generateMockNews() };
      }

      return { success: true, news };
    } catch (error) {
      console.error('Error fetching news:', error);
      // Return mock data on error
      return { success: true, news: this.generateMockNews() };
    }
  }

  // Add news (for admin/backend use)
  async addNews(newsData) {
    try {
      const news = {
        ...newsData,
        publishedAt: new Date(),
        source: newsData.source || 'NagarIQ',
        location: newsData.location || null
      };

      const docRef = await addDoc(collection(db, 'news'), news);
      return { success: true, newsId: docRef.id };
    } catch (error) {
      console.error('Error adding news:', error);
      return { success: false, error: error.message };
    }
  }

  // Generate mock news data
  generateMockNews() {
    const now = new Date();
    return [
      {
        id: 'news1',
        title: 'New Metro Line Opens Next Month',
        summary: 'The Blue Line extension will connect downtown to the airport, reducing travel time by 30 minutes.',
        category: 'Transportation',
        priority: 'high',
        location: { latitude: 28.6139, longitude: 77.2090 },
        publishedAt: new Date(now.getTime() - 1800000), // 30 minutes ago
        source: 'City Transport Authority',
        imageUrl: null
      },
      {
        id: 'news2',
        title: 'Water Supply Maintenance Scheduled',
        summary: 'Water supply will be interrupted in Sector 15-18 tomorrow from 9 AM to 5 PM for pipeline maintenance.',
        category: 'Utilities',
        priority: 'medium',
        location: { latitude: 28.6200, longitude: 77.2150 },
        publishedAt: new Date(now.getTime() - 3600000), // 1 hour ago
        source: 'Water Department',
        imageUrl: null
      },
      {
        id: 'news3',
        title: 'Traffic Diversion on Highway Due to Construction',
        summary: 'Heavy traffic expected on alternate routes. Use Ring Road for faster commute.',
        category: 'Traffic',
        priority: 'high',
        location: { latitude: 28.6300, longitude: 77.2200 },
        publishedAt: new Date(now.getTime() - 5400000), // 1.5 hours ago
        source: 'Traffic Police',
        imageUrl: null
      },
      {
        id: 'news4',
        title: 'Free Health Checkup Camp This Weekend',
        summary: 'Municipal Corporation organizing free health checkups at Community Center from 10 AM to 4 PM.',
        category: 'Health',
        priority: 'low',
        location: { latitude: 28.6100, longitude: 77.2050 },
        publishedAt: new Date(now.getTime() - 7200000), // 2 hours ago
        source: 'Health Department',
        imageUrl: null
      },
      {
        id: 'news5',
        title: 'Heavy Rain Alert for Next 48 Hours',
        summary: 'Meteorological department issues yellow alert. Citizens advised to avoid waterlogged areas.',
        category: 'Weather',
        priority: 'high',
        location: { latitude: 28.6139, longitude: 77.2090 },
        publishedAt: new Date(now.getTime() - 10800000), // 3 hours ago
        source: 'Weather Department',
        imageUrl: null
      }
    ];
  }

  // Get traffic updates
  async getTrafficUpdates() {
    return {
      success: true,
      traffic: [
        {
          id: 'traffic1',
          route: 'NH-1 to City Center',
          status: 'heavy',
          estimatedDelay: '25 minutes',
          alternateRoute: 'Use Ring Road via Sector 21',
          location: { latitude: 28.6250, longitude: 77.2180 },
          lastUpdated: new Date()
        },
        {
          id: 'traffic2',
          route: 'Metro Station to Airport',
          status: 'moderate',
          estimatedDelay: '10 minutes',
          alternateRoute: 'Express Highway available',
          location: { latitude: 28.6400, longitude: 77.2300 },
          lastUpdated: new Date()
        }
      ]
    };
  }
}

export default new NewsService();