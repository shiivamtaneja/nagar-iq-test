import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  SafeAreaView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import newsService from '../../services/newsService';
import reportsService from '../../services/reportsService';

export default function FeedScreen() {
  const [feedData, setFeedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // all, news, reports

  useEffect(() => {
    loadFeedData();
  }, [filter]);

  const loadFeedData = async () => {
    setLoading(true);
    
    try {
      let data = [];
      
      if (filter === 'all' || filter === 'news') {
        const newsResult = await newsService.getNews();
        if (newsResult.success) {
          const newsItems = newsResult.news.map(item => ({
            ...item,
            type: 'news',
            timestamp: item.publishedAt
          }));
          data = [...data, ...newsItems];
        }
      }
      
      if (filter === 'all' || filter === 'reports') {
        const reportsResult = await reportsService.getReports();
        if (reportsResult.success) {
          const reportItems = reportsResult.reports.map(item => ({
            ...item,
            type: 'report',
            timestamp: item.createdAt
          }));
          data = [...data, ...reportItems];
        } else {
          // Add mock reports if no real data
          const mockReports = reportsService.generateMockReports().map(item => ({
            ...item,
            type: 'report',
            timestamp: item.createdAt
          }));
          data = [...data, ...mockReports];
        }
      }
      
      // Sort by timestamp (newest first)
      data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setFeedData(data);
    } catch (error) {
      console.error('Error loading feed data:', error);
      Alert.alert('Error', 'Failed to load feed data');
    }
    
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFeedData();
    setRefreshing(false);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#FF5722';
      case 'medium': return '#FF9800';
      case 'low': return '#4CAF50';
      default: return '#2196F3';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#FF9800';
      case 'in-progress': return '#2196F3';
      case 'resolved': return '#4CAF50';
      default: return '#666';
    }
  };

  const getTypeIcon = (type, category, priority) => {
    if (type === 'news') {
      return 'newspaper';
    } else {
      switch (category) {
        case 'Infrastructure': return 'construct';
        case 'Utilities': return 'flash';
        case 'Sanitation': return 'trash';
        case 'Traffic': return 'car';
        case 'Safety': return 'shield';
        default: return 'alert-circle';
      }
    }
  };

  const renderFeedItem = ({ item }) => {
    const isNews = item.type === 'news';
    const iconName = getTypeIcon(item.type, item.category, item.priority);
    const itemColor = isNews 
      ? getPriorityColor(item.priority) 
      : getStatusColor(item.status);

    return (
      <TouchableOpacity 
        style={styles.feedItem}
        onPress={() => {
          const title = item.title;
          const description = isNews ? item.summary : item.description;
          Alert.alert(title, description);
        }}
      >
        <View style={styles.itemHeader}>
          <View style={[styles.iconContainer, { backgroundColor: itemColor }]}>
            <Ionicons name={iconName} size={20} color="white" />
          </View>
          <View style={styles.itemInfo}>
            <Text style={styles.itemTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <View style={styles.itemMeta}>
              <Text style={styles.itemCategory}>
                {isNews ? item.category : `Report • ${item.category}`}
              </Text>
              {!isNews && (
                <Text style={[styles.itemStatus, { color: itemColor }]}>
                  {item.status}
                </Text>
              )}
            </View>
          </View>
          <Text style={styles.itemTime}>
            {formatTime(item.timestamp)}
          </Text>
        </View>
        
        <Text style={styles.itemDescription} numberOfLines={3}>
          {isNews ? item.summary : item.description}
        </Text>

        {item.location && (
          <View style={styles.locationContainer}>
            <Ionicons name="location" size={12} color="#666" />
            <Text style={styles.locationText}>
              {item.location.latitude.toFixed(4)}, {item.location.longitude.toFixed(4)}
            </Text>
          </View>
        )}

        {isNews && item.source && (
          <Text style={styles.sourceText}>
            Source: {item.source}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  const renderFilterButton = (filterType, label, icon) => (
    <TouchableOpacity
      style={[
        styles.filterButton, 
        filter === filterType && styles.filterButtonActive
      ]}
      onPress={() => setFilter(filterType)}
    >
      <Ionicons 
        name={icon} 
        size={16} 
        color={filter === filterType ? 'white' : '#666'} 
      />
      <Text style={[
        styles.filterButtonText,
        filter === filterType && styles.filterButtonTextActive
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>City Feed</Text>
        <Text style={styles.headerSubtitle}>
          Latest news and reports from your city
        </Text>
      </View>

      <View style={styles.filterContainer}>
        {renderFilterButton('all', 'All', 'grid')}
        {renderFilterButton('news', 'News', 'newspaper')}
        {renderFilterButton('reports', 'Reports', 'warning')}
      </View>

      <FlatList
        data={feedData}
        keyExtractor={(item) => `${item.type}-${item.id}`}
        renderItem={renderFeedItem}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2196F3']}
          />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
  },
  filterButtonActive: {
    backgroundColor: '#2196F3',
  },
  filterButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: 'white',
  },
  listContainer: {
    paddingVertical: 10,
  },
  feedItem: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginVertical: 6,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    lineHeight: 22,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  itemCategory: {
    fontSize: 12,
    color: '#666',
    marginRight: 12,
  },
  itemStatus: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  itemTime: {
    fontSize: 12,
    color: '#999',
  },
  itemDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  sourceText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
});