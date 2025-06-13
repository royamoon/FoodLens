import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { StatusBar } from 'expo-status-bar';
import { View, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as SystemUI from 'expo-system-ui';

export default function RootLayout() {
  const insets = useSafeAreaInsets();
  
  // Set system UI background color to white
  SystemUI.setBackgroundColorAsync('#FFFFFF');
  
  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <StatusBar style="dark" backgroundColor="#FFFFFF" />
      <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#F472B6',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          paddingTop: 8,
          paddingBottom: Math.max(insets.bottom - 8, 4),
          height: 72 + Math.max(insets.bottom - 8, 4),
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="camera"
        options={{
          title: 'Camera',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="camera" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="result"
        options={{
          href: null, // Hide from tabs
          presentation: 'modal',
          title: 'Log Meal',
          tabBarStyle: { display: 'none' }, // Hide tab bar for this screen
        }}
      />
      <Tabs.Screen
        name="food-detail"
        options={{
          href: null, // Hide from tabs
          presentation: 'modal',
          title: 'Meal Details',
        }}
      />
    </Tabs>
    </View>
  );
}
