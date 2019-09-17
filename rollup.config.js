import strip from 'rollup-plugin-strip';
import babel from 'rollup-plugin-babel';


export default [

    {
        input: './src/index.js',
        output: [
            {file: 'dist/hic-straw_es6.js', format: 'es', name: 'HicStraw'},
        ],

        plugins: [
            strip({
                // set this to `false` if you don't want to
                // remove debugger statements
                debugger: true,

                // defaults to `[ 'console.*', 'assert.*' ]`
                functions: ['console.log', 'assert.*', 'debug', 'require'],

                // set this to `false` if you're not using sourcemaps –
                // defaults to `true`
                sourceMap: false
            })
        ]
    },

    {
        input: './src/index.js',
        output: [
            {file: 'tmp/hic-straw.js', format: 'umd', name: 'HicStraw'}
        ],

        plugins: [
            strip({
                // set this to `false` if you don't want to
                // remove debugger statements
                debugger: true,

                // defaults to `[ 'console.*', 'assert.*' ]`
                functions: ['console.log', 'assert.*', 'debug', 'require'],

                // set this to `false` if you're not using sourcemaps –
                // defaults to `true`
                sourceMap: false
            }),
            babel({
                exclude: 'node_modules/**'
            }),
        ]
    }
];
