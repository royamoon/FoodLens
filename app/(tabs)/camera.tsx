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
  InteractionManager,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useSetAtom } from 'jotai';
import { analysisAtom } from '@/atoms/analysis';
import { useState, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';

// Custom Unknown Food Modal Component
const UnknownFoodModal = ({ visible, onClose, onRetakePhoto, onChooseFromGallery }) => {
  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        {/* Backdrop - tap to dismiss */}
        <TouchableOpacity 
          style={styles.modalBackdrop} 
          activeOpacity={1} 
          onPress={onClose}
        />
        
        <View style={styles.modalContainer}>
          {/* Icon */}
          <View style={styles.modalIconWrapper}>
            <Ionicons name="camera-outline" size={32} color="#FF6B6B" />
          </View>
          
          {/* Content */}
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Unable to Recognize Food</Text>
            <Text style={styles.modalDescription}>
              The image appears unclear or doesn't contain identifiable food. Would you like to try again?
            </Text>
          </View>
          
          {/* Actions */}
          <View style={styles.modalActions}>
            <TouchableOpacity 
              style={styles.primaryActionButton}
              onPress={onRetakePhoto}
              activeOpacity={0.8}
            >
              <LinearGradient 
                colors={['#F472B6', '#FB923C']} 
                style={styles.primaryActionGradient}
              >
                <Ionicons name="camera" size={18} color="#FFFFFF" />
                <Text style={styles.primaryActionText}>Take New Photo</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.secondaryActionButton}
              onPress={onChooseFromGallery}
              activeOpacity={0.8}
            >
              <Ionicons name="images" size={18} color="#F472B6" />
              <Text style={styles.secondaryActionText}>Choose from Photos</Text>
            </TouchableOpacity>
          </View>
          
          {/* Cancel */}
          <TouchableOpacity 
            style={styles.cancelAction}
            onPress={onClose}
            activeOpacity={0.6}
          >
            <Text style={styles.cancelActionText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default function Camera() {
  const router = useRouter();
  const setAnalysis = useSetAtom(analysisAtom);
  const [isLoading, setIsLoading] = useState(false);
  const [showUnknownFoodModal, setShowUnknownFoodModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<'camera' | 'gallery' | null>(null);

  // Handle pending action when modal closes
  useEffect(() => {
    if (!showUnknownFoodModal && pendingAction) {
      const action = pendingAction;
      setPendingAction(null);
      
      // Use InteractionManager to ensure all interactions are complete
      InteractionManager.runAfterInteractions(() => {
        if (action === 'camera') {
          captureImage(true);
        } else if (action === 'gallery') {
          captureImage(false);
        }
      });
    }
  }, [showUnknownFoodModal, pendingAction]);

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
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
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
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
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

      // Show loading immediately after image is captured/selected
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
      
      // Check if food is unknown - show custom modal instead of Alert
      if (foodAnalysis.identifiedFood === 'unknown') {
        setShowUnknownFoodModal(true);
        return;
      }
      
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

  const handleRetakePhoto = () => {
    setPendingAction('camera');
    setShowUnknownFoodModal(false);
  };

  const handleChooseFromGallery = () => {
    setPendingAction('gallery');
    setShowUnknownFoodModal(false);
  };

  const handleCloseModal = () => {
    setShowUnknownFoodModal(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <Modal transparent={true} visible={isLoading} animationType="fade">
        <View style={styles.loadingModalContainer}>
          <View style={styles.loadingModalContent}>
            <ActivityIndicator size="large" color="#F472B6" />
            <Text style={styles.modalText}>Recognizing your food...</Text>
          </View>
        </View>
      </Modal>

      {/* Unknown Food Modal */}
      <UnknownFoodModal
        visible={showUnknownFoodModal}
        onClose={handleCloseModal}
        onRetakePhoto={handleRetakePhoto}
        onChooseFromGallery={handleChooseFromGallery}
      />

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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 20,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    width: '100%',
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
    paddingVertical: 18,
    paddingHorizontal: 32,
    gap: 12,
  },
  cameraButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  galleryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#F472B6',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  galleryButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F472B6',
  },
  quickActionButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  quickActionText: {
    fontSize: 16,
    color: '#6B7280',
    textDecorationLine: 'underline',
  },
  loadingModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  loadingModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  modalText: {
    fontSize: 16,
    color: '#1F2937',
    marginTop: 16,
    textAlign: 'center',
  },
  // Unknown Food Modal Styles - iOS/Material Design inspired
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingTop: 32,
    paddingHorizontal: 24,
    paddingBottom: 24,
    width: '100%',
    maxWidth: 340,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalIconWrapper: {
    alignSelf: 'center',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFF5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalContent: {
    alignItems: 'center',
    marginBottom: 28,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  modalDescription: {
    fontSize: 15,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 4,
  },
  modalActions: {
    gap: 12,
    marginBottom: 16,
  },
  primaryActionButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#F472B6',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  primaryActionGradient: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryActionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.1,
  },
  secondaryActionButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: '#F472B6',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  secondaryActionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F472B6',
    letterSpacing: -0.1,
  },
  cancelAction: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  cancelActionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#8E8E93',
    letterSpacing: -0.1,
  },
}); 