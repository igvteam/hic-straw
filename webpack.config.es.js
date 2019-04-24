const path = require('path')

module.exports = {
    mode: 'production',  //'development', //
    entry: './src/index.js',
    target: 'web',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'hic-straw_es6.js',
        library: 'HicStraw',
        libraryTarget: 'var'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
            },
        ],
    },
}
