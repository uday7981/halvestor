import React from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

type LogoSVGProps = {
  width?: number;
  height?: number;
  color?: string;
};

const LogoSVG = ({ width = 120, height = 120, color = 'white' }: LogoSVGProps) => {
  return (
    <View>
      <Svg width={width} height={height} viewBox="0 0 127 114" fill="none">
        <Path d="M13.38 14.1299V100.824" stroke={color} strokeWidth="26.2673" strokeLinecap="round" />
        <Path d="M53.179 59.7759L53.024 100.822" stroke={color} strokeWidth="26.2673" strokeLinecap="round" />
        <Path d="M113.642 71L85.972 100.788" stroke={color} strokeWidth="26.2673" strokeLinecap="round" />
      </Svg>
    </View>
  );
};

export default LogoSVG;
