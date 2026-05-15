// vite.config.ts
import { defineConfig, loadEnv as loadEnv2 } from "file:///D:/iplat4C/EPTFHVUE/xr-eptfmerge-dev/node_modules/vite/dist/node/index.js";
import vue from "file:///D:/iplat4C/EPTFHVUE/xr-eptfmerge-dev/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import federation from "file:///D:/iplat4C/EPTFHVUE/xr-eptfmerge-dev/node_modules/@originjs/vite-plugin-federation/dist/index.mjs";
import { resolve } from "path";
import { visualizer } from "file:///D:/iplat4C/EPTFHVUE/xr-eptfmerge-dev/node_modules/rollup-plugin-visualizer/dist/plugin/index.js";
import viteCompression from "file:///D:/iplat4C/EPTFHVUE/xr-eptfmerge-dev/node_modules/vite-plugin-compression/dist/index.mjs";

// build/utils.ts
var toIsoString = (date) => {
  var tzo = -date.getTimezoneOffset(), dif = tzo >= 0 ? "+" : "-", pad = (num) => {
    return (num < 10 ? "0" : "") + num;
  };
  return date.getFullYear() + "-" + pad(date.getMonth() + 1) + "-" + pad(date.getDate()) + "T" + pad(date.getHours()) + ":" + pad(date.getMinutes()) + ":" + pad(date.getSeconds()) + dif + pad(Math.floor(Math.abs(tzo) / 60)) + ":" + pad(Math.abs(tzo) % 60);
};

// vite.config.ts
import VitePluginHtmlEnv from "file:///D:/iplat4C/EPTFHVUE/xr-eptfmerge-dev/node_modules/vite-plugin-html-env/lib/index.js";

// build/vite-plugin-federation-types.ts
import * as fs from "fs";
import * as path from "path";
import axios from "file:///D:/iplat4C/EPTFHVUE/xr-eptfmerge-dev/node_modules/axios/index.js";
import compressing from "file:///D:/iplat4C/EPTFHVUE/xr-eptfmerge-dev/node_modules/compressing/index.js";
function FederationTypesPlugin(options) {
  const baseDir = process.cwd();
  const downloadDir = path.join(baseDir, ".types-download");
  const flagDir = path.join(downloadDir, ".lastModifiedTime");
  fs.mkdirSync(flagDir, { recursive: true });
  return {
    name: "vite-plugin-federation-types",
    async configResolved(config) {
      if (!options || !options.targetDir || options.remoteZips.length === 0) {
        console.error("\u8BF7\u63D0\u4F9B\u76EE\u6807\u76EE\u5F55\uFF01");
        return;
      }
      const isDevMode = config.command === "serve";
      if (config.command === "build")
        return;
      for (const tarZip of options.remoteZips) {
        const flagPath = path.join(flagDir, `${tarZip.remoteName}.txt`);
        const lastModifiedTime = await getLastModifiedTime(flagPath);
        const needsUpdate = await shouldUpdateRemoteFile(
          tarZip.remoteUrl,
          lastModifiedTime
        );
        if (config.command === "serve" && needsUpdate) {
          await downloadAndExtractRemoteZip(
            tarZip.remoteName,
            tarZip.remoteUrl
          );
          await markLastModifiedTime(flagPath);
        }
      }
    },
    transform(code, id) {
    }
  };
  async function shouldUpdateRemoteFile(remoteUrl, lastModifiedTime) {
    if (!lastModifiedTime) {
      return true;
    }
    const remoteLastModifiedTime = await getRemoteFileLastModifiedTime(
      remoteUrl
    );
    return remoteLastModifiedTime && remoteLastModifiedTime > lastModifiedTime;
  }
  async function extractAndDeleteZip(remoteName, zipFilePath) {
    const targetDir = path.join(baseDir, "@mf-types");
    try {
      await compressing.zip.uncompress(zipFilePath, targetDir);
      console.log(`${remoteName} \u7684\u6587\u4EF6\u89E3\u538B\u6210\u529F\uFF01`);
      fs.unlinkSync(zipFilePath);
    } catch (err) {
      console.error(`${remoteName} \u7684\u6587\u4EF6\u89E3\u538B\u5931\u8D25\uFF1A`, err);
    }
  }
  async function downloadAndExtractRemoteZip(remoteName, remoteZipUrl) {
    const zipFileName = `${remoteName}.zip`;
    const zipFilePath = path.join(downloadDir, zipFileName);
    return new Promise((resolve2, reject) => {
      axios.get(remoteZipUrl, { responseType: "stream" }).then((response) => {
        const { data, headers } = response;
        const zipFileStream = data;
        const writeStream = fs.createWriteStream(zipFilePath);
        zipFileStream.pipe(writeStream);
        writeStream.on("finish", () => {
          extractAndDeleteZip(remoteName, zipFilePath).then(resolve2).catch(reject);
        });
        writeStream.on("error", reject);
      }).catch((err) => {
        reject(err);
      });
    });
  }
  async function getRemoteFileLastModifiedTime(remoteUrl) {
    try {
      const response = await axios.head(remoteUrl);
      const lastModifiedHeader = response.headers["last-modified"];
      if (lastModifiedHeader) {
        return new Date(lastModifiedHeader).getTime();
      }
    } catch (error) {
      console.error("\u83B7\u53D6\u8FDC\u7A0B\u6587\u4EF6\u6700\u540E\u4FEE\u6539\u65F6\u95F4\u65F6\u51FA\u9519\uFF1A", error);
    }
    return null;
  }
  async function markLastModifiedTime(flagPath) {
    const currentTime = (/* @__PURE__ */ new Date()).getTime();
    fs.writeFileSync(flagPath, String(currentTime));
  }
  async function getLastModifiedTime(flagPath) {
    if (fs.existsSync(flagPath)) {
      const lastModifiedTimeString = fs.readFileSync(flagPath, "utf-8");
      return parseInt(lastModifiedTimeString, 10) || null;
    }
    return null;
  }
}

// build/vite-plugin-env-check.ts
import { loadEnv } from "file:///D:/iplat4C/EPTFHVUE/xr-eptfmerge-dev/node_modules/vite/dist/node/index.js";
import path2 from "path";
function EnvCheckPlugin() {
  const baseDir = process.cwd();
  return {
    name: "vite-plugin-env-check",
    async configResolved(config) {
      if (config.command === "serve")
        return;
      const envDir = config.envDir || path2.resolve(baseDir, ".env");
      const devEnv = loadEnv("development", envDir);
      const prodEnv = loadEnv("production", envDir);
      const devAppName = devEnv.VITE_APP_NAME;
      const prodAppName = prodEnv.VITE_APP_NAME;
      if (devAppName !== prodAppName) {
        throw new Error(
          `VITE_APP_NAME \u5728 .env.development \u548C .env.production \u4E2D\u4E0D\u4E00\u81F4: 
          .env.development: ${devAppName}, .env.production: ${prodAppName}`
        );
      } else {
        console.log(".env.development: ", devAppName);
        console.log(".env.production: ", prodAppName);
      }
    }
  };
}

// vite.config.ts
var __vite_injected_original_dirname = "D:\\iplat4C\\EPTFHVUE\\xr-eptfmerge-dev";
var vite_config_default = (configEnv) => {
  const { mode } = configEnv;
  const viteEnv = loadEnv2(configEnv.mode, process.cwd());
  const {
    VITE_APP_NAME: appName,
    VITE_APP_BASE_API: baseApi,
    VITE_APP_PUBLIC_PATH: publicPath
  } = viteEnv;
  const __DEV__ = mode === "development";
  const moduleFederationConfig = {
    name: `${appName}_general`,
    filename: "remoteEntry.js",
    remotes: {
      EPTFMERGE: `http://localhost:5001/assets/remoteEntry.js`,
      EFX: __DEV__ ? `${baseApi}remote_exposes/EFX/assets/remoteEntry.js` : {
        external: `Promise.resolve(
              window.top._APP_OPTIONS_  ?
              window.top._APP_OPTIONS_.appContext + 'remote_exposes/EFX/assets/remoteEntry.js' 
                : '/remote_exposes/EFX/assets/remoteEntry.js'
              )`,
        externalType: "promise"
      },
      EIX: __DEV__ ? `${baseApi}remote_exposes/EIX/assets/remoteEntry.js` : {
        external: `Promise.resolve(
            window.top._APP_OPTIONS_  ?
            window.top._APP_OPTIONS_.appContext + 'remote_exposes/EIX/assets/remoteEntry.js' 
              : '/remote_exposes/EIX/assets/remoteEntry.js'
            )`,
        externalType: "promise"
      },
      ERX: __DEV__ ? `${baseApi}remote_exposes/ERX/assets/remoteEntry.js` : {
        external: `Promise.resolve(
          window.top._APP_OPTIONS_  ?
          window.top._APP_OPTIONS_.appContext + 'remote_exposes/ERX/assets/remoteEntry.js'
            : '/remote_exposes/ERX/assets/remoteEntry.js'
          )`,
        externalType: "promise"
      }
      // 附件上传组件引用关系。若不需要请注释掉，否则应用会报错
      // EPTF: __DEV__
      //   ? `${baseApi}remote_exposes/EPTF/assets/remoteEntry.js`
      //   : {
      //       external: `Promise.resolve(
      //     window.top._APP_OPTIONS_  ?
      //     window.top._APP_OPTIONS_.appContext + 'remote_exposes/EPTF/assets/remoteEntry.js'
      //       : '/remote_exposes/EPTF/assets/remoteEntry.js'
      //     )`,
      //       externalType: "promise",
      //     },
      // 报表组件引用关系。若不需要请注释掉，否则应用会报错
      // EBFR: __DEV__
      //   ? `${baseApi}remote_exposes/EBFR/assets/remoteEntry.js`
      //   : {
      //       external: `Promise.resolve(
      //     window.top._APP_OPTIONS_  ?
      //     window.top._APP_OPTIONS_.appContext + 'remote_exposes/EBFR/assets/remoteEntry.js'
      //       : '/remote_exposes/EBFR/assets/remoteEntry.js'
      //     )`,
      //       externalType: "promise",
      //     },
      // FileManager: __DEV__
      //   ? `${baseApi}remote_exposes/FileManager/assets/remoteEntry.js`
      //   : {
      //       external: `Promise.resolve(
      //         window.top._APP_OPTIONS_  ?
      //         window.top._APP_OPTIONS_.appContext + 'remote_exposes/FileManager/assets/remoteEntry.js' 
      //           : '/remote_exposes/FileManager/assets/remoteEntry.js'
      //         )`,
      //       externalType: "promise",
      //     },
    },
    shared: ["vue"]
  };
  const remoteNames = Object.keys(moduleFederationConfig.remotes);
  const remoteZips = remoteNames.map((it) => {
    return {
      remoteName: it,
      remoteUrl: `${baseApi}remote_exposes/${it}/${it}.d.zip`
    };
  });
  return defineConfig({
    define: {
      //viteEnv
      "process.env": {
        ...viteEnv,
        BUILD_TIMESTAMP: `${toIsoString(/* @__PURE__ */ new Date())}`
      }
    },
    base: __DEV__ ? "/" : `./`,
    resolve: {
      alias: {
        /** @ 符号指向 src 目录 */
        "@": resolve(__vite_injected_original_dirname, "./src"),
        "#": resolve(__vite_injected_original_dirname),
        public: resolve(__vite_injected_original_dirname, "./public")
      }
    },
    plugins: [
      vue(),
      VitePluginHtmlEnv({
        compiler: true
        // compiler: false // 旧版本
      }),
      FederationTypesPlugin({ targetDir: "@mf-types", remoteZips }),
      EnvCheckPlugin(),
      federation(moduleFederationConfig),
      // topLevelAwait({
      //   // The export name of top-level await promise for each chunk module
      //   promiseExportName: "__tla",
      //   // The function to generate import names of top-level await promise in each chunk module
      //   promiseImportName: (i) => `__tla_${i}`,
      // }),
      visualizer({
        template: "treemap",
        // or sunburst
        open: false,
        gzipSize: true,
        brotliSize: true,
        filename: "./dist/analyse.html"
        // will be saved in project's root
      }),
      viteCompression({
        threshold: 1024e3
        // 对大于 1mb 的文件进行压缩
      })
    ],
    server: {
      proxy: {
        // 使用正则表达式匹配 URL
        "^/.*/api": {
          target: baseApi,
          changeOrigin: true,
          // 避免把 Vite 源码模块 /src/api/... 当成后端接口代理
          bypass(req) {
            var _a;
            if ((_a = req.url) == null ? void 0 : _a.startsWith("/src/")) {
              return req.url;
            }
          }
        },
        "/EX": {
          target: baseApi,
          changeOrigin: true
        },
        "/refreshToken": {
          target: baseApi,
          changeOrigin: true
        },
        "/remote_exposes": {
          target: baseApi,
          changeOrigin: true
        }
      }
    },
    build: {
      target: "esnext",
      outDir: `./dist/${appName}`,
      sourcemap: false,
      minify: true
    },
    optimizeDeps: {
      exclude: [
        "EIX/ei",
        "EFX/locale",
        "EFX/agPlugins",
        "EFX/AgGridVue",
        "EFX/theme",
        "ERX/ErI18n",
        "EFX/xrEfForm",
        "EFX/EFDialogForm",
        "EFX/xrEfPanel",
        "EFX/xrEfSearchBox",
        "ERX/ErLayout",
        "ERX/ErGrid",
        "ERX/Er",
        "ERX/ErPopFree"
      ]
    }
  });
};
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAiYnVpbGQvdXRpbHMudHMiLCAiYnVpbGQvdml0ZS1wbHVnaW4tZmVkZXJhdGlvbi10eXBlcy50cyIsICJidWlsZC92aXRlLXBsdWdpbi1lbnYtY2hlY2sudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxpcGxhdDRDXFxcXEVQVEZIVlVFXFxcXHhyLWVwdGZtZXJnZS1kZXZcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXGlwbGF0NENcXFxcRVBURkhWVUVcXFxceHItZXB0Zm1lcmdlLWRldlxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovaXBsYXQ0Qy9FUFRGSFZVRS94ci1lcHRmbWVyZ2UtZGV2L3ZpdGUuY29uZmlnLnRzXCI7LypcbiAqIEBEZXNjcmlwdGlvbjpcbiAqIEBBdXRob3I6IEVkd2FyZFxuICogQERhdGU6IDIwMjMtMTAtMTYgMTY6MzU6MzNcbiAqIEBMYXN0RWRpdG9yczogemhhbmdUaW5nXG4gKiBATGFzdEVkaXRUaW1lOiAyMDI0LTAzLTIwIDEwOjAzOjIwXG4gKi9cbmltcG9ydCB7IGRlZmluZUNvbmZpZywgbG9hZEVudiwgQ29uZmlnRW52IH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCB2dWUgZnJvbSBcIkB2aXRlanMvcGx1Z2luLXZ1ZVwiO1xuXG5pbXBvcnQgZmVkZXJhdGlvbiwge1xuICBWaXRlUGx1Z2luRmVkZXJhdGlvbk9wdGlvbnMsXG59IGZyb20gXCJAb3JpZ2luanMvdml0ZS1wbHVnaW4tZmVkZXJhdGlvblwiO1xuXG5pbXBvcnQgeyByZXNvbHZlIH0gZnJvbSBcInBhdGhcIjtcbmltcG9ydCB7IHZpc3VhbGl6ZXIgfSBmcm9tIFwicm9sbHVwLXBsdWdpbi12aXN1YWxpemVyXCI7XG5pbXBvcnQgdml0ZUNvbXByZXNzaW9uIGZyb20gXCJ2aXRlLXBsdWdpbi1jb21wcmVzc2lvblwiO1xuaW1wb3J0IHRvcExldmVsQXdhaXQgZnJvbSBcInZpdGUtcGx1Z2luLXRvcC1sZXZlbC1hd2FpdFwiO1xuXG5pbXBvcnQgeyB0b0lzb1N0cmluZyB9IGZyb20gXCIuL2J1aWxkL3V0aWxzXCI7XG5pbXBvcnQgVml0ZVBsdWdpbkh0bWxFbnYgZnJvbSBcInZpdGUtcGx1Z2luLWh0bWwtZW52XCI7XG5pbXBvcnQgeyBGZWRlcmF0aW9uVHlwZXNQbHVnaW4gfSBmcm9tIFwiLi9idWlsZC92aXRlLXBsdWdpbi1mZWRlcmF0aW9uLXR5cGVzXCI7XG5pbXBvcnQgeyBFbnZDaGVja1BsdWdpbiB9IGZyb20gXCIuL2J1aWxkL3ZpdGUtcGx1Z2luLWVudi1jaGVja1wiO1xuXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgKGNvbmZpZ0VudjogQ29uZmlnRW52KSA9PiB7XG4gIGNvbnN0IHsgbW9kZSB9ID0gY29uZmlnRW52O1xuICBjb25zdCB2aXRlRW52ID0gbG9hZEVudihjb25maWdFbnYubW9kZSwgcHJvY2Vzcy5jd2QoKSkgYXMgSW1wb3J0TWV0YUVudjtcbiAgY29uc3Qge1xuICAgIFZJVEVfQVBQX05BTUU6IGFwcE5hbWUsXG4gICAgVklURV9BUFBfQkFTRV9BUEk6IGJhc2VBcGksXG4gICAgVklURV9BUFBfUFVCTElDX1BBVEg6IHB1YmxpY1BhdGgsXG4gIH0gPSB2aXRlRW52O1xuICBjb25zdCBfX0RFVl9fID0gbW9kZSA9PT0gXCJkZXZlbG9wbWVudFwiO1xuICBjb25zdCBtb2R1bGVGZWRlcmF0aW9uQ29uZmlnOiBWaXRlUGx1Z2luRmVkZXJhdGlvbk9wdGlvbnMgPSB7XG4gICAgbmFtZTogYCR7YXBwTmFtZX1fZ2VuZXJhbGAsXG4gICAgZmlsZW5hbWU6IFwicmVtb3RlRW50cnkuanNcIixcbiAgICByZW1vdGVzOiB7XG4gICAgICBFUFRGTUVSR0U6IGBodHRwOi8vbG9jYWxob3N0OjUwMDEvYXNzZXRzL3JlbW90ZUVudHJ5LmpzYCxcbiAgICAgIEVGWDogX19ERVZfX1xuICAgICAgICA/IGAke2Jhc2VBcGl9cmVtb3RlX2V4cG9zZXMvRUZYL2Fzc2V0cy9yZW1vdGVFbnRyeS5qc2BcbiAgICAgICAgOiB7XG4gICAgICAgICAgICBleHRlcm5hbDogYFByb21pc2UucmVzb2x2ZShcbiAgICAgICAgICAgICAgd2luZG93LnRvcC5fQVBQX09QVElPTlNfICA/XG4gICAgICAgICAgICAgIHdpbmRvdy50b3AuX0FQUF9PUFRJT05TXy5hcHBDb250ZXh0ICsgJ3JlbW90ZV9leHBvc2VzL0VGWC9hc3NldHMvcmVtb3RlRW50cnkuanMnIFxuICAgICAgICAgICAgICAgIDogJy9yZW1vdGVfZXhwb3Nlcy9FRlgvYXNzZXRzL3JlbW90ZUVudHJ5LmpzJ1xuICAgICAgICAgICAgICApYCxcbiAgICAgICAgICAgIGV4dGVybmFsVHlwZTogXCJwcm9taXNlXCIsXG4gICAgICAgICAgfSxcbiAgICAgIEVJWDogX19ERVZfX1xuICAgICAgICA/IGAke2Jhc2VBcGl9cmVtb3RlX2V4cG9zZXMvRUlYL2Fzc2V0cy9yZW1vdGVFbnRyeS5qc2BcbiAgICAgICAgOiB7XG4gICAgICAgICAgICBleHRlcm5hbDogYFByb21pc2UucmVzb2x2ZShcbiAgICAgICAgICAgIHdpbmRvdy50b3AuX0FQUF9PUFRJT05TXyAgP1xuICAgICAgICAgICAgd2luZG93LnRvcC5fQVBQX09QVElPTlNfLmFwcENvbnRleHQgKyAncmVtb3RlX2V4cG9zZXMvRUlYL2Fzc2V0cy9yZW1vdGVFbnRyeS5qcycgXG4gICAgICAgICAgICAgIDogJy9yZW1vdGVfZXhwb3Nlcy9FSVgvYXNzZXRzL3JlbW90ZUVudHJ5LmpzJ1xuICAgICAgICAgICAgKWAsXG4gICAgICAgICAgICBleHRlcm5hbFR5cGU6IFwicHJvbWlzZVwiLFxuICAgICAgICAgIH0sXG5cbiAgICAgIEVSWDogX19ERVZfX1xuICAgICAgICA/IGAke2Jhc2VBcGl9cmVtb3RlX2V4cG9zZXMvRVJYL2Fzc2V0cy9yZW1vdGVFbnRyeS5qc2BcbiAgICAgICAgOiB7XG4gICAgICAgICAgICBleHRlcm5hbDogYFByb21pc2UucmVzb2x2ZShcbiAgICAgICAgICB3aW5kb3cudG9wLl9BUFBfT1BUSU9OU18gID9cbiAgICAgICAgICB3aW5kb3cudG9wLl9BUFBfT1BUSU9OU18uYXBwQ29udGV4dCArICdyZW1vdGVfZXhwb3Nlcy9FUlgvYXNzZXRzL3JlbW90ZUVudHJ5LmpzJ1xuICAgICAgICAgICAgOiAnL3JlbW90ZV9leHBvc2VzL0VSWC9hc3NldHMvcmVtb3RlRW50cnkuanMnXG4gICAgICAgICAgKWAsXG4gICAgICAgICAgICBleHRlcm5hbFR5cGU6IFwicHJvbWlzZVwiLFxuICAgICAgICAgIH0sXG5cbiAgICAgXG4gICAgICAvLyBcdTk2NDRcdTRFRjZcdTRFMEFcdTRGMjBcdTdFQzRcdTRFRjZcdTVGMTVcdTc1MjhcdTUxNzNcdTdDRkJcdTMwMDJcdTgyRTVcdTRFMERcdTk3MDBcdTg5ODFcdThCRjdcdTZDRThcdTkxQ0FcdTYzODlcdUZGMENcdTU0MjZcdTUyMTlcdTVFOTRcdTc1MjhcdTRGMUFcdTYyQTVcdTk1MTlcbiAgICAgIC8vIEVQVEY6IF9fREVWX19cbiAgICAgIC8vICAgPyBgJHtiYXNlQXBpfXJlbW90ZV9leHBvc2VzL0VQVEYvYXNzZXRzL3JlbW90ZUVudHJ5LmpzYFxuICAgICAgLy8gICA6IHtcbiAgICAgIC8vICAgICAgIGV4dGVybmFsOiBgUHJvbWlzZS5yZXNvbHZlKFxuICAgICAgLy8gICAgIHdpbmRvdy50b3AuX0FQUF9PUFRJT05TXyAgP1xuICAgICAgLy8gICAgIHdpbmRvdy50b3AuX0FQUF9PUFRJT05TXy5hcHBDb250ZXh0ICsgJ3JlbW90ZV9leHBvc2VzL0VQVEYvYXNzZXRzL3JlbW90ZUVudHJ5LmpzJ1xuICAgICAgLy8gICAgICAgOiAnL3JlbW90ZV9leHBvc2VzL0VQVEYvYXNzZXRzL3JlbW90ZUVudHJ5LmpzJ1xuICAgICAgLy8gICAgIClgLFxuICAgICAgLy8gICAgICAgZXh0ZXJuYWxUeXBlOiBcInByb21pc2VcIixcbiAgICAgIC8vICAgICB9LFxuICAgICAgLy8gXHU2MkE1XHU4ODY4XHU3RUM0XHU0RUY2XHU1RjE1XHU3NTI4XHU1MTczXHU3Q0ZCXHUzMDAyXHU4MkU1XHU0RTBEXHU5NzAwXHU4OTgxXHU4QkY3XHU2Q0U4XHU5MUNBXHU2Mzg5XHVGRjBDXHU1NDI2XHU1MjE5XHU1RTk0XHU3NTI4XHU0RjFBXHU2MkE1XHU5NTE5XG4gICAgICAvLyBFQkZSOiBfX0RFVl9fXG4gICAgICAvLyAgID8gYCR7YmFzZUFwaX1yZW1vdGVfZXhwb3Nlcy9FQkZSL2Fzc2V0cy9yZW1vdGVFbnRyeS5qc2BcbiAgICAgIC8vICAgOiB7XG4gICAgICAvLyAgICAgICBleHRlcm5hbDogYFByb21pc2UucmVzb2x2ZShcbiAgICAgIC8vICAgICB3aW5kb3cudG9wLl9BUFBfT1BUSU9OU18gID9cbiAgICAgIC8vICAgICB3aW5kb3cudG9wLl9BUFBfT1BUSU9OU18uYXBwQ29udGV4dCArICdyZW1vdGVfZXhwb3Nlcy9FQkZSL2Fzc2V0cy9yZW1vdGVFbnRyeS5qcydcbiAgICAgIC8vICAgICAgIDogJy9yZW1vdGVfZXhwb3Nlcy9FQkZSL2Fzc2V0cy9yZW1vdGVFbnRyeS5qcydcbiAgICAgIC8vICAgICApYCxcbiAgICAgIC8vICAgICAgIGV4dGVybmFsVHlwZTogXCJwcm9taXNlXCIsXG4gICAgICAvLyAgICAgfSxcbiAgICAgIC8vIEZpbGVNYW5hZ2VyOiBfX0RFVl9fXG4gICAgICAvLyAgID8gYCR7YmFzZUFwaX1yZW1vdGVfZXhwb3Nlcy9GaWxlTWFuYWdlci9hc3NldHMvcmVtb3RlRW50cnkuanNgXG4gICAgICAvLyAgIDoge1xuICAgICAgLy8gICAgICAgZXh0ZXJuYWw6IGBQcm9taXNlLnJlc29sdmUoXG4gICAgICAvLyAgICAgICAgIHdpbmRvdy50b3AuX0FQUF9PUFRJT05TXyAgP1xuICAgICAgLy8gICAgICAgICB3aW5kb3cudG9wLl9BUFBfT1BUSU9OU18uYXBwQ29udGV4dCArICdyZW1vdGVfZXhwb3Nlcy9GaWxlTWFuYWdlci9hc3NldHMvcmVtb3RlRW50cnkuanMnIFxuICAgICAgLy8gICAgICAgICAgIDogJy9yZW1vdGVfZXhwb3Nlcy9GaWxlTWFuYWdlci9hc3NldHMvcmVtb3RlRW50cnkuanMnXG4gICAgICAvLyAgICAgICAgIClgLFxuICAgICAgLy8gICAgICAgZXh0ZXJuYWxUeXBlOiBcInByb21pc2VcIixcbiAgICAgIC8vICAgICB9LFxuICAgIH0sXG4gICAgc2hhcmVkOiBbXCJ2dWVcIl0sXG4gIH07XG4gIGNvbnN0IHJlbW90ZU5hbWVzID0gT2JqZWN0LmtleXMobW9kdWxlRmVkZXJhdGlvbkNvbmZpZy5yZW1vdGVzISk7XG4gIGNvbnN0IHJlbW90ZVppcHMgPSByZW1vdGVOYW1lcy5tYXAoKGl0KSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlbW90ZU5hbWU6IGl0LFxuICAgICAgcmVtb3RlVXJsOiBgJHtiYXNlQXBpfXJlbW90ZV9leHBvc2VzLyR7aXR9LyR7aXR9LmQuemlwYCxcbiAgICB9O1xuICB9KTtcbiAgcmV0dXJuIGRlZmluZUNvbmZpZyh7XG4gICAgZGVmaW5lOiB7XG4gICAgICAvL3ZpdGVFbnZcbiAgICAgIFwicHJvY2Vzcy5lbnZcIjoge1xuICAgICAgICAuLi52aXRlRW52LFxuICAgICAgICBCVUlMRF9USU1FU1RBTVA6IGAke3RvSXNvU3RyaW5nKG5ldyBEYXRlKCkpfWAsXG4gICAgICB9LFxuICAgIH0sXG4gICAgYmFzZTogX19ERVZfXyA/IFwiL1wiIDogYC4vYCxcbiAgICByZXNvbHZlOiB7XG4gICAgICBhbGlhczoge1xuICAgICAgICAvKiogQCBcdTdCMjZcdTUzRjdcdTYzMDdcdTU0MTEgc3JjIFx1NzZFRVx1NUY1NSAqL1xuICAgICAgICBcIkBcIjogcmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmNcIiksXG4gICAgICAgIFwiI1wiOiByZXNvbHZlKF9fZGlybmFtZSksXG4gICAgICAgIHB1YmxpYzogcmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9wdWJsaWNcIiksXG4gICAgICB9LFxuICAgIH0sXG4gICAgcGx1Z2luczogW1xuICAgICAgdnVlKCksXG4gICAgICBWaXRlUGx1Z2luSHRtbEVudih7XG4gICAgICAgIGNvbXBpbGVyOiB0cnVlLFxuICAgICAgICAvLyBjb21waWxlcjogZmFsc2UgLy8gXHU2NUU3XHU3MjQ4XHU2NzJDXG4gICAgICB9KSxcbiAgICAgIEZlZGVyYXRpb25UeXBlc1BsdWdpbih7IHRhcmdldERpcjogXCJAbWYtdHlwZXNcIiwgcmVtb3RlWmlwczogcmVtb3RlWmlwcyB9KSxcbiAgICAgIEVudkNoZWNrUGx1Z2luKCksXG4gICAgICBmZWRlcmF0aW9uKG1vZHVsZUZlZGVyYXRpb25Db25maWcpLFxuICAgICAgLy8gdG9wTGV2ZWxBd2FpdCh7XG4gICAgICAvLyAgIC8vIFRoZSBleHBvcnQgbmFtZSBvZiB0b3AtbGV2ZWwgYXdhaXQgcHJvbWlzZSBmb3IgZWFjaCBjaHVuayBtb2R1bGVcbiAgICAgIC8vICAgcHJvbWlzZUV4cG9ydE5hbWU6IFwiX190bGFcIixcbiAgICAgIC8vICAgLy8gVGhlIGZ1bmN0aW9uIHRvIGdlbmVyYXRlIGltcG9ydCBuYW1lcyBvZiB0b3AtbGV2ZWwgYXdhaXQgcHJvbWlzZSBpbiBlYWNoIGNodW5rIG1vZHVsZVxuICAgICAgLy8gICBwcm9taXNlSW1wb3J0TmFtZTogKGkpID0+IGBfX3RsYV8ke2l9YCxcbiAgICAgIC8vIH0pLFxuICAgICAgdmlzdWFsaXplcih7XG4gICAgICAgIHRlbXBsYXRlOiBcInRyZWVtYXBcIiwgLy8gb3Igc3VuYnVyc3RcbiAgICAgICAgb3BlbjogZmFsc2UsXG4gICAgICAgIGd6aXBTaXplOiB0cnVlLFxuICAgICAgICBicm90bGlTaXplOiB0cnVlLFxuICAgICAgICBmaWxlbmFtZTogXCIuL2Rpc3QvYW5hbHlzZS5odG1sXCIsIC8vIHdpbGwgYmUgc2F2ZWQgaW4gcHJvamVjdCdzIHJvb3RcbiAgICAgIH0pLFxuICAgICAgdml0ZUNvbXByZXNzaW9uKHtcbiAgICAgICAgdGhyZXNob2xkOiAxMDI0MDAwLCAvLyBcdTVCRjlcdTU5MjdcdTRFOEUgMW1iIFx1NzY4NFx1NjU4N1x1NEVGNlx1OEZEQlx1ODg0Q1x1NTM4Qlx1N0YyOVxuICAgICAgfSksXG4gICAgXSxcbiAgICBzZXJ2ZXI6IHtcbiAgICAgIHByb3h5OiB7XG4gICAgICAgIC8vIFx1NEY3Rlx1NzUyOFx1NkI2M1x1NTIxOVx1ODg2OFx1OEZCRVx1NUYwRlx1NTMzOVx1OTE0RCBVUkxcbiAgICAgICAgXCJeLy4qL2FwaVwiOiB7XG4gICAgICAgICAgdGFyZ2V0OiBiYXNlQXBpLFxuICAgICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcbiAgICAgICAgICAvLyBcdTkwN0ZcdTUxNERcdTYyOEEgVml0ZSBcdTZFOTBcdTc4MDFcdTZBMjFcdTU3NTcgL3NyYy9hcGkvLi4uIFx1NUY1M1x1NjIxMFx1NTQwRVx1N0FFRlx1NjNBNVx1NTNFM1x1NEVFM1x1NzQwNlxuICAgICAgICAgIGJ5cGFzcyhyZXEpIHtcbiAgICAgICAgICAgIGlmIChyZXEudXJsPy5zdGFydHNXaXRoKCcvc3JjLycpKSB7XG4gICAgICAgICAgICAgIHJldHVybiByZXEudXJsOyAvLyBcdTRFQTRcdTU2REUgVml0ZSBcdTU5MDRcdTc0MDZcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIFwiL0VYXCI6IHtcbiAgICAgICAgICB0YXJnZXQ6IGJhc2VBcGksXG4gICAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxuICAgICAgICB9LFxuICAgICAgICBcIi9yZWZyZXNoVG9rZW5cIjoge1xuICAgICAgICAgIHRhcmdldDogYmFzZUFwaSxcbiAgICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXG4gICAgICAgIH0sXG4gICAgICAgIFwiL3JlbW90ZV9leHBvc2VzXCI6IHtcbiAgICAgICAgICB0YXJnZXQ6IGJhc2VBcGksXG4gICAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICAgIGJ1aWxkOiB7XG4gICAgICB0YXJnZXQ6IFwiZXNuZXh0XCIsXG4gICAgICBvdXREaXI6IGAuL2Rpc3QvJHthcHBOYW1lfWAsXG4gICAgICBzb3VyY2VtYXA6IGZhbHNlLFxuICAgICAgbWluaWZ5OiB0cnVlLFxuICAgIH0sXG4gICAgb3B0aW1pemVEZXBzOiB7XG4gICAgICBleGNsdWRlOiBbXG4gICAgICAgIFwiRUlYL2VpXCIsXG4gICAgICAgIFwiRUZYL2xvY2FsZVwiLFxuICAgICAgICBcIkVGWC9hZ1BsdWdpbnNcIixcbiAgICAgICAgXCJFRlgvQWdHcmlkVnVlXCIsXG4gICAgICAgIFwiRUZYL3RoZW1lXCIsXG4gICAgICAgIFwiRVJYL0VySTE4blwiLFxuICAgICAgICBcIkVGWC94ckVmRm9ybVwiLFxuICAgICAgICBcIkVGWC9FRkRpYWxvZ0Zvcm1cIixcbiAgICAgICAgXCJFRlgveHJFZlBhbmVsXCIsXG4gICAgICAgIFwiRUZYL3hyRWZTZWFyY2hCb3hcIixcbiAgICAgICAgXCJFUlgvRXJMYXlvdXRcIixcbiAgICAgICAgXCJFUlgvRXJHcmlkXCIsXG4gICAgICAgIFwiRVJYL0VyXCIsXG4gICAgICAgIFwiRVJYL0VyUG9wRnJlZVwiXG4gICAgICBdXG4gICAgfVxuICB9KTtcbn07XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkQ6XFxcXGlwbGF0NENcXFxcRVBURkhWVUVcXFxceHItZXB0Zm1lcmdlLWRldlxcXFxidWlsZFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcaXBsYXQ0Q1xcXFxFUFRGSFZVRVxcXFx4ci1lcHRmbWVyZ2UtZGV2XFxcXGJ1aWxkXFxcXHV0aWxzLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi9pcGxhdDRDL0VQVEZIVlVFL3hyLWVwdGZtZXJnZS1kZXYvYnVpbGQvdXRpbHMudHNcIjtleHBvcnQgY29uc3QgdG9Jc29TdHJpbmcgPSAoZGF0ZTogRGF0ZSkgPT4ge1xuICB2YXIgdHpvID0gLWRhdGUuZ2V0VGltZXpvbmVPZmZzZXQoKSxcbiAgICBkaWYgPSB0em8gPj0gMCA/ICcrJyA6ICctJyxcbiAgICBwYWQgPSAobnVtOiBudW1iZXIpID0+IHtcbiAgICAgIHJldHVybiAobnVtIDwgMTAgPyAnMCcgOiAnJykgKyBudW07XG4gICAgfTtcblxuICByZXR1cm4gKFxuICAgIGRhdGUuZ2V0RnVsbFllYXIoKSArXG4gICAgJy0nICtcbiAgICBwYWQoZGF0ZS5nZXRNb250aCgpICsgMSkgK1xuICAgICctJyArXG4gICAgcGFkKGRhdGUuZ2V0RGF0ZSgpKSArXG4gICAgJ1QnICtcbiAgICBwYWQoZGF0ZS5nZXRIb3VycygpKSArXG4gICAgJzonICtcbiAgICBwYWQoZGF0ZS5nZXRNaW51dGVzKCkpICtcbiAgICAnOicgK1xuICAgIHBhZChkYXRlLmdldFNlY29uZHMoKSkgK1xuICAgIGRpZiArXG4gICAgcGFkKE1hdGguZmxvb3IoTWF0aC5hYnModHpvKSAvIDYwKSkgK1xuICAgICc6JyArXG4gICAgcGFkKE1hdGguYWJzKHR6bykgJSA2MClcbiAgKTtcbn07XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkQ6XFxcXGlwbGF0NENcXFxcRVBURkhWVUVcXFxceHItZXB0Zm1lcmdlLWRldlxcXFxidWlsZFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcaXBsYXQ0Q1xcXFxFUFRGSFZVRVxcXFx4ci1lcHRmbWVyZ2UtZGV2XFxcXGJ1aWxkXFxcXHZpdGUtcGx1Z2luLWZlZGVyYXRpb24tdHlwZXMudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L2lwbGF0NEMvRVBURkhWVUUveHItZXB0Zm1lcmdlLWRldi9idWlsZC92aXRlLXBsdWdpbi1mZWRlcmF0aW9uLXR5cGVzLnRzXCI7LypcbiAqIEBEZXNjcmlwdGlvbjogXHU4MUVBXHU1MkE4XHU2NkY0XHU2NUIwXHU1OEYwXHU2NjBFXHU2NTg3XHU0RUY2XHU2M0QyXHU0RUY2LVx1OTAxQVx1OEZDN1x1NUJGOVx1NkJENFx1NjcwRFx1NTJBMVx1NTY2OFx1NEUwQXppcFx1NjU4N1x1NEVGNlx1NTQ4Q1x1NjcyQ1x1NTczMFx1OEJCMFx1NUY1NVx1NzY4NFx1NjcwMFx1OEZEMVx1NEZFRVx1NjUzOVx1NjVGNlx1OTVGNFx1Njc2NVx1Nzg2RVx1NUI5QVx1NjYyRlx1NTQyNlx1ODk4MVx1NjZGNFx1NjVCMFx1NThGMFx1NjYwRVx1NjU4N1x1NEVGNlxuICogQEF1dGhvcjogRWR3YXJkXG4gKiBARGF0ZTogMjAyNC0wMi0yOSAxMzoxNzo0M1xuICogQExhc3RFZGl0b3JzOiBFZHdhcmRcbiAqIEBMYXN0RWRpdFRpbWU6IDIwMjQtMDMtMDQgMTE6MjE6MjVcbiAqL1xuaW1wb3J0ICogYXMgZnMgZnJvbSBcImZzXCI7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgYXhpb3MgZnJvbSBcImF4aW9zXCI7XG5cbmltcG9ydCBjb21wcmVzc2luZyBmcm9tIFwiY29tcHJlc3NpbmdcIjtcblxuaW1wb3J0IHsgUmVzb2x2ZWRDb25maWcsIFBsdWdpbiB9IGZyb20gXCJ2aXRlXCI7XG5pbnRlcmZhY2UgUmVtb3RlWmlwIHtcbiAgcmVtb3RlTmFtZTogc3RyaW5nO1xuICByZW1vdGVVcmw6IHN0cmluZztcbiAgaXNaaXA/OiBib29sZWFuO1xufVxuaW50ZXJmYWNlIEZlZGVyYXRpb25UeXBlc1BsdWdpbk9wdGlvbnMge1xuICB0YXJnZXREaXI6IHN0cmluZztcbiAgcmVtb3RlWmlwczogUmVtb3RlWmlwW107XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBGZWRlcmF0aW9uVHlwZXNQbHVnaW4oXG4gIG9wdGlvbnM6IEZlZGVyYXRpb25UeXBlc1BsdWdpbk9wdGlvbnNcbik6IFBsdWdpbiB7XG4gIGNvbnN0IGJhc2VEaXIgPSBwcm9jZXNzLmN3ZCgpO1xuICBjb25zdCBkb3dubG9hZERpciA9IHBhdGguam9pbihiYXNlRGlyLCBcIi50eXBlcy1kb3dubG9hZFwiKTtcbiAgY29uc3QgZmxhZ0RpciA9IHBhdGguam9pbihkb3dubG9hZERpciwgXCIubGFzdE1vZGlmaWVkVGltZVwiKTtcbiAgZnMubWtkaXJTeW5jKGZsYWdEaXIsIHsgcmVjdXJzaXZlOiB0cnVlIH0pO1xuICByZXR1cm4ge1xuICAgIG5hbWU6IFwidml0ZS1wbHVnaW4tZmVkZXJhdGlvbi10eXBlc1wiLFxuICAgIGFzeW5jIGNvbmZpZ1Jlc29sdmVkKGNvbmZpZzogUmVzb2x2ZWRDb25maWcpIHtcbiAgICAgIC8vIFx1NjhDMFx1NjdFNVx1NjYyRlx1NTQyNlx1NEYyMFx1NTE2NVx1NEU4Nlx1OEZEQ1x1N0EwQiBkLnRzIFx1NjU4N1x1NEVGNlx1NzY4NFx1NzZFRVx1NjgwN1x1NzZFRVx1NUY1NVxuICAgICAgaWYgKCFvcHRpb25zIHx8ICFvcHRpb25zLnRhcmdldERpciB8fCBvcHRpb25zLnJlbW90ZVppcHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoXCJcdThCRjdcdTYzRDBcdTRGOUJcdTc2RUVcdTY4MDdcdTc2RUVcdTVGNTVcdUZGMDFcIik7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gXHU4QkJFXHU3RjZFXHU2NjJGXHU1NDI2XHU0RTNBXHU1RjAwXHU1M0QxXHU2QTIxXHU1RjBGXHVGRjBDeWFybiBzZXJ2ZVx1NjVGNlx1NjI2N1x1ODg0Q1x1RkYwQ3lhcm4gYnVpbGRcdTY1RjZcdTRFMERcdTYyNjdcdTg4NENcbiAgICAgIGNvbnN0IGlzRGV2TW9kZSA9IGNvbmZpZy5jb21tYW5kID09PSBcInNlcnZlXCI7XG4gICAgICBpZiAoY29uZmlnLmNvbW1hbmQgPT09IFwiYnVpbGRcIikgcmV0dXJuO1xuXG4gICAgICBmb3IgKGNvbnN0IHRhclppcCBvZiBvcHRpb25zLnJlbW90ZVppcHMpIHtcbiAgICAgICAgY29uc3QgZmxhZ1BhdGggPSBwYXRoLmpvaW4oZmxhZ0RpciwgYCR7dGFyWmlwLnJlbW90ZU5hbWV9LnR4dGApO1xuICAgICAgICBjb25zdCBsYXN0TW9kaWZpZWRUaW1lID0gYXdhaXQgZ2V0TGFzdE1vZGlmaWVkVGltZShmbGFnUGF0aCk7XG4gICAgICAgIGNvbnN0IG5lZWRzVXBkYXRlID0gYXdhaXQgc2hvdWxkVXBkYXRlUmVtb3RlRmlsZShcbiAgICAgICAgICB0YXJaaXAucmVtb3RlVXJsLFxuICAgICAgICAgIGxhc3RNb2RpZmllZFRpbWVcbiAgICAgICAgKTtcblxuICAgICAgICBpZiAoY29uZmlnLmNvbW1hbmQgPT09IFwic2VydmVcIiAmJiBuZWVkc1VwZGF0ZSkge1xuICAgICAgICAgIGF3YWl0IGRvd25sb2FkQW5kRXh0cmFjdFJlbW90ZVppcChcbiAgICAgICAgICAgIHRhclppcC5yZW1vdGVOYW1lLFxuICAgICAgICAgICAgdGFyWmlwLnJlbW90ZVVybFxuICAgICAgICAgICk7XG4gICAgICAgICAgYXdhaXQgbWFya0xhc3RNb2RpZmllZFRpbWUoZmxhZ1BhdGgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICB0cmFuc2Zvcm0oY29kZTogYW55LCBpZDogYW55KSB7fSxcbiAgfTtcblxuICAvKipcbiAgICogXHU1MjI0XHU2NUFEXHU2NjJGXHU1NDI2XHU5NzAwXHU4OTgxXHU2NkY0XHU2NUIwXHU1OEYwXHU2NjBFXHU2NTg3XHU0RUY2KFx1OTAxQVx1OEZDN1x1NUJGOVx1NkJENFx1NjcwRFx1NTJBMVx1NTY2OFx1NEUwQXppcFx1NjU4N1x1NEVGNlx1NTQ4Q1x1NjcyQ1x1NTczMFx1OEJCMFx1NUY1NVx1NzY4NFx1NjcwMFx1OEZEMVx1NEZFRVx1NjUzOVx1NjVGNlx1OTVGNClcbiAgICogQHBhcmFtIHJlbW90ZVVybCBcdTY3MERcdTUyQTFcdTU2NjhcdTRFMEF6aXBcdTY1ODdcdTRFRjZcdTc2ODRcdTU3MzBcdTU3NDBcbiAgICogQHBhcmFtIGxhc3RNb2RpZmllZFRpbWUgXHU2NzJDXHU1NzMwXHU4QkIwXHU1RjU1XHU3Njg0XHU2NzAwXHU4RkQxXHU0RkVFXHU2NTM5XHU2NUY2XHU5NUY0XG4gICAqIEByZXR1cm5zIEJvb2xlYW5cbiAgICovXG4gIGFzeW5jIGZ1bmN0aW9uIHNob3VsZFVwZGF0ZVJlbW90ZUZpbGUoXG4gICAgcmVtb3RlVXJsOiBzdHJpbmcsXG4gICAgbGFzdE1vZGlmaWVkVGltZTogbnVtYmVyIHwgbnVsbFxuICApIHtcbiAgICBpZiAoIWxhc3RNb2RpZmllZFRpbWUpIHtcbiAgICAgIHJldHVybiB0cnVlOyAvLyBJZiBsYXN0TW9kaWZpZWRUaW1lIGlzIG5vdCBhdmFpbGFibGUsIGl0IG1lYW5zIHdlIG5lZWQgdG8gZG93bmxvYWQgdGhlIGZpbGVcbiAgICB9XG5cbiAgICBjb25zdCByZW1vdGVMYXN0TW9kaWZpZWRUaW1lID0gYXdhaXQgZ2V0UmVtb3RlRmlsZUxhc3RNb2RpZmllZFRpbWUoXG4gICAgICByZW1vdGVVcmxcbiAgICApO1xuICAgIHJldHVybiByZW1vdGVMYXN0TW9kaWZpZWRUaW1lICYmIHJlbW90ZUxhc3RNb2RpZmllZFRpbWUgPiBsYXN0TW9kaWZpZWRUaW1lO1xuICB9XG5cbiAgLyoqXG4gICAqIFx1ODlFM1x1NTM4QnppcFx1NTIzMFx1NjMwN1x1NUI5QVx1NzZFRVx1NUY1NShAbWYtdHlwZXMpXHU1RTc2XHU1MjIwXHU5NjY0emlwXHU2NTg3XHU0RUY2XG4gICAqIEBwYXJhbSByZW1vdGVOYW1lIHppcFx1NTMwNVx1NTQwRFx1NzlGMFx1RkYwQ1x1NEY4Qlx1RkYxQUVGWFx1MzAwMUVSWFxuICAgKiBAcGFyYW0gemlwRmlsZVBhdGggemlwXHU1MzA1XHU3Njg0XHU2NTg3XHU0RUY2XHU4REVGXHU1Rjg0XG4gICAqL1xuICBhc3luYyBmdW5jdGlvbiBleHRyYWN0QW5kRGVsZXRlWmlwKHJlbW90ZU5hbWU6IHN0cmluZywgemlwRmlsZVBhdGg6IHN0cmluZykge1xuICAgIGNvbnN0IHRhcmdldERpciA9IHBhdGguam9pbihiYXNlRGlyLCBcIkBtZi10eXBlc1wiKTtcblxuICAgIHRyeSB7XG4gICAgICBhd2FpdCBjb21wcmVzc2luZy56aXAudW5jb21wcmVzcyh6aXBGaWxlUGF0aCwgdGFyZ2V0RGlyKTtcbiAgICAgIGNvbnNvbGUubG9nKGAke3JlbW90ZU5hbWV9IFx1NzY4NFx1NjU4N1x1NEVGNlx1ODlFM1x1NTM4Qlx1NjIxMFx1NTI5Rlx1RkYwMWApO1xuICAgICAgZnMudW5saW5rU3luYyh6aXBGaWxlUGF0aCk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGAke3JlbW90ZU5hbWV9IFx1NzY4NFx1NjU4N1x1NEVGNlx1ODlFM1x1NTM4Qlx1NTkzMVx1OEQyNVx1RkYxQWAsIGVycik7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFx1NEVDRVx1NjcwRFx1NTJBMVx1NTY2OFx1NEUwQlx1OEY3RHppcFx1NjU4N1x1NEVGNlx1NUU3Nlx1OEMwM1x1NzUyOFx1ODlFM1x1NTM4Qlx1NjVCOVx1NkNENVxuICAgKiBAcGFyYW0gcmVtb3RlTmFtZSB6aXBcdTUzMDVcdTU0MERcdTc5RjBcdUZGMENcdTRGOEJcdUZGMUFFRlhcdTMwMDFFUlhcbiAgICogQHBhcmFtIHJlbW90ZVppcFVybCBcdTY3MERcdTUyQTFcdTU2NjhcdTRFMEF6aXBcdTY1ODdcdTRFRjZcdTc2ODRcdTU3MzBcdTU3NDBcbiAgICovXG4gIGFzeW5jIGZ1bmN0aW9uIGRvd25sb2FkQW5kRXh0cmFjdFJlbW90ZVppcChcbiAgICByZW1vdGVOYW1lOiBzdHJpbmcsXG4gICAgcmVtb3RlWmlwVXJsOiBzdHJpbmdcbiAgKSB7XG4gICAgY29uc3QgemlwRmlsZU5hbWUgPSBgJHtyZW1vdGVOYW1lfS56aXBgO1xuICAgIGNvbnN0IHppcEZpbGVQYXRoID0gcGF0aC5qb2luKGRvd25sb2FkRGlyLCB6aXBGaWxlTmFtZSk7XG5cbiAgICAvLyBcdTRFMEJcdThGN0RcdThGRENcdTdBMEIgemlwIFx1NjU4N1x1NEVGNlxuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPHZvaWQ+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGF4aW9zXG4gICAgICAgIC5nZXQocmVtb3RlWmlwVXJsLCB7IHJlc3BvbnNlVHlwZTogXCJzdHJlYW1cIiB9KVxuICAgICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgICAgICBjb25zdCB7IGRhdGEsIGhlYWRlcnMgfSA9IHJlc3BvbnNlO1xuICAgICAgICAgIGNvbnN0IHppcEZpbGVTdHJlYW0gPSBkYXRhO1xuICAgICAgICAgIGNvbnN0IHdyaXRlU3RyZWFtID0gZnMuY3JlYXRlV3JpdGVTdHJlYW0oemlwRmlsZVBhdGgpO1xuICAgICAgICAgIHppcEZpbGVTdHJlYW0ucGlwZSh3cml0ZVN0cmVhbSk7XG5cbiAgICAgICAgICB3cml0ZVN0cmVhbS5vbihcImZpbmlzaFwiLCAoKSA9PiB7XG4gICAgICAgICAgICBleHRyYWN0QW5kRGVsZXRlWmlwKHJlbW90ZU5hbWUsIHppcEZpbGVQYXRoKVxuICAgICAgICAgICAgICAudGhlbihyZXNvbHZlKVxuICAgICAgICAgICAgICAuY2F0Y2gocmVqZWN0KTtcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIHdyaXRlU3RyZWFtLm9uKFwiZXJyb3JcIiwgcmVqZWN0KTtcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogXHU4M0I3XHU1M0Q2XHU2NzBEXHU1MkExXHU1NjY4XHU0RTBBemlwXHU2NTg3XHU0RUY2XHU3Njg0XHU2NzAwXHU4RkQxXHU0RkVFXHU2NTM5XHU2NUY2XHU5NUY0XG4gICAqIEBwYXJhbSByZW1vdGVVcmwgXHU2NzBEXHU1MkExXHU1NjY4XHU0RTBBemlwXHU2NTg3XHU0RUY2XHU3Njg0XHU1NzMwXHU1NzQwXG4gICAqIEByZXR1cm5zIFx1NjcwMFx1OEZEMVx1NEZFRVx1NjUzOVx1NjVGNlx1OTVGNCBEYXRlXG4gICAqL1xuICBhc3luYyBmdW5jdGlvbiBnZXRSZW1vdGVGaWxlTGFzdE1vZGlmaWVkVGltZShcbiAgICByZW1vdGVVcmw6IHN0cmluZ1xuICApOiBQcm9taXNlPG51bWJlciB8IG51bGw+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBheGlvcy5oZWFkKHJlbW90ZVVybCk7XG4gICAgICBjb25zdCBsYXN0TW9kaWZpZWRIZWFkZXIgPSByZXNwb25zZS5oZWFkZXJzW1wibGFzdC1tb2RpZmllZFwiXTtcbiAgICAgIGlmIChsYXN0TW9kaWZpZWRIZWFkZXIpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlKGxhc3RNb2RpZmllZEhlYWRlcikuZ2V0VGltZSgpO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKFwiXHU4M0I3XHU1M0Q2XHU4RkRDXHU3QTBCXHU2NTg3XHU0RUY2XHU2NzAwXHU1NDBFXHU0RkVFXHU2NTM5XHU2NUY2XHU5NUY0XHU2NUY2XHU1MUZBXHU5NTE5XHVGRjFBXCIsIGVycm9yKTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICAvKipcbiAgICogXHU2NkY0XHU2NUIwXHU2NzJDXHU1NzMwXHU4QkIwXHU1RjU1XHU3Njg0XHU2NzAwXHU4RkQxXHU0RkVFXHU2NTM5XHU2NUY2XHU5NUY0XG4gICAqIEBwYXJhbSBmbGFnUGF0aCBcdTY3MkNcdTU3MzBcdThCQjBcdTVGNTVcdTc2ODRcdTY1ODdcdTRFRjZcdThERUZcdTVGODRcbiAgICovXG4gIGFzeW5jIGZ1bmN0aW9uIG1hcmtMYXN0TW9kaWZpZWRUaW1lKGZsYWdQYXRoOiBzdHJpbmcpIHtcbiAgICBjb25zdCBjdXJyZW50VGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgIGZzLndyaXRlRmlsZVN5bmMoZmxhZ1BhdGgsIFN0cmluZyhjdXJyZW50VGltZSkpO1xuICB9XG5cbiAgLyoqXG4gICAqIFx1ODNCN1x1NTNENlx1NjcyQ1x1NTczMFx1OEJCMFx1NUY1NVx1NzY4NFx1NjcwMFx1OEZEMVx1NEZFRVx1NjUzOVx1NjVGNlx1OTVGNFxuICAgKiBAcGFyYW0gZmxhZ1BhdGggXHU2NzJDXHU1NzMwXHU4QkIwXHU1RjU1XHU3Njg0XHU2NTg3XHU0RUY2XHU4REVGXHU1Rjg0XG4gICAqIEByZXR1cm5zIFx1NjcwMFx1OEZEMVx1NEZFRVx1NjUzOVx1NjVGNlx1OTVGNCBEYXRlXG4gICAqL1xuICBhc3luYyBmdW5jdGlvbiBnZXRMYXN0TW9kaWZpZWRUaW1lKGZsYWdQYXRoOiBzdHJpbmcpOiBQcm9taXNlPG51bWJlciB8IG51bGw+IHtcbiAgICBpZiAoZnMuZXhpc3RzU3luYyhmbGFnUGF0aCkpIHtcbiAgICAgIGNvbnN0IGxhc3RNb2RpZmllZFRpbWVTdHJpbmcgPSBmcy5yZWFkRmlsZVN5bmMoZmxhZ1BhdGgsIFwidXRmLThcIik7XG4gICAgICByZXR1cm4gcGFyc2VJbnQobGFzdE1vZGlmaWVkVGltZVN0cmluZywgMTApIHx8IG51bGw7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG59XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkQ6XFxcXGlwbGF0NENcXFxcRVBURkhWVUVcXFxceHItZXB0Zm1lcmdlLWRldlxcXFxidWlsZFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcaXBsYXQ0Q1xcXFxFUFRGSFZVRVxcXFx4ci1lcHRmbWVyZ2UtZGV2XFxcXGJ1aWxkXFxcXHZpdGUtcGx1Z2luLWVudi1jaGVjay50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovaXBsYXQ0Qy9FUFRGSFZVRS94ci1lcHRmbWVyZ2UtZGV2L2J1aWxkL3ZpdGUtcGx1Z2luLWVudi1jaGVjay50c1wiOy8qXG4gKiBARGVzY3JpcHRpb246IFx1NjI1M1x1NTMwNVx1NjVGNlx1NjhDMFx1NjdFNS5lbnYuZGV2ZWxvcG1lbnRcdTU0OEMuZW52LnByb2R1Y3Rpb25cdTRFMkRWSVRFX0FQUF9OQU1FXHU2NjJGXHU1NDI2XHU0RTAwXHU4MUY0XG4gKiBAQXV0aG9yOiBHdWlYaW5cbiAqIEBEYXRlOiAyMDI1LTAzLTExIDA5OjUwOjAwXG4gKiBATGFzdEVkaXRvcnM6IEd1aVhpblxuICogQExhc3RFZGl0VGltZTogMjAyNS0wMy0xMSAwOTo1MDowMFxuICovXG5pbXBvcnQgeyBsb2FkRW52LCBSZXNvbHZlZENvbmZpZywgUGx1Z2luIH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XG5cbmV4cG9ydCBmdW5jdGlvbiBFbnZDaGVja1BsdWdpbigpOiBQbHVnaW4ge1xuICBjb25zdCBiYXNlRGlyID0gcHJvY2Vzcy5jd2QoKTtcbiAgcmV0dXJuIHtcbiAgICBuYW1lOiBcInZpdGUtcGx1Z2luLWVudi1jaGVja1wiLFxuICAgIGFzeW5jIGNvbmZpZ1Jlc29sdmVkKGNvbmZpZzogUmVzb2x2ZWRDb25maWcpIHtcbiAgICAgIGlmIChjb25maWcuY29tbWFuZCA9PT0gXCJzZXJ2ZVwiKSByZXR1cm47XG5cbiAgICAgIGNvbnN0IGVudkRpciA9IGNvbmZpZy5lbnZEaXIgfHwgcGF0aC5yZXNvbHZlKGJhc2VEaXIsIFwiLmVudlwiKTtcbiAgICAgIC8vIGNvbnNvbGUubG9nKGVudkRpcik7XG4gICAgICBjb25zdCBkZXZFbnYgPSBsb2FkRW52KFwiZGV2ZWxvcG1lbnRcIiwgZW52RGlyKTtcbiAgICAgIGNvbnN0IHByb2RFbnYgPSBsb2FkRW52KFwicHJvZHVjdGlvblwiLCBlbnZEaXIpO1xuXG4gICAgICBjb25zdCBkZXZBcHBOYW1lID0gZGV2RW52LlZJVEVfQVBQX05BTUU7XG4gICAgICBjb25zdCBwcm9kQXBwTmFtZSA9IHByb2RFbnYuVklURV9BUFBfTkFNRTtcblxuICAgICAgaWYgKGRldkFwcE5hbWUgIT09IHByb2RBcHBOYW1lKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBgVklURV9BUFBfTkFNRSBcdTU3MjggLmVudi5kZXZlbG9wbWVudCBcdTU0OEMgLmVudi5wcm9kdWN0aW9uIFx1NEUyRFx1NEUwRFx1NEUwMFx1ODFGNDogXG4gICAgICAgICAgLmVudi5kZXZlbG9wbWVudDogJHtkZXZBcHBOYW1lfSwgLmVudi5wcm9kdWN0aW9uOiAke3Byb2RBcHBOYW1lfWBcbiAgICAgICAgKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiLmVudi5kZXZlbG9wbWVudDogXCIsIGRldkFwcE5hbWUpO1xuICAgICAgICBjb25zb2xlLmxvZyhcIi5lbnYucHJvZHVjdGlvbjogXCIsIHByb2RBcHBOYW1lKTtcbiAgICAgIH1cbiAgICB9LFxuICB9O1xufVxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQU9BLFNBQVMsY0FBYyxXQUFBQSxnQkFBMEI7QUFDakQsT0FBTyxTQUFTO0FBRWhCLE9BQU8sZ0JBRUE7QUFFUCxTQUFTLGVBQWU7QUFDeEIsU0FBUyxrQkFBa0I7QUFDM0IsT0FBTyxxQkFBcUI7OztBQ2hCeVIsSUFBTSxjQUFjLENBQUMsU0FBZTtBQUN2VixNQUFJLE1BQU0sQ0FBQyxLQUFLLGtCQUFrQixHQUNoQyxNQUFNLE9BQU8sSUFBSSxNQUFNLEtBQ3ZCLE1BQU0sQ0FBQyxRQUFnQjtBQUNyQixZQUFRLE1BQU0sS0FBSyxNQUFNLE1BQU07QUFBQSxFQUNqQztBQUVGLFNBQ0UsS0FBSyxZQUFZLElBQ2pCLE1BQ0EsSUFBSSxLQUFLLFNBQVMsSUFBSSxDQUFDLElBQ3ZCLE1BQ0EsSUFBSSxLQUFLLFFBQVEsQ0FBQyxJQUNsQixNQUNBLElBQUksS0FBSyxTQUFTLENBQUMsSUFDbkIsTUFDQSxJQUFJLEtBQUssV0FB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QUFBQSxNQUNOLE9BQU87QUFBQTtBQUFBLFFBRUwsWUFBWTtBQUFBLFVBQ1YsUUFBUTtBQUFBLFVBQ1IsY0FBYztBQUFBO0FBQUEsVUFFZCxPQUFPLEtBQUs7QUFwS3RCO0FBcUtZLGlCQUFJLFNBQUksUUFBSixtQkFBUyxXQUFXLFVBQVU7QUFDaEMscUJBQU8sSUFBSTtBQUFBLFlBQ2I7QUFBQSxVQUNGO0FBQUEsUUFDRjtBQUFBLFFBQ0EsT0FBTztBQUFBLFVBQ0wsUUFBUTtBQUFBLFVBQ1IsY0FBYztBQUFBLFFBQ2hCO0FBQUEsUUFDQSxpQkFBaUI7QUFBQSxVQUNmLFFBQVE7QUFBQSxVQUNSLGNBQWM7QUFBQSxRQUNoQjtBQUFBLFFBQ0EsbUJBQW1CO0FBQUEsVUFDakIsUUFBUTtBQUFBLFVBQ1IsY0FBYztBQUFBLFFBQ2hCO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUNBLE9BQU87QUFBQSxNQUNMLFFBQVE7QUFBQSxNQUNSLFFBQVEsVUFBVSxPQUFPO0FBQUEsTUFDekIsV0FBVztBQUFBLE1BQ1gsUUFBUTtBQUFBLElBQ1Y7QUFBQSxJQUNBLGNBQWM7QUFBQSxNQUNaLFNBQVM7QUFBQSxRQUNQO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRixDQUFDO0FBQ0g7IiwKICAibmFtZXMiOiBbImxvYWRFbnYiLCAicmVzb2x2ZSIsICJwYXRoIiwgInBhdGgiLCAibG9hZEVudiJdCn0K
