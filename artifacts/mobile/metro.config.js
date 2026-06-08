const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Packages that use private class fields (#field) or ES2022+ syntax
// must be explicitly included here so Metro/Babel transpiles them
// for Hermes compatibility instead of passing them through raw.
const TRANSPILE_PACKAGES = [
  "react-native",
  "@react-native",
  "@react-navigation",
  "expo",
  "@expo",
  "expo-router",
  "react-native-reanimated",
  "react-native-worklets",
  "react-native-gesture-handler",
  "react-native-screens",
  "react-native-safe-area-context",
  "react-native-keyboard-controller",
  "react-native-svg",
  "@react-native-async-storage",
  "@expo-google-fonts",
  "@expo/vector-icons",
];

config.transformer = {
  ...config.transformer,
  transformIgnorePatterns: [
    `node_modules/(?!(${TRANSPILE_PACKAGES.join("|")}))`,
  ],
};

module.exports = config;
