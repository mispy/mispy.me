const path = require('path')
const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const fs = require('fs')
const StaticSiteGeneratorPlugin = require('static-site-generator-webpack-plugin')
const postSlugs = fs.readdirSync(path.join(__dirname, 'posts')).filter(file => !file.match(/.tsx$/))

module.exports = (env, argv) => {
    const isProduction = argv.mode === 'production'
    return {
        context: __dirname,
        mode: argv.mode||'development',
        entry: {
            build: path.join(__dirname, 'src/index.tsx'),
            homepage: path.join(__dirname, 'src/homepageClient.ts'),
            posts: path.join(__dirname, 'src/posts.scss')
        },
        output: {
            path: path.join(__dirname, "build"),
            filename: "assets/[name].js",
            libraryTarget: 'umd'
        },
        resolve: {
            extensions: [".ts", ".tsx", ".js", ".css"],
            modules: [
                path.join(__dirname, "node_modules"),
            ],
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    loader: "ts-loader",
                    options: {
                        transpileOnly: true,
                        configFile: path.join(__dirname, "tsconfig.json")
                    }
                },
                {
                    test: /\.css$/,
                    loader: ExtractTextPlugin.extract({ fallback: 'style-loader', use: ['css-loader?modules&importLoaders=true&localIdentName=[local]'] })
                },
                {
                    test: /\.scss$/,
                    loader: ExtractTextPlugin.extract({ fallback: 'style-loader', use: ['css-loader?modules&importLoaders=true&localIdentName=[local]', 'sass-loader'] })
                },
                {
                    test: /\.(jpe?g|png|ttf|eot|svg|woff|woff2)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                    loader: 'url-loader?limit=10000&outputPath=assets/&publicPath=/assets/'
                },
                {
                    test: /\.md$/,
                    loader: ['json-loader', 'markdown-it-front-matter-loader'],
                },
            ],
        },
        plugins: [
            new webpack.LoaderOptionsPlugin({
                options: {
                    'markdown-it-front-matter': {
                        html: true
                    }
                }
            }),
    
            new ExtractTextPlugin('assets/[name].css'),
    
            new StaticSiteGeneratorPlugin({
                paths: ['/', '/links'].concat(postSlugs.map(slug => '/'+slug)),
                locals: { 'isProduction': isProduction },
                globals: { window: {} }
            }),

            // Copy the post assets (images and such)
            new CopyWebpackPlugin([
                { context: 'posts', from: '**/*' },
                { context: 'public', from: '**/*' }
            ], { ignore: ['index.tsx'] })

        ],
        devServer: {
            host: 'localhost',
            port: 8020,
            inline: false,
            hot: true,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
                "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
            }
        },    
    }
}
