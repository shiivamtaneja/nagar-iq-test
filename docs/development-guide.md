# NagarIQ MVP Development Guide

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Expo CLI
- Firebase CLI
- Git

### Quick Setup
```bash
# Clone and setup
git clone https://github.com/shiivamtaneja/nagar-iq-test.git
cd nagar-iq-test
./scripts/setup.sh

# Start development
cd frontend && npm start
```

## Development Workflow

### Frontend Development
```bash
cd frontend
npm start                 # Start Expo development server
npm run android          # Run on Android emulator
npm run ios              # Run on iOS simulator (Mac only)
npm run web              # Run in web browser
```

### Backend Development
```bash
cd backend
firebase emulators:start # Start Firebase emulators
firebase functions:shell # Interactive functions shell
firebase deploy         # Deploy to production
```

## Project Structure Detail

### Frontend Architecture
```
src/
├── components/          # Reusable UI components
│   ├── common/         # Basic UI components
│   ├── forms/          # Form components
│   └── map/           # Map-related components
├── screens/            # App screens
│   ├── auth/          # Login/Signup screens
│   ├── home/          # Main app screens
│   └── reports/       # Report submission
├── services/           # API services
│   ├── firebase.js    # Firebase configuration
│   ├── authService.js # Authentication logic
│   ├── reportsService.js # Reports management
│   └── newsService.js # News and alerts
├── navigation/         # App navigation
└── utils/             # Utility functions
```

### Backend Architecture
```
backend/
├── src/
│   ├── services/      # Business logic services
│   ├── utils/         # Utility functions
│   └── models/        # Data models
├── index.js           # Cloud Functions entry point
└── package.json       # Dependencies
```

## API Documentation

### Cloud Functions

#### `onReportCreated`
**Trigger**: New report document created
**Purpose**: Process and categorize new reports
```javascript
// Automatically triggered on new report
// Processes with AI analysis
// Sends notifications if urgent
```

#### `updateCityNews`
**Trigger**: Scheduled (every hour)
**Purpose**: Fetch and process latest news
```javascript
// Scrapes news from various sources
// AI processing for categorization
// Stores in Firestore
```

#### `sendNotification`
**Type**: Callable function
**Purpose**: Send push notifications
```javascript
// Input: { title, body, tokens, data }
// Returns: { success: boolean, result: object }
```

#### `processWithAI`
**Type**: Callable function
**Purpose**: AI analysis of content
```javascript
// Input: { type, content, mediaUrls }
// Returns: { success: boolean, result: object }
```

### Database Schema

#### Users Collection
```javascript
{
  uid: string,
  email: string,
  name: string,
  role: 'citizen' | 'admin' | 'official',
  createdAt: timestamp,
  preferences: {
    notifications: boolean,
    categories: string[],
    location: { latitude: number, longitude: number }
  }
}
```

#### Reports Collection
```javascript
{
  title: string,
  description: string,
  category: 'Infrastructure' | 'Utilities' | 'Safety' | 'Traffic' | 'Sanitation' | 'Other',
  status: 'pending' | 'in-progress' | 'resolved' | 'rejected',
  priority: 'low' | 'medium' | 'high',
  location: { latitude: number, longitude: number },
  mediaUrls: string[],
  userId: string,
  createdAt: timestamp,
  aiAnalysis: {
    sentiment: string,
    tags: string[],
    confidence: number
  }
}
```

#### News Collection
```javascript
{
  title: string,
  summary: string,
  content: string,
  category: string,
  priority: 'low' | 'medium' | 'high',
  source: string,
  publishedAt: timestamp,
  location?: { latitude: number, longitude: number },
  imageUrl?: string
}
```

## Testing

### Frontend Testing
```bash
# Unit tests
npm test

# E2E tests (if implemented)
npm run test:e2e

# Manual testing checklist
- [ ] Login/Signup flow
- [ ] Report submission
- [ ] Map functionality
- [ ] News feed
- [ ] Notifications
```

### Backend Testing
```bash
# Function testing with emulators
firebase emulators:exec "npm test"

# Individual function testing
firebase functions:shell
> onReportCreated({...testData})
```

## Deployment

### Staging Deployment
```bash
# Frontend (Expo development build)
expo publish --release-channel staging

# Backend (Firebase staging project)
firebase use staging
firebase deploy
```

### Production Deployment
```bash
# Frontend (App store builds)
expo build:android --release-channel production
expo build:ios --release-channel production

# Backend (Firebase production project)
firebase use production
firebase deploy --only functions,firestore,storage
```

## Environment Configuration

### Frontend Environment
```javascript
// src/config/environment.js
export const ENV = {
  development: {
    apiUrl: 'http://localhost:5001',
    firebaseConfig: { /* dev config */ }
  },
  production: {
    apiUrl: 'https://us-central1-nagariq-prod.cloudfunctions.net',
    firebaseConfig: { /* prod config */ }
  }
}
```

### Backend Environment
```bash
# Set environment variables
firebase functions:config:set \
  app.environment="production" \
  apis.maps_key="your-maps-api-key" \
  apis.news_key="your-news-api-key"
```

## Performance Optimization

### Frontend
- Image optimization and lazy loading
- Efficient map marker clustering
- Offline data caching
- Optimized bundle size

### Backend
- Firestore query optimization
- Cloud Function cold start reduction
- Efficient data processing
- Smart notification batching

## Security Best Practices

### Authentication
- Firebase Auth with email/password
- Custom claims for role-based access
- Secure token validation

### Database Security
- Firestore security rules
- Data validation in Cloud Functions
- User permission checks

### Storage Security
- Storage rules for media files
- File type and size validation
- Secure upload URLs

## Monitoring and Analytics

### Application Monitoring
- Firebase Performance Monitoring
- Crashlytics for error tracking
- Analytics for user behavior

### Backend Monitoring
- Cloud Functions logs
- Performance metrics
- Error alerting

## Troubleshooting

### Common Issues

#### "Firebase not initialized"
```bash
# Check firebase configuration
# Ensure all required services are enabled
# Verify API keys and project settings
```

#### "Location permissions denied"
```bash
# Check app permissions in device settings
# Ensure location services are enabled
# Handle permission requests properly
```

#### "Push notifications not working"
```bash
# Check FCM configuration
# Verify notification permissions
# Test with Firebase console
```

### Debug Mode
```bash
# Enable debug logging
export DEBUG=nagariq:*

# Run with verbose logging
npm start -- --verbose
```

## Contributing Guidelines

### Code Style
- ESLint configuration for consistent formatting
- Prettier for code formatting
- Conventional commits for git messages

### Pull Request Process
1. Create feature branch from main
2. Implement changes with tests
3. Update documentation
4. Create pull request with description
5. Code review and approval
6. Merge to main

### Release Process
1. Version bump (semantic versioning)
2. Update changelog
3. Create release tag
4. Deploy to staging
5. Test and validate
6. Deploy to production
7. Monitor for issues

## Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Expo Documentation](https://docs.expo.dev)
- [React Native Documentation](https://reactnative.dev/docs)
- [Google Maps Platform](https://developers.google.com/maps)
- [Gemini API Documentation](https://ai.google.dev/docs)