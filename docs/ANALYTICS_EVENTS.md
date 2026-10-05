# 분석 이벤트 사전

GA4·Mixpanel 로 보내는 이벤트 목록. 이벤트 이름·파라미터의 원본은 `src/lib/analytics.ts`의 `AnalyticsEvents`와 `MIXPANEL_EVENT_NAMES`이고, 이 문서는 "언제 기록되나"를 사람이 읽을 수 있게 정리한 것이다. 이벤트를 추가·변경하면 함께 고친다.

PM 공유용 전체 설계(퍼널·대시보드·예정 이벤트 포함): https://claude.ai/artifact/9pj3SrbxkWtAdG1ZzRUCMV

## 구조

- 화면 코드는 `track('snake_case_key', params)` 하나만 부른다. GA4 에는 키 그대로, Mixpanel 에는 `MIXPANEL_EVENT_NAMES`의 이름(Title Case)으로 간다. GA4 는 이벤트 이름에 공백을 못 쓴다.
- **운영에서만 수집한다.** GA 태그는 `VERCEL_ENV === 'production'`일 때만 로드되고(`src/app/layout.tsx`), Mixpanel 토큰(`NEXT_PUBLIC_MIXPANEL_TOKEN`)은 Vercel **Production** 환경에만 등록한다. 토큰이 없으면 SDK 를 받지도 않는다.
- Mixpanel 초기화·페이지뷰·로그인 식별·앱 재방문은 `src/app/_components/AnalyticsManager.tsx`가 맡는다.
- 서버에 저장되는 행동(찜·기록 등)은 파사드의 `onSuccess`에서 보낸다 — 실패한 시도가 성공으로 잡히지 않게.

## 공통 속성 (Mixpanel super property)

| 속성 | 값 |
| --- | --- |
| `platform` | `web` / `android` (`Capacitor.getPlatform()`). GA 에는 이벤트마다 파라미터로 붙는다 |
| `app_version` | 앱에서만. `App.getInfo().version` |
| `is_logged_in` | 인증 마커 기준 로그인 여부. 마커가 바뀌는 즉시 갱신 |
| `prev_path` | 바로 전 화면 경로. 첫 화면에는 없다 |

## 사용자 속성 (회원만)

| 속성 | 값 |
| --- | --- |
| distinct id | 회원 번호(`/auth/me`의 `id`). 이메일·닉네임은 보내지 않는다 |
| `interest_flowers` | 관심 꽃(`favoriteCategories`) |
| `platforms_used` | 로그인해서 써 본 플랫폼 목록 |
| `signup_date`, `signup_platform` | 가입 직후 식별될 때 한 번만 저장. 회원 정보에 가입일이 없어 도입 전 가입자는 비어 있다 |

로그아웃·탈퇴·세션 만료로 인증 마커가 사라지면 `reset()`으로 새 익명 ID 로 바꾼다.

## 이벤트

| GA4 키 | Mixpanel 이름 | 언제 | 파라미터 |
| --- | --- | --- | --- |
| (자동) | `$mp_web_page_view` | 화면 경로가 바뀔 때. 쿼리만 바뀌면 보내지 않음 | — |
| `login_click` | Login Started | 소셜 로그인 버튼 (외부 로그인 화면으로 떠나기 전). 고른 수단을 저장소에 남긴다 | `provider` |
| `login` | Login Completed | 로그인 성공 (웹 콜백·앱 코드 교환) | `provider`(로그인 버튼을 거쳤을 때만) |
| `sign_up` | Sign Up Completed | 가입 완료 | `provider` |
| `onboarding_step` / `onboarding_skip` | Onboarding Step Viewed / Onboarding Skipped | 온보딩 각 장 / 건너뛰기 | `step`(1부터) |
| `logout` | Logout | 로그아웃 확인. **`clearAuthMarker()` 전에** 보낸다 | — |
| `account_delete` | Account Deleted | 탈퇴 성공. **`clearAuthMarker()` 전에** 보낸다 | — |
| `location_setting_change` | Location Setting Changed | 설정의 "지도에서 현재 위치 사용" 토글 | `enabled` |
| `login_prompt` | Login Prompt Shown | 로그인이 필요한 기능을 눌러 로그인 시트가 뜸 | `reason` |
| `search` | Search Performed | 엔터나 결과 클릭으로 검색어 확정 | `search_term`, `result_count`, `trigger`(typed/hot/recent) |
| `search_result_click` | Search Result Clicked | 검색 결과를 눌러 이동 | `result_type`(spot/user), `item_id`, `position`, `search_term` |
| `search_tab_change` | Search Tab Changed | 스팟/유저 탭 전환 | `tab`, `has_keyword` |
| `map_pin_click` | Map Pin Clicked | 지도 핀·클러스터 클릭 | `spot_id` |
| `map_preview_click` | Map Preview Clicked | 핀·필터 결과 목록에서 카드를 눌러 상세로 | `spot_id`, `position` |
| `filter_open` | Filter Opened | 필터 시트 열기 (지도·탐색) | `surface`(map/explore) |
| `map_filter_apply` | Filter Applied | 필터 적용. 지도는 목록 결과가 나온 뒤 보낸다 | `surface`, `region`, `timing`, `categories`(목록, 미선택은 `['all']`), `flower_count`, `result_count`(지도만, 0 포함) |
| `map_my_location_click` | My Location Clicked | 지도 "내 위치" 버튼 | `permission`(granted/denied/app_off) |
| `location_permission` | Location Permission Responded | 위치 권한 결과가 **이 기기에서 마지막으로 보낸 값과 다를 때만** | `result`(granted/denied), `trigger`(map_open/my_location_button) |
| `explore_card_click` | Explore Card Clicked | 탐색 카드 클릭 | `section`(peak_now/next_week/festival/creator), `item_id`, `position`, `view`(main/list) |
| `explore_see_all` | Explore See All Clicked | 탐색 섹션 "전체" | `section` |
| `spot_view` | Spot Viewed | 명소 상세 진입 | `spot_id`, `spot_name`, `spot_type`, `bloom_category`, `bloom_status` |
| `spot_action_click` | Spot Action Clicked | 명소 상세의 하트·종·"방문 기록 남기기"를 누른 순간 (로그인 여부 무관) | `action`(save/unsave/alert_on/alert_off/record), `spot_id` |
| `spot_save` / `spot_unsave` | Spot Saved / Spot Unsaved | 찜 저장·해제 성공 | `spot_id` |
| `bloom_alert_on` / `bloom_alert_off` | Bloom Alert Enabled / Disabled | 만개 알림 설정 성공 | `spot_id` |
| `festival_view` | Festival Viewed | 축제 상세 진입 | `festival_id`, `festival_name` |
| `festival_homepage_click` | Festival Homepage Clicked | 축제 공식 홈페이지 링크 (외부 이동) | `festival_id` |
| `record_start` | Record Started | 기록 작성 화면 진입 | `spot_id` |
| `record_location_select` | Record Location Selected | 1단계(사진·위치·날짜)에서 "다음" | `method`(typed/search/from_spot), `photo_count` |
| `record_plant_select` | Record Plant Selected | 2단계에서 식물을 고름 (해제는 세지 않음) | `plant_id` |
| `record_create` | Record Created | 기록 등록 성공 | `spot_id`, `spot_type`, `bloom_stage`, `photo_count` |
| `record_edit_start` | Record Edit Started | 기록 수정 화면 진입 (수정하기 메뉴가 여러 곳이라 화면에서 보냄. 출처는 `prev_path`) | `record_id` |
| `record_edit` / `record_delete` | Record Edited / Record Deleted | 수정·삭제 성공 | `record_id` |
| `feed_view` | Feed Viewed | 기록 상세 진입 | `record_id`, `spot_id` |
| `feed_tab_change` | Feed Tab Changed | 피드 상단 탭 | `tab` |
| `feed_photo_swipe` | Feed Photos Swiped | 기록 사진을 넘김. 기록(카드)당 처음 1회만 | `record_id`, `photo_count`, `surface`(feed_list/feed_detail) |
| `reaction_add` / `reaction_remove` | Reaction Added / Reaction Removed | 리액션 성공 | `record_id`, `reaction_type` |
| `follow` / `unfollow` | User Followed / User Unfollowed | 팔로우 성공 | `target_user_id` |
| `report_submit` | Report Submitted | 신고 성공 | `target_type` |
| `push_permission` | Push Permission Responded | 앱 알림 권한 응답 | `result` |
| `push_open` | Push Opened | 앱 푸시를 눌러 들어옴 | `notification_type` |
| `notification_badge_shown` | Notification Badge Shown | 지도·마이 알림 버튼에 안 읽은 표시가 처음 보임. 페이지(앱)를 새로 열 때마다 1회 | `unread_count` |
| `notification_icon_click` | Notification Icon Clicked | 알림 버튼 클릭 (비로그인이면 이후 로그인 시트) | `surface`(map/my), `has_unread`, `unread_count` |
| `notification_tab_change` | Notification Tab Changed | 알림 화면 탭 | `tab` |
| `notification_click` | Notification Clicked | 알림 목록에서 알림 클릭 | `notification_type`, `was_unread` |
| `notification_read_all` | Notifications All Read | "모두 읽음" 성공 | `unread_count`(처리 전) |
| `app_open` | App Opened | 앱을 백그라운드에 30분 이상 두었다가 다시 엶 (새로 켜면 페이지뷰가 잡음) | — |
| `web_vitals` | (보내지 않음) | Core Web Vitals. GA 전용 | `metric_name`, `metric_value`, `metric_rating`, `metric_id`, `navigation_type` |
