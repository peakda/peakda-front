import { defineConfig } from "orval";

export default defineConfig({
  peakda: {
    input: { target: "./swagger.json" },
    output: {
      mode: "tags-split",
      target: "./src/api/facades/generated",
      client: "react-query",
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
