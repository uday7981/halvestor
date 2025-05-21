import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface InvSplashProps {
  width?: number;
  height?: number;
  color?: string;
}

// This component recreates the inv-splash.svg content as a React component
// instead of importing the SVG file directly
const InvSplash: React.FC<InvSplashProps> = ({ 
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

export default InvSplash;
