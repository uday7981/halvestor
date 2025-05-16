import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { Svg, Path } from 'react-native-svg';
import { StatusBar } from 'expo-status-bar';

// Portfolio Icon SVG
const PortfolioIcon = ({ color }: { color: string }) => (
  <Svg width="24" height="21" viewBox="0 0 24 21" fill="none">
    <Path d="M3 2.45117V18.2422M10.2493 10.7654L10.2212 18.2418M21.2626 12.8098L16.2225 18.2357" stroke={color} strokeWidth="4.78453" strokeLinecap="round" />
  </Svg>
);

// Explore Icon SVG
const ExploreIcon = ({ color }: { color: string }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M11 2C15.968 2 20 6.032 20 11C20 15.968 15.968 20 11 20C6.032 20 2 15.968 2 11C2 6.032 6.032 2 11 2ZM11 18C14.8675 18 18 14.8675 18 11C18 7.1325 14.8675 4 11 4C7.1325 4 4 7.1325 4 11C4 14.8675 7.1325 18 11 18ZM19.4853 18.0711L22.3137 20.8995L20.8995 22.3137L18.0711 19.4853L19.4853 18.0711Z" fill={color} />
  </Svg>
);

// Watchlist Icon SVG
const WatchlistIcon = ({ color }: { color: string }) => (
  <Svg width="25" height="24" viewBox="0 0 25 24" fill="none">
    <Path d="M12.501 4.52853C14.85 2.42 18.48 2.49 20.7426 4.75736C23.0053 7.02472 23.083 10.637 20.9786 12.993L12.4999 21.485L4.02138 12.993C1.91705 10.637 1.99571 7.01901 4.25736 4.75736C6.52157 2.49315 10.1452 2.41687 12.501 4.52853ZM19.327 6.1701C17.8279 4.66794 15.4076 4.60701 13.837 6.01687L12.5019 7.21524L11.1661 6.01781C9.59098 4.60597 7.17506 4.66808 5.67157 6.17157C4.18183 7.66131 4.10704 10.0473 5.47993 11.6232L12.4999 18.6543L19.5201 11.6232C20.8935 10.0467 20.819 7.66525 19.327 6.1701Z" fill={color} />
  </Svg>
);

// Home indicator component removed to avoid duplication with native iOS indicator

// Custom TabBar component
type CustomTabBarProps = {
  state: {
    routes: Array<{ key: string; name: string }>,
    index: number
  };
  descriptors: Record<string, { options: any }>;
  navigation: any;
};

const CustomTabBar = ({ state, descriptors, navigation }: CustomTabBarProps) => {
  return (
    <SafeAreaView style={styles.tabBarContainer}>
      <View style={styles.tabBar}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const label = options.title || route.name;
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

          return (
            <View key={route.key} style={styles.tabItem}>
              <View
                style={styles.tabButton}
                onTouchEnd={onPress}
              >
                {options.tabBarIcon && options.tabBarIcon({
                  color: isFocused ? '#3B82F6' : '#94A3B8',
                })}
                <Text
                  style={[styles.tabLabel, { color: isFocused ? '#3B82F6' : '#94A3B8' }]}
                >
                  {label}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
      {/* Native iOS home indicator will appear here */}
    </SafeAreaView>
  );
};

export default function TabLayout() {
  return (
    <>
      <StatusBar style="dark" translucent backgroundColor="transparent" />
      <Tabs
        screenOptions={{
          headerShown: false,
        }}
        initialRouteName="index"
        tabBar={(props: any) => <CustomTabBar {...props} />}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Portfolio',
            tabBarIcon: ({ color }: { color: string }) => <PortfolioIcon color={color} />,
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Explore',
            tabBarIcon: ({ color }: { color: string }) => <ExploreIcon color={color} />,
          }}
        />
        <Tabs.Screen
          name="watchlist"
          options={{
            title: 'Watchlist',
            tabBarIcon: ({ color }: { color: string }) => <WatchlistIcon color={color} />,
          }}
        />
      </Tabs>
    </>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    backgroundColor: 'white',
    paddingBottom: 0,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  tabBar: {
    display: 'flex',
    flexDirection: 'row',
    paddingHorizontal: 40,
    paddingTop: 12,
    paddingBottom: 4,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 6,
    fontWeight: '500',
  },
  // Home indicator styles removed
});