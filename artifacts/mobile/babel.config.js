module.exports = function (api) {
  api.cache(true);
  return {
    presets: [["babel-preset-expo", { unstable_transformImportMeta: true }]],
    plugins: [
      // Required for react-native-reanimated v4 + react-native-worklets
      "react-native-worklets/plugin",
    ],
    overrides: [
      {
        test: /[\\/]node_modules[\\/]react-native-worklets[\\/]/,
        plugins: [
          ["@babel/plugin-transform-class-properties", { "loose": true }],
          ["@babel/plugin-transform-private-methods", { "loose": true }],
          ["@babel/plugin-transform-private-property-in-object", { "loose": true }],
        ],
      },
    ],
  };
};
