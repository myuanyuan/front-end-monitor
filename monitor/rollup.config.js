import babel from 'rollup-plugin-babel';
export default {
    input: './index.js',
    output: {
        file: '../website/client/bundle.js',
        format: 'umd', // amd cmd 都统一支持
    },
    watch: {
        exclude: 'node_modules/**',
    },
    plugins: [
        babel({
            babelrc: false,
            presets: [
                '@babel/preset-env'
            ]
        })
    ]
}