import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useSetAtom, useAtom } from 'jotai';
import { analysisAtom, historyAtom, FoodAnalysis } from '@/atoms/analysis';
import { useState } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function Index() {
  const router = useRouter();
  const setAnalysis = useSetAtom(analysisAtom);
  const [history] = useAtom(historyAtom);
  const [isLoading, setIsLoading] = useState(false);

  const showImagePickerOptions = () => {
    console.log('showImagePickerOptions called');
    Alert.alert(
      'Select Image',
      'Choose how you want to select an image',
      [
        {
          text: 'Camera',
          onPress: () => {
            console.log('Camera option selected');
            captureImage(true);
          },
        },
        {
          text: 'Gallery',
          onPress: () => {
            console.log('Gallery option selected'); 
            captureImage(false);
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  const captureImage = async (useCamera = false) => {
    try {
      let result;
      
      if (useCamera) {
        // Request camera permissions
        const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
        if (!cameraPermission.granted) {
          Alert.alert('Permission Required', 'Camera permission is required to take photos.');
          return;
        }
        
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [4, 3],
          quality: 1,
          base64: true,
        });
      } else {
        // Request media library permissions  
        const libraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!libraryPermission.granted) {
          Alert.alert('Permission Required', 'Photo library permission is required to select photos.');
          return;
        }
        
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [4, 3],
          quality: 1,
          base64: true,
        });
      }

      if (result.canceled) {
        console.log('User cancelled image picker');
        return;
      }

      if (!result.assets || result.assets.length === 0) {
        Alert.alert('Error', 'No image was selected');
        return;
      }

      console.log('Image selected, starting analysis...');
      setIsLoading(true);
      
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: {
            inlineData: {
              data: result.assets[0].base64,
              mimeType: 'image/jpeg',
            },
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Unknown error occurred');
      }
      
      const foodAnalysis = data.data.foodAnalysis;
      foodAnalysis.image = result.assets[0].uri;
      setAnalysis(foodAnalysis);
      router.push('/result');
    } catch (error: any) {
      console.error('Error analyzing food:', error);
      
      // More specific error messages
      let errorMessage = 'Đã xảy ra lỗi khi phân tích ảnh. ';
      
      if (error.message.includes('API key not configured')) {
        errorMessage += 'Vui lòng cấu hình GEMINI_API_KEY. Xem file SETUP.md để biết hướng dẫn.';
      } else if (error.message.includes('Invalid image data')) {
        errorMessage += 'Dữ liệu ảnh không hợp lệ. Vui lòng thử chọn ảnh khác.';
      } else if (error.message.includes('Network')) {
        errorMessage += 'Kiểm tra kết nối internet và thử lại.';
      } else {
        errorMessage += error.message;
      }
      
      Alert.alert('Lỗi', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

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
      
      <Modal transparent={true} visible={isLoading} animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ActivityIndicator size="large" color="#F472B6" />
            <Text style={styles.modalText}>Recognizing your food...</Text>
          </View>
        </View>
      </Modal>

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

        {/* Take Photo Button */}
        <TouchableOpacity 
          style={styles.takePhotoContainer}
          onPress={showImagePickerOptions}
        >
          <LinearGradient
            colors={['#F472B6', '#FB923C']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.takePhotoButton}
          >
            <Text style={styles.cameraIcon}>📷</Text>
            <Text style={styles.takePhotoText}>Take Photo</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* View Today's Log Button */}
        <TouchableOpacity 
          style={styles.viewLogButton}
          onPress={() => {
            const todayMeals = history.filter(meal => 
              new Date(meal.timestamp).toDateString() === new Date().toDateString()
            );
            
            if (todayMeals.length === 0) {
              Alert.alert('Today\'s Log', 'No meals logged today yet!');
            } else {
              const mealNames = todayMeals.map(meal => `• ${meal.identifiedFood} (${meal.mealType})`).join('\n');
              Alert.alert('Today\'s Meals', mealNames);
            }
          }}
        >
          <Text style={styles.viewLogText}>View Today's Log</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>🏠</Text>
          <Text style={styles.navLabel}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem}
          onPress={showImagePickerOptions}
        >
          <Text style={styles.navIcon}>📷</Text>
          <Text style={styles.navLabel}>Camera</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => {
            Alert.alert('History', `Total meals logged: ${history.length}`);
          }}
        >
          <Text style={styles.navIcon}>📊</Text>
          <Text style={styles.navLabel}>History</Text>
        </TouchableOpacity>
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
  takePhotoContainer: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  takePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 32,
    gap: 12,
  },
  cameraIcon: {
    fontSize: 24,
  },
  takePhotoText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  viewLogButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  viewLogText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  navIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  navLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalText: {
    marginTop: 12,
    fontSize: 16,
    color: '#374151',
  },
});
