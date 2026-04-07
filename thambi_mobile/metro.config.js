const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ensure .js files in vendored react-native-vector-icons are resolved
config.resolver.sourceExts = ['tsx', 'ts', 'jsx', 'js', 'json', 'cjs', 'mjs'];

module.exports = config;
