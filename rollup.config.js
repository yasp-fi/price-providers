import path from 'path'
import esbuild from 'rollup-plugin-esbuild'
import json from '@rollup/plugin-json'
import dts from 'rollup-plugin-dts'
import nodeResolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'

const PACKAGE_ROOT_PATH = process.cwd()
const INPUT_FILE = path.join(PACKAGE_ROOT_PATH, 'src/index.ts')
const OUTPUT_DIR = path.join(PACKAGE_ROOT_PATH, 'dist')
const PKG = require(path.join(PACKAGE_ROOT_PATH, 'package.json'))

const external = [
  ...Object.keys(PKG.dependencies || {}),
  ...Object.keys(PKG.devDependencies || {}),
]

const isProd = process.env.NODE_ENV === 'production'

const FILENAME = PKG.name.replace('@', '').replace('/', '-')

export default [
  bundle({
    output: [
      {
        file: path.join(OUTPUT_DIR, `${FILENAME}.cjs.js`),
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: path.join(OUTPUT_DIR, `${FILENAME}.esm.js`),
        format: 'esm',
        sourcemap: true,
      },
    ],
    plugins: [
      commonjs(),
      nodeResolve({ exportConditions: ['node'] }),
      json(),
      esbuild({
        minify: isProd,
      }),
    ],
  }),
  bundle({
    plugins: [dts()],
    output: {
      file: path.join(OUTPUT_DIR, `${FILENAME}.d.ts`),
      format: 'es',
    },
  }),
]

function bundle(config) {
  return {
    ...config,
    input: INPUT_FILE,
    external,
  }
}
