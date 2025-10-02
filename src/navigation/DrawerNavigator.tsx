// Ubicación: src/navigation/DrawerNavigator.tsx

import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import BottomTabNavigator from './BottomTabNavigator';
import { Colors } from '../constants';

// Se eliminaron las importaciones de pantallas como AboutScreen, SettingsScreen y CustomHeader,
// ya que estas ahora se gestionan en el AppNavigator (Stack) al ser navegadas desde MoreScreen.

export type DrawerParamList = {
  HomeTabs: undefined;
  // Se eliminaron About, Settings, y Favorites de aquí.
};

const Drawer = createDrawerNavigator<DrawerParamList>();

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator
      screenOptions={{
        // CONFIGURACIÓN CLAVE: El menú lateral se abre desde la derecha
        drawerPosition: 'right', 
        // Tipo de animación de deslizamiento
        drawerType: 'slide', 
        // Oculta el header (el Stack Navigator lo manejará)
        headerShown: false, 
        drawerStyle: { backgroundColor: Colors.background.primary },
      }}
    >
      <Drawer.Screen
        name="HomeTabs"
        component={BottomTabNavigator}
        options={{ title: 'Inicio' }}
      />
      {/* El Drawer ya no incluye About, Settings, o Favorites. 
          Estas pantallas se navegan a través del Stack principal. */}
    </Drawer.Navigator>
  );
}