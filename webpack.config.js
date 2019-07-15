const path = require('path')
const glob = require('glob')
const uglify = require('uglifyjs-webpack-plugin')
const htmlPlugin = require('html-webpack-plugin')
const extractTextPlugin = require('extract-text-webpack-plugin')
const purifyCssPlugin = require('purifycss-webpack')
const webpack = require('webpack')
const copyWebpackPlugin = require('copy-webpack-plugin')

// 判断是什么环境, 读取 package.json 中 dev 和 build 中的参数
console.log(encodeURIComponent(process.env.type))
if(process.env.type === "build") {
	var website = {
		publicPath: 'http://baidu.com:8090/'
	}
} else {
	var website = {
		publicPath: 'http://192.168.1.2:8090/'
	}
}

module.exports = {
	// 调试工具
	// source-map 独立 map 包括行/列 打包慢, 容易调试
	// cheap-moudle-source-map 独立 包括行不包括列
	// env-source-map 融入到js文件中, 打包速度快, 但是不安全, 使用在开发阶段, eval
	// cheap-moudle-env-source-map 只有列
	devtool: 'source-map',
	// 入口
	entry: {
		entry: './src/entry.js'
	},
	// 出口
	output: {
		// dist 的路径
		path: path.resolve(__dirname, 'dist'),
		filename: '[name].js',
		// 公共路径
		publicPath: website.publicPath
	},
	// 模块
	module: {
		// 通过不同的 loader 把 less，es6 等转换成浏览器可编译的文件
		rules: [
			{
				test: /\.css$/,
				// use: ['style-loader', 'css-loader']
				use: extractTextPlugin.extract({
					fallback: 'style-loader',
					use: ['css-loader', 'postcss-loader']
				})
			},
			{
				test: /\.(png|jpg|gif)/,
				use: [{
					// url-loader 带有 file-loader 功能
					loader: 'url-loader',
					options: {
						// 图片字节限制 超过就生成链接
						limit: 5000,
						// 将图片打包到 images文件
						outputPath: 'images/'
					}
				}]
			},
			// 打包 img 标签引入的图片
			{
				test: /\.(htm|html)$/i,
				use: ['html-withimg-loader']
			},
			// 解析less
			{
				test: /\.less$/,
				use: extractTextPlugin.extract({
					use: [{
						loader: 'css-loader'
					}, {
						loader: 'less-loader'
					}],
					// 打包出去 分离less
					fallback: 'style-loader'
				})
			},
			// 解析es6
			{
				test: /\.(jsx|js)$/,
				use: {
					loader: 'babel-loader',
					// 移到 .babelrc 文件里配置
					// options: {
					// 	presets: ['@babel/preset-env', '@babel/preset-react']
					// }
				},
				// 去除文件夹
				exclude: /node_modules/
			}
		]
	},
	// 插件
	plugins: [
		// new uglify(),
		new htmlPlugin({
			// 压缩
			minify: {
				// 去掉引号
				removeAttributeQuotes: true
			},
			// 哈希 不产生缓存
			hash: true,
			// 打包成这个模板
			template: './src/index.html'
		}),
		// 分离 打包 css 文件
		new extractTextPlugin("css/index.css"),
		// 去除冗余的 css
		new purifyCssPlugin({
			paths: glob.sync(path.join(__dirname, 'src/*.html'))
		}),
		// 类似于水印 版权
		new webpack.BannerPlugin('ali 版权所有'),
		// 引入第三方类库 这种引用方法 如果没有使用到的话 就不会加载
		new webpack.ProvidePlugin({
			$: 'jquery'
		}),
		// 静态资源打包
		new copyWebpackPlugin([
			{
				from: __dirname+'/src/public',
				to: './public'
			}
		])
	],
	// 配置
	devServer: {
		// 基本目录结构 监听路径 用绝对路径
		contentBase: path.resolve(__dirname, 'dist'),
		// 服务器 ip地址
		host: '192.168.1.2',
		// 服务器压缩参数 开启压缩
		compress: true,
		// 端口号
		port: 8090
	},
	// 热打包 检测修改 然后自动打包
	// webpack --watch
	watchOptions: {
		// 检测修改的时间
		poll: 1000,
		// 500 毫秒内只执行一次
		aggregateTimeout: 500,
		// 除了哪个文件不用打包
		ignored: /node_modules/
	},
	mode: 'development'
}