import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Line, Defs, LinearGradient, Stop, Rect } from 'react-native-svg';

type SimpleStockChartProps = {
  timeRange: string;
  color?: string;
};

// Generate sample data based on time range
const generateChartData = (timeRange: string, width: number, height: number) => {
  const points = 50; // Number of data points
  const data = [];
  
  // Generate sample data with some volatility
  let lastValue = height * 0.5; // Start in the middle
  
  for (let i = 0; i < points; i++) {
    // Add some random movement to the stock price
    const change = (Math.random() - 0.5) * (height * 0.1);
    lastValue = Math.max(Math.min(lastValue + change, height * 0.8), height * 0.2); // Keep within bounds
    
    data.push({
      x: (i / (points - 1)) * width,
      y: lastValue
    });
  }
  
  // Add a final dip for the chart to match the screenshot
  if (timeRange === '1d') {
    data[data.length - 1].y = data[data.length - 2].y * 1.03;
  }
  
  return data;
};

// Convert data points to SVG path
const createPath = (data: { x: number; y: number }[]): string => {
  let path = `M ${data[0].x} ${data[0].y}`;
  
  for (let i = 1; i < data.length; i++) {
    path += ` L ${data[i].x} ${data[i].y}`;
  }
  
  return path;
};

export default function SimpleStockChart({ timeRange, color = '#3B82F6' }: SimpleStockChartProps) {
  const width = Dimensions.get('window').width - 32;
  const height = 200;
  const chartData = generateChartData(timeRange, width, height);
  const pathData = createPath(chartData);
  
  // Create area fill path by extending the line to the bottom
  const areaPath = `${pathData} L ${width} ${height} L 0 ${height} Z`;
  
  // Create grid lines
  const horizontalLines = [];
  const verticalLines = [];
  const gridCount = 4;
  
  for (let i = 1; i < gridCount; i++) {
    const y = (height / gridCount) * i;
    horizontalLines.push(
      <Line
        key={`h-${i}`}
        x1={0}
        y1={y}
        x2={width}
        y2={y}
        stroke="#E2E8F0"
        strokeWidth={1}
        strokeDasharray="5,5"
      />
    );
  }
  
  for (let i = 1; i < gridCount; i++) {
    const x = (width / gridCount) * i;
    verticalLines.push(
      <Line
        key={`v-${i}`}
        x1={x}
        y1={0}
        x2={x}
        y2={height}
        stroke="#E2E8F0"
        strokeWidth={1}
        strokeDasharray="5,5"
      />
    );
  }
  
  return (
    <View style={styles.container}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity="0.2" />
            <Stop offset="1" stopColor={color} stopOpacity="0.01" />
          </LinearGradient>
        </Defs>
        
        {/* Grid lines */}
        {horizontalLines}
        {verticalLines}
        
        {/* Area fill */}
        <Path
          d={areaPath}
          fill="url(#grad)"
        />
        
        {/* Line */}
        <Path
          d={pathData}
          fill="none"
          stroke={color}
          strokeWidth={2}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
  }
});
