import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Checkbox, useTheme } from 'react-native-paper';
import type { Task } from '../../db/schema';
import { useTaskStore } from '../../store/useTaskStore'; // <--- Імпорт стору

interface Props {
  task: Task;
  onToggle: (id: string, status: boolean) => void;
  onPress: (task: Task) => void;
}

export const TaskCard = ({ task, onToggle, onPress }: Props) => {
  const theme = useTheme();
  const { categories } = useTaskStore(); // <--- Беремо категорії

  // Знаходимо категорію для цієї задачі
  const category = categories.find(c => c.id === task.categoryId);

  return (
    <View style={styles.container}>
      <Card 
        mode="elevated" 
        style={[styles.card, { backgroundColor: theme.colors.surface }]}
        onPress={() => onPress(task)}
      >
        <Card.Content style={styles.content}>
          <View style={styles.leftSection}>
            <Checkbox
              status={task.isCompleted ? 'checked' : 'unchecked'}
              onPress={() => onToggle(task.id, !!task.isCompleted)}
            />
            <View style={styles.textContainer}>
              <Text
                variant="bodyLarge"
                numberOfLines={1}
                style={{
                  textDecorationLine: task.isCompleted ? 'line-through' : 'none',
                  color: task.isCompleted ? theme.colors.onSurfaceDisabled : theme.colors.onSurface,
                }}
              >
                {task.title}
              </Text>
              
              {/* ВІДОБРАЖЕННЯ КАТЕГОРІЇ (Тегу) */}
              {category && (
                <View style={[styles.badge, { backgroundColor: category.color + '20' }]}>
                  {/* + '20' додає прозорість до HEX кольору */}
                  <Text style={{ fontSize: 10, color: category.color, fontWeight: 'bold' }}>
                    {category.name.toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
          </View>
          
          <View style={{ flexDirection: 'row', gap: 4 }}>
            {task.isUrgent && <Text>🔥</Text>}
            {task.isImportant && <Text>⭐</Text>}
          </View>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  card: {},
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  textContainer: {
    marginLeft: 8,
    flex: 1,
    alignItems: 'flex-start', // Вирівнювання по лівому краю
  },
  badge: {
    marginTop: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  }
});