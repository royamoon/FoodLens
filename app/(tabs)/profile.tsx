import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useAtom } from 'jotai';
import { authStateAtom } from '@/atoms/auth';
import { logoutAtom } from '@/atoms/auth-actions';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const [authState] = useAtom(authStateAtom);
  const [, logout] = useAtom(logoutAtom);

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất không?',
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('Starting logout...');
              await logout();
              console.log('Logout completed');
              // Force navigation to auth screen
              router.replace('/auth/login');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Lỗi', 'Không thể đăng xuất. Vui lòng thử lại.');
            }
          },
        },
      ]
    );
  };

  const ProfileItem = ({
    icon,
    label,
    value,
    onPress,
  }: {
    icon: string;
    label: string;
    value?: string;
    onPress?: () => void;
  }) => (
    <TouchableOpacity style={styles.profileItem} onPress={onPress} disabled={!onPress}>
      <View style={styles.profileItemLeft}>
        <Ionicons name={icon as any} size={24} color="#F472B6" />
        <Text style={styles.profileItemLabel}>{label}</Text>
      </View>
      <View style={styles.profileItemRight}>
        {value && <Text style={styles.profileItemValue}>{value}</Text>}
        {onPress && <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person-circle" size={80} color="#F472B6" />
          </View>
          <Text style={styles.userName}>
            {authState.user?.name || authState.user?.email || 'User'}
          </Text>
          <Text style={styles.userEmail}>{authState.user?.email}</Text>
        </View>

        {/* Profile Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
          
          <ProfileItem
            icon="person-outline"
            label="Tên"
            value={authState.user?.name || 'Chưa cập nhật'}
          />
          
          <ProfileItem
            icon="mail-outline"
            label="Email"
            value={authState.user?.email}
          />
          
          <ProfileItem
            icon="calendar-outline"
            label="Tham gia"
            value={authState.user?.created_at 
              ? new Date(authState.user.created_at).toLocaleDateString('vi-VN')
              : 'Không rõ'
            }
          />
        </View>

        {/* App Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cài đặt</Text>
          
          <ProfileItem
            icon="notifications-outline"
            label="Thông báo"
            onPress={() => Alert.alert('Thông báo', 'Tính năng đang được phát triển')}
          />
          
          <ProfileItem
            icon="lock-closed-outline"
            label="Bảo mật"
            onPress={() => Alert.alert('Bảo mật', 'Tính năng đang được phát triển')}
          />
          
          <ProfileItem
            icon="help-circle-outline"
            label="Trợ giúp"
            onPress={() => Alert.alert('Trợ giúp', 'Liên hệ support@foodlens.com để được hỗ trợ')}
          />
          
          <ProfileItem
            icon="information-circle-outline"
            label="Về ứng dụng"
            onPress={() => Alert.alert('FoodLens', 'Phiên bản 1.0.0\nỨng dụng theo dõi dinh dưỡng thông minh')}
          />
        </View>

        {/* Logout Button */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#EF4444" />
            <Text style={styles.logoutText}>Đăng xuất</Text>
          </TouchableOpacity>
        </View>

        {/* Version Info */}
        <View style={styles.footer}>
          <Text style={styles.versionText}>FoodLens v1.0.0</Text>
          <Text style={styles.footerText}>© 2025 FoodLens. All rights reserved.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    marginBottom: 20,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#6B7280',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  profileItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileItemLabel: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 12,
    flex: 1,
  },
  profileItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileItemValue: {
    fontSize: 16,
    color: '#6B7280',
    marginRight: 8,
    maxWidth: 150,
    textAlign: 'right',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginHorizontal: 20,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  versionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 4,
  },
  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
}); 