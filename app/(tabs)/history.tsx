import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  FlatList,
  Image,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAtom } from 'jotai';
import { historyAtom, FoodAnalysis, MealType } from '@/atoms/analysis';
import { useState, useMemo, useRef, useEffect } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

// Helper function to generate date range
const generateDateRange = (days: number = 14) => {
  const dates = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    dates.push(date);
  }
  
  return dates;
};

// Date Picker Component
const HorizontalDatePicker = ({ selectedDate, onDateSelect }: {
  selectedDate: Date | null;
  onDateSelect: (date: Date | null) => void;
}) => {
  const dates = generateDateRange(14);
  const flatListRef = useRef<FlatList>(null);
  
  const formatDay = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };
  
  const formatDate = (date: Date) => {
    return date.getDate().toString().padStart(2, '0');
  };
  
  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };
  
  const isSelected = (date: Date) => {
    return selectedDate?.toDateString() === date.toDateString();
  };
  
  const renderDateItem = ({ item: date }: { item: Date }) => {
    const selected = isSelected(date);
    const today = isToday(date);
    
    return (
      <TouchableOpacity
        style={[
          styles.dateItem,
          selected && styles.dateItemSelected,
          today && !selected && styles.dateItemToday,
        ]}
        onPress={() => onDateSelect(date)}
      >
        <Text style={[
          styles.dayText,
          selected && styles.dayTextSelected,
          today && !selected && styles.dayTextToday,
        ]}>
          {formatDay(date)}
        </Text>
        <Text style={[
          styles.dateText,
          selected && styles.dateTextSelected,
          today && !selected && styles.dateTextToday,
        ]}>
          {formatDate(date)}
        </Text>
        {today && (
          <View style={[
            styles.todayIndicator,
            selected && styles.todayIndicatorSelected,
          ]} />
        )}
      </TouchableOpacity>
    );
  };

  // Auto scroll to selected date
  useEffect(() => {
    if (selectedDate && flatListRef.current) {
      const selectedIndex = dates.findIndex(date => 
        date.toDateString() === selectedDate.toDateString()
      );
      if (selectedIndex !== -1) {
        setTimeout(() => {
          flatListRef.current?.scrollToIndex({
            index: selectedIndex,
            animated: true,
            viewPosition: 0.5,
          });
        }, 100);
      }
    }
  }, [selectedDate, dates]);
  
  return (
    <View style={styles.datePickerContainer}>
      <FlatList
        ref={flatListRef}
        data={dates}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(date) => date.toISOString()}
        contentContainerStyle={styles.datesList}
        renderItem={renderDateItem}
        snapToInterval={58}
        decelerationRate="fast"
        snapToAlignment="center"
        getItemLayout={(data, index) => ({
          length: 58,
          offset: 58 * index,
          index,
        })}
      />
    </View>
  );
};

export default function History() {
  const router = useRouter();
  const [history] = useAtom(historyAtom);
  const [selectedFilter, setSelectedFilter] = useState<'All' | MealType>('All');
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const filteredHistory = useMemo(() => {
    let filtered = history;
    
    // Filter by meal type
    if (selectedFilter !== 'All') {
      filtered = filtered.filter(meal => meal.mealType === selectedFilter);
    }
    
    // Filter by selected date
    if (selectedDate) {
      filtered = filtered.filter(meal => {
        const mealDate = new Date(meal.timestamp);
        return mealDate.toDateString() === selectedDate.toDateString();
      });
    }
    
    return filtered;
  }, [history, selectedFilter, selectedDate]);

  const groupedHistory = useMemo(() => {
    const grouped: { [key: string]: FoodAnalysis[] } = {};
    
    filteredHistory.forEach(meal => {
      const date = new Date(meal.timestamp);
      const dateKey = date.toDateString();
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(meal);
    });

    // Sort by date (newest first)
    const sortedEntries = Object.entries(grouped).sort(([dateA], [dateB]) => 
      new Date(dateB).getTime() - new Date(dateA).getTime()
    );

    return sortedEntries;
  }, [filteredHistory]);

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today's Meals";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday's Meals";
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      });
    }
  };

  const getMealTypeColor = (mealType?: MealType) => {
    switch (mealType) {
      case 'Breakfast':
        return '#FEF3C7'; // Light yellow
      case 'Lunch':
        return '#DBEAFE'; // Light blue
      case 'Dinner':
        return '#FCE7F3'; // Light pink
      case 'Snack':
        return '#D1FAE5'; // Light green
      default:
        return '#F3F4F6'; // Light gray
    }
  };

  const getMealTypeTextColor = (mealType?: MealType) => {
    switch (mealType) {
      case 'Breakfast':
        return '#F59E0B'; // Yellow
      case 'Lunch':
        return '#3B82F6'; // Blue
      case 'Dinner':
        return '#EC4899'; // Pink
      case 'Snack':
        return '#10B981'; // Green
      default:
        return '#6B7280'; // Gray
    }
  };

  const renderMealCard = ({ item }: { item: FoodAnalysis }) => {
    // Extract location from notes
    const notes = item.notes || '';
    const locationMatch = notes.match(/📍 (\w+)\n?/);
    const location = locationMatch ? locationMatch[1] : null;
    const notesWithoutLocation = notes.replace(/📍 \w+\n?/, '').trim();

    return (
      <TouchableOpacity 
        style={styles.mealCard}
        onPress={() => router.push(`/food-detail?id=${item.id}&source=history`)}
      >
        <View style={styles.cardContent}>
          <View style={styles.cardLeft}>
            <Text style={styles.mealName}>{item.identifiedFood}</Text>
            
            <View style={styles.tagsContainer}>
              <View style={[
                styles.mealTypeBadge, 
                { backgroundColor: getMealTypeColor(item.mealType) }
              ]}>
                <Text style={[
                  styles.mealTypeText,
                  { color: getMealTypeTextColor(item.mealType) }
                ]}>
                  {item.mealType || 'Unknown'}
                </Text>
              </View>
              
              {location && (
                <View style={styles.locationBadge}>
                  <Ionicons name="location" size={12} color="#8B5CF6" />
                  <Text style={styles.locationText}>
                    {location.charAt(0).toUpperCase() + location.slice(1)}
                  </Text>
                </View>
              )}
            </View>

            {notesWithoutLocation && (
              <Text style={styles.notesText} numberOfLines={2}>
                {notesWithoutLocation}
              </Text>
            )}

          <View style={styles.nutritionContainer}>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionLabel}>Calories</Text>
              <Text style={styles.nutritionValue}>{item.nutritionFactsPerPortion.calories}</Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionLabel}>Protein</Text>
              <Text style={styles.nutritionValue}>{item.nutritionFactsPerPortion.protein}</Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionLabel}>Carbs</Text>
              <Text style={styles.nutritionValue}>{item.nutritionFactsPerPortion.carbs}</Text>
            </View>
          </View>
        </View>

        <View style={styles.cardRight}>
          <Text style={styles.timeText}>{formatTime(item.timestamp)}</Text>
          {item.image && (
            <Image source={{ uri: item.image }} style={styles.mealImage} />
          )}
        </View>
      </View>
    </TouchableOpacity>
    );
  };

  const renderDateSection = ({ item }: { item: [string, FoodAnalysis[]] }) => {
    const [dateString, meals] = item;
    
    return (
      <View style={styles.dateSection}>
        <View style={styles.dateSectionHeader}>
          <Text style={styles.dateHeaderText}>{formatDate(dateString)}</Text>
        </View>
        
        <FlatList
          data={meals}
          renderItem={renderMealCard}
          keyExtractor={(meal) => meal.id}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  };

  const filterButtons: ('All' | MealType)[] = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Snack'];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <View style={styles.header}>
        <Text style={styles.title}>Meal History</Text>
        <Text style={styles.subtitle}>Track your nutritional journey</Text>
      </View>

      {/* Date Picker */}
      <HorizontalDatePicker
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate}
      />

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <FlatList
          data={filterButtons}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterButton,
                selectedFilter === item && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedFilter(item)}
            >
              <Text style={[
                styles.filterText,
                selectedFilter === item && styles.filterTextActive,
              ]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {filteredHistory.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="restaurant" size={80} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>No meals found</Text>
          <Text style={styles.emptySubtitle}>
            Try selecting a different date or filter, or add a new meal
          </Text>
          <TouchableOpacity 
            style={styles.addMealButtonContainer}
            onPress={() => router.push('/camera')}
          >
            <LinearGradient
              colors={['#F472B6', '#FB923C']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.addMealButton}
            >
              <Ionicons name="camera" size={20} color="#FFFFFF" />
              <Text style={styles.addMealButtonText}>Add New Meal</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={groupedHistory}
          renderItem={renderDateSection}
          keyExtractor={([dateString]) => dateString}
          contentContainerStyle={styles.historyList}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  filterContainer: {
    paddingBottom: 16,
  },
  filterList: {
    paddingHorizontal: 24,
    gap: 12,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterButtonActive: {
    backgroundColor: '#F472B6',
    borderColor: '#F472B6',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  historyList: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  dateSection: {
    marginBottom: 24,
  },
  dateSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  dateHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  mealCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardContent: {
    flexDirection: 'row',
    padding: 16,
  },
  cardLeft: {
    flex: 1,
    paddingRight: 12,
  },
  cardRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    minHeight: 100,
  },
  mealName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  mealTypeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  mealTypeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: '#F3E8FF',
    borderWidth: 1,
    borderColor: '#8B5CF6',
    gap: 4,
  },
  locationText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  notesText: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
    marginBottom: 12,
    lineHeight: 20,
  },
  nutritionContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  nutritionValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  timeText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  mealImage: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 24,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  addMealButtonContainer: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  addMealButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    gap: 8,
  },
  addMealButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  datePickerContainer: {
    marginHorizontal: 24,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  datesList: {
    gap: 8,
  },
  dateItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 70,
    borderRadius: 25,
          backgroundColor: '#F8FAFC',
      position: 'relative',
  },
  dateItemSelected: {
    backgroundColor: '#8B5CF6',
  },
  dateItemToday: {
    backgroundColor: '#EDE9FE',
    borderWidth: 2,
    borderColor: '#8B5CF6',
  },
  dayText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 4,
  },
  dayTextSelected: {
    color: '#FFFFFF',
  },
  dayTextToday: {
    color: '#8B5CF6',
  },
  dateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  dateTextSelected: {
    color: '#FFFFFF',
  },
  dateTextToday: {
    color: '#8B5CF6',
  },
  todayIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#8B5CF6',
    position: 'absolute',
    bottom: 8,
  },
  todayIndicatorSelected: {
    backgroundColor: '#FFFFFF',
  },
}); 