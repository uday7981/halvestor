import React from 'react';
import { Image, ImageSourcePropType } from 'react-native';

// This component helps handle SVG files by using them as regular images
// This is a fallback approach when the SVG transformer is not working correctly
interface SvgLoaderProps {
  source: ImageSourcePropType;
  width?: number;
  height?: number;
  style?: any;
}

const SvgLoader: React.FC<SvgLoaderProps> = ({ source, width, height, style }) => {
  return (
    <Image
      source={source}
      style={[{ width, height }, style]}
      resizeMode="contain"
    />
  );
};

export default SvgLoader;
