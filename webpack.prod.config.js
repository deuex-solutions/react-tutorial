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
        publicPath: '/',
        filename: 'reacttour.min.js',
        library: {
            type: 'umd',
        },
    },
    externals: {
        react: "react",
        "react-dom": "react-dom",
        "styled-components": "styled-components",
        lodash: "lodash",
        "scroll-smooth": "scroll-smooth",
        scrollparent: "scrollparent",
    },
};