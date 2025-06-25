# StreakFire - Habit Tracking App

🔥 A React Native habit tracking app built with Expo, focusing on maintaining streaks and building lasting habits.

## Features

- **📱 Cross-Platform**: Built with React Native and Expo for iOS and Android
- **🔥 Streak Tracking**: Visual streak counters with fire animations
- **👥 Group Challenges**: Team up with friends for group habit streaks
- **📊 Progress Analytics**: Track completion rates and longest streaks
- **🔔 Smart Notifications**: Customizable reminders for habits
- **🎯 Social Features**: Share achievements and motivate others
- **💎 Premium Features**: Streak protections and advanced analytics

## Tech Stack

- **Framework**: React Native with Expo managed workflow
- **Language**: TypeScript
- **State Management**: Redux Toolkit
- **Navigation**: React Navigation v6
- **UI Components**: React Native + Expo Vector Icons
- **Notifications**: Expo Notifications
- **Storage**: AsyncStorage
- **Styling**: StyleSheet with Linear Gradients

## Getting Started

### Prerequisites

- Node.js (16.x or later)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development)
- Android Emulator (for Android development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd StreakFireExpo
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server**
   ```bash
   npx expo start
   ```

4. **Run on device/simulator**
   - **iOS**: Press `i` in the terminal or scan QR code with camera
   - **Android**: Press `a` in the terminal or scan QR code with Expo Go
   - **Web**: Press `w` in the terminal

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── DailyProgress.tsx
│   ├── QuickStats.tsx
│   └── StreakCard.tsx
├── navigation/          # Navigation configuration
│   └── RootNavigator.tsx
├── screens/            # Screen components
│   ├── auth/           # Authentication screens
│   ├── main/           # Main app screens
│   └── details/        # Detail/modal screens
├── services/           # External services and API calls
│   ├── firebase.ts     # Firebase configuration (mock)
│   ├── notifications.ts # Notification service
│   └── mockData.ts     # Mock data for development
├── store/              # Redux store and slices
│   ├── store.ts
│   └── slices/         # Redux slices
└── types/              # TypeScript type definitions
```

## Available Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS device/simulator
- `npm run web` - Run on web browser

## Features Overview

### 🏠 Home Screen
- Welcome message with personalized greeting
- Streak summary statistics
- Today's habit progress
- Quick access to active groups
- Global leaderboard access

### 📋 Habits Screen
- Create and manage personal habits
- Visual streak counters with fire animations
- Filter habits by status (all, completed, pending)
- Habit completion tracking
- Category-based organization

### 👥 Social Screen
- Community feed with user posts
- Like and comment on achievements
- Share milestone celebrations
- Create custom posts about progress

### 🏆 Groups Screen
- Join group challenges
- Collaborative streak tracking
- Group member progress overview
- Invite friends to groups

### 👤 Profile Screen
- Personal statistics and achievements
- Notification settings
- Referral system
- Account management

## Development Notes

### Current Implementation
- **Mock Data**: Currently uses mock data for rapid development and testing
- **Expo Managed**: Built for Expo managed workflow compatibility
- **Local Notifications**: Uses Expo Notifications for local reminders

### Future Enhancements
- **Backend Integration**: Replace mock data with real Firebase backend
- **Push Notifications**: Implement server-side push notifications
- **Social Features**: Real-time social interactions
- **Analytics**: Advanced progress analytics and insights

## Building for Production

### Development Build
```bash
npx expo export --platform all
```

### EAS Build (Recommended)
```bash
npm install -g @expo/cli
npx expo install expo-dev-client
npx eas build --platform all
```

## Troubleshooting

### Common Issues

1. **Metro bundler errors**: Clear cache with `npx expo start --clear`
2. **iOS simulator issues**: Reset simulator and restart Expo
3. **Android emulator problems**: Ensure emulator is running before starting Expo
4. **TypeScript errors**: Run `npx tsc --noEmit` to check for type issues

### Notification Setup
- Notifications require physical device for push tokens
- iOS requires Apple Developer account for production notifications
- Android requires Firebase Cloud Messaging setup

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review Expo documentation for platform-specific issues

---

**Built with ❤️ using Expo and React Native**
