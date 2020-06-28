import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import strip from 'rollup-plugin-strip';
import {terser} from "rollup-plugin-terser"


export default [

    // Browser ES6 bundle
    {
        input: './src/index.js',
        output: [
            {file: 'dist/hic-straw.esm.js', format: 'es'}
        ],
        plugins: [
            strip({
                debugger: true,
                functions: ['console.log', 'assert.*', 'debug']
            })
        ]
    },

    // Browser / Node  bundle
    {
        input: './src/index.js',
        output: [
            {file: 'dist/hic-straw.js', format: 'umd', name: 'HicStraw'},
            {file: 'dist/hic-straw.min.js', format: 'umd', name: 'HicStraw', sourcemap: true}
        ],
        plugins: [
            strip({
                debugger: true,
                functions: ['console.log', 'assert.*', 'debug']
            }),
            commonjs(),
            resolve(),
            babel(),
            terser({
                include: [/^.+\.min\.js$/],
                sourcemap: {
                    filename: "hic-straw.min.js",
                    url: "hic-straw.min.js.map"
                }
            })
        ]
    },

];
