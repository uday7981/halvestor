import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Dimensions,
  FlatList,
  Animated
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

// Carousel data
const carouselData = [
  {
    id: '1',
    title: 'Invest the Halal Way',
    description: 'Ethical investing made simple — grow your wealth confidently, with a portfolio that aligns with your values.',
    image: require('../assets/images/halal-investing.png')
  },
  {
    id: '2',
    title: 'Automated Purification',
    description: 'We track gains from non-compliant sources and help you donate them, so your wealth stays clean and aligned.',
    image: require('../assets/images/halal-2.png')
  },
  {
    id: '3',
    title: 'Paper Trade with Confidence',
    description: 'Practice investing with real market data, place limit or market orders and learn without risking your money.',
    image: require('../assets/images/halal-3.png')
  }
];

export default function Onboarding() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleLogin = () => {
    router.push('/auth/login');
  };

  const handleGetStarted = () => {
    router.push('/auth/signup');
  };

  const viewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const renderItem = ({ item }: { item: typeof carouselData[0] }) => {
    return (
      <View style={styles.carouselItem}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>
        <Image
          source={item.image}
          style={styles.carouselImage}
          resizeMode="contain"
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.carouselContainer}>
        <FlatList
          ref={flatListRef}
          data={carouselData}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          bounces={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          onViewableItemsChanged={viewableItemsChanged}
          viewabilityConfig={viewConfig}
          scrollEventThrottle={32}
        />
      </View>

      <View style={styles.paginationContainer}>
        {carouselData.map((_, index) => {
          const inputRange = [
            (index - 1) * width,
            index * width,
            (index + 1) * width
          ];

          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 16, 8],
            extrapolate: 'clamp'
          });

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp'
          });

          return (
            <Animated.View
              key={index.toString()}
              style={[
                styles.dot,
                { width: dotWidth, opacity }
              ]}
            />
          );
        })}
      </View>

      <View style={styles.buttonContainer}>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            activeOpacity={0.7}
          >
            <Text style={styles.loginButtonText}>Log in</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.getStartedButton}
            onPress={handleGetStarted}
            activeOpacity={0.7}
          >
            <Text style={styles.getStartedButtonText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.termsContainer}>
        <Text style={styles.termsText}>
          By continuing, you accept our{' '}
          <Text style={styles.termsLink} onPress={() => console.log('Terms of Use pressed')}>
            Terms of Use
          </Text>
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  carouselContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  carouselItem: {
    width,
    alignItems: 'center',
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  textContainer: {
    marginBottom: 32,
    paddingTop: 80,
    alignSelf: 'flex-start',
  },
  carouselImage: {
    width: width * 0.8,
    height: width * 0.8,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'left',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'left',
    lineHeight: 24,
    maxWidth: '95%',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
    marginHorizontal: 4,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  loginButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 100,
    paddingVertical: 14,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#1E293B',
    fontSize: 15,
    fontWeight: '600',
  },
  getStartedButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
    borderRadius: 100,
    paddingVertical: 14,
    alignItems: 'center',
  },
  getStartedButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
  termsContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  termsText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  termsLink: {
    color: '#3B82F6',
    fontWeight: '500',
  },
});
