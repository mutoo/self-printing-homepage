import path from 'path';
import merge from 'webpack-merge';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

import scss from './parts/scss';
import javascript from './parts/javascript';

const isDevMode = process.env.NODE_ENV !== 'production';

export default merge([
    {
        entry: path.resolve(__dirname, '../src/index.js'),
        output: {
            filename: 'bundle.js',
            path: path.resolve(__dirname, '../dist'),
        },
        resolve: {
            alias: {
                'vue': isDevMode ? 'vue/dist/vue.common.js' : 'vue/dist/vue.runtime.common.js',
            },
        },
        plugins: [
            // Use MiniCssExtractPlugin to generate a .css file
            new MiniCssExtractPlugin({
                filename: 'bundle.css',
            }),
        ],
    },
    javascript(),
    scss(),
]);
