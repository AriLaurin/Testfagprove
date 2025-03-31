// Polyfill Node.js modules for browser environments
import shims from './shims';

// Add polyfills to the global context
(globalThis as any).process = {
  env: { NODE_ENV: 'development' },
  cwd: () => '/',
  version: '',
  platform: 'browser',
  nextTick: (cb: Function) => setTimeout(cb, 0)
};

// Define module shims
(globalThis as any).require = (moduleName: string) => {
  if (shims.hasOwnProperty(moduleName)) {
    return (shims as any)[moduleName];
  }
  
  console.warn(`Module ${moduleName} was required but not polyfilled`);
  return {};
};

export default {}; 