import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import authService from '../../services/authService';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    const result = await authService.signIn(email, password);
    setLoading(false);

    if (result.success) {
      // Navigation will be handled by the auth state change
    } else {
      Alert.alert('Login Failed', result.error);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    // Use demo credentials
    const result = await authService.signIn('demo@nagariq.com', 'demo123');
    setLoading(false);

    if (!result.success) {
      // If demo account doesn't exist, create it
      const signUpResult = await authService.signUp('demo@nagariq.com', 'demo123', {
        name: 'Demo User',
        role: 'citizen'
      });
      
      if (!signUpResult.success) {
        Alert.alert('Demo Login Failed', 'Unable to create demo account');
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollView}>
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.title}>NagarIQ</Text>
              <Text style={styles.subtitle}>Smart City Monitoring</Text>
            </View>

            <View style={styles.form}>
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              
              <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />

              <TouchableOpacity 
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? 'Signing In...' : 'Sign In'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.button, styles.demoButton]}
                onPress={handleDemoLogin}
                disabled={loading}
              >
                <Text style={[styles.buttonText, styles.demoButtonText]}>
                  Demo Login
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.linkButton}
                onPress={() => navigation.navigate('SignUp')}
              >
                <Text style={styles.linkText}>
                  Don't have an account? Sign Up
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 50,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  form: {
    width: '100%',
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  button: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  demoButton: {
    backgroundColor: '#4CAF50',
  },
  demoButtonText: {
    color: 'white',
  },
  linkButton: {
    alignItems: 'center',
    marginTop: 20,
  },
  linkText: {
    color: '#2196F3',
    fontSize: 16,
  },
});