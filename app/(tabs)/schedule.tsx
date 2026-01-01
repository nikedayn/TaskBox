import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { Text, useTheme, Card, Portal, Modal, IconButton, Button, Divider } from 'react-native-paper';
import { useTaskStore } from '../../src/store/useTaskStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Task } from '../../src/db/schema';

// Список годин
const HOURS = Array.from({ length: 14 }, (_, i) => `${i + 8}:00`); // 08:00 - 21:00

export default function ScheduleScreen() {
  const theme = useTheme();
  const { tasks, timeBlocks, fetchTimeBlocks, assignTaskToTime, removeFromSchedule } = useTaskStore();
  
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  useEffect(() => {
    fetchTimeBlocks();
  }, []);

  // Тільки активні задачі для вибору
  const availableTasks = tasks.filter(t => !t.isCompleted);

  const handleAssign = async (task: Task) => {
    if (selectedTime) {
      await assignTaskToTime(task.id, selectedTime);
      setSelectedTime(null);
    }
  };

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={{ fontWeight: 'bold' }}>Мій День 📅</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {HOURS.map((time) => {
          // Шукаємо, чи є блок на цей час
          const block = timeBlocks.find(b => b.startTime === time);
          const task = block ? tasks.find(t => t.id === block.taskId) : null;

          return (
            <View key={time} style={styles.timeRow}>
              {/* Час зліва */}
              <Text variant="labelLarge" style={{ width: 50, color: theme.colors.outline }}>
                {time}
              </Text>

              {/* Слот для задачі */}
              <View style={styles.slotContainer}>
                {task ? (
                  // Якщо є задача
                  <Card style={[styles.taskCard, { backgroundColor: theme.colors.primaryContainer }]}>
                    <View style={styles.cardInner}>
                      <Text 
                        variant="bodyMedium" 
                        style={{ flex: 1, color: theme.colors.onPrimaryContainer, fontWeight: '500' }}
                        numberOfLines={1}
                      >
                        {task.title}
                      </Text>
                      <IconButton 
                        icon="close-circle-outline" 
                        size={20} 
                        iconColor={theme.colors.onPrimaryContainer}
                        onPress={() => block && removeFromSchedule(block.id)}
                      />
                    </View>
                  </Card>
                ) : (
                  // Якщо пусто - кнопка "+"
                  <TouchableOpacity 
                    style={[styles.emptySlot, { borderColor: theme.colors.outlineVariant }]}
                    onPress={() => setSelectedTime(time)}
                  >
                    <Text style={{ color: theme.colors.outline }}>+</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Модалка вибору задачі */}
      <Portal>
        <Modal 
          visible={!!selectedTime} 
          onDismiss={() => setSelectedTime(null)}
          contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.elevation.level3 }]}
        >
          <Text variant="titleLarge" style={{ marginBottom: 16 }}>
            Що робимо о {selectedTime}?
          </Text>
          
          <FlatList
            data={availableTasks}
            keyExtractor={item => item.id}
            style={{ maxHeight: 400 }}
            renderItem={({ item }) => (
              <>
                <TouchableOpacity onPress={() => handleAssign(item)} style={styles.taskOption}>
                  <Text variant="bodyLarge">{item.title}</Text>
                  {(item.isUrgent || item.isImportant) && (
                    <Text>{item.isUrgent ? '🔥' : ''}{item.isImportant ? '⭐' : ''}</Text>
                  )}
                </TouchableOpacity>
                <Divider />
              </>
            )}
            ListEmptyComponent={
              <Text style={{ textAlign: 'center', padding: 20, opacity: 0.5 }}>
                Немає активних задач. Створи їх у "Вхідних"!
              </Text>
            }
          />
          
          <Button onPress={() => setSelectedTime(null)} style={{ marginTop: 10 }}>
            Скасувати
          </Button>
        </Modal>
      </Portal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 16, paddingBottom: 8 },
  scrollContent: { padding: 16 },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    minHeight: 50,
  },
  slotContainer: { flex: 1 },
  emptySlot: {
    flex: 1,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    height: 45,
  },
  taskCard: {
    borderRadius: 12,
  },
  cardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12,
    paddingRight: 4,
    height: 45,
  },
  modal: {
    margin: 20,
    padding: 20,
    borderRadius: 20,
  },
  taskOption: {
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  }
});