import { collection, addDoc, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import * as Location from 'expo-location';

class ReportsService {
  // Submit a new report
  async submitReport(reportData, mediaFiles = []) {
    try {
      // Get current location
      const location = await this.getCurrentLocation();
      
      // Upload media files if any
      const mediaUrls = [];
      for (const file of mediaFiles) {
        const url = await this.uploadMedia(file);
        if (url) mediaUrls.push(url);
      }

      // Create report document
      const report = {
        ...reportData,
        location: location,
        mediaUrls: mediaUrls,
        createdAt: new Date(),
        status: 'pending',
        userId: reportData.userId || 'anonymous'
      };

      const docRef = await addDoc(collection(db, 'reports'), report);
      return { success: true, reportId: docRef.id, report };
    } catch (error) {
      console.error('Error submitting report:', error);
      return { success: false, error: error.message };
    }
  }

  // Get all reports
  async getReports(limitCount = 50) {
    try {
      const q = query(
        collection(db, 'reports'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      const reports = [];
      
      querySnapshot.forEach((doc) => {
        reports.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return { success: true, reports };
    } catch (error) {
      console.error('Error fetching reports:', error);
      return { success: false, error: error.message };
    }
  }

  // Get reports by user
  async getUserReports(userId, limitCount = 20) {
    try {
      const q = query(
        collection(db, 'reports'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      const reports = [];
      
      querySnapshot.forEach((doc) => {
        reports.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return { success: true, reports };
    } catch (error) {
      console.error('Error fetching user reports:', error);
      return { success: false, error: error.message };
    }
  }

  // Upload media file to Firebase Storage
  async uploadMedia(fileUri) {
    try {
      const response = await fetch(fileUri);
      const blob = await response.blob();
      
      const fileName = `reports/${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const storageRef = ref(storage, fileName);
      
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);
      
      return downloadURL;
    } catch (error) {
      console.error('Error uploading media:', error);
      return null;
    }
  }

  // Get current location
  async getCurrentLocation() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Location permission not granted');
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: location.timestamp
      };
    } catch (error) {
      console.error('Error getting location:', error);
      // Return a default location (e.g., city center) for demo purposes
      return {
        latitude: 28.6139, // Delhi coordinates for demo
        longitude: 77.2090,
        timestamp: Date.now()
      };
    }
  }

  // Generate mock reports for demo
  generateMockReports() {
    return [
      {
        id: 'mock1',
        title: 'Pothole on Main Street',
        description: 'Large pothole causing traffic issues',
        category: 'Infrastructure',
        location: { latitude: 28.6139, longitude: 77.2090 },
        createdAt: new Date(Date.now() - 3600000), // 1 hour ago
        status: 'pending',
        userId: 'user1'
      },
      {
        id: 'mock2',
        title: 'Street Light Not Working',
        description: 'Street light has been out for 3 days',
        category: 'Utilities',
        location: { latitude: 28.6129, longitude: 77.2100 },
        createdAt: new Date(Date.now() - 7200000), // 2 hours ago
        status: 'in-progress',
        userId: 'user2'
      },
      {
        id: 'mock3',
        title: 'Garbage Overflow',
        description: 'Garbage bin is overflowing, needs attention',
        category: 'Sanitation',
        location: { latitude: 28.6149, longitude: 77.2080 },
        createdAt: new Date(Date.now() - 1800000), // 30 minutes ago
        status: 'pending',
        userId: 'user3'
      }
    ];
  }
}

export default new ReportsService();