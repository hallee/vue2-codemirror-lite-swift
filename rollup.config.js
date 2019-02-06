import vue from 'rollup-plugin-vue';
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';

export default {
    input: 'src/index.js',
    output: {
        name: 'CodeMirrorSwift',
        exports: 'named',
    },
    plugins: [
        commonjs(),
        vue({
            css: true,
            compileTemplate: true,
        }),
        babel({
            exclude: 'node_modules/**'
        }),
    ],
};