'use strict';

export default () => ({
    module: {
        rules: [
            // JavaScript
            {
                test: /\.js$/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/preset-env'],
                            cacheDirectory: true,
                        },
                    },
                ],
            },
        ],
    },
});
