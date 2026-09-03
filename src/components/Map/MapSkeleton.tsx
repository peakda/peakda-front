// SDK와 첫 지도 타일이 준비될 때까지 지도 자리를 채운다.
// CSS만 사용해 느린 네트워크에서도 별도 이미지 요청 없이 바로 보인다.
export const MapSkeleton = () => (
  <div
    className="relative flex h-full w-full items-center justify-center overflow-hidden bg-green-50"
    aria-label="지도 로딩 중"
    aria-busy="true"
    role="status"
  >
    <div
      aria-hidden="true"
      className="absolute top-[18%] -left-8 h-12 w-[120%] rotate-12 bg-white/80"
    />
    <div
      aria-hidden="true"
      className="absolute top-[58%] -left-8 h-9 w-[120%] -rotate-6 bg-white/70"
    />
    <div
      aria-hidden="true"
      className="absolute -top-8 left-[18%] h-[115%] w-8 rotate-3 bg-white/60"
    />
    <div className="border-border-primary bg-bg-primary/95 relative flex items-center gap-3 rounded-full border px-5 py-3 shadow-lg">
      <span
        aria-hidden="true"
        className="h-5 w-5 animate-spin rounded-full border-2 border-green-100 border-t-green-500 motion-reduce:animate-none"
      />
      <span className="text-text-secondary text-sm font-semibold">지도를 불러오는 중이에요</span>
    </div>
  </div>
)
