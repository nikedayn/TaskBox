import { Stack } from 'expo-router';
import { PaperProvider, MD3LightTheme as DefaultTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
// 1. Імпортуємо RootView
import { GestureHandlerRootView } from 'react-native-gesture-handler';

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
    // 2. Обгортаємо ВЕСЬ додаток у GestureHandlerRootView
    // style={{ flex: 1 }} є обов'язковим!
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}