import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAtomValue, useAtom } from 'jotai';
import { analysisAtom, historyAtom, MealType } from '@/atoms/analysis';

type LocationType = 'home' | 'work' | 'restaurant' | 'event';
import { Ionicons } from '@expo/vector-icons';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import ConfettiCannon from 'react-native-confetti-cannon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


const Page = () => {
  const analysis = useAtomValue(analysisAtom);
  const [history, setHistory] = useAtom(historyAtom);
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();

  const [mealType, setMealType] = useState<MealType | undefined>();
  const [location, setLocation] = useState<LocationType | undefined>();
  const [notes, setNotes] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const handleSave = () => {
    if (!analysis) return;
    const newEntry = {
      ...analysis,
      id: Date.now().toString(),
      timestamp: Date.now(),
      mealType,
      notes: `${location ? `📍 ${location.charAt(0).toUpperCase() + location.slice(1)}\n` : ''}${notes}`,
    };
    setHistory([newEntry, ...history]);
    
    // Trigger celebration effect
    setShowCelebration(true);
    setShowSuccessMessage(true);
    
    // Hide celebration after 3 seconds and navigate back
    setTimeout(() => {
      setShowCelebration(false);
      setShowSuccessMessage(false);
      router.back();
    }, 3000);
  };

  const handleNotesFocus = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 300);
  };



  if (!analysis) return null;

  const getMealTypeIcon = (type: MealType) => {
    switch (type) {
      case 'Breakfast':
        return 'sunny-outline';
      case 'Lunch':
        return 'restaurant-outline';
      case 'Dinner':
        return 'moon-outline';
      case 'Snack':
        return 'ice-cream-outline';
      default:
        return 'restaurant-outline';
    }
  };

  const getMealTypeColor = (type: MealType, selected: boolean) => {
    if (!selected) return '#FFFFFF';
    
    switch (type) {
      case 'Breakfast':
        return '#FEF3C7';
      case 'Lunch':
        return '#DBEAFE';
      case 'Dinner':
        return '#FCE7F3';
      case 'Snack':
        return '#D1FAE5';
      default:
        return '#F3F4F6';
    }
  };

  const getMealTypeTextColor = (type: MealType, selected: boolean) => {
    if (!selected) return '#6B7280';
    
    switch (type) {
      case 'Breakfast':
        return '#F59E0B';
      case 'Lunch':
        return '#3B82F6';
      case 'Dinner':
        return '#EC4899';
      case 'Snack':
        return '#10B981';
      default:
        return '#6B7280';
    }
  };

  const getMealTypeBorderColor = (type: MealType) => {
    switch (type) {
      case 'Breakfast':
        return '#F59E0B';
      case 'Lunch':
        return '#3B82F6';
      case 'Dinner':
        return '#EC4899';
      case 'Snack':
        return '#10B981';
      default:
        return '#E5E7EB';
    }
  };

  const getLocationIcon = (type: LocationType) => {
    switch (type) {
      case 'home':
        return 'home-outline';
      case 'work':
        return 'briefcase-outline';
      case 'restaurant':
        return 'storefront-outline';
      case 'event':
        return 'calendar-outline';
      default:
        return 'location-outline';
    }
  };

  const getLocationColor = (type: LocationType, selected: boolean) => {
    if (!selected) return '#FFFFFF';
    
    switch (type) {
      case 'home':
        return '#DBEAFE';
      case 'work':
        return '#F3E8FF';
      case 'restaurant':
        return '#FEF3C7';
      case 'event':
        return '#FCE7F3';
      default:
        return '#F3F4F6';
    }
  };

  const getLocationTextColor = (type: LocationType, selected: boolean) => {
    if (!selected) return '#6B7280';
    
    switch (type) {
      case 'home':
        return '#3B82F6';
      case 'work':
        return '#8B5CF6';
      case 'restaurant':
        return '#F59E0B';
      case 'event':
        return '#EC4899';
      default:
        return '#6B7280';
    }
  };

  const getLocationBorderColor = (type: LocationType) => {
    switch (type) {
      case 'home':
        return '#3B82F6';
      case 'work':
        return '#8B5CF6';
      case 'restaurant':
        return '#F59E0B';
      case 'event':
        return '#EC4899';
      default:
        return '#E5E7EB';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="#1F2937" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Log Meal</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <KeyboardAvoidingView 
        style={styles.contentContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
      >
        <ScrollView 
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Food Image */}
          <View style={styles.imageContainer}>
            <Image source={{ uri: analysis.image }} style={styles.image} />
          </View>
          
          <View style={styles.content}>
            {/* Food Name */}
            <View style={styles.foodNameSection}>
              <Text style={styles.foodLabel}>Food Detected:</Text>
              <Text style={styles.foodName}>{analysis.identifiedFood}</Text>
            </View>

            {/* Meal Type Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Type of meal *</Text>
              <View style={styles.mealTypeContainer}>
                {(['Breakfast', 'Lunch', 'Dinner', 'Snack'] as MealType[]).map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.mealTypeTag,
                      { 
                        backgroundColor: getMealTypeColor(type, mealType === type),
                        borderColor: getMealTypeBorderColor(type),
                        borderWidth: 1
                      }
                    ]}
                    onPress={() => setMealType(type)}
                  >
                    <Ionicons 
                      name={getMealTypeIcon(type) as any} 
                      size={18} 
                      color={getMealTypeTextColor(type, mealType === type)}
                      style={{ marginRight: 8 }}
                    />
                    <Text style={[
                      styles.mealTypeText,
                      { color: getMealTypeTextColor(type, mealType === type) }
                    ]}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Where to Eat Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Where to eat?</Text>
              <View style={styles.mealTypeContainer}>
                {(['home', 'work', 'restaurant', 'event'] as LocationType[]).map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.mealTypeTag,
                      { 
                        backgroundColor: getLocationColor(type, location === type),
                        borderColor: getLocationBorderColor(type),
                        borderWidth: 1
                      }
                    ]}
                    onPress={() => setLocation(type)}
                  >
                                         <Ionicons 
                       name={getLocationIcon(type) as any} 
                       size={18} 
                       color={getLocationTextColor(type, location === type)}
                       style={{ marginRight: 8 }}
                     />
                    <Text style={[
                      styles.mealTypeText,
                      { color: getLocationTextColor(type, location === type) }
                    ]}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Date & Time */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Date & Time</Text>
              <View style={styles.dateTimeInfo}>
                <View style={styles.dateTimeDisplay}>
                  <Ionicons name="calendar-outline" size={20} color="#F472B6" />
                  <Text style={styles.dateTimeText}>
                    Today ({new Date().toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })})
                  </Text>
                </View>
                
                <View style={styles.dateTimeDisplay}>
                  <Ionicons name="time-outline" size={20} color="#F472B6" />
                  <Text style={styles.dateTimeText}>
                    {new Date().toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true,
                    })}
                  </Text>
                </View>
              </View>
            </View>

            {/* Nutrition Info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Nutrition Facts</Text>
              <View style={styles.nutritionGrid}>
                <View style={styles.nutritionCard}>
                  <Text style={styles.nutritionLabel}>Calories</Text>
                  <Text style={styles.nutritionValue}>{analysis.nutritionFactsPerPortion.calories}</Text>
                </View>
                <View style={styles.nutritionCard}>
                  <Text style={styles.nutritionLabel}>Protein</Text>
                  <Text style={styles.nutritionValue}>{analysis.nutritionFactsPerPortion.protein}</Text>
                </View>
                <View style={styles.nutritionCard}>
                  <Text style={styles.nutritionLabel}>Carbs</Text>
                  <Text style={styles.nutritionValue}>{analysis.nutritionFactsPerPortion.carbs}</Text>
                </View>
                <View style={styles.nutritionCard}>
                  <Text style={styles.nutritionLabel}>Fat</Text>
                  <Text style={styles.nutritionValue}>{analysis.nutritionFactsPerPortion.fat}</Text>
                </View>
              </View>
            </View>

            {/* AI Additional Notes */}
            {analysis.additionalNotes && analysis.additionalNotes.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>AI Analysis</Text>
                <View style={styles.aiNotesContainer}>
                  {analysis.additionalNotes.map((note, index) => (
                    <View key={index} style={styles.aiNoteItem}>
                      <Ionicons name="bulb-outline" size={16} color="#F59E0B" />
                      <Text style={styles.aiNoteText}>{note}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Personal Notes */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Personal Notes</Text>
              <TextInput
                style={styles.notesInput}
                multiline
                placeholder="Add your personal notes about this meal..."
                placeholderTextColor="#9CA3AF"
                value={notes}
                onChangeText={setNotes}
                onFocus={handleNotesFocus}
                textAlignVertical="top"
                returnKeyType="done"
                blurOnSubmit={true}
              />
            </View>
            
            {/* Bottom spacing for the fixed button */}
            <View style={styles.bottomSpacing} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Fixed Bottom Save Button - Outside KeyboardAvoidingView */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <View style={[styles.bottomButtonContainer, { 
          paddingBottom: 16 + Math.max(insets.bottom, 0),
          marginBottom: -Math.max(insets.bottom, 0),
        }]}>
          <TouchableOpacity 
            style={[styles.saveButtonContainer, !mealType && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={!mealType}
          >
            <LinearGradient
              colors={!mealType ? ['#D1D5DB', '#D1D5DB'] : ['#F472B6', '#FB923C']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.saveButton}
            >
              <Ionicons 
                name="checkmark-circle" 
                size={24} 
                color={!mealType ? '#9CA3AF' : '#FFFFFF'} 
              />
              <Text style={[styles.saveButtonText, !mealType && styles.saveButtonTextDisabled]}>
                Save Food Log
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Confetti Celebration */}
      {showCelebration && (
        <ConfettiCannon
          count={150}
          origin={{ x: -10, y: 0 }}
          explosionSpeed={350}
          fallSpeed={3000}
          fadeOut={true}
          colors={['#F472B6', '#FB923C', '#FBBF24', '#34D399', '#60A5FA', '#A78BFA']}
        />
      )}

      {/* Success Message Overlay */}
      {showSuccessMessage && (
        <View style={styles.successOverlay}>
          <View style={styles.successCard}>
            <Ionicons name="checkmark-circle" size={60} color="#10B981" />
            <Text style={styles.successTitle}>Meal Logged Successfully! 🎉</Text>
            <Text style={styles.successMessage}>Your food intake has been saved to your history.</Text>
          </View>
        </View>
      )}

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  backButtonText: {
    color: '#1F2937',
    fontSize: 16,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 2,
    textAlign: 'center',
  },
  headerSpacer: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  imageContainer: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  foodNameSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  foodLabel: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
  },
  foodName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  mealTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  mealTypeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 28,
    borderWidth: 1.5,
    minHeight: 50,
  },
  mealTypeText: {
    fontSize: 15,
    fontWeight: '600',
  },
  dateTimeInfo: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  dateTimeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dateTimeText: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  nutritionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    minWidth: 80,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  nutritionLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  nutritionValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  aiNotesContainer: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
  },
  aiNoteItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 8,
  },
  aiNoteText: {
    flex: 1,
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
  notesInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minHeight: 120,
    maxHeight: 200,
    textAlignVertical: 'top',
  },
  bottomSpacing: {
    height: 50, // Reduced space since button is no longer absolute
  },
  bottomButtonContainer: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  saveButtonContainer: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    gap: 12,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  saveButtonTextDisabled: {
    color: '#9CA3AF',
  },
  successOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  successCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    margin: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },

});

export default Page;
