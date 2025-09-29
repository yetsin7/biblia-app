// metro.config.js
// Ubicación: biblia-app/metro.config.js

const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Configurar resolución de módulos para TypeScript paths
config.resolver.alias = {
  '@': './src',
  '@/components': './src/components',
  '@/screens': './src/screens',
  '@/services': './src/services',
  '@/hooks': './src/hooks',
  '@/types': './src/types',
  '@/constants': './src/constants',
  '@/utils': './src/utils',
  '@/navigation': './src/navigation'
};

// Configurar extensiones de archivos
config.resolver.sourceExts = [...config.resolver.sourceExts, 'tsx', 'ts', 'jsx', 'js'];

// Configurar assets
config.resolver.assetExts = [...config.resolver.assetExts, 'db', 'sqlite', 'sqlite3'];

// Configurar transformer para SQLite
config.transformer.assetPlugins = ['expo-asset/tools/hashAssetFiles'];

module.exports = config;