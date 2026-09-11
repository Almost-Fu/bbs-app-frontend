// 命令行 H5 打包用的临时 vite 配置（由 tools/build-h5.bat 复制到项目根目录，打包完成后删除）
// 作用：HBuilderX 项目里 main.js 写的是 `import App from './App'`（不带扩展名），
//      需要把 .vue 加进 resolve.extensions，否则 rollup 报 UNRESOLVED_IMPORT: "./App"
import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

export default defineConfig({
  plugins: [uni()],
  resolve: {
    extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json', '.vue']
  }
})
