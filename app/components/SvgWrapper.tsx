import React from 'react';
import { View } from 'react-native';
import Svg, { Path, SvgProps } from 'react-native-svg';

// This component provides a safe way to use SVG content directly
// instead of importing SVG files which can cause bundling issues
interface SvgWrapperProps extends SvgProps {
  paths: Array<{
    d: string;
    stroke?: string;
    fill?: string;
    strokeWidth?: string | number;
    strokeLinecap?: string;
  }>;
}

const SvgWrapper: React.FC<SvgWrapperProps> = ({ 
  width = 100, 
  height = 100, 
  viewBox = "0 0 100 100",
  paths,
  ...props 
}) => {
  return (
    <View>
      <Svg width={width} height={height} viewBox={viewBox} {...props}>
        {paths.map((path, index) => (
          <Path
            key={index}
            d={path.d}
            stroke={path.stroke || 'none'}
            fill={path.fill || 'none'}
            strokeWidth={path.strokeWidth || 1}
            strokeLinecap={path.strokeLinecap as any || 'round'}
          />
        ))}
      </Svg>
    </View>
  );
};

export default SvgWrapper;
