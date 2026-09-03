const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// Watch both project and workspace root for pnpm monorepo symlinks
// Merge with Expo's default watchFolders so we don't override them
config.watchFolders = [...(config.watchFolders || []), workspaceRoot];

// Ensure Metro resolves modules from project node_modules and workspace root node_modules
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

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
  "react-native-webview",
];

config.transformer = {
  ...config.transformer,
  transformIgnorePatterns: [
    `node_modules/(?!(${TRANSPILE_PACKAGES.join("|")}))`,
  ],
};

module.exports = config;
