import lwc from '@lwc/rollup-plugin';
import replace from '@rollup/plugin-replace';

export default {
  input: 'src/main.js',
  output: {
    file: 'dist/lwc-bundle.js',
    format: 'iife',
    name: 'LWCApp'
  },
  plugins: [
    replace({
        'process.env.NODE_ENV': JSON.stringify('development'),
    }),
    lwc(),
  ]
};
