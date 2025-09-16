const path = require('path');

module.exports = function override(config, env) {
  // 프로덕션 빌드에서만 파일명 해싱 비활성화
  if (env === 'production') {
    // CSS 파일명 고정
    const miniCssExtractPlugin = config.plugins.find(
      plugin => plugin.constructor.name === 'MiniCssExtractPlugin'
    );
    if (miniCssExtractPlugin) {
      miniCssExtractPlugin.options.filename = 'static/css/main.css';
      miniCssExtractPlugin.options.chunkFilename = 'static/css/[name].css';
    }

    // JS 파일명 고정
    config.output.filename = 'static/js/main.js';
    config.output.chunkFilename = 'static/js/[name].js';

    // 최적화 설정에서 splitChunks 설정 수정
    if (config.optimization && config.optimization.splitChunks) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendor',
            chunks: 'all',
          },
          default: {
            name: 'main',
            chunks: 'all',
          }
        }
      };
    }
  }

  return config;
};
