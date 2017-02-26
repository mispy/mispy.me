import webpack from 'webpack'
import path from 'path'
import StaticSiteGeneratorPlugin from 'static-site-generator-webpack-plugin'
import ExtractTextPlugin from 'extract-text-webpack-plugin'
import CopyWebpackPlugin from 'copy-webpack-plugin'

import fs from 'fs'
import fm from 'front-matter'

const postSlugs = fs.readdirSync(path.join(__dirname, 'posts')).filter(file => !file.match(/.js$/))

export default {
    context: __dirname,    
    entry: path.join(__dirname, 'src/index.js'),
    output: {
        path: path.join(__dirname, 'build'),
        filename: 'index.bundle.js',
        libraryTarget: 'umd'
    },
    resolve: {
        alias: {
            'react': 'preact-compat',
            'react-dom': 'preact-compat'
        },      
    },
    module: {
        rules: [
            { 
                test: /.js|.jsx$/,
                exclude: /node_modules/,
                use: "babel-loader",
            },
            {
                test: /\.png$/,
                loader: 'url-loader?limit=10000&name=/assets/[hash].[ext]' 
            },
            {
                test: /\.md$/,
                loader: ['json-loader', 'markdown-it-front-matter-loader'],
            },        
            { test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "url-loader?limit=10000&mimetype=application/font-woff&name=/assets/[hash].[ext]" },
            { test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "file-loader?limit=10000&name=/assets/[hash].[ext]" },
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: 'css-loader?modules&localIdentName=[local]'//--[hash:base64:5]',
              }),
            }
        ]
    },
    devServer: {
        host: '0.0.0.0',
        port: 3333,
        contentBase: path.join(__dirname, '/public'),
        publicPath: "/build/"
    },
    devtool: 'cheap-module-eval-source-map',
    plugins: [
        new webpack.LoaderOptionsPlugin({
            options: {
                'markdown-it-front-matter': {
                    html: true
                }
            }
        }),
        new ExtractTextPlugin('style.css'),
        new StaticSiteGeneratorPlugin({
            paths: ['/'].concat(postSlugs.map(slug => '/'+slug)),
            globals: { window: {} }
        }),
        // Copy the post assets (images and such)
        new CopyWebpackPlugin([
            { context: 'posts', from: '**/*' }
        ], { ignore: ['*.js'] })
    ]
}

