import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface SplashLogoIconProps {
  width?: number;
  height?: number;
  color?: string;
}

/**
 * A React Native component that renders the splash logo SVG
 * This is a direct conversion of the splash-logo.svg file to avoid bundling issues
 */
const SplashLogoIcon: React.FC<SplashLogoIconProps> = ({ 
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

export default SplashLogoIcon;
