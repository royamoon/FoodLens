import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAtomValue, useAtom } from 'jotai';
import { analysisAtom, historyAtom, MealType } from '@/atoms/analysis';
import { Ionicons } from '@expo/vector-icons';
import { useState, useRef } from 'react';
import { useRouter } from 'expo-router';

const Page = () => {
  const analysis = useAtomValue(analysisAtom);
  const [history, setHistory] = useAtom(historyAtom);
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);

  const [mealType, setMealType] = useState<MealType | undefined>();
  const [notes, setNotes] = useState('');

  const handleSave = () => {
    if (!analysis) return;
    const newEntry = {
      ...analysis,
      id: Date.now().toString(),
      timestamp: Date.now(),
      mealType,
      notes,
    };
    setHistory([newEntry, ...history]);
    router.back();
  };

  const handleNotesFocus = () => {
    // Scroll to bottom when notes input is focused
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  if (!analysis) return null;

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="#2D3748" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Log Meal</Text>
        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={handleSave}
          disabled={!mealType}
        >
          <Text style={[styles.saveButtonText, !mealType && styles.saveButtonDisabled]}>
            Save
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Image source={{ uri: analysis.image }} style={styles.image} />
        
        <View style={styles.content}>
          <Text style={styles.title}>Food Detected:</Text>
          <Text style={styles.foodName}>{analysis.identifiedFood}</Text>

          <Text style={styles.sectionTitle}>Meal Type:</Text>
          <View style={styles.mealTypeContainer}>
            {(['Breakfast', 'Lunch', 'Dinner', 'Snack'] as MealType[]).map((type) => (
              <TouchableOpacity
                key={type}
                style={[styles.mealTypeButton, mealType === type && styles.mealTypeButtonSelected]}
                onPress={() => setMealType(type)}>
                <Text
                  style={[
                    styles.mealTypeButtonText,
                    mealType === type && styles.mealTypeButtonTextSelected,
                  ]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Date & Time:</Text>
          <Text style={styles.dateTimeText}>{new Date().toLocaleString()}</Text>

          <Text style={styles.sectionTitle}>Nutrition Info:</Text>
          <View style={styles.nutritionContainer}>
            <Text style={styles.nutritionItem}>
              Calories: {analysis.nutritionFactsPerPortion.calories} kcal
            </Text>
            <Text style={styles.nutritionItem}>
              Protein: {analysis.nutritionFactsPerPortion.protein}
            </Text>
            <Text style={styles.nutritionItem}>
              Carbs: {analysis.nutritionFactsPerPortion.carbs}
            </Text>
            <Text style={styles.nutritionItem}>
              Fat: {analysis.nutritionFactsPerPortion.fat}
            </Text>
          </View>

          {analysis.additionalNotes && analysis.additionalNotes.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Additional Notes from AI:</Text>
              <View style={styles.aiNotesContainer}>
                {analysis.additionalNotes.map((note, index) => (
                  <Text key={index} style={styles.aiNoteText}>
                    • {note}
                  </Text>
                ))}
              </View>
            </>
          )}

          <Text style={styles.sectionTitle}>Personal Notes:</Text>
          <TextInput
            style={styles.notesInput}
            multiline
            placeholder="Add your personal notes about this meal..."
            value={notes}
            onChangeText={setNotes}
            onFocus={handleNotesFocus}
            textAlignVertical="top"
            returnKeyType="done"
            blurOnSubmit={true}
          />
          
          {/* Extra space for keyboard */}
          <View style={styles.extraSpace} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF2F7',
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3748',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backButtonText: {
    color: '#2D3748',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#79C267',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonDisabled: {
    color: '#9CA3AF',
  },
  scrollView: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: 250,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 16,
    color: '#718096',
    marginBottom: 4,
  },
  foodName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3748',
    marginTop: 16,
    marginBottom: 12,
  },
  mealTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  mealTypeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#EDF2F7',
  },
  mealTypeButtonSelected: {
    backgroundColor: '#F4A5B8',
  },
  mealTypeButtonText: {
    color: '#2D3748',
    fontWeight: '500',
  },
  mealTypeButtonTextSelected: {
    color: '#FFFFFF',
  },
  dateTimeText: {
    fontSize: 16,
    color: '#4A5568',
  },
  nutritionContainer: {
    backgroundColor: '#F7FAFC',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  nutritionItem: {
    fontSize: 15,
    color: '#4A5568',
    marginBottom: 4,
  },
  aiNotesContainer: {
    backgroundColor: '#EBF8FF',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3182CE',
  },
  aiNoteText: {
    fontSize: 15,
    color: '#2D3748',
    lineHeight: 20,
    marginBottom: 6,
  },
  notesInput: {
    backgroundColor: '#EDF2F7',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  extraSpace: {
    height: 200, // Adjust this value based on your keyboard height
  },
});

export default Page;
