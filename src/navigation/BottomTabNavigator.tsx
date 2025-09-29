// BottomTabNavigator.tsx
// Ubicación: src/navigation/BottomTabNavigator.tsx

import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { Platform } from 'react-native';
import { Colors, Layout } from '../constants';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Screens
import ReadingScreen from '../screens/ReadingScreen';
import SearchScreen from '../screens/SearchScreen';
import MoreScreen from '../screens/MoreScreen';
import NotesScreen from '../screens/NotesScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import PlanesScreen from '../screens/PlanesScreen';

export type BottomTabParamList = {
  ReadingStack: undefined;
  Planes: undefined;
  Notes: undefined;
  Favorites: undefined;
  More: undefined;
};

export type ReadingStackParamList = {
  Reading: { bookId: number; chapter: number; bookName: string } | undefined;
  Search: undefined;
};

const Tab = createBottomTabNavigator<BottomTabParamList>();
const ReadingStack = createStackNavigator<ReadingStackParamList>();

function ReadingStackNavigator() {
  return (
    <ReadingStack.Navigator screenOptions={{ headerShown: false }}>
      <ReadingStack.Screen 
        name="Reading" 
        component={ReadingScreen}
        options={{ title: 'Biblia' }}
      />
      <ReadingStack.Screen 
        name="Search" 
        component={SearchScreen}
        options={{ title: 'Buscar' }}
      />
    </ReadingStack.Navigator>
  );
}

export default function BottomTabNavigator() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;
          
          switch (route.name) {
            case 'ReadingStack':
              iconName = focused ? 'book' : 'book-outline';
              break;
            case 'Planes':
              iconName = focused ? 'calendar' : 'calendar-outline';
              break;
            case 'Notes':
              iconName = focused ? 'pencil' : 'pencil-outline';
              break;
            case 'Favorites':
              iconName = focused ? 'heart' : 'heart-outline';
              break;
            case 'More':
              iconName = focused ? 'grid' : 'grid-outline';
              break;
            default:
              iconName = 'help-outline';
          }
          
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.text.secondary,
        tabBarStyle: {
          backgroundColor: Colors.background.primary,
          borderTopColor: Colors.border.light,
          borderTopWidth: 1,
          height: Layout.heights.tabBar + insets.bottom + (Platform.OS === 'android' ? 8 : 0),
          paddingBottom: insets.bottom + (Platform.OS === 'android' ? 8 : 6),
          paddingTop: Layout.spacing.sm,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: Layout.fontSize.xs,
          fontWeight: '600',
          marginTop: -2,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
        headerShown: false,
      })}
      initialRouteName="ReadingStack"
    >
      <Tab.Screen 
        name="ReadingStack" 
        component={ReadingStackNavigator} 
        options={{ 
          title: 'Biblia', 
          tabBarLabel: 'Biblia' 
        }} 
      />
      
      <Tab.Screen 
        name="Planes" 
        component={PlanesScreen} 
        options={{ 
          title: 'Planes', 
          tabBarLabel: 'Planes' 
        }} 
      />
      
      <Tab.Screen 
        name="Notes" 
        component={NotesScreen} 
        options={{ 
          title: 'Notas', 
          tabBarLabel: 'Notas' 
        }} 
      />
      
      <Tab.Screen 
        name="Favorites" 
        component={FavoritesScreen} 
        options={{ 
          title: 'Favoritos', 
          tabBarLabel: 'Favoritos' 
        }} 
      />
      
      <Tab.Screen 
        name="More" 
        component={MoreScreen} 
        options={{ 
          title: 'Más', 
          tabBarLabel: 'Más' 
        }} 
      />
    </Tab.Navigator>
  );
}