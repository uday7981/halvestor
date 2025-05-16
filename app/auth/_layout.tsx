import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function AuthLayout() {
  return (
    <>
      <StatusBar style="dark" translucent backgroundColor="transparent" />
      <Stack 
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#FFFFFF' }
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            animation: 'fade'
          }}
        />
        <Stack.Screen
          name="login"
          options={{
            animation: 'slide_from_right'
          }}
        />
        <Stack.Screen
          name="signup"
          options={{
            animation: 'slide_from_right'
          }}
        />
      </Stack>
    </>
  );
}
