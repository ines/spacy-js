import babel from 'rollup-plugin-babel';

export default {
    input: 'src/index.js',
    output: {
        format: 'cjs',
        file: 'dist/index.js'
    },
    plugins: [
        babel({
            presets: [
                ['@babel/preset-env', {
                    modules: false,
                    targets: { node: 'current' }
                }]
            ],
            exclude: 'node_modules/**'
        })
    ]
}
