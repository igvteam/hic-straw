const path = require('path')

module.exports = {
    mode: 'production',  //'development'
    entry: './src/index.js',
    target: 'web',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'hic-straw.js',
        library: 'HicStraw',
        libraryTarget: 'umd',
        umdNamedDefine: true
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                },
            },
        ],
    },
}
