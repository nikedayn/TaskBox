import { Tabs } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function TabLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: theme.colors.elevation.level2,
          borderTopWidth: 0,
          elevation: 0,
          // 👇 ОСЬ ЦІ НАЛАШТУВАННЯ
          height: 80,          // Робимо панель вищою
          paddingBottom: 20,   // Піднімаємо іконки від нижнього краю
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Вхідні',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="inbox-full" size={size} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="schedule"
        options={{
          title: 'Розклад',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="clock-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="matrix"
        options={{
          title: 'Матриця',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="view-grid" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}