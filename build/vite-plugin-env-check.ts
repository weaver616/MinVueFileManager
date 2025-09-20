/*
 * @Description: 打包时检查.env.development和.env.production中VITE_APP_NAME是否一致
 * @Author: GuiXin
 * @Date: 2025-03-11 09:50:00
 * @LastEditors: GuiXin
 * @LastEditTime: 2025-03-11 09:50:00
 */
import { loadEnv, ResolvedConfig, Plugin } from "vite";
import path from "path";

export function EnvCheckPlugin(): Plugin {
  const baseDir = process.cwd();
  return {
    name: "vite-plugin-env-check",
    async configResolved(config: ResolvedConfig) {
      if (config.command === "serve") return;

      const envDir = config.envDir || path.resolve(baseDir, ".env");
      // console.log(envDir);
      const devEnv = loadEnv("development", envDir);
      const prodEnv = loadEnv("production", envDir);

      const devAppName = devEnv.VITE_APP_NAME;
      const prodAppName = prodEnv.VITE_APP_NAME;

      if (devAppName !== prodAppName) {
        throw new Error(
          `VITE_APP_NAME 在 .env.development 和 .env.production 中不一致: 
          .env.development: ${devAppName}, .env.production: ${prodAppName}`
        );
      } else {
        console.log(".env.development: ", devAppName);
        console.log(".env.production: ", prodAppName);
      }
    },
  };
}
