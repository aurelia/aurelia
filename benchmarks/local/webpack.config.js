/** @type {import('webpack').Configuration} */
module.exports = {
    mode: 'production',
    entry: '../app.js',
    experiments: {
        outputModule: true,
    },
    output: {
        library: {
            type: 'module',
        },
        filename: 'app.local.js',
    }
}