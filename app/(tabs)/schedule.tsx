import React, { useEffect, useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { Text, useTheme, Portal, Modal, Button, Divider, IconButton, SegmentedButtons } from 'react-native-paper';
import { useTaskStore } from '../../src/store/useTaskStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Task, Category } from '../../src/db/schema';

// --- HELPERS ---
const START_HOUR = 8;
const END_HOUR = 22;
const HOURS = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => `${i + START_HOUR}:00`);

// Форматування дати у рядок YYYY-MM-DD для БД
const formatDateKey = (date: Date) => {
  return date.toISOString().split('T')[0];
};

// Форматування для заголовка (напр. "Пн, 12 січ")
const formatDateHeader = (date: Date) => {
  return date.toLocaleDateString('uk-UA', { weekday: 'short', day: 'numeric', month: 'short' });
};

const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export default function ScheduleScreen() {
  const theme = useTheme();
  const { tasks, timeBlocks, categories, fetchTimeBlocks, assignTaskToTime, removeFromSchedule } = useTaskStore();
  
  // Стан: вибраний режим (1 день або 3 дні)
  const [viewMode, setViewMode] = useState<'day' | '3day'>('day');
  // Стан: базова дата (перший день відображення)
  const [baseDate, setBaseDate] = useState(new Date());

  // Стан для модалки вибору задачі
  const [selection, setSelection] = useState<{ time: string, dateKey: string } | null>(null);

  useEffect(() => {
    fetchTimeBlocks();
  }, []);

  // Обчислюємо дні, які треба показати
  const displayDates = useMemo(() => {
    const daysToShow = viewMode === 'day' ? 1 : 3;
    return Array.from({ length: daysToShow }, (_, i) => addDays(baseDate, i));
  }, [baseDate, viewMode]);

  const activeTasks = tasks.filter(t => !t.isCompleted);

  const handleAssign = async (task: Task) => {
    if (selection) {
      await assignTaskToTime(task.id, selection.time, selection.dateKey);
      setSelection(null);
    }
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const shift = viewMode === 'day' ? 1 : 3;
    setBaseDate(prev => addDays(prev, direction === 'next' ? shift : -shift));
  };

  const jumpToToday = () => setBaseDate(new Date());

  // --- КОМПОНЕНТИ ---

  // Блок події
  const EventBlock = ({ task, blockId, isCompact }: { task: Task, blockId: string, isCompact: boolean }) => {
    const category = categories.find((c: Category) => c.id === task.categoryId);
    const bgColor = category ? category.color : theme.colors.primary;
    
    return (
      <View style={[styles.eventBlock, { backgroundColor: bgColor + '25', borderLeftColor: bgColor }]}>
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Text 
            variant="labelSmall" 
            style={{ fontWeight: 'bold', color: theme.colors.onSurface }} 
            numberOfLines={1}
          >
            {task.title}
          </Text>
        </View>
        {!isCompact && (
          <IconButton 
            icon="close" 
            size={14} 
            onPress={() => removeFromSchedule(blockId)}
            style={{ margin: 0, width: 20, height: 20 }}
          />
        )}
      </View>
    );
  };

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: theme.colors.background }]}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <Text variant="headlineSmall" style={{ fontWeight: 'bold' }}>Розклад</Text>
          <Button mode="text" onPress={jumpToToday} compact>Сьогодні</Button>
        </View>
        
        <View style={styles.controlsRow}>
          <View style={styles.navContainer}>
            <IconButton icon="chevron-left" onPress={() => navigateDate('prev')} />
            <Text variant="titleMedium" style={{ fontWeight: '600' }}>
              {displayDates[0].toLocaleDateString('uk-UA', { month: 'long', year: 'numeric' })}
            </Text>
            <IconButton icon="chevron-right" onPress={() => navigateDate('next')} />
          </View>

          <SegmentedButtons
            value={viewMode}
            onValueChange={val => setViewMode(val as 'day' | '3day')}
            buttons={[
              { value: 'day', label: '1 День' },
              { value: '3day', label: '3 Дні' },
            ]}
            style={{ flex: 1, maxWidth: 150 }}
            density="small"
          />
        </View>
      </View>

      {/* GRID HEADER (Дні тижня) */}
      <View style={styles.gridHeaderRow}>
        <View style={styles.timeColumnHeader} /> 
        {displayDates.map((date) => {
          const isToday = formatDateKey(date) === formatDateKey(new Date());
          return (
            <View key={date.toString()} style={styles.dayHeaderColumn}>
              <Text 
                variant="labelMedium" 
                style={{ 
                  color: isToday ? theme.colors.primary : theme.colors.onSurface,
                  fontWeight: isToday ? 'bold' : 'normal'
                }}
              >
                {formatDateHeader(date)}
              </Text>
            </View>
          );
        })}
      </View>

      {/* SCROLLABLE GRID */}
      <ScrollView style={styles.scrollView}>
        {HOURS.map((time, index) => {
          const isLast = index === HOURS.length - 1;

          return (
            <View key={time} style={styles.timeRow}>
              {/* Колонка часу */}
              <View style={styles.timeLabelContainer}>
                <Text variant="labelSmall" style={{ color: theme.colors.outline, top: -6 }}>
                  {time}
                </Text>
              </View>

              {/* Колонки днів */}
              <View style={styles.daysContainer}>
                {/* Горизонтальна лінія на всю ширину */}
                <View style={[styles.gridLine, { backgroundColor: theme.colors.outlineVariant }]} />
                
                {!isLast && (
                   <View style={styles.rowContent}>
                     {displayDates.map((date) => {
                       const dateKey = formatDateKey(date);
                       // Шукаємо блок для конкретної дати і часу
                       const block = timeBlocks.find(b => b.startTime === time && b.date === dateKey);
                       const task = block ? tasks.find(t => t.id === block.taskId) : null;
                       
                       return (
                         <View key={dateKey} style={styles.dayColumn}>
                            {/* Вертикальний розділювач між днями */}
                            <View style={[styles.verticalLine, { backgroundColor: theme.colors.outlineVariant + '40' }]} />
                            
                            <View style={styles.slotCell}>
                              {task && block ? (
                                <TouchableOpacity 
                                  style={{ flex: 1 }} 
                                  onLongPress={() => removeFromSchedule(block.id)} // Довгий тап для видалення в 3-денному режимі
                                >
                                  <EventBlock 
                                    task={task} 
                                    blockId={block.id} 
                                    isCompact={viewMode === '3day'} 
                                  />
                                </TouchableOpacity>
                              ) : (
                                <TouchableOpacity 
                                  style={styles.emptySlot} 
                                  onPress={() => setSelection({ time, dateKey })}
                                />
                              )}
                            </View>
                         </View>
                       );
                     })}
                   </View>
                )}
              </View>
            </View>
          );
        })}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* МОДАЛКА ВИБОРУ */}
      <Portal>
        <Modal 
          visible={!!selection} 
          onDismiss={() => setSelection(null)}
          contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.elevation.level3 }]}
        >
          <Text variant="titleLarge" style={{ marginBottom: 16 }}>
            Додати задачу
            {selection && `\n${selection.time}, ${selection.dateKey}`}
          </Text>
          
          <FlatList
            data={activeTasks}
            keyExtractor={item => item.id}
            style={{ maxHeight: 400 }}
            renderItem={({ item }) => {
              const cat = categories.find(c => c.id === item.categoryId);
              return (
                <>
                  <TouchableOpacity onPress={() => handleAssign(item)} style={styles.taskOption}>
                    <View style={{ flex: 1 }}>
                      <Text variant="bodyLarge">{item.title}</Text>
                      {cat && <Text style={{ fontSize: 10, color: cat.color }}>{cat.name}</Text>}
                    </View>
                    {(item.isUrgent || item.isImportant) && (
                      <Text>{item.isUrgent ? '🔥' : ''}{item.isImportant ? '⭐' : ''}</Text>
                    )}
                  </TouchableOpacity>
                  <Divider />
                </>
              );
            }}
            ListEmptyComponent={
              <Text style={{ padding: 20, textAlign: 'center', opacity: 0.5 }}>Немає активних задач</Text>
            }
          />
          <Button onPress={() => setSelection(null)} style={{ marginTop: 10 }}>Скасувати</Button>
        </Modal>
      </Portal>

    </SafeAreaView>
  );
}

const ROW_HEIGHT = 60;
const TIME_COL_WIDTH = 50;

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 10, paddingBottom: 5 },
  headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  controlsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  navContainer: { flexDirection: 'row', alignItems: 'center' },
  
  gridHeaderRow: { flexDirection: 'row', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
  timeColumnHeader: { width: TIME_COL_WIDTH },
  dayHeaderColumn: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  
  scrollView: { flex: 1 },
  timeRow: { flexDirection: 'row', height: ROW_HEIGHT },
  timeLabelContainer: { width: TIME_COL_WIDTH, alignItems: 'center' },
  
  daysContainer: { flex: 1, position: 'relative', flexDirection: 'row' },
  rowContent: { flexDirection: 'row', flex: 1, height: '100%', marginTop: 1 },
  
  dayColumn: { flex: 1, position: 'relative' },
  verticalLine: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 1 },
  slotCell: { flex: 1, padding: 2 },
  
  gridLine: { position: 'absolute', top: 0, left: 0, right: 0, height: 1, zIndex: 10 },
  
  emptySlot: { flex: 1 },
  eventBlock: {
    flex: 1,
    borderRadius: 4,
    borderLeftWidth: 3,
    paddingHorizontal: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  modal: { margin: 20, padding: 20, borderRadius: 20 },
  taskOption: { paddingVertical: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }
});