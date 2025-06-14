import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Image,
  Alert,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { useAtom } from 'jotai';
import { historyAtom, FoodAnalysis, MealType, updateFoodEntryAtom, deleteFoodEntryAtom } from '@/atoms/analysis';
import { useState, useEffect, useRef } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type LocationType = 'home' | 'work' | 'restaurant' | 'event';

export default function FoodDetail() {
  const router = useRouter();
  const { id, source } = useLocalSearchParams<{ id: string; source?: string }>();
  const [history, setHistory] = useAtom(historyAtom);
  const [, updateFoodEntry] = useAtom(updateFoodEntryAtom);
  const [, deleteFoodEntry] = useAtom(deleteFoodEntryAtom);
  const insets = useSafeAreaInsets();
  
  const [meal, setMeal] = useState<FoodAnalysis | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedNotes, setEditedNotes] = useState('');
  const [editedMealType, setEditedMealType] = useState<MealType>('Breakfast');
  const [editedLocation, setEditedLocation] = useState<LocationType | undefined>();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const notesInputRef = useRef<TextInput>(null);

  useEffect(() => {
    const foundMeal = history.find(m => m.id === id);
    if (foundMeal) {
      setMeal(foundMeal);
      // Extract location from notes if it exists
      const notes = foundMeal.notes || '';
      const locationMatch = notes.match(/📍 (\w+)\n?/);
      const location = locationMatch ? locationMatch[1].toLowerCase() as LocationType : undefined;
      const notesWithoutLocation = notes.replace(/📍 \w+\n?/, '').trim();
      
      setEditedNotes(notesWithoutLocation);
      setEditedMealType(foundMeal.mealType || 'Breakfast');
      setEditedLocation(location);
    }
  }, [id, history]);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

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

  const handleBack = () => {
    // If in edit mode, cancel edit instead of navigating away
    if (isEditing) {
      handleCancel();
      return;
    }
    
    // Navigate back to the source screen
    if (source === 'history') {
      router.push('/history');
    } else {
      router.push('/');
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!meal || isSaving) return;
    
    setIsSaving(true);
    
    try {
      const notesWithLocation = `${editedLocation ? `📍 ${editedLocation.charAt(0).toUpperCase() + editedLocation.slice(1)}\n` : ''}${editedNotes}`;
      
      const updates = {
        notes: notesWithLocation,
        mealType: editedMealType,
      };

      console.log('Updating meal:', meal.id, updates);
      
      const updatedEntry = await updateFoodEntry({
        id: meal.id,
        updates,
      });

      if (updatedEntry) {
        setMeal({ ...meal, ...updates });
        setIsEditing(false);
        Alert.alert('Success', 'Meal updated successfully!');
      } else {
        Alert.alert('Error', 'Failed to update meal. Please try again.');
      }
    } catch (error) {
      console.error('Error updating meal:', error);
      Alert.alert('Error', 'Failed to update meal. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (!meal) return;
    setIsEditing(false);
    // Reset to original values
    const notes = meal.notes || '';
    const locationMatch = notes.match(/📍 (\w+)\n?/);
    const location = locationMatch ? locationMatch[1].toLowerCase() as LocationType : undefined;
    const notesWithoutLocation = notes.replace(/📍 \w+\n?/, '').trim();
    
    setEditedNotes(notesWithoutLocation);
    setEditedMealType(meal.mealType || 'Breakfast');
    setEditedLocation(location);
  };

  const handleDelete = () => {
    if (!meal || isDeleting) return;
    
    Alert.alert(
      'Delete Meal',
      'Are you sure you want to delete this meal? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            
            try {
              console.log('Deleting meal:', meal.id);
              
              const success = await deleteFoodEntry(meal.id);
              
              if (success) {
                // Navigate back to the source screen
                if (source === 'history') {
                  router.push('/history');
                } else {
                  router.push('/');
                }
                Alert.alert('Deleted', 'Meal has been deleted successfully.');
              } else {
                Alert.alert('Error', 'Failed to delete meal. Please try again.');
              }
            } catch (error) {
              console.error('Error deleting meal:', error);
              Alert.alert('Error', 'Failed to delete meal. Please try again.');
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  const handleNotesFocus = () => {
    setTimeout(() => {
      // Get the bottom buttons height + spacing
      const bottomButtonsHeight = Platform.OS === 'ios' ? 100 : 84;
      const spacingAboveButtons = 12;
      
      notesInputRef.current?.measureInWindow((x, y, width, height) => {
        const screenHeight = Platform.OS === 'ios' ? 812 : 680; // Approximate screen heights
        const keyboardHeight = Platform.OS === 'ios' ? 291 : 280; // Approximate keyboard heights
        const availableHeight = screenHeight - keyboardHeight - bottomButtonsHeight - spacingAboveButtons;
        
        if (y + height > availableHeight) {
          const scrollAmount = (y + height) - availableHeight;
          scrollViewRef.current?.scrollTo({ 
            y: scrollAmount, 
            animated: true 
          });
        }
      });
    }, 100);
  };

  const mealTypes: MealType[] = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

  return (
    <>
      <Stack.Screen 
        options={{ 
          headerShown: false,
          tabBarStyle: { display: 'none' },
          presentation: 'modal'
        }} 
      />
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={handleBack}
            >
              <Ionicons name="chevron-back" size={24} color="#1F2937" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.headerTitle}>Meal Details</Text>
          
          <View style={styles.headerActions}>
            {!isEditing ? (
              <>
                <TouchableOpacity 
                  style={styles.headerButton}
                  onPress={handleEdit}
                >
                  <Ionicons name="create-outline" size={24} color="#F472B6" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.headerButton, isDeleting && { opacity: 0.7 }]}
                  onPress={handleDelete}
                  disabled={isDeleting}
                >
                  <Ionicons 
                    name={isDeleting ? "hourglass-outline" : "trash-outline"} 
                    size={24} 
                    color="#EF4444" 
                  />
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.headerSpacer} />
            )}
          </View>
        </View>

        {meal ? (
          <>
            <KeyboardAvoidingView 
              style={styles.contentContainer}
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
              <ScrollView 
                style={styles.scrollView} 
                contentContainerStyle={[
                  styles.scrollContent,
                  isEditing && styles.scrollContentWithPadding
                ]}
                showsVerticalScrollIndicator={false}
                ref={scrollViewRef}
              >
                {/* Food Image */}
                {meal.image && (
                  <View style={styles.imageContainer}>
                    <Image source={{ uri: meal.image }} style={styles.foodImage} />
                  </View>
                )}

                {/* Food Name */}
                <View style={styles.titleContainer}>
                  <Text style={styles.foodTitle}>{meal.identifiedFood}</Text>
                  <Text style={styles.timeText}>{formatTime(meal.timestamp)}</Text>
                </View>

                <View style={styles.content}>
                  {/* Meal Type */}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Meal Type</Text>
                    {isEditing ? (
                      <View style={styles.mealTypeContainer}>
                        {mealTypes.map(type => (
                          <TouchableOpacity
                            key={type}
                            style={[
                              styles.mealTypeTag,
                              { 
                                backgroundColor: getMealTypeColor(type, editedMealType === type),
                                borderColor: getMealTypeBorderColor(type),
                                borderWidth: 1.5
                              }
                            ]}
                            onPress={() => setEditedMealType(type)}
                          >
                            <Ionicons 
                              name={getMealTypeIcon(type) as any} 
                              size={18} 
                              color={getMealTypeTextColor(type, editedMealType === type)}
                              style={{ marginRight: 8 }}
                            />
                            <Text style={[
                              styles.mealTypeText,
                              { color: getMealTypeTextColor(type, editedMealType === type) }
                            ]}>
                              {type}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    ) : (
                      <View style={styles.mealTypeBadgeContainer}>
                        <View style={[
                          styles.mealTypeBadge, 
                          { 
                            backgroundColor: getMealTypeColor(meal.mealType || 'Breakfast', true),
                            borderColor: getMealTypeBorderColor(meal.mealType || 'Breakfast'),
                            borderWidth: 1.5
                          }
                        ]}>
                          <Ionicons 
                            name={getMealTypeIcon(meal.mealType || 'Breakfast') as any} 
                            size={18} 
                            color={getMealTypeTextColor(meal.mealType || 'Breakfast', true)}
                            style={{ marginRight: 8 }}
                          />
                          <Text style={[
                            styles.mealTypeText,
                            { color: getMealTypeTextColor(meal.mealType || 'Breakfast', true) }
                          ]}>
                            {meal.mealType || 'Unknown'}
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>

                  {/* Where to Eat Selection */}
                  {isEditing && (
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>Where to eat?</Text>
                      <View style={styles.mealTypeContainer}>
                        {(['home', 'work', 'restaurant', 'event'] as LocationType[]).map((type) => (
                          <TouchableOpacity
                            key={type}
                            style={[
                              styles.mealTypeTag,
                              { 
                                backgroundColor: getLocationColor(type, editedLocation === type),
                                borderColor: getLocationBorderColor(type),
                                borderWidth: 1.5
                              }
                            ]}
                            onPress={() => setEditedLocation(editedLocation === type ? undefined : type)}
                          >
                            <Ionicons 
                              name={getLocationIcon(type) as any} 
                              size={18} 
                              color={getLocationTextColor(type, editedLocation === type)}
                              style={{ marginRight: 8 }}
                            />
                            <Text style={[
                              styles.mealTypeText,
                              { color: getLocationTextColor(type, editedLocation === type) }
                            ]}>
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  )}

                  {/* Where to Eat - Display Mode */}
                  {!isEditing && editedLocation && (
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>Where to eat?</Text>
                      <View style={styles.mealTypeBadgeContainer}>
                        <View style={[
                          styles.mealTypeBadge, 
                          { 
                            backgroundColor: getLocationColor(editedLocation, true),
                            borderColor: getLocationBorderColor(editedLocation),
                            borderWidth: 1.5
                          }
                        ]}>
                          <Ionicons 
                            name={getLocationIcon(editedLocation) as any} 
                            size={18} 
                            color={getLocationTextColor(editedLocation, true)}
                            style={{ marginRight: 8 }}
                          />
                          <Text style={[
                            styles.mealTypeText,
                            { color: getLocationTextColor(editedLocation, true) }
                          ]}>
                            {editedLocation.charAt(0).toUpperCase() + editedLocation.slice(1)}
                          </Text>
                        </View>
                      </View>
                    </View>
                  )}

                  {/* Notes */}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Notes</Text>
                    {isEditing ? (
                      <TextInput
                        style={styles.notesInput}
                        value={editedNotes}
                        onChangeText={setEditedNotes}
                        placeholder="Add notes about this meal..."
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                        onFocus={handleNotesFocus}
                        ref={notesInputRef}
                      />
                    ) : (
                      <Text style={styles.notesText}>
                        {editedNotes || 'No notes added'}
                      </Text>
                    )}
                  </View>

                  {/* Nutrition Facts */}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Nutrition Facts</Text>
                    <View style={styles.nutritionGrid}>
                      <View style={styles.nutritionCard}>
                        <Text style={styles.nutritionLabel}>Calories</Text>
                        <Text style={styles.nutritionValue}>{meal.nutritionFactsPerPortion.calories}</Text>
                      </View>
                      <View style={styles.nutritionCard}>
                        <Text style={styles.nutritionLabel}>Protein</Text>
                        <Text style={styles.nutritionValue}>{meal.nutritionFactsPerPortion.protein}</Text>
                      </View>
                      <View style={styles.nutritionCard}>
                        <Text style={styles.nutritionLabel}>Carbs</Text>
                        <Text style={styles.nutritionValue}>{meal.nutritionFactsPerPortion.carbs}</Text>
                      </View>
                      <View style={styles.nutritionCard}>
                        <Text style={styles.nutritionLabel}>Fat</Text>
                        <Text style={styles.nutritionValue}>{meal.nutritionFactsPerPortion.fat}</Text>
                      </View>
                      <View style={styles.nutritionCard}>
                        <Text style={styles.nutritionLabel}>Fiber</Text>
                        <Text style={styles.nutritionValue}>{meal.nutritionFactsPerPortion.fiber}</Text>
                      </View>
                      <View style={styles.nutritionCard}>
                        <Text style={styles.nutritionLabel}>Sugar</Text>
                        <Text style={styles.nutritionValue}>{meal.nutritionFactsPerPortion.sugar}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Additional Notes from AI */}
                  {meal.additionalNotes && meal.additionalNotes.length > 0 && (
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>AI Analysis</Text>
                      <View style={styles.aiNotesContainer}>
                        {meal.additionalNotes.map((note, index) => (
                          <View key={index} style={styles.aiNoteItem}>
                            <Ionicons name="bulb-outline" size={16} color="#F59E0B" />
                            <Text style={styles.aiNoteText}>{note}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  {/* Portion Size */}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Portion Information</Text>
                    <View style={styles.portionContainer}>
                      <View style={styles.portionItem}>
                        <Text style={styles.portionLabel}>Portion Size</Text>
                        <Text style={styles.portionValue}>{meal.portionSize}</Text>
                      </View>
                      <View style={styles.portionItem}>
                        <Text style={styles.portionLabel}>Serving Size</Text>
                        <Text style={styles.portionValue}>{meal.recognizedServingSize}</Text>
                      </View>
                    </View>
                  </View>
                </View>
                
                {/* Bottom spacing for the fixed button */}
                <View style={styles.bottomSpacing} />
              </ScrollView>
            </KeyboardAvoidingView>

            {/* Fixed Bottom Edit Buttons - Outside main KeyboardAvoidingView */}
            {isEditing && (
              <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={0}
              >
                <View style={[styles.bottomButtonContainer, { 
                  paddingBottom: 16 + Math.max(insets.bottom, 0),
                  marginBottom: -Math.max(insets.bottom, 0),
                }]}>
                  <View style={styles.editButtonsContainer}>
                    <TouchableOpacity 
                      style={styles.cancelButton}
                      onPress={handleCancel}
                    >
                      <Ionicons name="close" size={20} color="#6B7280" />
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.saveButton, isSaving && { opacity: 0.7 }]}
                      onPress={handleSave}
                      disabled={isSaving}
                    >
                      <LinearGradient
                        colors={['#F472B6', '#FB923C']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.saveButtonGradient}
                      >
                        <Ionicons name={isSaving ? "hourglass" : "checkmark"} size={20} color="#FFFFFF" />
                        <Text style={styles.saveButtonText}>
                          {isSaving ? 'Saving...' : 'Save Changes'}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </View>
              </KeyboardAvoidingView>
            )}
          </>
        ) : (
          <View style={styles.notFoundContainer}>
            <Ionicons name="restaurant" size={80} color="#D1D5DB" />
            <Text style={styles.notFoundText}>Meal not found</Text>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Text style={styles.backButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerLeft: {
    width: 112,
    alignItems: 'flex-start',
  },
  headerButton: {
    padding: 8,
    minWidth: 40,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
    width: 112,
    justifyContent: 'flex-end',
  },
  contentContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  scrollContentWithPadding: {
    paddingBottom: 120,
  },
  imageContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  foodImage: {
    width: 200,
    height: 200,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  foodTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  timeText: {
    fontSize: 16,
    color: '#6B7280',
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
  mealTypeBadgeContainer: {
    alignSelf: 'flex-start',
  },
  mealTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
  },
  mealTypeText: {
    fontSize: 15,
    fontWeight: '600',
  },
  notesInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minHeight: 100,
  },
  notesText: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
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
    minWidth: 100,
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
    fontSize: 16,
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
  portionContainer: {
    gap: 12,
  },
  portionItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  portionLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  portionValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  notFoundText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#F472B6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerSpacer: {
    width: 112, // 2 buttons * (40 + 8) + 8 gap = 96 + 16 = 112
  },
  bottomButtonContainer: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom:16,
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
  editButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  saveButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  content: {
    paddingVertical: 10,
  },
  bottomSpacing: {
    height: 16,
  },
}); 