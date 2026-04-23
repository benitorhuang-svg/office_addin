/* eslint-disable no-undef */

const devCerts = require("office-addin-dev-certs");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { InjectManifest } = require("workbox-webpack-plugin");
const path = require("path");

const urlDev = "https://localhost:3001/";
const urlProd = "https://www.contoso.com/"; // CHANGE THIS TO YOUR PRODUCTION DEPLOYMENT LOCATION

async function getHttpsOptions() {
  try {
    const fs = require("fs");
    const certPath = path.resolve(__dirname, "certs/localhost.crt");
    const keyPath = path.resolve(__dirname, "certs/localhost.key");
    
    if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
      console.log("[Webpack] Using local certificates from certs/ folder.");
      return {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath),
      };
    }
  } catch (err) {
    console.warn("[Webpack] Failed to load local certificates, falling back to devCerts:", err.message);
  }

  const httpsOptions = await devCerts.getHttpsServerOptions();
  return { ca: httpsOptions.ca, key: httpsOptions.key, cert: httpsOptions.cert };
}

module.exports = async (env, options) => {
  const mode = (options && options.mode) || process.env.NODE_ENV || "development";
  const dev = mode === "development";
  const config = {
    devtool: dev ? "eval-cheap-module-source-map" : false,
    cache: {
      type: "filesystem",
      buildDependencies: {
        config: [__filename],
      },
      name: `${mode}-cache`,
    },
    entry: {
      taskpane: ["./src/client/entries/taskpane-entry.ts"],
      commands: "./src/client/entries/commands-entry.ts",
      monitor: "./src/client/entries/monitor-entry.ts"
    },
    output: {
      clean: true,
      globalObject: "self",
    },
    resolve: {
      extensions: [".ts", ".html", ".js", ".css"],
      alias: {
        "@shared": path.resolve(__dirname, "src/shared"),
        "@components": path.resolve(__dirname, "src/client/components"),
        "@services": path.resolve(__dirname, "src/client/services"),
        "@atoms": path.resolve(__dirname, "src/client/components/atoms"),
        "@molecules": path.resolve(__dirname, "src/client/components/molecules"),
        "@organisms": path.resolve(__dirname, "src/client/components/organisms"),
      }
    },
    module: {
      rules: [
        {
          test: /\.css$/i,
          use: [
            "style-loader",
            "css-loader"
          ],
        },
        {
          test: /\.ts$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
              presets: [
                ["@babel/preset-env", {
                  targets: "last 2 Chrome versions, last 2 Edge versions",
                  useBuiltIns: "usage",
                  corejs: 3,
                  shippedProposals: true,
                }],
                "@babel/preset-typescript",
              ],
            },
          },
        },
        {
          test: /\.html$/,
          exclude: /node_modules/,
          use: "html-loader",
        },
        {
          test: /\.(png|jpg|jpeg|gif|ico)$/,
          type: "asset/resource",
          generator: {
            filename: "assets/[name][ext][query]",
          },
        },
      ],
    },
    optimization: {
      runtimeChunk: "single",
      splitChunks: {
        chunks: "all",
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            priority: 10,
            reuseExistingChunk: true,
          },
        },
      },
      ...(dev ? {} : { minimize: true }),
    },
    plugins: [
      new HtmlWebpackPlugin({
        filename: "taskpane.html",
        template: "./src/client/entries/taskpane.html",
        chunks: ["taskpane"],
      }),
      new HtmlWebpackPlugin({
        filename: "monitor.html",
        template: "./src/client/entries/monitor.html",
        chunks: ["monitor"],
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: "src/client/assets/*",
            to: "assets/[name][ext][query]",
          },
          {
            from: "manifest*.xml",
            to: "[name]" + "[ext]",
            transform(content) {
              if (dev) {
                return content;
              } else {
                // Production replacement: 4000 (Unified Gateway) -> Production URL
                return content.toString().replace(/https:\/\/localhost:4000\//g, "https://www.contoso.com/");
              }
            },
          },
        ],
      }),
      new HtmlWebpackPlugin({
        filename: "commands.html",
        template: "./src/client/entries/commands.html",
        chunks: ["commands"],
      }),
    ],
    devServer: {
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      proxy: [
        {
          context: ['/api', '/auth'],
          target: 'https://localhost:4000',
          secure: false,
          changeOrigin: true,
          logLevel: 'debug',
          // Crucial for Streaming Support
          onProxyRes: (proxyRes) => {
            proxyRes.headers['x-accel-buffering'] = 'no';
            proxyRes.headers['cache-control'] = 'no-cache';
          },
          onProxyReq: (proxyReq, req, res) => {
            if (req.method === 'POST' || req.method === 'OPTIONS') {
              console.log(`[HPM] Request received on proxy: ${req.method} ${req.url}`);
            }
          },
          onError: (err, req, res) => {
            console.error('[Proxy Error]', err.message);
            if (res && !res.headersSent && typeof res.writeHead === 'function') {
              res.writeHead(502, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Backend server unreachable' }));
            }
          }
        }
      ],
      compress: false, // Disable compression for reliable SSE
      server: dev ? {
        type: "https",
        options: env.WEBPACK_BUILD || options.https !== undefined ? options.https : await getHttpsOptions(),
      } : undefined,
      port: process.env.npm_package_config_dev_server_port || 3001,
    },
  };

  // Prevent InjectManifest from running multiple times in dev (webpack --watch/devServer).
  if (!dev) {
    if (!global.__WB_INJECT_MANIFEST_ADDED__) {
      config.plugins.push(
        new InjectManifest({
          swSrc: "./src/client/entries/sw.ts",
          swDest: "sw.js",
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB for office.js
        })
      );
      global.__WB_INJECT_MANIFEST_ADDED__ = true;
    }
  }

  return config;
};
