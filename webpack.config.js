import path from 'path';
import url from 'url';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default (env)=>({
    mode: 'development',
    devtool: 'source-map',
    entry: {
        index: env.no_worker ? './src/unwrapperJS.ts' : './src/unwrapperWorker.ts',
        node: './src/node.ts',
    },
    experiments: {
        outputModule: true
    },
    externals: /^node:.+/,
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
        filename: !!env.no_worker ? '[name]-no-worker.js' : '[name].js',
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
