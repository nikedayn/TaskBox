import { Stack } from 'expo-router';
import { PaperProvider, MD3LightTheme as DefaultTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#6750a4',
    secondary: '#625b71',
    tertiary: '#7d5260',
  },
};

export default function RootLayout() {
  return (
    // 1. SafeAreaProvider для правильних відступів на iPhone/Android
    <SafeAreaProvider>
      {/* 2. PaperProvider ОБОВ'ЯЗКОВИЙ для роботи Modal та Portal */}
      <PaperProvider theme={theme}>
        {/* 3. Stack показує наші екрани (зокрема папку tabs) */}
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </PaperProvider>
    </SafeAreaProvider>
  );
}