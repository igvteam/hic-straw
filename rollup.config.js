//import resolve from 'rollup-plugin-node-resolve';
//import commonjs from 'rollup-plugin-commonjs';
import pkg from './package.json';
import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import strip from 'rollup-plugin-strip';

export default [

    {
        input: './src/index.js',
        output: [
            {file: pkg.module, format: 'es'}
        ],
        plugins: [
            strip({
                // set this to `false` if you don't want to
                // remove debugger statements
                debugger: true,

                // defaults to `[ 'console.*', 'assert.*' ]`
                functions: ['console.log', 'assert.*', 'debug'],

                // set this to `false` if you're not using sourcemaps –
                // defaults to `true`
                sourceMap: false
            })
        ]
    },

    {
        input: './src/index.js',
        output: [
            {file: 'tmp/hic-straw.js', format: 'umd', name: "igv"},
        ],
        plugins: [
            resolve(),
            strip({
                // set this to `false` if you don't want to
                // remove debugger statements
                debugger: true,

                // defaults to `[ 'console.*', 'assert.*' ]`
                functions: ['console.log', 'assert.*', 'debug'],

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
