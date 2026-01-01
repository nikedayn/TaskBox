import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, Platform, KeyboardAvoidingView } from 'react-native';
import { TextInput, useTheme, Text } from 'react-native-paper';
import { useTaskStore } from '../../src/store/useTaskStore';
import { TaskCard } from '../../src/features/tasks/TaskCard';
import { TaskDetailModal } from '../../src/features/tasks/TaskDetailModal';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Task } from '../../src/db/schema';

export default function HomeScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  
  const { tasks, fetchTasks, initData, addTask, toggleTaskCompletion, updateTask, deleteTask } = useTaskStore();
  
  const [newTaskTitle, setNewTaskTitle] = useState('');
  
  // ЗМІНА 1: Зберігаємо тільки ID вибраної задачі, а не об'єкт
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // ЗМІНА 2: Знаходимо "свіжу" версію задачі зі списку
  // Якщо tasks оновиться, ця змінна теж автоматично оновиться!
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
    setSelectedTaskId(task.id); // Зберігаємо тільки ID
  };

  const handleDismissModal = () => {
    setSelectedTaskId(null);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text variant="headlineMedium" style={styles.title}>Brain Dump 🧠</Text>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        style={styles.keyboardContainer}
      >
        <View style={styles.listContainer}>
          <FlatList
            data={tasks}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TaskCard 
                task={item} 
                onToggle={toggleTaskCompletion} 
                onPress={handleTaskPress}
              />
            )}
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 20, paddingTop: 8 }}
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

      {/* Модалка тепер отримує завжди актуальну selectedTask */}
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
  },
  title: {
    fontWeight: 'bold',
  },
  keyboardContainer: {
    flex: 1,
  },
  listContainer: {
    flex: 1, 
    paddingHorizontal: 16,
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