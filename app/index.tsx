import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAtom } from 'jotai';
import { historyAtom } from '@/atoms/analysis';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function Index() {
  const router = useRouter();
  const [history] = useAtom(historyAtom);



  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning! 🌸';
    if (hour < 18) return 'Good afternoon! ☀️';
    return 'Good evening! 🌙';
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getTodayMealsCount = () => {
    const today = new Date().toDateString();
    return history.filter(meal => 
      new Date(meal.timestamp).toDateString() === today
    ).length;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.mainContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greetingText}>{getGreeting()}</Text>
          <Text style={styles.dateText}>{formatDate(new Date())}</Text>
        </View>

        {/* Stats Card */}
        <View style={styles.statsCard}>
          <Text style={styles.statsNumber}>{getTodayMealsCount()}</Text>
          <Text style={styles.statsLabel}>meals logged today</Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.quickActionCard}
            onPress={() => router.push('/camera')}
          >
            <LinearGradient
              colors={['#F472B6', '#FB923C']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.quickActionGradient}
            >
              <Ionicons name="camera" size={32} color="#FFFFFF" />
              <Text style={styles.quickActionTitle}>Add Meal</Text>
              <Text style={styles.quickActionSubtitle}>Take a photo to analyze</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.quickActionCard}
            onPress={() => router.push('/history')}
          >
            <View style={styles.quickActionContent}>
              <Ionicons name="time" size={32} color="#F472B6" />
              <Text style={styles.quickActionTitleSecondary}>View History</Text>
              <Text style={styles.quickActionSubtitleSecondary}>See all your meals</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Today's Meals Preview */}
        <View style={styles.todayPreviewCard}>
          <View style={styles.todayPreviewHeader}>
            <Text style={styles.todayPreviewTitle}>Today's Meals</Text>
            <TouchableOpacity onPress={() => router.push('/history')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {history.filter(meal => 
            new Date(meal.timestamp).toDateString() === new Date().toDateString()
          ).length === 0 ? (
            <View style={styles.emptyTodayContainer}>
              <Text style={styles.emptyTodayText}>No meals logged today</Text>
              <Text style={styles.emptyTodaySubtext}>Start by taking a photo of your meal</Text>
            </View>
          ) : (
            <View style={styles.todayMealsList}>
              {history
                .filter(meal => 
                  new Date(meal.timestamp).toDateString() === new Date().toDateString()
                )
                .slice(0, 3)
                .map((meal, index) => (
                  <TouchableOpacity 
                    key={meal.id} 
                    style={styles.todayMealItem}
                    onPress={() => router.push(`/food-detail?id=${meal.id}&source=home`)}
                  >
                    <View style={styles.mealItemLeft}>
                      <Text style={styles.mealItemName}>{meal.identifiedFood}</Text>
                      <Text style={styles.mealItemType}>{meal.mealType}</Text>
                    </View>
                    <Text style={styles.mealItemTime}>
                      {new Date(meal.timestamp).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                      })}
                    </Text>
                  </TouchableOpacity>
                ))
              }
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  greetingText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statsNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#F472B6',
    marginBottom: 8,
  },
  statsLabel: {
    fontSize: 16,
    color: '#6B7280',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  quickActionCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  quickActionGradient: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  quickActionContent: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 8,
    marginBottom: 4,
  },
  quickActionSubtitle: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'center',
  },
  quickActionTitleSecondary: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 8,
    marginBottom: 4,
  },
  quickActionSubtitleSecondary: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  todayPreviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  todayPreviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  todayPreviewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F472B6',
  },
  emptyTodayContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyTodayText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 4,
  },
  emptyTodaySubtext: {
    fontSize: 14,
    color: '#D1D5DB',
  },
  todayMealsList: {
    gap: 12,
  },
  todayMealItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  mealItemLeft: {
    flex: 1,
  },
  mealItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  mealItemType: {
    fontSize: 12,
    color: '#F472B6',
    fontWeight: '500',
  },
  mealItemTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});
