const path = require('path');

module.exports = {
    entry: ['./src/index.js'],
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: [/node_modules/],
                use:{
                    loader: "babel-loader",
                },
            },
        ]
    },
    output: {
        path: path.resolve(__dirname, 'dist/'),
        publicPath: '',
        filename: 'reacttutorial.min.js',
        libraryTarget: 'umd'
    },
    externals: [
        "react",
        "react-dom",
        "styled-components",
        "lodash",
        "scroll-smooth",
        "scrollparent"
    ],
};