const path = require('path')

module.exports = (env)=>({
    mode: 'development',
    devtool: 'source-map',
    entry: env.no_worker ? './src/unwrapperJS.ts' : './src/unwrapperWorker.ts',
    experiments: {
            outputModule: true
    },
    devServer: {
        hot: false,
        port: 6237,
        static: {
            serveIndex: true,
            directory: __dirname
        },
        devMiddleware: {
            writeToDisk: true,
        },
        open: ['http://localhost:6237/public/uvs-debug.html'],
        client: false,
    },
    output: {
        filename: !!env.no_worker ? 'index-no-worker.js' : 'index.js',
        module: true,
        path: path.resolve(__dirname, 'public/build'),
        publicPath: '/public/build/',
        library: {
            type: "module"
        },
        clean: true
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/
            },
            {
                test: /\.js$/,
                enforce: "pre",
                use: ["source-map-loader"],
            },
        ]
    },
    watchOptions: {
        ignored: /node_modules/
    }
})
