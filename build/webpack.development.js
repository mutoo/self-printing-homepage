import path from 'path';
import merge from 'webpack-merge';

let devServer = {
    host: '0.0.0.0',
    disableHostCheck: true,
    port: 3132,
    inline: true,
    headers: {
        'Access-Control-Allow-Origin': '*',
    },
    contentBase: path.resolve(__dirname, '../dist/'),
};

let publicPath = devServer.https ? 'https://' : 'http://';
publicPath += 'localhost';
publicPath += ':' + devServer.port + '/';

export default merge([
    {
        devtool: 'eval-source-map',

        devServer,

        output: {
            publicPath,
        },

        // Turn off minimize when running in development mode
        optimization: {
            minimize: false,
        },
    },
]);
