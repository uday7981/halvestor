import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Image, FlatList, Dimensions, TouchableOpacity, Animated } from 'react-native';

const { width } = Dimensions.get('window');

interface CarouselItem {
  id: string;
  title: string;
  description: string;
  image: any;
  backgroundColor: string;
}

const carouselData: CarouselItem[] = [
  {
    id: '1',
    title: 'Purify Your Gains',
    description: 'Earnings from non-compliant sources? We help you track and donate them seamlessly — so your portfolio stays halal.',
    image: require('../../assets/images/purifygains.png'),
    backgroundColor: '#FEF9C3'
  },
  {
    id: '2',
    title: 'Track Your Impact',
    description: 'See how your purified investments are making a difference in communities around the world.',
    image: require('../../assets/images/purifygains.png'),
    backgroundColor: '#E6F5EA'
  },
  {
    id: '3',
    title: 'Automate Your Zakat',
    description: 'Set up automatic calculations and payments for your annual Zakat obligations.',
    image: require('../../assets/images/purifygains.png'),
    backgroundColor: '#EFF6FF'
  }
];

const PurifyGainsCard = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList<CarouselItem>>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const renderItem = ({ item }: { item: CarouselItem }) => (
    <View style={[styles.slide, { backgroundColor: item.backgroundColor, width: width - 32 }]}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
      <View style={styles.imageContainer}>
        <Image
          source={item.image}
          style={styles.image}
          resizeMode="contain"
        />
      </View>
    </View>
  );

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  );

  const handleMomentumScrollEnd = (event: any) => {
    const newIndex = Math.round(event.nativeEvent.contentOffset.x / (width - 32));
    setActiveIndex(newIndex);
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={carouselData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        onScroll={handleScroll}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        snapToInterval={width - 32}
        decelerationRate="fast"
        contentContainerStyle={styles.flatListContent}
      />
      <View style={styles.pagination}>
        {carouselData.map((_, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.paginationDot, activeIndex === index && styles.paginationDotActive]}
            onPress={() => {
              flatListRef.current?.scrollToIndex({ index, animated: true });
              setActiveIndex(index);
            }}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  flatListContent: {
    paddingRight: 16,
  },
  slide: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 16,
    overflow: 'hidden',
    marginRight: 8,
  },
  textContainer: {
    flex: 2,
    paddingRight: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  imageContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 100,
    height: 100,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#CBD5E1',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#3B82F6',
    width: 16,
  },
});

export default PurifyGainsCard;
