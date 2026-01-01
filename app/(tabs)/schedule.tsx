import React, { useEffect, useState, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert, FlatList } from 'react-native';
import { Text, useTheme, Portal, Modal, Button, SegmentedButtons, Divider } from 'react-native-paper';
import { Calendar } from 'react-native-big-calendar';
import dayjs from 'dayjs';
import 'dayjs/locale/uk';
// 👇 1. Імпортуємо плагін для оновлення налаштувань локалі
import updateLocale from 'dayjs/plugin/updateLocale';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTaskStore } from '../../src/store/useTaskStore';
import type { Task, Category } from '../../src/db/schema';

// 👇 2. Налаштовуємо понеділок як перший день тижня
dayjs.extend(updateLocale);
dayjs.locale('uk');
dayjs.updateLocale('uk', {
  weekStart: 1, // 1 = Понеділок (0 = Неділя)
});

export default function ScheduleScreen() {
  const theme = useTheme();
  const { tasks, timeBlocks, categories, fetchTimeBlocks, assignTaskToTime, removeFromSchedule } = useTaskStore();
  
  const [mode, setMode] = useState<'day' | '3days' | 'week'>('day');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selection, setSelection] = useState<{ start: Date, end: Date } | null>(null);

  useEffect(() => {
    fetchTimeBlocks();
  }, []);

  const activeTasks = tasks.filter(t => !t.isCompleted);

  const calendarEvents = useMemo(() => {
    return timeBlocks
      .map(block => {
        const task = tasks.find(t => t.id === block.taskId);
        if (!task) return null;
        const category = categories.find(c => c.id === task.categoryId);
        
        const [hourStr] = block.startTime.split(':');
        // Обережно з датами: dayjs парсить рядок YYYY-MM-DD
        const start = dayjs(block.date).hour(parseInt(hourStr)).minute(0).toDate();
        const end = dayjs(start).add(1, 'hour').toDate(); 

        return {
          title: task.title,
          start,
          end,
          color: category?.color || theme.colors.primary,
          catName: category?.name,
          id: block.id,
        };
      })
      .filter(Boolean) as any[]; 
  }, [timeBlocks, tasks, categories]);

  const handleCellPress = (start: Date, end: Date) => {
    setSelection({ start, end });
  };

  const handleEventPress = (event: any) => {
    Alert.alert(
      "Управління подією",
      `"${event.title}"\n${dayjs(event.start).format('HH:mm')} - ${dayjs(event.end).format('HH:mm')}`,
      [
        { text: "Скасувати", style: "cancel" },
        { 
          text: "Видалити", 
          style: "destructive", 
          onPress: () => removeFromSchedule(event.id) 
        }
      ]
    );
  };

  const handleAssign = async (task: Task) => {
    if (selection) {
      const dateKey = selection.start.toISOString().split('T')[0];
      const timeStr = `${selection.start.getHours()}:00`;
      await assignTaskToTime(task.id, timeStr, dateKey);
      setSelection(null);
    }
  };

  const renderEvent = (event: any, touchableOpacityProps: any) => {
    const { key, ...restProps } = touchableOpacityProps;
    return (
      <TouchableOpacity 
        key={key} 
        {...restProps} 
        style={[styles.eventContainer, { 
          backgroundColor: event.color + '25',
          borderLeftColor: event.color 
        }]}
      >
        <Text numberOfLines={1} style={[styles.eventTitle, { color: theme.colors.onSurface }]}>
          {event.title}
        </Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 }}>
          <Text style={{ fontSize: 10, color: theme.colors.outline }}>
            {dayjs(event.start).format('HH:mm')}
          </Text>
          {event.catName && (
            <Text style={{ fontSize: 10, color: event.color, fontWeight: 'bold' }}>
              {event.catName.toUpperCase()}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: theme.colors.background }]}>
      
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text variant="headlineSmall" style={{ fontWeight: 'bold' }}>Розклад</Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.secondary }}>
              {dayjs(currentDate).format('D MMMM YYYY')}
            </Text>
          </View>
          <Button mode="text" onPress={() => setCurrentDate(new Date())}>Сьогодні</Button>
        </View>

        <SegmentedButtons
          value={mode}
          onValueChange={val => setMode(val as any)}
          buttons={[
            { value: 'day', label: 'День' },
            { value: '3days', label: '3 дні' },
            { value: 'week', label: 'Тиждень' },
          ]}
          style={{ marginTop: 10 }}
          density="small"
        />
      </View>

      <View style={{ flex: 1 }}>
        <Calendar 
          events={calendarEvents} 
          height={600} 
          mode={mode} 
          date={currentDate} 
          onSwipeEnd={(date) => setCurrentDate(date)} 
          swipeEnabled={true}
          onPressCell={handleCellPress} 
          onPressEvent={handleEventPress} 
          renderEvent={renderEvent} 
          
          // 👇 3. Додаємо 'locale' проп, щоб календар точно знав, яку мову використовувати
          locale="uk" 
          
          headerContainerStyle={{ borderBottomWidth: 0, backgroundColor: theme.colors.background }}
          bodyContainerStyle={{ backgroundColor: theme.colors.background }}
          itemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: theme.colors.outlineVariant, opacity: 0.2 }} />}
          hourRowHeight={70} 
          ampm={false} 
        />
      </View>

      <Portal>
        <Modal 
          visible={!!selection} 
          onDismiss={() => setSelection(null)}
          contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.elevation.level3 }]}
        >
          <Text variant="headlineSmall" style={{ marginBottom: 16, textAlign: 'center' }}>
            Додати задачу 
          </Text>
          <Text style={{ textAlign: 'center', marginBottom: 20, color: theme.colors.secondary }}>
            {selection && `${dayjs(selection.start).format('D MMMM, HH:mm')}`}
          </Text>
          
          <FlatList
            data={activeTasks}
            keyExtractor={item => item.id}
            style={{ maxHeight: 300 }}
            renderItem={({ item }) => {
               const cat = categories.find((c: Category) => c.id === item.categoryId);
               return (
                <TouchableOpacity onPress={() => handleAssign(item)} style={styles.taskOption}>
                  <View style={{ flex: 1 }}>
                    <Text variant="bodyLarge" style={{ fontWeight: '500' }}>{item.title}</Text>
                    {cat && (
                      <Text style={{ fontSize: 11, color: cat.color }}>{cat.name}</Text>
                    )}
                  </View>
                  {(item.isUrgent || item.isImportant) && (
                    <Text style={{ fontSize: 16 }}>{item.isUrgent ? '🔥' : ''}{item.isImportant ? '⭐' : ''}</Text>
                  )}
                </TouchableOpacity>
              );
            }}
            ItemSeparatorComponent={() => <Divider style={{ marginVertical: 8 }} />}
            ListEmptyComponent={
              <Text style={{ padding: 20, textAlign: 'center', opacity: 0.5 }}>
                Немає активних задач. Створіть їх у вкладці "Вхідні".
              </Text>
            }
          />
          <Button mode="contained-tonal" onPress={() => setSelection(null)} style={{ marginTop: 20 }}>
            Скасувати
          </Button>
        </Modal>
      </Portal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    padding: 16, 
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee', 
    backgroundColor: '#fff', 
    elevation: 2, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    zIndex: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventContainer: {
    flex: 1,
    borderRadius: 6,
    borderLeftWidth: 4, 
    paddingHorizontal: 6,
    paddingVertical: 4,
    justifyContent: 'center',
    margin: 1,
  },
  eventTitle: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  modal: {
    margin: 20,
    padding: 24,
    borderRadius: 28,
  },
  taskOption: {
    paddingVertical: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  }
});