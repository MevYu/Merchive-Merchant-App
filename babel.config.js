// Taro 4 babel — babel-preset-taro bundles ts + react + the @tarojs/babel-*
// plugins and switches per-platform automatically based on the build target.
module.exports = {
  presets: [
    ['taro', {
      framework: 'react',
      ts: true,
    }],
  ],
};
