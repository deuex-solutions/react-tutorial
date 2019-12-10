const path = require('path');
const HtmlWebPackPlugin = require('html-webpack-plugin')

module.exports = {
    entry: ['babel-polyfill', './demo/index.js'],
    devtool: 'sourcemap',
    devServer: {
        host: '192.168.1.107'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: [/node_modules/],
                use:{
                    loader: "babel-loader",
                },
            },
            {
                test: /\.html$/,
                use: [
                  {
                    loader: 'html-loader',
                    options: { minimize: true },
                  },
                ],
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
        ]
    },
    plugins: [
        new HtmlWebPackPlugin({
          template: './demo/public/index.html',
          filename: './index.html',
        }),
    ],
    output: {
        path: path.resolve(__dirname, 'dist/'),
        publicPath: '',
        filename: 'reacttutorial.js',
        libraryTarget: 'umd'
    }
};