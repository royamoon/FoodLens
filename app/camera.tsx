import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useSetAtom } from 'jotai';
import { analysisAtom } from '@/atoms/analysis';
import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function Camera() {
  const router = useRouter();
  const setAnalysis = useSetAtom(analysisAtom);
  const [isLoading, setIsLoading] = useState(false);

  const showImagePickerOptions = () => {
    Alert.alert(
      'Select Image',
      'Choose how you want to select an image',
      [
        {
          text: 'Camera',
          onPress: () => captureImage(true),
        },
        {
          text: 'Gallery',
          onPress: () => captureImage(false),
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
        return;
      }

      if (!result.assets || result.assets.length === 0) {
        Alert.alert('Error', 'No image was selected');
        return;
      }

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

      <View style={styles.content}>
        <View style={styles.header}>
          <Ionicons name="camera" size={80} color="#F472B6" />
          <Text style={styles.title}>Take a Photo</Text>
          <Text style={styles.subtitle}>Capture or select an image of your meal to get nutritional analysis</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.cameraButtonContainer}
            onPress={() => captureImage(true)}
          >
            <LinearGradient
              colors={['#F472B6', '#FB923C']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.cameraButton}
            >
              <Ionicons name="camera" size={24} color="#FFFFFF" />
              <Text style={styles.cameraButtonText}>Take Photo</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.galleryButton}
            onPress={() => captureImage(false)}
          >
            <Ionicons name="images" size={24} color="#F472B6" />
            <Text style={styles.galleryButtonText}>Choose from Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={showImagePickerOptions}
          >
            <Text style={styles.quickActionText}>Quick Capture</Text>
          </TouchableOpacity>
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 24,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    gap: 16,
  },
  cameraButtonContainer: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  cameraButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 32,
    gap: 12,
  },
  cameraButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  galleryButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  galleryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F472B6',
  },
  quickActionButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  quickActionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
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