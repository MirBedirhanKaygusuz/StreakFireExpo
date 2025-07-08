import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Android için basit ve temiz tab bar
interface CustomTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

const CustomTabBar: React.FC<CustomTabBarProps> = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();

  // Icon isimleri - her tab için farklı iconlar
  const getIconName = (routeName: string, focused: boolean) => {
    switch (routeName) {
      case 'Home':
        return focused ? 'home' : 'home-outline';
      case 'Habits':
        return focused ? 'checkbox-marked-circle' : 'checkbox-marked-circle-outline';
      case 'Social':
        return focused ? 'account-group' : 'account-group-outline';
      case 'Groups':
        return focused ? 'google-circles-communities' : 'google-circles-group';
      case 'Profile':
        return focused ? 'account' : 'account-outline';
      default:
        return 'circle';
    }
  };

  return (
    <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      <View style={styles.tabContainer}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel || options.title || route.name;
          const isFocused = state.index === index;

          // Tab'a basıldığında çalışacak fonksiyon
          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={styles.tabItem}
            >
              <View style={[styles.tabButton, isFocused && styles.tabButtonActive]}>
                <MaterialCommunityIcons
                  name={getIconName(route.name, isFocused) as any}
                  size={24}
                  color={isFocused ? '#FF6B6B' : '#757575'}
                />
                {isFocused && (
                  <Text style={styles.tabLabel}>{label}</Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

// Android tab bar stilleri
const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingHorizontal: 12,
    paddingTop: 8,
    elevation: 8, // Android shadow
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 50,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 40,
  },
  tabButtonActive: {
    backgroundColor: '#FF6B6B20', // Hafif kırmızı arka plan
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF6B6B',
    marginTop: 2,
  },
});

export default CustomTabBar;
