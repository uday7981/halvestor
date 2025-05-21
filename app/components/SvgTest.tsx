import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import SplashLogo from '../../assets/images/splash-logo.svg';
import InvSplash from '../../assets/images/inv-splash.svg';

interface SvgTestProps {
  width?: number;
  height?: number;
}

const SvgTest: React.FC<SvgTestProps> = ({ width = 100, height = 100 }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>SVG Test Component</Text>
      <View style={styles.svgContainer}>
        <SplashLogo width={width} height={height} />
        <Text style={styles.label}>splash-logo.svg</Text>
      </View>
      <View style={styles.svgContainer}>
        <InvSplash width={width} height={height} />
        <Text style={styles.label}>inv-splash.svg</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  svgContainer: {
    marginVertical: 10,
    alignItems: 'center',
  },
  label: {
    marginTop: 5,
    fontSize: 14,
    color: '#666',
  },
});

export default SvgTest;
