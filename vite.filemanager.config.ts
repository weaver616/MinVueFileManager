import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import federation from "@originjs/vite-plugin-federation";
import { resolve } from "path";

export default defineConfig({
  plugins: [
    vue(),
    federation({
      name: 'FileManager',
      filename: 'remoteEntry.js',
      exposes: {
        './FileManagerApi': './src/remote_exposes/FileManagerApi.ts',
        './FileManagerService': './src/remote_exposes/FileManagerService.ts'
      },
      shared: {
        'vue': {
          requiredVersion: false
        },
        '@aws-sdk/client-s3': {
          requiredVersion: false
        },
        '@aws-sdk/lib-storage': {
          requiredVersion: false
        }
      }
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  build: {
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
    outDir: './dist/remote_exposes/FileManager',
    rollupOptions: {
      external: [
        'vue',
        'EIX/ei',
        'EFX/locale',
        'EFX/agPlugins',
        'EFX/AgGridVue',
        'EFX/theme',        // 添加这一行
        'ant-design-vue',
        '@ant-design/icons-vue',
        'ERX/ErI18n'
      ],
      output: {
        format: 'es',
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]'
      }
    }
  }
});
