import type { FlowerItem } from '@/components/Map/Pin'
import { type Stage, STAGE_COLOR } from '@/constants/map'
import { clusterSlices, topStageFlower, type MapSpot } from '@/lib/utils/mapCluster'

// 핀·클러스터 HTML 은 innerHTML 로 들어간다. 서버 문자열(꽃 이름·명소명)을 여기에 끼워 넣지 말 것 —
// 이름은 컨테이너의 aria-label(setAttribute)로만 붙이고, 이미지는 장식용(alt="")으로 둔다.
// 꽃이 없는 핀(blooms: [])에 대신 띄우는 기본 아이콘. 서버는 개화 조건을 통과하지 못한 동네 스팟도
// blooms 를 비운 채 핀으로 내려줄 수 있다. 테두리는 toMaxStage([]) 의 Before(회색).
const NO_BLOOM_ICON: FlowerItem = { src: '/icons/Pin.svg' }

export function createPinHTML(flowers: FlowerItem[], maxStage: Stage): string {
  const color = STAGE_COLOR[maxStage]
  const grayscale =
    flowers.length > 0 && (maxStage === 'Before' || maxStage === 'End')
      ? 'opacity:0.4;filter:grayscale(1);'
      : ''
  // max-width:none 은 Tailwind preflight 의 img { max-width:100% } 를 끄는 것이다.
  // 카카오 오버레이는 폭 0 인 판 안에 absolute 로 붙어 min-content 폭으로 줄어드는데,
  // Safari(WebKit)는 퍼센트 max-width 이미지의 min-content 를 0 으로 쳐서 이미지가 5px 로
  // 찌그러지고 핀이 세로로 길쭉한 캡슐(21×40)이 된다. Chrome 은 영향 없음.
  const imgs = (flowers.length > 0 ? flowers.slice(0, 3) : [NO_BLOOM_ICON])
    .map(
      (f) =>
        `<img src="${f.src}" alt="" width="24" height="24" style="width:24px;height:24px;max-width:none;flex-shrink:0;object-fit:contain;${grayscale}">`
    )
    .join('')
  const badge =
    flowers.length >= 2
      ? `<span style="flex-shrink:0;background:${color};color:white;font-size:11px;font-weight:600;border-radius:9999px;padding:2px 5px;">+${flowers.length}</span>`
      : ''

  // 꼬리는 viewBox 확대 없이 같은 좌표로 그린다(예전 viewBox 0 0 14 9 가 10×8 상자에 만들던 모양).
  // SVG 안 변환을 없애는 이유는 createClusterHTML 의 링 주석 참고.
  return `
    <div style="display:inline-flex;flex-direction:column;align-items:center;">
      <div style="background:white;border:2px solid ${color};border-radius:9999px;padding:6px;display:flex;align-items:center;gap:4px;box-shadow:0 1px 3px rgba(0,0,0,0.15);white-space:nowrap;">
        ${imgs}${badge}
      </div>
      <svg width="10" height="8" style="margin-top:-1px;display:block;flex-shrink:0;">
        <polygon points="0,0.7857 10,0.7857 5,7.2143" fill="${color}"/>
      </svg>
    </div>
  `
}

const CLUSTER_SIZE = 56
const CLUSTER_RING_WIDTH = 5
const CLUSTER_TAIL_HEIGHT = 9
const CLUSTER_ICON_SIZE = 26

export function createClusterHTML(spots: MapSpot[]): string {
  const slices = clusterSlices(spots)
  // 대표 상태(꼬리·배지 색, 가운데 아이콘)는 꽃이 있는 핀 중에서만 고른다. 꽃 없는 핀도 maxStage 가
  // Before 라 그대로 세면, 개화 정보 없는 동네 핀이 많은 클러스터는 만개 명소가 섞여 있어도 회색이 된다.
  // 링은 그대로 전체 비율로 그린다.
  const topStage =
    clusterSlices(spots.filter((s) => s.statuses.length > 0))[0]?.stage ?? 'Before'
  const color = STAGE_COLOR[topStage]

  const center = CLUSTER_SIZE / 2
  const radius = (CLUSTER_SIZE - CLUSTER_RING_WIDTH) / 2
  const circumference = 2 * Math.PI * radius

  // 상태별 비율(개수/전체)만큼 링을 각도로 나눈다. dasharray 로 호 길이를, dashoffset 으로
  // 시작점을 잡는다. 원은 12시 방향에서 시작해 시계방향으로 도는 path 로 그린다.
  // 예전엔 <g> 를 -90° 돌렸는데, 카카오가 드래그 때 오버레이 판을 left/top 으로 옮겨 매 프레임 판 아래를
  // 다시 처리하므로 SVG 안의 변환이 그 비용(Layerize·PrePaint)을 키웠다. 픽셀 비교로 모양이 같음을 확인했다.
  // pathLength 를 붙이면 경계 각도가 미세하게 어긋나 눈에 보이므로 붙이지 않는다.
  const circle = `M${center},${center - radius}A${radius},${radius} 0 1 1 ${center},${center + radius}A${radius},${radius} 0 1 1 ${center},${center - radius}`
  let drawn = 0
  const ring = slices
    .map(({ stage, count }) => {
      const arcLength = (count / spots.length) * circumference
      const arc = `<path d="${circle}" fill="none" stroke="${STAGE_COLOR[stage]}" stroke-width="${CLUSTER_RING_WIDTH}" stroke-dasharray="${arcLength.toFixed(2)} ${(circumference - arcLength).toFixed(2)}" stroke-dashoffset="${(-drawn).toFixed(2)}"/>`
      drawn += arcLength
      return arc
    })
    .join('')

  const flower = topStageFlower(spots, topStage) ?? NO_BLOOM_ICON
  const iconOffset = (CLUSTER_SIZE - CLUSTER_ICON_SIZE) / 2
  const icon = `<img src="${flower.src}" alt="" width="${CLUSTER_ICON_SIZE}" height="${CLUSTER_ICON_SIZE}" style="position:absolute;left:${iconOffset}px;top:${iconOffset}px;width:${CLUSTER_ICON_SIZE}px;height:${CLUSTER_ICON_SIZE}px;object-fit:contain;">`

  // 배지는 대표로 보여준 꽃 1개를 뺀 나머지 스팟 수다.
  const rest = spots.length - 1
  const restLabel = rest > 99 ? '99+' : `+${rest}`
  const badge =
    rest > 0
      ? `<span style="position:absolute;right:-8px;bottom:11px;background:${color};color:white;font-size:13px;font-weight:700;line-height:1;border-radius:9999px;padding:5px 8px;white-space:nowrap;">${restLabel}</span>`
      : ''

  // 꼬리 → 흰 원판 → 링 순으로 겹쳐 꼬리가 링 뒤에서 나온 것처럼 보이게 한다.
  return `
    <div style="position:relative;width:${CLUSTER_SIZE}px;height:${CLUSTER_SIZE + CLUSTER_TAIL_HEIGHT}px;cursor:pointer;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.18));">
      <svg width="${CLUSTER_SIZE}" height="${CLUSTER_SIZE + CLUSTER_TAIL_HEIGHT}" viewBox="0 0 ${CLUSTER_SIZE} ${CLUSTER_SIZE + CLUSTER_TAIL_HEIGHT}" style="display:block;">
        <polygon points="${center - 7},${CLUSTER_SIZE - 12} ${center + 7},${CLUSTER_SIZE - 12} ${center},${CLUSTER_SIZE + CLUSTER_TAIL_HEIGHT}" fill="${color}"/>
        <circle cx="${center}" cy="${center}" r="${radius}" fill="white"/>
        ${ring}
      </svg>
      ${icon}${badge}
    </div>
  `
}
