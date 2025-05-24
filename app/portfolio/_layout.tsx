import { Stack } from 'expo-router';

export default function PortfolioLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="all-holdings"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
