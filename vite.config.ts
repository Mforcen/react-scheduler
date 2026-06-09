import { resolve } from "path";
import { defineConfig } from "vite-plus";
import dts from "unplugin-dts/vite";

export default defineConfig({
  staged: {
    "*": "vp check --fix",
  },
  lint: { options: { typeAware: true, typeCheck: true } },
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "ReactScheduler",
      formats: ["es"],
      fileName: "react-scheduler",
    },
  },
  plugins: [dts()],
});
