import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import authService from '../../services/authService';
import reportsService from '../../services/reportsService';

export default function ProfileScreen() {
  const [user, setUser] = useState(null);
  const [userReports, setUserReports] = useState([]);
  const [stats, setStats] = useState({
    totalReports: 0,
    pendingReports: 0,
    resolvedReports: 0
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        
        // Get user data from Firestore
        const userData = await authService.getUserData(currentUser.uid);
        if (userData.success) {
          setUser(prev => ({ ...prev, ...userData.data }));
        }

        // Load user reports
        const reportsResult = await reportsService.getUserReports(currentUser.uid);
        if (reportsResult.success) {
          setUserReports(reportsResult.reports);
          
          // Calculate stats
          const total = reportsResult.reports.length;
          const pending = reportsResult.reports.filter(r => r.status === 'pending').length;
          const resolved = reportsResult.reports.filter(r => r.status === 'resolved').length;
          
          setStats({
            totalReports: total,
            pendingReports: pending,
            resolvedReports: resolved
          });
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            const result = await authService.signOut();
            if (!result.success) {
              Alert.alert('Error', 'Failed to sign out');
            }
          }
        }
      ]
    );
  };

  const StatCard = ({ title, value, icon, color }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statContent}>
        <View>
          <Text style={styles.statValue}>{value}</Text>
          <Text style={styles.statTitle}>{title}</Text>
        </View>
        <Ionicons name={icon} size={24} color={color} />
      </View>
    </View>
  );

  const MenuItem = ({ title, icon, onPress, color = '#333' }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuItemLeft}>
        <Ionicons name={icon} size={20} color={color} />
        <Text style={[styles.menuItemText, { color }]}>{title}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.profileInfo}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={40} color="#2196F3" />
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                {user?.name || user?.email || 'User'}
              </Text>
              <Text style={styles.userEmail}>
                {user?.email || 'No email'}
              </Text>
              <Text style={styles.userRole}>
                {user?.role || 'Citizen'} • Member since {
                  user?.createdAt 
                    ? new Date(user.createdAt.seconds * 1000).getFullYear()
                    : new Date().getFullYear()
                }
              </Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Your Impact</Text>
          <View style={styles.statsGrid}>
            <StatCard
              title="Total Reports"
              value={stats.totalReports}
              icon="document-text"
              color="#2196F3"
            />
            <StatCard
              title="Pending"
              value={stats.pendingReports}
              icon="time"
              color="#FF9800"
            />
            <StatCard
              title="Resolved"
              value={stats.resolvedReports}
              icon="checkmark-circle"
              color="#4CAF50"
            />
          </View>
        </View>

        {/* Recent Reports */}
        {userReports.length > 0 && (
          <View style={styles.reportsContainer}>
            <Text style={styles.sectionTitle}>Recent Reports</Text>
            {userReports.slice(0, 3).map((report) => (
              <View key={report.id} style={styles.reportItem}>
                <View style={styles.reportHeader}>
                  <Text style={styles.reportTitle} numberOfLines={1}>
                    {report.title}
                  </Text>
                  <Text style={[
                    styles.reportStatus,
                    { color: report.status === 'resolved' ? '#4CAF50' : '#FF9800' }
                  ]}>
                    {report.status}
                  </Text>
                </View>
                <Text style={styles.reportCategory}>{report.category}</Text>
                <Text style={styles.reportDate}>
                  {new Date(report.createdAt.seconds * 1000).toLocaleDateString()}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Menu */}
        <View style={styles.menuContainer}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          <MenuItem
            title="My Reports"
            icon="document-text-outline"
            onPress={() => Alert.alert('Coming Soon', 'My Reports view will be available in the next update')}
          />
          
          <MenuItem
            title="Notifications"
            icon="notifications-outline"
            onPress={() => Alert.alert('Coming Soon', 'Notification settings will be available in the next update')}
          />
          
          <MenuItem
            title="Privacy & Security"
            icon="shield-outline"
            onPress={() => Alert.alert('Coming Soon', 'Privacy settings will be available in the next update')}
          />
          
          <MenuItem
            title="About NagarIQ"
            icon="information-circle-outline"
            onPress={() => Alert.alert(
              'About NagarIQ', 
              'NagarIQ is a smart city monitoring app that helps citizens report issues and stay informed about their city.\n\nVersion 1.0.0 (MVP)\nMade with ❤️ for smart cities'
            )}
          />
          
          <MenuItem
            title="Sign Out"
            icon="log-out-outline"
            onPress={handleSignOut}
            color="#FF5722"
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            NagarIQ MVP v1.0.0
          </Text>
          <Text style={styles.footerText}>
            Building smarter cities together
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 12,
    color: '#999',
    textTransform: 'capitalize',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  statsContainer: {
    backgroundColor: 'white',
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 4,
    borderLeftWidth: 4,
  },
  statContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statTitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  reportsContainer: {
    backgroundColor: 'white',
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  reportItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  reportTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  reportStatus: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  reportCategory: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  reportDate: {
    fontSize: 12,
    color: '#999',
  },
  menuContainer: {
    backgroundColor: 'white',
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    marginLeft: 12,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
});