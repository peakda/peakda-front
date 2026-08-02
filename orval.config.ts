import { defineConfig } from "orval";

const pascal = (value: string) =>
  value
    .split(/[-_]/)
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join("");

export default defineConfig({
  peakda: {
    input: { target: "./swagger.json" },
    output: {
      mode: "tags-split",
      // 임시 디렉터리에 생성한 뒤 scripts/sync-generated.mjs 가 변경분만 generated/ 로 옮긴다.
      // generated/ 와 같은 depth 여야 mutator 상대경로가 일치한다.
      target: "./src/api/facades/.generated-next",
      client: "react-query",
      clean: true,
      override: {
        mutator: {
          path: "./src/api/mutator/index.ts",
          name: "customInstance",
        },
        // 백엔드 operationId 가 list/get 처럼 도메인 구분 없이 중복이라, orval 이 붙이는
        // 숫자 접미사(list1, list2…)가 스펙 전체 등장 순서로 매겨진다. 그래서 무관한 API 가
        // 하나만 추가돼도 기존 이름이 통째로 밀린다. route + verb 로 직접 지어 순서와 무관하게 고정.
        operationName: (_operation, route, verb) =>
          verb +
          route
            .replace(/^\/api\//, "")
            .split("/")
            .filter(Boolean)
            .map((segment) => {
              // 경로 변수는 `${id}` 형태로 넘어온다
              const param = segment.match(/^\$\{(.+)\}$/);
              return param ? `By${pascal(param[1])}` : pascal(segment);
            })
            .join(""),
      },
    },
  },
});
