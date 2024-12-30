const PROXY_CONFIG = {
  "/api": {
    "target": "http://localhost:5000",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug",
    onProxyReq: (proxyReq, req, res) => {
      console.log(`Proxying request: ${req.method} ${req.url}`);
    },
    onProxyRes: (proxyRes, req, res) => {
      console.log(`Response from target: ${proxyRes.statusCode}`);
    },
  },
}

module.exports = PROXY_CONFIG;
