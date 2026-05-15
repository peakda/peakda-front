import { defineConfig } from "orval";

export default defineConfig({
  peakda: {
    input: { target: "./swagger.json" },
    output: {
      mode: "tags-split",
      target: "./src/api/generated",
      client: "fetch",
      clean: true,
      override: {
        mutator: {
          path: "./src/api/mutator/index.ts",
          name: "customInstance",
        },
      },
    },
  },
});
