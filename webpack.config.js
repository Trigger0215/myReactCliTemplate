const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CssMinimizerWebpackPlugin = require("css-minimizer-webpack-plugin");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

// 路径处理方法
function resolve(dir) {
    return path.join(__dirname, dir);
}

const config = {
    entry: './src/main.jsx',      // 要打包的文件
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'main.js'
    },

    module: {
        noParse: /jquery|lodash/,
        rules: [
            // 这里放置loader
            {
                // 使用oneOf 可以减少打包时的打包时间
                oneOf: [
                    // 处理css
                    // css-loader 会解析导入的css文件
                    // style-loader 会将解析的样式代码插入到html中
                    {
                        test: /\.css$/,
                        use: [
                            MiniCssExtractPlugin.loader,
                            'css-loader',
                            {
                                loader: 'postcss-loader',
                                options: {
                                    postcssOptions: {
                                        plugins: ['postcss-preset-env']
                                    }
                                }
                            }
                                ]
                    },
                    // 处理less
                    {
                        test: /\.less$/,
                        include: path.resolve(__dirname, './src'),
                        use: [
                            'style-loader',
                            'css-loader',
                            {
                                loader: 'postcss-loader',
                                options: {
                                    postcssOptions: {
                                        plugins: ['postcss-preset-env']
                                    }
                                }
                            },
                            'less-loader'
                        ]
                    },
                    // 处理sass
                    {
                        test: /\.s[ac]ss$/,
                        include: path.resolve(__dirname, './src'),
                        use: ['style-loader', 'css-loader', 'sass-loader']
                    },
                    // webpack5后对于img不用配置loader, 设置相应的资源类型即可
                    // 处理图片(.png/.gif/.svg)等
                    {
                        test: /\.(png|jpe?g|gif|webp)$/,
                        include: path.resolve(__dirname, './src'),
                        // 设定资源类型为asset
                        type: 'asset',
                        parser: {
                            // 小于200KB 的图片转换成 base64
                            dataUrlCondition: {
                                maxSize: 200 * 1024
                            }
                        },
                        // generator 字段可以指定存放的目录
                        generator: {
                            filename: 'static/assets/[hash][ext][query]'
                        }
                    },
                    // svg
                    {
                        test: /\.svg$/,
                        include: path.resolve(__dirname, './public'),
                        use: ['@babel/loader', '@svgr/webpack']
                    },
                    // 处理字体图标
                    {
                        test: /\.(ttf|woff|woff2)$/,
                        include: path.resolve(__dirname, './src'),
                        // asset/resource 可以将资源原封不动的输出到指定位置
                        type: 'asset/resource',
                        generator: {
                            filename: 'static/font/[hash][ext][query]'
                        }
                    },
                    // 处理JS 兼容性(部分)
                    {
                        test: /\.jsx?$/,

                        // 排除node_modules下的文件
                        exclude: /node_modules/,
                        // 只转换src目录下的文件 以外的不转换
                        include: path.resolve(__dirname, './src'),

                        use: [
                            {
                                loader: 'babel-loader',
                                // 主要转换代码的是: @babel/preset-env, 所以新建一个babel.config.js 文件
                                options: {
                                    // cacheDirectory 为true 时: 开启转义缓存
                                    cacheDirectory: true,
                                    // cacheCompression 为false时: 关闭缓存文件压缩, 提升打包速度
                                    cacheCompression: false
                                }
                            },
                            {
                                loader: 'thread-loader',    // thread-loader 的作用是多进程打包
                                options: {
                                    worker: 3,
                                }
                            }
                        ]
                    }
                ]
            }
        ],
    },

    plugins: [
        // 使用插件要通过new来实现

        // 提取CSS为单独文件
        new MiniCssExtractPlugin({
            filename: 'static/css/app.css'
        }),
        // 自动引入JS & CSS
        new HtmlWebpackPlugin({
            // template的作用是让它以一个html文件为模版去生成一个新的html文件
            template: path.resolve(__dirname, 'index.html')
        }),
        // 自动清空打包目录
        new CleanWebpackPlugin(),

        // 压缩CSS文件 它在生产模式(production)下才生效
        new CssMinimizerWebpackPlugin(),

        // 查看打包结果插件
        new BundleAnalyzerPlugin({
            analyzerMode: 'disabled',       // 展示打包报告的http服务器
            // generateStatsFile: true         // 生成stats.json 文件
        })
    ],

    devtool: 'source-map',

    resolve: {
        // 配置别名
        alias: {
            '@': resolve('src'),
            '~': resolve('src'),
            'components': resolve('src/components')
        },

        extensions: ['.js', '.jsx', '.json']
    },

    externals: {
        jquery: 'jQuery'
    }
};

// 设置模式(mode)
config.mode = process.env.NODE_ENV;

// 通过判断process.env.NODE_ENV 的值来决定是否使用devServer
if (config.mode === 'development') {
    config.devServer = {
        host: 'localhost',
        open: false,
        port: 9000
    }
}

module.exports = config;
