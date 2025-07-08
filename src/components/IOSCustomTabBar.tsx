import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';

const { width: screenWidth } = Dimensions.get('window');

interface IOSCustomTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

const IOSCustomTabBar: React.FC<IOSCustomTabBarProps> = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();
  const focusedIndex = useSharedValue(state.index);

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

  React.useEffect(() => {
    focusedIndex.value = withSpring(state.index, {
      damping: 15,
      stiffness: 120,
    });
  }, [state.index]);

  // Daha hassas pozisyon hesaplaması
  const backgroundAnimatedStyle = useAnimatedStyle(() => {
    const tabBarPadding = 24; // 12 * 2
    const availableWidth = screenWidth - tabBarPadding;
    const tabCount = state.routes.length; // 5
    const singleTabWidth = availableWidth / tabCount;
    
    // Her tab'ın merkez pozisyonu
    const tabCenters = state.routes.map((_: any, index: number) => {
      return (index * singleTabWidth) + (singleTabWidth / 2) - (availableWidth / 2);
    });

    const translateX = interpolate(
      focusedIndex.value,
      [0, 1, 2, 3, 4],
      tabCenters,
      Extrapolate.CLAMP
    );

    return {
      transform: [{ translateX: translateX }],
    };
  });

  return (
    <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      {/* Animasyonlu üst çizgi */}
      <Animated.View style={[styles.backgroundIndicator, backgroundAnimatedStyle]} />
      
      <View style={styles.tabContainer}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel || options.title || route.name;
          const isFocused = state.index === index;

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

          // Simplified icon animation
          const tabAnimatedStyle = useAnimatedStyle(() => {
            const scale = interpolate(
              focusedIndex.value,
              [index - 0.5, index, index + 0.5],
              [0.9, 1.1, 0.9],
              Extrapolate.CLAMP
            );

            return {
              transform: [{ scale: withSpring(scale, { damping: 12 }) }],
            };
          });

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={styles.tabItem}
              activeOpacity={0.7}
            >
              <View style={styles.tabContent}>
                <Animated.View style={tabAnimatedStyle}>
                  <MaterialCommunityIcons
                    name={getIconName(route.name, isFocused) as any}
                    size={isFocused ? 24 : 20}
                    color={isFocused ? '#FF6B6B' : '#8E8E93'}
                  />
                </Animated.View>
                <Text style={[
                  styles.tabLabel,
                  { 
                    color: isFocused ? '#FF6B6B' : '#8E8E93',
                    fontWeight: isFocused ? '600' : '500',
                  }
                ]}>
                  {label}
                </Text>
              </View>
              
              {route.name === 'Social' && options.tabBarBadge && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{options.tabBarBadge}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0,
    paddingHorizontal: 12,
    paddingTop: 8,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  backgroundIndicator: {
    position: 'absolute',
    top: 8,
    left: '50%',
    width: 40, // Daha küçük ve tutarlı genişlik
    height: 3,
    backgroundColor: '#FF6B6B',
    borderRadius: 2,
    marginLeft: -20, // width / 2
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 45,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 38,
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: '25%',
    backgroundColor: '#FF6B6B',
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    paddingHorizontal: 2,
  },
});

export default IOSCustomTabBar;