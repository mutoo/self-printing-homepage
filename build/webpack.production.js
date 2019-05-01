import merge from 'webpack-merge';

export default merge([
    {
        // Tell webpack to minimize the bundle using the UglifyjsWebpackPlugin.
        optimization: {
            minimize: true,
        },
    },
]);
