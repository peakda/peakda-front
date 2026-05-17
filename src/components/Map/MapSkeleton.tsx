export const MapSkeleton = () => (
  <div
    className="relative w-full h-full overflow-hidden bg-[#E8E0D8]"
    aria-label="지도 로딩 중"
    aria-busy="true"
  >
    {/* 배경 격자 (지도 타일 느낌) */}
    <div 
      className="absolute inset-0 opacity-20"
      style={{
        backgroundImage: `linear-gradient(#F5F0EB 1px, transparent 1px), linear-gradient(90deg, #F5F0EB 1px, transparent 1px)`,
        backgroundSize: '40px 40px'
      }}
    />

    {/* 지형지물 같은 다각형 (랜덤한 느낌으로) */}
    <div className="absolute top-[20%] left-[10%] w-24 h-16 bg-[#F5F0EB] opacity-60 rounded-full blur-xl" />
    <div className="absolute bottom-[30%] right-[15%] w-32 h-20 bg-[#F5F0EB] opacity-40 rounded-full blur-2xl" />

    {/* 도로 (조금 더 얇고 세밀하게) */}
    <div className="absolute top-[50%] w-full h-[2px] bg-[#F5F0EB] opacity-80" />
    <div className="absolute left-[45%] h-full w-[2px] bg-[#F5F0EB] opacity-80" />

    {/* 커스텀 마커 스켈레톤 (지도의 핵심 요소) */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
      <div className="w-8 h-8 bg-white/50 rounded-full animate-pulse flex items-center justify-center">
        <div className="w-3 h-3 bg-white/80 rounded-full" />
      </div>
    </div>

    {/* Shimmer 효과 (기존보다 부드럽게) */}
    <div className="absolute inset-0 shimmer-overlay" />

    <style jsx>{`
      .shimmer-overlay {
        background: linear-gradient(
          90deg,
          transparent 0%,
          rgba(255, 255, 255, 0.2) 50%,
          transparent 100%
        );
        background-size: 200% 100%;
        animation: shimmer 2s infinite linear;
      }
      @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
    `}</style>
  </div>
);