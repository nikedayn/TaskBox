module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Якщо у вас є інші плагіни, вони мають бути вище
      'react-native-reanimated/plugin', // <--- ДОДАЙТЕ ЦЕЙ РЯДОК ОСТАННІМ
    ],
  };
};