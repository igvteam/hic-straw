//import resolve from 'rollup-plugin-node-resolve';
//import commonjs from 'rollup-plugin-commonjs';
import pkg from './package.json';
import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import strip from 'rollup-plugin-strip';
import commonjs from 'rollup-plugin-commonjs';
import builtins from 'rollup-plugin-node-builtins';
import globals from 'rollup-plugin-node-globals';

export default [

    {
        input: './src/index.js',
        output: [
            {file: 'dist/hic-straw_es6.js', format: 'es', name: 'HicStraw'}
        ],
        plugins: [
            globals(),
            builtins(),
            commonjs({
                include: [
                    'node_modules/**'
                ],  // Default: undefined

                // if true then uses of `global` won't be dealt with by this plugin
                ignoreGlobal: false,  // Default: false

                // if false then skip sourceMap generation for CommonJS modules
                sourceMap: false,  // Default: true

            }),
            resolve({browser: true}),

            strip({
                // set this to `false` if you don't want to
                // remove debugger statements
                debugger: true,

                // defaults to `[ 'console.*', 'assert.*' ]`
                functions: ['console.log', 'assert.*', 'debug'],

                // set this to `false` if you're not using sourcemaps –
                // defaults to `true`npm install --save-dev rollup-plugin-node-resolve
                sourceMap: false
            })
        ]
    },

    // {
    //     input: './src/index.js',
    //     output: [
    //         {file: 'dist/hic-straw.js', format: 'umd', name: 'HicStraw'}
    //     ],
    //     plugins: [
    //         resolve(),
    //         commonjs({
    //             include: 'node_modules/**',  // Default: undefined
    //
    //             // if true then uses of `global` won't be dealt with by this plugin
    //             ignoreGlobal: false,  // Default: false
    //
    //             // if false then skip sourceMap generation for CommonJS modules
    //             sourceMap: false,  // Default: true
    //         }),
    //         strip({
    //             // set this to `false` if you don't want to
    //             // remove debugger statements
    //             debugger: true,
    //
    //             // defaults to `[ 'console.*', 'assert.*' ]`
    //             functions: ['console.log', 'assert.*', 'debug'],
    //
    //             // set this to `false` if you're not using sourcemaps –
    //             // defaults to `true`
    //             sourceMap: false
    //         }),
    //         babel({
    //             exclude: 'node_modules/**'
    //         }),
    //     ]
    // }
];
