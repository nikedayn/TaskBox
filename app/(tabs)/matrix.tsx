import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, useTheme, Card } from 'react-native-paper';
import { useTaskStore } from '../../src/store/useTaskStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Task, Category } from '../../src/db/schema'; // Додали тип Category
import { TaskDetailModal } from '../../src/features/tasks/TaskDetailModal';

// Оновили Quadrant, тепер він приймає categories
const Quadrant = ({ title, icon, tasks, categories, backgroundColor, textColor, onPressTask }: any) => (
  <View style={[styles.quadrant, { backgroundColor }]}>
    <View style={styles.quadrantHeader}>
      <Text variant="titleSmall" style={[styles.quadrantTitle, { color: textColor }]}>
        {icon} {title}
      </Text>
      <View style={styles.badge}>
        <Text variant="labelSmall" style={{ fontWeight: 'bold' }}>{tasks.length}</Text>
      </View>
    </View>
    
    <ScrollView contentContainerStyle={styles.listContent}>
      {tasks.length === 0 ? (
        <Text style={[styles.emptyText, { color: textColor }]}>Пусто</Text>
      ) : (
        tasks.map((task: Task) => {
          // Знаходимо категорію для цієї задачі
          const cat = categories.find((c: Category) => c.id === task.categoryId);

          return (
            <TouchableOpacity key={task.id} onPress={() => onPressTask(task)}>
              <Card style={styles.miniCard}>
                <Card.Content style={{ padding: 8, paddingVertical: 6 }}>
                  {/* Заголовок + Кольорова крапка */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text 
                      variant="bodyMedium" 
                      numberOfLines={2}
                      style={{
                        flex: 1,
                        textDecorationLine: task.isCompleted ? 'line-through' : 'none',
                        opacity: task.isCompleted ? 0.5 : 1
                      }}
                    >
                      {task.title}
                    </Text>
                    
                    {/* Якщо є категорія — показуємо кольорову точку */}
                    {cat && (
                      <View style={{ 
                        width: 8, 
                        height: 8, 
                        borderRadius: 4, 
                        backgroundColor: cat.color,
                        marginLeft: 4 
                      }} />
                    )}
                  </View>
                </Card.Content>
              </Card>
            </TouchableOpacity>
          );
        })
      )}
    </ScrollView>
  </View>
);

export default function MatrixScreen() {
  const theme = useTheme();
  // Дістаємо categories зі стору
  const { tasks, categories, fetchTasks, updateTask, deleteTask } = useTaskStore();
  
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  
  const selectedTask = tasks.find(t => t.id === selectedTaskId) || null;
  const isModalVisible = !!selectedTask;

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleTaskPress = (task: Task) => {
    setSelectedTaskId(task.id);
  };

  const handleDismiss = () => {
    setSelectedTaskId(null);
  };

  const activeTasks = tasks.filter(t => !t.isCompleted); 

  const doFirst = activeTasks.filter(t => t.isUrgent && t.isImportant);
  const schedule = activeTasks.filter(t => !t.isUrgent && t.isImportant);
  const delegate = activeTasks.filter(t => t.isUrgent && !t.isImportant);
  const eliminate = activeTasks.filter(t => !t.isUrgent && !t.isImportant);

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={{ fontWeight: 'bold' }}>Матриця 🎯</Text>
      </View>

      <View style={styles.grid}>
        <View style={styles.row}>
          <Quadrant 
            title="Зробити" 
            icon="🔥"
            tasks={doFirst}
            categories={categories} // Передаємо категорії
            backgroundColor={theme.colors.errorContainer}
            textColor={theme.colors.onErrorContainer}
            onPressTask={handleTaskPress}
          />
          <Quadrant 
            title="Планувати" 
            icon="📅"
            tasks={schedule}
            categories={categories} // Передаємо категорії
            backgroundColor={theme.colors.primaryContainer}
            textColor={theme.colors.onPrimaryContainer}
            onPressTask={handleTaskPress}
          />
        </View>

        <View style={styles.row}>
          <Quadrant 
            title="Делегувати" 
            icon="🤝"
            tasks={delegate}
            categories={categories} // Передаємо категорії
            backgroundColor={theme.colors.secondaryContainer}
            textColor={theme.colors.onSecondaryContainer}
            onPressTask={handleTaskPress}
          />
          <Quadrant 
            title="Видалити" 
            icon="🗑️"
            tasks={eliminate}
            categories={categories} // Передаємо категорії
            backgroundColor={theme.colors.surfaceVariant}
            textColor={theme.colors.onSurfaceVariant}
            onPressTask={handleTaskPress}
          />
        </View>
      </View>

      <TaskDetailModal 
        visible={isModalVisible}
        onDismiss={handleDismiss}
        task={selectedTask}
        onUpdate={updateTask}
        onDelete={deleteTask}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 16, paddingBottom: 8 },
  grid: { flex: 1, padding: 8, gap: 8 },
  row: { flex: 1, flexDirection: 'row', gap: 8 },
  
  quadrant: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  quadrantHeader: {
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quadrantTitle: { fontWeight: 'bold' },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  listContent: { padding: 8, paddingTop: 0 },
  emptyText: { textAlign: 'center', marginTop: 20, opacity: 0.5, fontSize: 12 },
  miniCard: { marginBottom: 6, backgroundColor: 'white' }
});