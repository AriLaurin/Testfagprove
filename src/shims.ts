// Polyfill for Node.js modules in the browser
const shims = {
  tls: {},
  net: {},
  fs: {
    readFileSync: () => '',
    writeFileSync: () => {}
  },
  path: {
    join: (...args: string[]) => args.join('/'),
    resolve: (...args: string[]) => args.join('/'),
    dirname: (p: string) => p.split('/').slice(0, -1).join('/')
  },
  os: {
    EOL: '\n',
    platform: () => 'browser'
  },
  stream: {},
  crypto: {}
};

// Export all shims
export default shims; 