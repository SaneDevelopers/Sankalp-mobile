module.exports = function (api) {
  api.cache(true);
  return {
    presets: [["babel-preset-expo", { unstable_transformImportMeta: true }]],
    plugins: [
      // Required for react-native-reanimated v4 + react-native-worklets
      "react-native-worklets/plugin",
    ],
  };
};
