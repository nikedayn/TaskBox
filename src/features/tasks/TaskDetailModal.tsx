import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Modal, Portal, Text, Button, Switch, Divider, useTheme, IconButton, Chip } from 'react-native-paper';
import type { Task } from '../../db/schema';
import { useTaskStore } from '../../store/useTaskStore';

interface Props {
  visible: boolean;
  onDismiss: () => void;
  task: Task | null;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
}

export const TaskDetailModal = ({ visible, onDismiss, task, onUpdate, onDelete }: Props) => {
  const theme = useTheme();
  const { categories } = useTaskStore(); // Отримуємо список категорій

  if (!task) return null;

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={[styles.container, { backgroundColor: theme.colors.elevation.level3 }]}>
        <View style={styles.header}>
          <Text variant="headlineSmall" style={{ flex: 1 }}>Редагування</Text>
          <IconButton icon="close" onPress={onDismiss} />
        </View>

        <Text variant="bodyLarge" style={{ marginBottom: 10 }}>{task.title}</Text>

        {/* ВИБІР КАТЕГОРІЇ */}
        <Text variant="titleMedium" style={{ marginBottom: 8 }}>Категорія</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipContainer}>
          {/* Чіп для "Без категорії" */}
          <Chip
            selected={task.categoryId === null}
            onPress={() => onUpdate(task.id, { categoryId: null })}
            style={{ marginRight: 8 }}
          >
            Немає
          </Chip>
          
          {/* Чіпи для категорій з бази */}
          {categories.map(cat => (
            <Chip
              key={cat.id}
              selected={task.categoryId === cat.id}
              onPress={() => onUpdate(task.id, { categoryId: cat.id })}
              style={{ marginRight: 8, backgroundColor: task.categoryId === cat.id ? cat.color + '40' : undefined }}
              textStyle={{ color: task.categoryId === cat.id ? 'black' : undefined }}
              icon={task.categoryId === cat.id ? 'check' : undefined}
            >
              {cat.name}
            </Chip>
          ))}
        </ScrollView>
        
        <Divider style={{ marginVertical: 15 }} />

        {/* Матриця Ейзенхауера */}
        <View style={styles.row}>
          <Text variant="titleMedium">🔥 Терміново</Text>
          <Switch 
            value={!!task.isUrgent} 
            onValueChange={(val) => onUpdate(task.id, { isUrgent: val })}
            color={theme.colors.error}
          />
        </View>
        <Divider style={{ marginVertical: 10 }} />
        
        <View style={styles.row}>
          <Text variant="titleMedium">⭐ Важливо</Text>
          <Switch 
            value={!!task.isImportant} 
            onValueChange={(val) => onUpdate(task.id, { isImportant: val })}
            color={theme.colors.primary}
          />
        </View>

        <Divider style={{ marginVertical: 20 }} />

        <Button 
          mode="contained-tonal" 
          icon="trash-can-outline" 
          buttonColor={theme.colors.errorContainer}
          textColor={theme.colors.onErrorContainer}
          onPress={() => {
            onDelete(task.id);
            onDismiss();
          }}
        >
          Видалити задачу
        </Button>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    margin: 20,
    borderRadius: 28,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    paddingVertical: 4,
  }
});