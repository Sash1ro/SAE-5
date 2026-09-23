import { Tabs } from 'expo-router';

import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '@/stores/stylesStore';


export default function TabLayout() {
  const APP_NAME = 'Manganitor'
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.main,
        tabBarInactiveTintColor: colors.placeHolder,
        tabBarStyle: {
          backgroundColor: colors.background, 
          borderTopColor: colors.border, 
          borderTopWidth: 1,         
          elevation: 0,             
          shadowOpacity: 0,          
        },
        headerStyle: {
          backgroundColor: colors.background, 
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          elevation: 0, 
          shadowOpacity: 0,
        },
        headerTintColor: colors.onBg,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerTitle: APP_NAME,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home-sharp' : 'home-outline'} color={color} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          headerTitle: APP_NAME,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'archive' : 'archive-outline'} color={color} size={24}/>
          ),
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          title: 'About',
          headerTitle: APP_NAME,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'information-circle' : 'information-circle-outline'} color={color} size={24}/>
          ),
        }}
      />

      {/* Hidden tabs */}
       <Tabs.Screen 
        name="details" 
        options={{ 
          href: null, 
          title: 'Details' 
        }} 
      />
    </Tabs>
  );
}
