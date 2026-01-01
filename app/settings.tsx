import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, List, useTheme, Divider, Switch, Button } from 'react-native-paper';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // 👈 1. Імпорт для безпечних зон

export default function SettingsScreen() {
  const theme = useTheme();
  const [isDark, setIsDark] = React.useState(false); 
  const insets = useSafeAreaInsets(); // 👈 2. Отримуємо розміри відступів

  // Функції-заглушки
  const handleExport = () => {
    Alert.alert("Експорт", "Функціонал експорту в JSON буде додано пізніше.");
  };

  const handleImport = () => {
    Alert.alert("Імпорт", "Функціонал відновлення з файлу буде додано пізніше.");
  };

  const handleResetDatabase = () => {
    Alert.alert(
      "Небезпечна дія! ⚠️",
      "Ви впевнені, що хочете видалити ВСІ задачі та налаштування? Цю дію неможливо відмінити.",
      [
        { text: "Скасувати", style: "cancel" },
        { 
          text: "Видалити все", 
          style: "destructive", 
          onPress: () => {
            console.log("Deleting all data..."); 
          } 
        }
      ]
    );
  };

  return (
    <View style={[
      styles.container, 
      { 
        backgroundColor: theme.colors.background,
        paddingTop: insets.top // 👈 3. Додаємо динамічний відступ зверху
      }
    ]}>
      {/* Налаштування заголовка (headerShown: false, якщо хочете свій кастомний, або залиште як є) */}
      <Stack.Screen options={{ title: 'Налаштування', headerBackTitle: 'Назад' }} />

      <List.Section>
        <List.Subheader>Загальні</List.Subheader>
        
        <List.Item
          title="Темна тема"
          left={() => <List.Icon icon="theme-light-dark" />}
          right={() => <Switch value={isDark} onValueChange={setIsDark} />}
        />
        
        <List.Item
          title="Сповіщення"
          description="Керування нагадуваннями"
          left={() => <List.Icon icon="bell-outline" />}
          right={() => <List.Icon icon="chevron-right" />}
        />
      </List.Section>

      <Divider />

      <List.Section>
        <List.Subheader>Дані</List.Subheader>

        <List.Item
          title="Експорт даних"
          description="Зберегти резервну копію (JSON)"
          left={() => <List.Icon icon="database-export" />}
          onPress={handleExport}
        />

        <List.Item
          title="Імпорт даних"
          description="Відновити з резервної копії"
          left={() => <List.Icon icon="database-import" />}
          onPress={handleImport}
        />

        <List.Item
          title="Скинути всі дані"
          description="Очистити базу даних повністю"
          titleStyle={{ color: theme.colors.error }}
          left={() => <List.Icon color={theme.colors.error} icon="delete-forever" />}
          onPress={handleResetDatabase}
        />
      </List.Section>

      <Divider />

      <List.Section>
        <List.Subheader>Інше</List.Subheader>
        <List.Item
          title="Про додаток"
          description="Версія 1.0.0"
          left={() => <List.Icon icon="information-outline" />}
        />
      </List.Section>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
});