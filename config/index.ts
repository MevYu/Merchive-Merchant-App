import path from 'path';

// Taro build config for the merchant-end app. Independent from
// merchive-miniapp — different wx appid, different pages, no shared
// code (business is completely separate).
//
// P1 ships weapp + h5; rn (app) builds work the same Taro target but
// require react-native + Android/iOS tooling that we don't bake into CI.
export default {
  projectName: 'merchive-merchant-app',
  date: '2026-05-26',
  designWidth: 750,
  deviceRatio: { '640': 2.34 / 2, '750': 1, '828': 1.81 / 2 },
  sourceRoot: 'src',
  outputRoot: 'dist',
  // alias mirrors tsconfig "paths" because Taro doesn't auto-read
  // tsconfig.compilerOptions.paths for webpack's resolver.
  alias: {
    '@': path.resolve(__dirname, '..', 'src'),
  },
  // compile.include forces babel-loader to walk ESM-only deps so their
  // `import` syntax is downleveled before webpack's parser sees it.
  // zustand + react ship .mjs that webpack would otherwise hand to its
  // own parser at column 5. (Same footgun merchive-miniapp hit.)
  compile: {
    include: [
      /node_modules[\\/]zustand[\\/]/,
      /node_modules[\\/]use-sync-external-store[\\/]/,
      /node_modules[\\/]react[\\/]/,
      /node_modules[\\/]react-dom[\\/]/,
      /node_modules[\\/]@babel[\\/]runtime[\\/]/,
      /node_modules[\\/].*\.mjs$/,
    ],
  },
  plugins: [],
  defineConstants: {},
  framework: 'react',
  compiler: 'webpack5',
  mini: {
    postcss: {
      autoprefixer: { enable: true, config: {} },
      pxtransform: { enable: true, config: {} },
      'url': { enable: true, config: { limit: 1024 } },
      'cssModules': { enable: false },
    },
  },
  h5: {
    publicPath: '/',
    staticDirectory: 'static',
    postcss: {
      autoprefixer: { enable: true, config: {} },
      'cssModules': { enable: false },
    },
  },
  // Taro env entries land in DefinePlugin as `process.env.<KEY>`; values
  // MUST be JSON-encoded strings or DefinePlugin emits raw text that the
  // webpack parser chokes on at column 5 ("Unexpected token (1:5)" on
  // every consumer). merchive-miniapp hit this — don't repeat.
  env: {
    TARO_APP_API_BASE: JSON.stringify(process.env.TARO_APP_API_BASE || 'http://localhost:8080/api/v1'),
    // TODO 待 user 配：商家端独立 weapp appid（不可复用 miniapp 消费者端的）
    TARO_APP_WX_APPID: JSON.stringify(process.env.TARO_APP_WX_APPID || ''),
    // LOCAL_DEV_TOKEN — paste a JWT for a STORE_STAFF / STORE_MGR /
    // FRANCHISEE / TENANT_ADMIN / OWNER account to skip wxlogin while
    // iterating UI. Empty in prod builds.
    TARO_APP_LOCAL_DEV_TOKEN: JSON.stringify(process.env.TARO_APP_LOCAL_DEV_TOKEN || ''),
    TARO_APP_DEFAULT_TENANT_ID: JSON.stringify(process.env.TARO_APP_DEFAULT_TENANT_ID || ''),
  },
};
