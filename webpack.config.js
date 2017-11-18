/**
 * Inspired by https://github.com/topheman/react-es6-redux
 */

const path = require('path');
const log = require('npmlog');

log.level = 'silly';
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const myLocalIp = require('my-local-ip');
const fs = require('fs');

const plugins = [];

const root = __dirname;

const MODE_DEV_SERVER = process.argv[1].indexOf('webpack-dev-server') > -1;

log.info('webpack', `Launched in ${MODE_DEV_SERVER ? 'dev-server' : 'build'} mode`);

/** environment setup */

const BUILD_DIR = './build';
const DIST_DIR = process.env.DIST_DIR || 'dist';// relative to BUILD_DIR
const NODE_ENV = (process.env.NODE_ENV) ? process.env.NODE_ENV.toLowerCase() : 'development';

// can be useful in case you have web devtools (null by default to differentiate from true or false)
const DEVTOOLS = (process.env.DEVTOOLS) ? JSON.parse(process.env.DEVTOOLS) : null;
// optimize in production by default - otherwize,
// override with OPTIMIZE=false flag (if not optimized, sourcemaps will be generated)
const OPTIMIZE = (process.env.OPTIMIZE) ? JSON.parse(process.env.OPTIMIZE) : NODE_ENV === 'production';
const LINTER = (process.env.LINTER) ? JSON.parse(process.env.LINTER) : true;

// disabled on dev-server mode, enabled in build mode
const FAIL_ON_ERROR = (process.env.FAIL_ON_ERROR) ? JSON.parse(process.env.FAIL_ON_ERROR) : !MODE_DEV_SERVER;

// to output a stats.json file (from webpack at build - useful for debuging)
const STATS = (process.env.STATS) ? JSON.parse(process.env.STATS) : false;
const LOCALHOST = (process.env.LOCALHOST) ? JSON.parse(process.env.LOCALHOST) : true;
const ASSETS_LIMIT = (typeof process.env.ASSETS_LIMIT !== 'undefined') ? parseInt(process.env.ASSETS_LIMIT, 10) : 5000; // limit bellow the assets will be inlines
const hash = (NODE_ENV === 'production' && DEVTOOLS ? '-devtools' : '') + (NODE_ENV === 'production' ? '-[hash]' : '');

/** integrity checks */

if (/^\w+/.test(DIST_DIR) === false || /\/$/.test(DIST_DIR) === true) { // @todo make a better regexp that accept valid unicode leading chars
  log.error('webpack', `DIST_DIR should not contain trailing slashes nor invalid leading chars - you passed "${DIST_DIR}"`);
  process.exit(1);
}

log.info('webpack', `${NODE_ENV.toUpperCase()} mode`);
if (DEVTOOLS) {
  log.info('webpack', 'DEVTOOLS active');
}
if (!OPTIMIZE) {
  log.info('webpack', 'SOURCEMAPS activated');
}
if (FAIL_ON_ERROR) {
  log.info('webpack', 'NoErrorsPlugin disabled, build will fail on error');
}

/** plugins setup */

if (!FAIL_ON_ERROR) {
  plugins.push(new webpack.NoEmitOnErrorsPlugin());
}

plugins.push(new HtmlWebpackPlugin({
  title: 'threejs fabrika fun',
  template: './src/index.ejs',
  inject: MODE_DEV_SERVER, // inject scripts in dev-server mode - in build mode, use the template tags
  MODE_DEV_SERVER,
  DEVTOOLS
}));
// extract css into one main.css file
const extractSass = new ExtractTextPlugin({
  filename: `main${hash}.css`,
  disable: false,
  allChunks: true
});
plugins.push(extractSass);
plugins.push(new webpack.DefinePlugin({
  // Lots of library source code (like React) are based on process.env.NODE_ENV
  // (all development related code is wrapped inside a conditional that can be dropped if equal to "production"
  // this way you get your own react.min.js build)
  'process.env': {
    NODE_ENV: JSON.stringify(NODE_ENV),
    DEVTOOLS, // You can rely on this var in your code to enable specific features only related to development (that are not related to NODE_ENV)
    LINTER // You can choose to log a warning in dev if the linter is disabled
  }
}));
plugins.push(new webpack.ProvidePlugin({
  THREE: 'three'
}));

if (OPTIMIZE) {
  plugins.push(new webpack.optimize.UglifyJsPlugin({
    compress: {
      warnings: true
    }
  }));
}

if (NODE_ENV !== 'production') {
  // to keep compatibility with old loaders - debug: true was previously on config
  plugins.push(new webpack.LoaderOptionsPlugin({
    debug: true
  }));
}

if (MODE_DEV_SERVER) {
  // webpack-dev-server mode
  if (LOCALHOST) {
    log.info('webpack', 'Check http://localhost:8080');
  }
  else {
    log.info('webpack', `Check http://${myLocalIp()}:8080`);
  }
}
else {
  // build mode
  log.info('webpackbuild', `rootdir: ${root}`);
  if (STATS) {
    // write infos about the build (to retrieve the hash) https://webpack.github.io/docs/long-term-caching.html#get-filenames-from-stats
    plugins.push(() => {
      this.plugin('done', stats => {
        fs.writeFileSync(
          path.join(__dirname, BUILD_DIR, DIST_DIR, 'stats.json'),
          JSON.stringify(stats.toJson()));
      });
    });
  }
}

/** preloaders */

const preLoaders = [];

if (LINTER) {
  log.info('webpack', 'LINTER ENABLED');
  preLoaders.push({
    test: /\.js$/,
    exclude: /node_modules/,
    loader: 'eslint-loader',
    enforce: 'pre'
  });
}
else {
  log.info('webpack', 'LINTER DISABLED');
}

/** webpack config */

const config = {
  bail: FAIL_ON_ERROR,
  entry: {
    bundle: './src/js/app.js',
    // main: './src/style/main.scss'
  },
  output: {
    publicPath: '',
    filename: `[name]${hash}.js`,
    chunkFilename: `[id]${hash}.chunk.js`,
    path: path.join(__dirname, BUILD_DIR, DIST_DIR)
  },
  cache: true,
  devtool: OPTIMIZE ? false : 'sourcemap',
  devServer: {
    host: LOCALHOST ? 'localhost' : myLocalIp()
  },
  module: {
    rules: [
      ...preLoaders,
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      {
        test: /\.(s)?css/,
        use: extractSass.extract({
          use: [{
            loader: 'css-loader',
            query: JSON.stringify({
              sourceMap: true
            })
          }, {
            loader: 'sass-loader',
            query: JSON.stringify({
              sourceMap: true
            })
          }],
          // use style-loader in development
          fallback: 'style-loader'
        })
      },
      {
        test: /\.(png)$/, loader: `url-loader?limit=${ASSETS_LIMIT}&name=assets/[hash].[ext]`
      },
      {
        test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
        loader: `url-loader?limit=${ASSETS_LIMIT}&mimetype=application/font-woff&name=assets/[hash].[ext]`
      },
      {
        test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
        loader: `url-loader?limit=${ASSETS_LIMIT}&mimetype=application/font-woff&name=assets/[hash].[ext]`
      },
      {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        loader: `url-loader?limit=${ASSETS_LIMIT}&mimetype=application/octet-stream&name=assets/[hash].[ext]`
      },
      {
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'file-loader?&name=assets/[hash].[ext]'
      },
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        loader: `url-loader?limit=${ASSETS_LIMIT}&mimetype=image/svg+xml&&name=assets/[hash].[ext]`
      }
    ]
  },
  plugins,
  resolve: {
    alias: {
      'three/OrbitControls': path.join(__dirname, 'node_modules/three/examples/js/controls/OrbitControls.js'),
      vendor: path.join(__dirname, 'vendor')
    }
  },
  node: {
    console: true,
    fs: 'empty',
    net: 'empty',
    tls: 'empty'
  },
};

module.exports = config;
