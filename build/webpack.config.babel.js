import merge from 'webpack-merge';
import commonConfig from './webpack.common';
import developmentConfig from './webpack.development';
import productionConfig from './webpack.production';

module.exports = (mode) => {
    if (mode === 'production') {
        return merge(commonConfig, productionConfig, {mode});
    } else {
        return merge(commonConfig, developmentConfig, {mode});
    }
};
