import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Text,
  SafeAreaView,
  Dimensions
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import reportsService from '../../services/reportsService';
import newsService from '../../services/newsService';

const { width, height } = Dimensions.get('window');

export default function MapScreen() {
  const [region, setRegion] = useState({
    latitude: 28.6139, // Delhi coordinates for demo
    longitude: 77.2090,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [reports, setReports] = useState([]);
  const [news, setNews] = useState([]);
  const [showReports, setShowReports] = useState(true);
  const [showNews, setShowNews] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeMap();
    loadData();
  }, []);

  const initializeMap = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        
        setRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      }
    } catch (error) {
      console.log('Error getting location:', error);
      // Keep default region (Delhi) if location fails
    }
  };

  const loadData = async () => {
    setLoading(true);
    
    try {
      // Load reports
      const reportsResult = await reportsService.getReports();
      if (reportsResult.success) {
        setReports(reportsResult.reports);
      } else {
        // Use mock data if no reports found
        setReports(reportsService.generateMockReports());
      }

      // Load news
      const newsResult = await newsService.getNews();
      if (newsResult.success) {
        setNews(newsResult.news);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      // Use mock data on error
      setReports(reportsService.generateMockReports());
      setNews(newsService.generateMockNews());
    }
    
    setLoading(false);
  };

  const centerOnUserLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    } catch (error) {
      Alert.alert('Error', 'Unable to get your location');
    }
  };

  const getMarkerColor = (category, type = 'report') => {
    if (type === 'news') {
      const priority = category;
      switch (priority) {
        case 'high': return '#FF5722';
        case 'medium': return '#FF9800';
        case 'low': return '#4CAF50';
        default: return '#2196F3';
      }
    }
    
    // Report categories
    switch (category) {
      case 'Infrastructure': return '#FF5722';
      case 'Utilities': return '#FF9800';
      case 'Sanitation': return '#4CAF50';
      case 'Traffic': return '#9C27B0';
      case 'Safety': return '#F44336';
      default: return '#2196F3';
    }
  };

  const onMarkerPress = (item, type) => {
    const title = type === 'news' ? item.title : item.title;
    const description = type === 'news' ? item.summary : item.description;
    
    Alert.alert(title, description, [
      { text: 'OK', style: 'default' }
    ]);
  };

  const refreshData = () => {
    loadData();
  };

  return (
    <SafeAreaView style={styles.container}>
      <MapView
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
        provider={PROVIDER_GOOGLE}
        showsUserLocation={true}
        showsMyLocationButton={false}
      >
        {/* Report Markers */}
        {showReports && reports.map((report) => (
          <Marker
            key={`report-${report.id}`}
            coordinate={{
              latitude: report.location.latitude,
              longitude: report.location.longitude,
            }}
            title={report.title}
            description={report.description}
            pinColor={getMarkerColor(report.category)}
            onPress={() => onMarkerPress(report, 'report')}
          />
        ))}

        {/* News Markers */}
        {showNews && news.filter(item => item.location).map((newsItem) => (
          <Marker
            key={`news-${newsItem.id}`}
            coordinate={{
              latitude: newsItem.location.latitude,
              longitude: newsItem.location.longitude,
            }}
            title={newsItem.title}
            description={newsItem.summary}
            pinColor={getMarkerColor(newsItem.priority, 'news')}
            onPress={() => onMarkerPress(newsItem, 'news')}
          />
        ))}
      </MapView>

      {/* Control Panel */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.filterButton, showReports && styles.filterButtonActive]}
          onPress={() => setShowReports(!showReports)}
        >
          <Ionicons 
            name="warning" 
            size={16} 
            color={showReports ? 'white' : '#666'} 
          />
          <Text style={[styles.filterText, showReports && styles.filterTextActive]}>
            Reports
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterButton, showNews && styles.filterButtonActive]}
          onPress={() => setShowNews(!showNews)}
        >
          <Ionicons 
            name="newspaper" 
            size={16} 
            color={showNews ? 'white' : '#666'} 
          />
          <Text style={[styles.filterText, showNews && styles.filterTextActive]}>
            News
          </Text>
        </TouchableOpacity>
      </View>

      {/* Location Button */}
      <TouchableOpacity 
        style={styles.locationButton}
        onPress={centerOnUserLocation}
      >
        <Ionicons name="locate" size={24} color="#2196F3" />
      </TouchableOpacity>

      {/* Refresh Button */}
      <TouchableOpacity 
        style={styles.refreshButton}
        onPress={refreshData}
      >
        <Ionicons name="refresh" size={24} color="#2196F3" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: width,
    height: height,
  },
  controls: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  filterButtonActive: {
    backgroundColor: '#2196F3',
  },
  filterText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterTextActive: {
    color: 'white',
  },
  locationButton: {
    position: 'absolute',
    bottom: 120,
    right: 20,
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  refreshButton: {
    position: 'absolute',
    bottom: 180,
    right: 20,
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});