// This file provides a simple fix for SVG bundling issues in React Native
// It exports React components that render SVG content directly
// instead of importing SVG files which can cause bundling errors

import React from 'react';
import { Image } from 'react-native';

// Use PNG versions of SVG files to avoid bundling issues
export const SplashLogo = (props) => (
  <Image 
    source={require('../../assets/images/splash-icon.png')} 
    style={{
      width: props.width || 127,
      height: props.height || 114,
      ...props.style
    }}
    resizeMode="contain"
  />
);

export const InvSplash = (props) => (
  <Image 
    source={require('../../assets/images/inv-splash.png')} 
    style={{
      width: props.width || 127,
      height: props.height || 114,
      ...props.style
    }}
    resizeMode="contain"
  />
);

// Export other SVG replacements as needed
