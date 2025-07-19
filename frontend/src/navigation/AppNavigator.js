import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

// Import screens
import LoginScreen from '../screens/auth/LoginScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';
import MapScreen from '../screens/home/MapScreen';
import FeedScreen from '../screens/home/FeedScreen';
import ReportScreen from '../screens/reports/ReportScreen';
import ProfileScreen from '../screens/home/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Auth Stack Navigator
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
    </Stack.Navigator>
  );
}

// Main Tab Navigator
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Map') {
            iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === 'Feed') {
            iconName = focused ? 'newspaper' : 'newspaper-outline';
          } else if (route.name === 'Report') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Map" 
        component={MapScreen}
        options={{ title: 'City Map' }}
      />
      <Tab.Screen 
        name="Feed" 
        component={FeedScreen}
        options={{ title: 'News & Alerts' }}
      />
      <Tab.Screen 
        name="Report" 
        component={ReportScreen}
        options={{ title: 'Submit Report' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

// Main App Navigator
export default function AppNavigator({ isAuthenticated }) {
  return (
    <NavigationContainer>
      {isAuthenticated ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
}