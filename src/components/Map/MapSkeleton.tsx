export const MapSkeleton = () => (
  <div
    aria-label="지도 로딩 중"
    aria-busy="true"
    style={{
      width: '100%',
      height: '100%',
      // 카카오맵 기본 배경색과 동일하게
      background: '#E8E0D8',
      position: 'relative',
      overflow: 'hidden',
    }}
  >
    {/* 도로처럼 보이는 선들 */}
    <div
      style={{
        position: 'absolute',
        top: '45%',
        left: 0,
        right: 0,
        height: '6px',
        background: '#F5F0EB',
      }}
    />
    <div
      style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: '40%',
        width: '4px',
        background: '#F5F0EB',
      }}
    />
    <div
      style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: '70%',
        width: '8px',
        background: '#F5F0EB',
      }}
    />

    {/* 로딩 shimmer */}
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: `linear-gradient(
          90deg,
          transparent 0%,
          rgba(255,255,255,0.15) 50%,
          transparent 100%
        )`,
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.8s infinite',
      }}
    />

    <style>{`
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; }
        }
      `}</style>
  </div>
)
