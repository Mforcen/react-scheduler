import { resolve } from "path";
import { defineConfig } from "vite-plus";
import react from "@vitejs/plugin-react";

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
  plugins: [react()],
});
