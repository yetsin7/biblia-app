// index.js
// Ubicación: biblia-app/index.js

import { registerRootComponent } from 'expo';
import App from './App';

// registerRootComponent llama a AppRegistry.registerComponent('main', () => App);
// También se encarga de que la aplicación funcione con Expo Go y development builds
registerRootComponent(App);