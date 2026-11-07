import {
  type InfiniteData,
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { postFeedByIdReactions, deleteFeedByIdReactions } from '@/api/facades/generated/feed/feed'
import {
  getV2FeedByIdReactions,
  getV2ReactionEmojis,
  getGetV2FeedByIdQueryKey,
  getGetV2FeedByIdReactionsQueryKey,
  getGetV2ReactionEmojisQueryKey,
  usePutV2FeedByIdReactionsByEmojiKey as useAddReactionGen,
  useDeleteV2FeedByIdReactionsByEmojiKey as useRemoveReactionGen,
} from '@/api/facades/generated/feed-v2/feed-v2'
import type {
  PostFeedByIdReactionsParams,
  GetV2FeedFilter,
  DeleteFeedByIdReactionsParams,
} from '@/api/facades/generated/peakdaApi.schemas'
import { PAGE_SIZE, nextPageParam } from '@/api/facades/pagination'
import { useSsrInitialQuery } from '@/hooks/useSsrInitialQuery'
import type {
  FeedRecordResponse,
  PageResponseFeedRecordSummaryResponse,
} from '@/api/facades/generated/peakdaApi.schemas'
import { feedDetailApi } from '@/api/facades/feed-detail'
import { feedListApi } from '@/api/facades/feed-list'
import { track } from '@/lib/analytics'

// 트레이드 규칙: res.data (Orval 래퍼) → res.data.data (백엔드 실제 payload)

// 리액션은 해당 기록 "상세"만 무효화한다.
// 목록까지 무효화하면 무한 스크롤로 쌓인 모든 페이지를 한꺼번에 다시 불러오면서 스크롤이 튄다.
// 목록 카드의 선택 상태·카운트는 mutation 응답으로 직접 갱신하므로 목록 무효화가 필요 없다.
const invalidateFeedDetail = (queryClient: ReturnType<typeof useQueryClient>, id: number) =>
  queryClient.invalidateQueries({ queryKey: getGetV2FeedByIdQueryKey(id) })

// 내 반응은 한 기록에 여러 개일 수 있지만, 피커 표시에는 첫 페이지 최대치면 충분하다.
const MY_REACTIONS_PARAMS = { mineOnly: true, size: 100 }

// ▷ plain async (이벤트 기반 호출) ─────────────────────────────────────────

// options 는 서버 컴포넌트에서 캐시 설정(next.revalidate)을 넘길 때 쓴다.
export async function addReactionApi(id: number, params: PostFeedByIdReactionsParams) {
  const res = await postFeedByIdReactions(id, params)
  return res.data.data ?? null
}

export async function removeReactionApi(id: number, params: DeleteFeedByIdReactionsParams) {
  const res = await deleteFeedByIdReactions(id, params)
  return res.data.data ?? null
}

// ▷ React Query hooks (캐싱 / 상태 관리) ───────────────────────────────────

// 무한 스크롤용. 기록 삭제 시 '/api/v2/feed' 프리픽스 무효화에 함께 걸린다.
// initialPage 는 서버가 받은 '전체' 탭 첫 페이지다. 비로그인 기준이라 로그인 사용자는 내 리액션을 채우려
// 하이드레이션 직후 한 번 다시 조회한다. 다른 탭(관심 식물·팔로잉)에는 넘기지 않는다.
export const useFeedListInfinite = (
  filter: GetV2FeedFilter,
  initialPage?: PageResponseFeedRecordSummaryResponse
) => {
  // initialData 객체는 렌더마다 새로 만들어지므로 첫 페이지 참조로 초기값인지 판정한다.
  const ssr = useSsrInitialQuery<InfiniteData<PageResponseFeedRecordSummaryResponse | null, number>>(
    (data) => data?.pages[0] === initialPage
  )
  return useInfiniteQuery({
    queryKey: ['/api/v2/feed', 'infinite', filter],
    queryFn: ({ pageParam, signal }) =>
      feedListApi({ filter, pageRequest: { page: pageParam, size: PAGE_SIZE } }, { signal }),
    initialPageParam: 0,
    getNextPageParam: nextPageParam,
    initialData: initialPage ? { pages: [initialPage], pageParams: [0] } : undefined,
    ...ssr,
  })
}

export const useFeedDetail = (id: number | undefined, initialRecord?: FeedRecordResponse) => {
  // 서버 HTML 은 비로그인 기준이라, 로그인 사용자는 내 리액션 상태를 채우려 하이드레이션 직후 한 번 다시 조회한다.
  const ssr = useSsrInitialQuery<FeedRecordResponse | null>((data) => data === initialRecord)
  return useQuery({
    queryKey: getGetV2FeedByIdQueryKey(id ?? 0),
    queryFn: ({ signal }) => feedDetailApi(id!, { signal }),
    enabled: !!id && ssr.enabled,
    initialData: initialRecord,
    staleTime: ssr.staleTime,
  })
}

// 3,944종이라 원본 약 300KB 다. 피커를 처음 열 때만 받고, 내용이 바뀌지 않으니 세션 동안 다시 받지 않는다.
export const useReactionEmojiCatalog = () =>
  useQuery({
    queryKey: getGetV2ReactionEmojisQueryKey(),
    queryFn: async ({ signal }) => (await getV2ReactionEmojis({ signal })).data.data ?? null,
    staleTime: Infinity,
    gcTime: Infinity,
  })

// 피드 응답은 상위 8종만 주므로, 8종 밖의 내 반응도 피커에서 취소할 수 있게 따로 조회한다.
// 시트를 열 때마다 새로 받도록 캐시를 남기지 않는다.
export const useMyReactionKeys = (id: number) =>
  useQuery({
    queryKey: getGetV2FeedByIdReactionsQueryKey(id, MY_REACTIONS_PARAMS),
    queryFn: ({ signal }) => getV2FeedByIdReactions(id, MY_REACTIONS_PARAMS, { signal }),
    select: (res) => res.data.data?.items.map((item) => item.key) ?? [],
    staleTime: 0,
    gcTime: 0,
  })

// 더보기 시트용 전체 반응. 서버가 이모지 키 순으로 나눠 주므로 순서를 바꾸지 않고 이어 붙인다.
// 시트에서 반응을 바꾸면 시트가 닫히니, 다시 열 때 새로 받도록 캐시를 남기지 않는다.
export const useAllReactions = (id: number) =>
  useInfiniteQuery({
    queryKey: [...getGetV2FeedByIdReactionsQueryKey(id), 'all'],
    queryFn: async ({ pageParam, signal }) =>
      (await getV2FeedByIdReactions(id, { afterKey: pageParam, size: 100 }, { signal })).data
        .data ?? null,
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => (last?.hasMore ? (last.nextAfterKey ?? undefined) : undefined),
    staleTime: 0,
    gcTime: 0,
  })

// mutate({ id, emojiKey }) 형태로 호출 → 성공 시 해당 기록 상세 캐시만 무효화

export const useAddReaction = () => {
  const queryClient = useQueryClient()
  return useAddReactionGen({
    mutation: {
      onSuccess: (_res, { id, emojiKey }) => {
        track('reaction_add', { record_id: id, reaction_type: emojiKey })
        invalidateFeedDetail(queryClient, id)
      },
    },
  })
}

export const useRemoveReaction = () => {
  const queryClient = useQueryClient()
  return useRemoveReactionGen({
    mutation: {
      onSuccess: (_res, { id, emojiKey }) => {
        track('reaction_remove', { record_id: id, reaction_type: emojiKey })
        invalidateFeedDetail(queryClient, id)
      },
    },
  })
}
