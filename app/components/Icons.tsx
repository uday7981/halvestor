import React from 'react';
import { View, Image, StyleSheet, ImageSourcePropType } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface IconProps {
  width?: number;
  height?: number;
  color?: string;
}

/**
 * SplashLogo component that renders the splash logo as an SVG
 * This avoids the need to import SVG files directly
 */
export const SplashLogo: React.FC<IconProps> = ({ 
  width = 127, 
  height = 114, 
  color = 'white' 
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 127 114" fill="none">
      <Path d="M13.38 14.1299V100.824" stroke={color} strokeWidth="26.2673" strokeLinecap="round"/>
      <Path d="M53.179 59.7759L53.024 100.822" stroke={color} strokeWidth="26.2673" strokeLinecap="round"/>
      <Path d="M113.62 14.1299V100.824" stroke={color} strokeWidth="26.2673" strokeLinecap="round"/>
    </Svg>
  );
};

/**
 * InvSplash component that renders the investment splash logo as an SVG
 * This avoids the need to import SVG files directly
 */
export const InvSplash: React.FC<IconProps> = ({ 
  width = 127, 
  height = 114, 
  color = 'white' 
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 127 114" fill="none">
      <Path d="M13.38 14.1299V100.824" stroke={color} strokeWidth="26.2673" strokeLinecap="round"/>
      <Path d="M53.179 59.7759L53.024 100.822" stroke={color} strokeWidth="26.2673" strokeLinecap="round"/>
      <Path d="M113.62 14.1299V100.824" stroke={color} strokeWidth="26.2673" strokeLinecap="round"/>
    </Svg>
  );
};

/**
 * PurifyGains component that renders the purify gains logo as an SVG
 * This avoids the need to import SVG files directly
 */
export const PurifyGains: React.FC<IconProps> = ({ 
  width = 127, 
  height = 114, 
  color = 'white' 
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 127 114" fill="none">
      <Path d="M63.5 0L127 114H0L63.5 0Z" fill={color} />
    </Svg>
  );
};

interface ImageIconProps {
  source: ImageSourcePropType;
  width?: number;
  height?: number;
  style?: any;
}

/**
 * ImageIcon component that renders an image
 * Use this for PNG files instead of SVG files
 */
export const ImageIcon: React.FC<ImageIconProps> = ({ 
  source, 
  width = 100, 
  height = 100,
  style 
}) => {
  return (
    <Image
      source={source}
      style={[{ width, height }, style]}
      resizeMode="contain"
    />
  );
};
