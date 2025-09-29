// Ubicación: src/navigation/AppNavigator.tsx
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, StackHeaderProps } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import React from 'react';

// Navigators
import DrawerNavigator from './DrawerNavigator';
import CustomHeader from '../components/navigation/CustomHeader';

// Screens
// Se eliminó la importación de VersesScreen
import AboutScreen from '../screens/AboutScreen';
import SettingsScreen from '../screens/SettingsScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import NotesScreen from '../screens/NotesScreen';
import HistoryScreen from '../screens/HistoryScreen';

export type RootStackParamList = {
    MainTabs: undefined; // Contiene el BottomTabNavigator (incluyendo ReadingScreen)
    // Se eliminó la ruta Verses de aquí, ya que se navega directamente a la pestaña Reading.
    
    // Destinos de la pantalla "Más" (Siguen siendo parte del Stack)
    About: undefined; 
    Settings: undefined;
    Favorites: undefined;
    Notes: undefined;
    History: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

// Define un tipo auxiliar para la función de renderizado del header
type SimpleHeaderProps = Pick<StackHeaderProps, 'navigation'>; 

export default function AppNavigator() {
    
    // Función auxiliar para renderizar el CustomHeader en pantallas simples
    const renderSimpleHeader = (title: string, subtitle?: string) => 
        ({ navigation }: SimpleHeaderProps) => ( 
            <CustomHeader
                title={title}
                subtitle={subtitle}
                showBackButton
                onBackPress={() => navigation.goBack()}
            />
        );

    return (
        <>
            <StatusBar style="dark" backgroundColor="#FFFFFF" />
            <NavigationContainer>
                <Stack.Navigator screenOptions={{ headerShown: false }}>
                    
                    {/* 1. Drawer + Tabs (Contiene Reading, Books, Search, More) */}
                    <Stack.Screen name="MainTabs" component={DrawerNavigator} />


                    {/* 2. Pantallas de Menú (Navegadas desde MoreScreen) */}
                    <Stack.Screen 
                        name="About" 
                        component={AboutScreen} 
                        options={{ headerShown: true, header: renderSimpleHeader('Acerca de', 'Información de la App') }} 
                    />
                    <Stack.Screen 
                        name="Settings" 
                        component={SettingsScreen} 
                        options={{ headerShown: true, header: renderSimpleHeader('Configuración', 'Ajustes de la aplicación') }} 
                    />
                    <Stack.Screen 
                        name="Favorites" 
                        component={FavoritesScreen} 
                        options={{ headerShown: true, header: renderSimpleHeader('Favoritos', 'Versículos guardados') }} 
                    />
                    <Stack.Screen 
                        name="Notes" 
                        component={NotesScreen} 
                        options={{ headerShown: true, header: renderSimpleHeader('Notas', 'Tus apuntes y marcadores') }} 
                    />
                    <Stack.Screen 
                        name="History" 
                        component={HistoryScreen} 
                        options={{ headerShown: true, header: renderSimpleHeader('Historial', 'Registro de lectura') }} 
                    />
                    
                </Stack.Navigator>
            </NavigationContainer>
        </>
    );
}