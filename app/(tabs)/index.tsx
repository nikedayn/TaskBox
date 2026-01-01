import React, { useEffect, useState } from 'react';
import { View, SectionList, StyleSheet, Platform, KeyboardAvoidingView, TouchableOpacity } from 'react-native';
import { TextInput, useTheme, Text, IconButton } from 'react-native-paper';
import { useRouter } from 'expo-router'; // 👈 1. Імпортуємо роутер
import { useTaskStore } from '../../src/store/useTaskStore';
import { TaskCard } from '../../src/features/tasks/TaskCard';
import { TaskDetailModal } from '../../src/features/tasks/TaskDetailModal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Task } from '../../src/db/schema';

export default function HomeScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter(); // 👈 2. Ініціалізуємо роутер
  
  const { tasks, initData, addTask, toggleTaskCompletion, updateTask, deleteTask } = useTaskStore();
  
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);

  const selectedTask = tasks.find(t => t.id === selectedTaskId) || null;
  const isModalVisible = !!selectedTask;

  useEffect(() => {
    initData();
  }, []);

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;
    await addTask(newTaskTitle, null as any);
    setNewTaskTitle('');
  };

  const handleTaskPress = (task: Task) => {
    setSelectedTaskId(task.id);
  };

  const handleDismissModal = () => {
    setSelectedTaskId(null);
  };

  const activeTasks = tasks.filter(t => !t.isCompleted);
  const completedTasks = tasks.filter(t => t.isCompleted);

  const sections = [
    ...(activeTasks.length > 0 ? [{ title: 'Треба зробити 🔥', data: activeTasks, type: 'active' }] : []),
    ...(completedTasks.length > 0 ? [{ title: 'Виконано ✅', data: showCompleted ? completedTasks : [], type: 'completed', count: completedTasks.length }] : []),
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      
      {/* 👇 3. Оновлений заголовок з кнопкою налаштувань */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text variant="headlineMedium" style={styles.title}>Brain Dump 🧠</Text>
        <IconButton 
          icon="cog-outline" 
          size={28} 
          onPress={() => router.push('/settings')} // Перехід на сторінку
        />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        style={styles.keyboardContainer}
      >
        <View style={styles.listContainer}>
          <SectionList
            sections={sections}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TaskCard 
                task={item} 
                onToggle={toggleTaskCompletion} 
                onPress={handleTaskPress}
              />
            )}
            renderSectionHeader={({ section: { title, type, count } }: any) => {
              if (type === 'completed') {
                return (
                  <TouchableOpacity 
                    onPress={() => setShowCompleted(!showCompleted)}
                    style={[styles.sectionHeaderRow, { backgroundColor: theme.colors.background }]}
                  >
                    <Text variant="titleMedium" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                      {title} ({count})
                    </Text>
                    <IconButton 
                      icon={showCompleted ? "chevron-up" : "chevron-down"}
                      size={20}
                      onPress={() => setShowCompleted(!showCompleted)}
                      style={{ margin: 0 }}
                    />
                  </TouchableOpacity>
                );
              }
              return (
                <View style={[styles.sectionHeaderRow, { backgroundColor: theme.colors.background }]}>
                  <Text variant="titleMedium" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                    {title}
                  </Text>
                </View>
              );
            }}
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
            stickySectionHeadersEnabled={false}
          />
        </View>

        <View style={[styles.inputWrapper, { backgroundColor: theme.colors.elevation.level2, paddingBottom: 16 + insets.bottom }]}>
          <TextInput
            mode="outlined"
            placeholder="Що треба зробити?"
            value={newTaskTitle}
            onChangeText={setNewTaskTitle}
            onSubmitEditing={handleAddTask}
            style={styles.input}
            right={<TextInput.Icon icon="arrow-up-circle" onPress={handleAddTask} />}
          />
        </View>
      </KeyboardAvoidingView>

      <TaskDetailModal 
        visible={isModalVisible}
        onDismiss={handleDismissModal}
        task={selectedTask}
        onUpdate={updateTask}
        onDelete={deleteTask}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
  },
  keyboardContainer: {
    flex: 1,
  },
  listContainer: {
    flex: 1, 
    paddingHorizontal: 16, // 👈 ДОДАНО ВІДСТУПИ (зліва і справа)
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    marginTop: 12,
    marginBottom: 4,
    // Можна додати borderRadius, якщо ви хочете, щоб фон заголовка був заокруглений
    borderRadius: 8, 
  },
  inputWrapper: {
    padding: 16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  input: {
    backgroundColor: 'transparent',
  },
});