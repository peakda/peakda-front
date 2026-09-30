# PEAKDA — 디자인 토큰 (Component 핸드오프)

> **출처**: Figma `PEAKDA` 파일 (`nUETz1701cxHk1Fk3xp5Kw`) / Component 페이지 (`151:504`)
> **추출일**: 2026-04-25
> **본문 폰트**: Pretendard Variable (Figma **Text Style**로 등록됨, Variable 아님)
> **로고 폰트**: Advent Pro Expanded (로고 컴포넌트에 직접 지정)

이 문서는 Figma 파일에 **현재 등록되어 있는 모든 Variable과 Text Style**을 누락 없이 정리한 것입니다.

| 종류 | 위치 | 개수 | 매핑 권장 방식 |
|---|---|---|---|
| Variable: Dimensions | Spacing, Border Radius | 48 | CSS 변수, 디자인 토큰 |
| Variable: Color (Primitive) | gray, Pink, Green, Yellow, Error | 43 | CSS 변수 (color scale) |
| Variable: Main UI (Semantic) | Background, Text, Icon, Border, Colors, Flower_colors | 53 | CSS 변수 (semantic alias) |
| Effect Style | Background blur | 1 | CSS `backdrop-filter` |
| Text Style | Display, Heading, Title, Body, Caption, Button | 20 | CSS 클래스/믹스인 |

> **이번 개정 요약 (2026-04-25)**
> - Figma 파일에 `Flower_colors/Royal Azalea`(#ff6fa0, 철쭉), `Flower_colors/Pink Muhly`(#d87ba0, 핑크뮬리) 추가 완료 → Flower_colors 총 21종
> - 문서를 Figma의 실제 등록값 기준으로 전수 재작성 (이전 추출에서 빠졌던 Display/Heading/Title 5종, gray·Yellow scale, Background opacity 변종 등 추가)
> - 꽃 뱃지 적용 규칙 명문화: BG = 꽃 솔리드 컬러 @ 20%, 텍스트 = 동일 솔리드 100%

---

## 1. Color — Primitive (Color 컬렉션)

브랜드 팔레트의 원본 hex 값들. Main UI 의미 토큰이 이 변수들을 alias로 참조합니다.

### 1.1 gray (12)

| 토큰 | Hex | 용도 |
|---|---|---|
| `gray/0` | `#ffffff` | 화이트 |
| `gray/50` | `#f8f9fb` | |
| `gray/100` | `#f0f2f5` | |
| `gray/200` | `#e8eaee` | |
| `gray/300` | `#d0d4db` | |
| `gray/400` | `#a8b0bc` | |
| `gray/500` | `#8c95a4` | |
| `gray/600` | `#6a7382` | |
| `gray/700` | `#4e5666` | |
| `gray/800` | `#363d4a` | |
| `gray/900` | `#2c313a` | |
| `gray/950` | `#1a1d24` | 가장 진한 텍스트 |

### 1.2 Pink (10)

| 토큰 | Hex | 비고 |
|---|---|---|
| `Pink/50` | `#fff0f2` | |
| `Pink/100` | `#ffcfd6` | |
| `Pink/200` | `#ffa8b4` | (= Cherry Blossom alias 대상) |
| `Pink/300` | `#ff7f92` | (= Colors/Primary, Plum Blossom alias 대상) |
| `Pink/400` | `#f7576b` | |
| `Pink/500` | `#ec3248` | (= Tulip alias 대상) |
| `Pink/600` | `#c41f33` | |
| `Pink/700` | `#9c1228` | |
| `Pink/800` | `#72091a` | |
| `Pink/900` | `#45060f` | |

### 1.3 Green (10)

| 토큰 | Hex | 비고 |
|---|---|---|
| `Green/50` | `#f0f8e8` | |
| `Green/100` | `#d5ecc0` | |
| `Green/200` | `#a9d188` | |
| `Green/300` | `#8dc468` | (= Colors/Secondary alias 대상) |
| `Green/400` | `#68ac40` | |
| `Green/500` | `#4a8e24` | |
| `Green/600` | `#386d19` | |
| `Green/700` | `#285011` | "Peakda" 로고 색 |
| `Green/800` | `#1a3608` | |
| `Green/900` | `#0d1d03` | |

### 1.4 Yellow (10)

| 토큰 | Hex | 비고 |
|---|---|---|
| `Yellow/50` | `#fffce8` | |
| `Yellow/100` | `#fff3b5` | |
| `Yellow/200` | `#ffe87a` | (= Canola Flower alias 대상) |
| `Yellow/300` | `#ffd63a` | (= Forsythia alias 대상) |
| `Yellow/400` | `#f0b800` | |
| `Yellow/500` | `#d49d00` | |
| `Yellow/600` | `#a87a00` | |
| `Yellow/700` | `#7c5a00` | |
| `Yellow/800` | `#503a00` | |
| `Yellow/900` | `#2b1f00` | |

### 1.5 Error

| 토큰 | Hex |
|---|---|
| `Error/Error` | `#ef441e` |

---

## 2. Color — Semantic (Main UI 컬렉션)

실제 컴포넌트가 참조하는 의미 토큰. 대부분 위 primitive를 alias로 가리킵니다.

### 2.1 Brand

| 토큰 | 값 | 비고 |
|---|---|---|
| `Colors/Primary` | → `Pink/300` (`#ff7f92`) | 메인 브랜드 |
| `Colors/Secondary` | → `Green/300` (`#8dc468`) | 보조 (Primary 버튼 채움 등) |
| `Colors/Tertiary` | (외부 라이브러리 alias, 미해석) | 거의 사용되지 않음 |
| `Colors/Warning` | → `Error/Error` (`#ef441e`) | 경고 |

### 2.2 Background

| 토큰 | 값 |
|---|---|
| `Background/Primary` | → `gray/0` (`#ffffff`) |
| `Background/Primary-0%` | `#ffffff` @ 0% |
| `Background/Primary-10%` | `#ffffff` @ 10% |
| `Background/Primary-80%` | `#ffffff` @ 60% — 토큰명은 80%이나 실제 alpha 0.6 |
| `Background/Secondary` | → `gray/50` (`#f8f9fb`) |
| `Background/Secondary-50%` | `#fafaf7` @ 50% |
| `Background/Secondary-80%` | `#fafaf7` @ 80% |
| `Background/Tertiary` | → `gray/200` (`#e8eaee`) |
| `Background/Tertiary-70%` | `#e8eaee` @ 70% |
| `Background/Quaternary` | → `gray/300` (`#d0d4db`) |
| `Background/Quaternary 2` | → `gray/400` (`#a8b0bc`) — 이름에 공백 주의 |
| `Background/Quaternary-0%` | `#1e1916` @ 0% |
| `Background/Quaternary-10%` | `#1e1916` @ 10% |
| `Background/Quaternary-50%` | `#1e1916` @ 50% — 다크 백드롭 |
| `Background/Quaternary-80%` | `#1e1916` @ 80% |

### 2.3 Text

| 토큰 | 값 |
|---|---|
| `Text/Primary` | → `gray/950` (`#1a1d24`) |
| `Text/Secondary` | → `gray/700` (`#4e5666`) |
| `Text/Tertiary` | → `gray/500` (`#8c95a4`) |
| `Text/Quaternary` | → `gray/400` (`#a8b0bc`) |
| `Text/Primary inverse` | → `gray/50` (`#f8f9fb`) |

### 2.4 Icon

| 토큰 | 값 |
|---|---|
| `Icon/Primary` | → `gray/900` (`#2c313a`) |
| `Icon/Secondary` | → `gray/700` (`#4e5666`) |
| `Icon/Tertiary` | → `gray/500` (`#8c95a4`) |
| `Icon/Quaternary` | → `gray/400` (`#a8b0bc`) |
| `Icon/Primary inverse` | → `gray/50` (`#f8f9fb`) |

### 2.5 Border

| 토큰 | 값 |
|---|---|
| `Border/Primary` | → `gray/100` (`#f0f2f5`) |
| `Border/Secondary` | → `gray/300` (`#d0d4db`) |
| `Border/Tertiary` | → `gray/400` (`#a8b0bc`) |
| `Border/Primary Inverse` | → `gray/800` (`#363d4a`) |
| `Border/Primary Inverse-10%` | `#363028` @ 10% |
| `Border/Primary Inverse-70%` | `#363028` @ 70% |

### 2.6 Flower_colors (21종)

꽃 뱃지(Flower_badge), Pin, 필터 시트에서 사용. **각 꽃은 솔리드 1색**만 정의되어 있고, 뱃지에는 동일 색을 **20% 투명도**로 BG 처리합니다.

#### 적용 규칙

```
Flower_badge {
  background-color: <flower-color> @ 20% alpha;
  color (text):     <flower-color> @ 100%;
  flower icon:      이미지 에셋 (PNG);
}
```

#### PEAKDA 사용 13종 (계절순)

| 시즌 | 꽃(한글) | 토큰 | 값 | 개화 |
|---|---|---|---|---|
| 봄 | 매화 | `Flower_colors/Plum Blossom` | → `Pink/300` (`#ff7f92`) | 1~2월 |
| 봄 | 개나리 | `Flower_colors/Forsythia` | → `Yellow/300` (`#ffd63a`) | 3~4월 |
| 봄 | 진달래 | `Flower_colors/Azalea` | `#e82a78` | 3~4월 |
| 봄 | 벚꽃 | `Flower_colors/Cherry Blossom` | → `Pink/200` (`#ffa8b4`) | 3~4월 |
| 봄 | 유채 | `Flower_colors/Canola Flower` | → `Yellow/200` (`#ffe87a`) | 4~5월 |
| 봄 | 철쭉 | `Flower_colors/Royal Azalea` ⭐신규 | `#dc3f62` | 4~5월 |
| 여름 | 수국 | `Flower_colors/Hydrangea` | `#97caff` | 6~8월 |
| 여름 | 연꽃 | `Flower_colors/Lotus` | → `Pink/100` (`#ffcfd6`) | 7~8월 |
| 가을 | 코스모스 | `Flower_colors/Cosmos` | `#f07088` | 9~10월 |
| 가을 | 핑크뮬리 | `Flower_colors/Pink Muhly` ⭐신규 | `#d87ba0` | 9~11월 |
| 가을 | 억새 | `Flower_colors/Pampas Grass` | `#c2aa8a` | 9~11월 |
| 가을 | 단풍 | `Flower_colors/Autumn Maple` | `#f0603a` | 10~11월 |
| 겨울 | 동백 | `Flower_colors/Camellia` | `#c8202a` | 11~3월 |

⭐신규 = 이번 개정에서 Figma에 추가됨

#### 사용하지 않는 8종 (현재 보존, PEAKDA 도메인에서는 미사용)

| 토큰 | 값 | 한글 |
|---|---|---|
| `Flower_colors/Lavender` | `#b189d9` | 라벤더 |
| `Flower_colors/Iris` | `#7060c0` | 아이리스 |
| `Flower_colors/Buckwheat Flower` | `#a0b884` | 메밀꽃 |
| `Flower_colors/Sunflower` | `#ffb800` | 해바라기 |
| `Flower_colors/Magnolia` | `#f2dec8` | 목련 |
| `Flower_colors/Rose` | `#dc3f62` | 장미 |
| `Flower_colors/Tulip` | → `Pink/500` (`#ec3248`) | 튤립 |
| `Flower_colors/Chrysanthemum` | `#f9bc5a` | 국화 |

> 향후 사용 가능성 위해 보존. 

### 2.7 기타

| 토큰 | 값 | 비고 |
|---|---|---|
| `String` | `"Button"` | STRING 변수 — 실제로는 Variable 시스템에 String도 있음 |

---

## 3. Dimensions — Spacing (33종)

`Spacing/N`의 N은 0.25rem(4px) 기준 배수. Tailwind 스타일 네이밍.

| 토큰 | px | 토큰 | px | 토큰 | px |
|---|---|---|---|---|---|
| `Spacing/0` | 0 | `Spacing/8` | 32 | `Spacing/40` | 160 |
| `Spacing/px` | 1 | `Spacing/9` | 36 | `Spacing/44` | 176 |
| `Spacing/0.5` | 2 | `Spacing/10` | 40 | `Spacing/48` | 192 |
| `Spacing/1` | 4 | `Spacing/11` | 44 | `Spacing/52` | 208 |
| `Spacing/1.5` | 6 | `Spacing/12` | 48 | `Spacing/56` | 224 |
| `Spacing/2` | 8 | `Spacing/14` | 56 | `Spacing/60` | 240 |
| `Spacing/2.5` | 10 | `Spacing/16` | 64 | `Spacing/64` | 256 |
| `Spacing/3` | 12 | `Spacing/20` | 80 | `Spacing/72` | 288 |
| `Spacing/3.5` | 14 | `Spacing/24` | 96 | `Spacing/80` | 320 |
| `Spacing/4` | 16 | `Spacing/28` | 112 | `Spacing/96` | 384 |
| `Spacing/5` | 20 | `Spacing/32` | 128 | | |
| `Spacing/6` | 24 | `Spacing/36` | 144 | | |
| `Spacing/7` | 28 | | | | |

> 토큰명에는 가운데 점 U+2024(`․`)가 사용되어 `Spacing/0․5`처럼 저장되어 있습니다. 구현 시 일반 점으로 변환해도 무방합니다.

---

## 4. Dimensions — Border Radius (15종)

| 토큰 | px | 토큰 | px |
|---|---|---|---|
| `Border Radius/rounded-none` | 0 | `Border Radius/rounded-3xl` | 16 |
| `Border Radius/rounded-sm` | 2 | `Border Radius/rounded-4xl` | 20 |
| `Border Radius/rounded` | 4 | `Border Radius/rounded-5xl` | 24 |
| `Border Radius/rounded-md` | 6 | `Border Radius/rounded-6xl` | 32 |
| `Border Radius/rounded-lg` | 8 | `Border Radius/rounded-7xl` | 40 |
| `Border Radius/rounded-xl` | 10 | `Border Radius/rounded-8xl` | 48 |
| `Border Radius/rounded-2xl` | 12 | `Border Radius/rounded-full` | 9999 |

---

## 5. Effect Styles (1종)

| 토큰 | 값 | 비고 |
|---|---|---|
| `Background blur` | `BACKGROUND_BLUR radius=8` | `backdrop-filter: blur(8px)` |

---

## 6. Typography — Text Styles (20종)

> ⚠ **모든 본문 타이포는 Figma의 Text Style로 등록되어 있습니다 (Variable이 아님)**
> Figma에서 텍스트 레이어 선택 → 우측 패널 Text 섹션에서 토큰명 확인 가능.
> Letter Spacing은 Figma에 **퍼센트(em 비례)**로 저장되어 있습니다 (예: `-2%` = `-0.02em`). CSS에서는 em 단위 사용을 권장합니다.

### 6.1 본문 (Pretendard Variable)

| 토큰 (Text Style) | Family / Style | Size | Line Height | Letter Spacing | 권장 용도 |
|---|---|---|---|---|---|
| `Display/1` | Pretendard Variable / Bold | 48px | 120% | -2% (-0.02em) | 가장 큰 디스플레이 (메인 비주얼) |
| `Heading/1` | Pretendard Variable / Bold | 32px | 130% | -2% | H1 — 페이지 메인 타이틀 |
| `Heading/2` | Pretendard Variable / SemiBold | 24px | 135% | 0% | H2 — 섹션 제목 |
| `Heading/3` | Pretendard Variable / SemiBold | 20px | 140% | -1% | H3 — 서브 섹션 |
| `Title/1` | Pretendard Variable / Bold | 18px | 160% | 0% | 카드/시트 타이틀 |
| `Body 1/Regular` | Pretendard Variable / Medium | 18px | 155% | -0.5% | 큰 본문 |
| `Body 1/Semibold` | Pretendard Variable / SemiBold | 18px | 155% | -0.5% | 큰 본문 강조 |
| `Body 2/Regular` | Pretendard Variable / Regular | 16px | 150% | 0% | 본문 기본 |
| `Body 2/Semibold` | Pretendard Variable / SemiBold | 16px | 150% | -0.5% | 본문 강조, 카드 타이틀 |
| `Body 3/Regular` | Pretendard Variable / Regular | 14px | 150% | 0.5% | 보조 본문 |
| `Body 3/Medium` | Pretendard Variable / Medium | 14px | 150% | 0% | 강조된 보조 본문, 탭 라벨 |
| `Body 3/Bold` | Pretendard Variable / Bold | 14px | 150% | 0% | Pin 라벨 등 강한 강조 |
| `Body 4/Regular` | Pretendard Variable / Regular | 13px | 140% | 1% | 메타, 헬퍼 |
| `Body 4/Semibold` | Pretendard Variable / SemiBold | 13px | 140% | 1% | 메타 강조 |
| `Caption 1/Regular` | Pretendard Variable / Regular | 12px | 140% | 1% | 캡션 기본 |
| `Caption 1/Medium` | Pretendard Variable / Medium | 12px | 140% | 1% | 캡션 강조 |
| `Caption 2/Regular` ※ | — | — | — | — | (등록되지 않음) |
| `Caption 2/Medium` | Pretendard Variable / Medium | 11px | 140% | 1% | 작은 라벨 |
| `Caption 2/Semibold` | Pretendard Variable / SemiBold | 11px | 140% | 1% | 배지 (꽃 뱃지 등) |
| `Button/1` | Pretendard Variable / Medium | 15px | 140% | 0% | lg/md 버튼 |
| `Button/2` | Pretendard Variable / Medium | 14px | 140% | 0% | sm 버튼·인라인 버튼 |

> Figma의 line height/letter spacing 퍼센트 값은 내부적으로 `1.4 → 1.399999976158142` 같이 부동소수점 오차가 있습니다. 구현 시 `1.4`/`140%`/`-2%` 등 라운드 값 사용.

### 6.2 로고 전용 — Advent Pro Expanded

"Peakda" 워드마크에만 사용. **Text Style로 등록되지 않고** Header 컴포넌트에 직접 지정되어 있습니다.

| 항목 | 값 |
|---|---|
| Font Family | `Advent Pro Expanded` |
| Weight | SemiBold (600) |
| Size | 30px |
| Letter Spacing | -1.2px |
| Color | `Green/700` (`#285011`) |
| 사용처 | Header `main` 변형의 "Peakda" 텍스트 |

> 웹 폰트: Google Fonts [Advent Pro](https://fonts.google.com/specimen/Advent+Pro) Expanded weight 추가 로드 필요.

---

## 7. 컴포넌트 토큰 매핑 가이드 (요약)

### Button

| 타입/상태 | 배경 | 텍스트/아이콘 | 보더 | 라운드 | 폰트 |
|---|---|---|---|---|---|
| Primary / Active | `Colors/Secondary` | `Text/Primary inverse` | — | lg=`rounded-3xl`, md=`rounded-xl`, sm=`rounded-xl` | lg/md=`Button/1`, sm=`Button/2` |
| Primary / Disabled | `Background/Quaternary` | `Text/Primary inverse` | — | 동일 | 동일 |
| Outline / Active | 투명 | `Text/Secondary` | `Border/Secondary` | 동일 | 동일 |
| Outline / Disabled | 투명 | `Text/Secondary` | `Border/Secondary` | 동일 | 동일 |
| Ghost / Active | 투명 | `Text/Secondary` | — | `rounded-none` | 동일 |
| Ghost / Disabled | 투명 | `Text/Secondary` | — | `rounded-none` | 동일 |

좌우 패딩 `Spacing/4`(16), 텍스트-아이콘 갭 `Spacing/2`(8).

### Input / Textfield

- Default: bg `Background/Secondary`, border `Border/Primary`, radius `rounded-3xl`(16)
- Focus: border `Border/Tertiary`
- Placeholder: `Text/Quaternary`
- 입력 텍스트: `Text/Secondary` + `Body 2/Regular`
- 헬퍼 텍스트: `Text/Tertiary` + `Body 4/Regular`

### Pin (지도 마커)

| 상태 | bg | text | font |
|---|---|---|---|
| Before | `Background/Tertiary` | `Text/Tertiary` | `Body 3/Bold` |
| Start | `Pink/50` | `Colors/Primary` | `Body 3/Bold` |
| Peak | `Colors/Secondary` | `Text/Primary inverse` | `Body 3/Bold` |

라운드 `rounded-full`.

### Tab / Category Chip

- On: bg `Colors/Primary` + text `Text/Primary inverse`
- Off: bg `Background/Tertiary` + text `Text/Tertiary`
- 폰트 `Caption 2/Semibold`, 라운드 `rounded-full`

### Badge

- **Count 배지** (피기시작/만개): `Colors/Primary` 또는 `Pink/400` + `Text/Primary inverse` + `Caption 2/Semibold` + `rounded-full`
- **준비중 배지**: `Background/Tertiary` + `Text/Tertiary` + `Caption 2/Semibold`
- **Flower 배지**:
  - 좌측 꽃 그래픽 16×16 PNG
  - padding `Spacing/0.5` 상하 / `Spacing/1.5` 좌우, gap `Spacing/0.5`
  - 라운드 `rounded-full`, 폰트 `Caption 2/Semibold`
  - **컬러 규칙**: bg = `<flower-color> @ 20%`, text = `<flower-color> @ 100%`
  - 예) 매화: `bg: rgba(255, 127, 146, 0.2)` / `color: #ff7f92`

### Card / Pin_list

- bg `Background/Primary`, border `Border/Primary`, radius `rounded-2xl`(12) ~ `rounded-3xl`(16)
- 타이틀 `Body 2/Semibold` + `Text/Primary`
- 메타 `Body 3/Medium` + `Text/Tertiary`
- 패딩 `Spacing/3` ~ `Spacing/4`

### Bottom Sheet

- bg `Background/Primary`, 상단만 `rounded-5xl`(24)
- 핸들 `Background/Tertiary`
- 백드롭 `Background/Quaternary-50%` + `Background blur`(8px) 또는 `blur(40px)` 강한 변형

### Header (main 변형)

- "Peakda" 로고: Advent Pro Expanded SemiBold 30px / `Green/700` / ls -1.2px (Text Style 아님)
- 우측 알림 버튼: bg `Background/Primary-80%` + border `Border/Primary` + `backdrop-filter: blur(2px)` + size 40×40 `rounded-full`

---

## 8. 빠른 CSS 변수 (선택 사항)

```css
:root {
  /* === Color Primitive === */
  /* gray */
  --gray-0: #ffffff;   --gray-50: #f8f9fb;  --gray-100: #f0f2f5;
  --gray-200: #e8eaee; --gray-300: #d0d4db; --gray-400: #a8b0bc;
  --gray-500: #8c95a4; --gray-600: #6a7382; --gray-700: #4e5666;
  --gray-800: #363d4a; --gray-900: #2c313a; --gray-950: #1a1d24;

  /* Pink */
  --pink-50: #fff0f2;  --pink-100: #ffcfd6; --pink-200: #ffa8b4;
  --pink-300: #ff7f92; --pink-400: #f7576b; --pink-500: #ec3248;
  --pink-600: #c41f33; --pink-700: #9c1228; --pink-800: #72091a;
  --pink-900: #45060f;

  /* Green */
  --green-50: #f0f8e8;  --green-100: #d5ecc0; --green-200: #a9d188;
  --green-300: #8dc468; --green-400: #68ac40; --green-500: #4a8e24;
  --green-600: #386d19; --green-700: #285011; --green-800: #1a3608;
  --green-900: #0d1d03;

  /* Yellow */
  --yellow-50: #fffce8;  --yellow-100: #fff3b5; --yellow-200: #ffe87a;
  --yellow-300: #ffd63a; --yellow-400: #f0b800; --yellow-500: #d49d00;
  --yellow-600: #a87a00; --yellow-700: #7c5a00; --yellow-800: #503a00;
  --yellow-900: #2b1f00;

  --error: #ef441e;

  /* === Color Semantic === */
  --color-primary: var(--pink-300);
  --color-secondary: var(--green-300);
  --color-warning: var(--error);

  --bg-primary: var(--gray-0);
  --bg-primary-10: rgba(255, 255, 255, 0.10);
  --bg-primary-80: rgba(255, 255, 255, 0.60); /* 토큰명은 80%이나 실제 0.6 */
  --bg-secondary: var(--gray-50);
  --bg-secondary-50: rgba(250, 250, 247, 0.50);
  --bg-secondary-80: rgba(250, 250, 247, 0.80);
  --bg-tertiary: var(--gray-200);
  --bg-tertiary-70: rgba(232, 234, 238, 0.70);
  --bg-quaternary: var(--gray-300);
  --bg-quaternary-2: var(--gray-400);
  --bg-quaternary-10: rgba(30, 25, 22, 0.10);
  --bg-quaternary-50: rgba(30, 25, 22, 0.50);
  --bg-quaternary-80: rgba(30, 25, 22, 0.80);

  --text-primary: var(--gray-950);
  --text-secondary: var(--gray-700);
  --text-tertiary: var(--gray-500);
  --text-quaternary: var(--gray-400);
  --text-primary-inverse: var(--gray-50);

  --icon-primary: var(--gray-900);
  --icon-secondary: var(--gray-700);
  --icon-tertiary: var(--gray-500);
  --icon-quaternary: var(--gray-400);
  --icon-primary-inverse: var(--gray-50);

  --border-primary: var(--gray-100);
  --border-secondary: var(--gray-300);
  --border-tertiary: var(--gray-400);
  --border-primary-inverse: var(--gray-800);
  --border-primary-inverse-10: rgba(54, 48, 40, 0.10);
  --border-primary-inverse-70: rgba(54, 48, 40, 0.70);

  /* === Flower (PEAKDA 13종) === */
  --flower-plum: var(--pink-300);          /* 매화 */
  --flower-forsythia: var(--yellow-300);   /* 개나리 */
  --flower-azalea: #e82a78;                /* 진달래 */
  --flower-cherry: var(--pink-200);        /* 벚꽃 */
  --flower-canola: var(--yellow-200);      /* 유채 */
  --flower-royal-azalea: #ff6fa0;          /* 철쭉 ⭐ */
  --flower-hydrangea: #97caff;             /* 수국 */
  --flower-lotus: var(--pink-100);         /* 연꽃 */
  --flower-cosmos: #f07088;                /* 코스모스 */
  --flower-pink-muhly: #d87ba0;            /* 핑크뮬리 ⭐ */
  --flower-pampas-grass: #c2aa8a;          /* 억새 */
  --flower-autumn-maple: #f0603a;          /* 단풍 */
  --flower-camellia: #c8202a;              /* 동백 */

  /* === Spacing === */
  --space-0: 0;       --space-px: 1px;     --space-0-5: 2px;
  --space-1: 4px;     --space-1-5: 6px;    --space-2: 8px;
  --space-2-5: 10px;  --space-3: 12px;     --space-3-5: 14px;
  --space-4: 16px;    --space-5: 20px;     --space-6: 24px;
  --space-7: 28px;    --space-8: 32px;     --space-9: 36px;
  --space-10: 40px;   --space-11: 44px;    --space-12: 48px;
  --space-14: 56px;   --space-16: 64px;    --space-20: 80px;
  --space-24: 96px;   --space-28: 112px;   --space-32: 128px;
  --space-36: 144px;  --space-40: 160px;   --space-44: 176px;
  --space-48: 192px;  --space-52: 208px;   --space-56: 224px;
  --space-60: 240px;  --space-64: 256px;   --space-72: 288px;
  --space-80: 320px;  --space-96: 384px;

  /* === Radius === */
  --radius-none: 0;       --radius-sm: 2px;     --radius: 4px;
  --radius-md: 6px;       --radius-lg: 8px;     --radius-xl: 10px;
  --radius-2xl: 12px;     --radius-3xl: 16px;   --radius-4xl: 20px;
  --radius-5xl: 24px;     --radius-6xl: 32px;   --radius-7xl: 40px;
  --radius-8xl: 48px;     --radius-full: 9999px;

  /* === Effects === */
  --blur-default: 8px;

  /* === Typography === */
  --font-family: "Pretendard Variable", -apple-system, BlinkMacSystemFont, sans-serif;
  --font-family-logo: "Advent Pro", "Advent Pro Expanded", sans-serif;
}

/* === Text Style classes (Figma Text Style 1:1) === */
.t-display-1     { font: 700 48px/1.2  var(--font-family); letter-spacing: -0.02em; }
.t-heading-1     { font: 700 32px/1.3  var(--font-family); letter-spacing: -0.02em; }
.t-heading-2     { font: 600 24px/1.35 var(--font-family); letter-spacing: 0; }
.t-heading-3     { font: 600 20px/1.4  var(--font-family); letter-spacing: -0.01em; }
.t-title-1       { font: 700 18px/1.6  var(--font-family); letter-spacing: 0; }
.t-body-1-regular  { font: 500 18px/1.55 var(--font-family); letter-spacing: -0.005em; }
.t-body-1-semibold { font: 600 18px/1.55 var(--font-family); letter-spacing: -0.005em; }
.t-body-2-regular  { font: 400 16px/1.5  var(--font-family); letter-spacing: 0; }
.t-body-2-semibold { font: 600 16px/1.5  var(--font-family); letter-spacing: -0.005em; }
.t-body-3-regular  { font: 400 14px/1.5  var(--font-family); letter-spacing: 0.005em; }
.t-body-3-medium   { font: 500 14px/1.5  var(--font-family); letter-spacing: 0; }
.t-body-3-bold     { font: 700 14px/1.5  var(--font-family); letter-spacing: 0; }
.t-body-4-regular  { font: 400 13px/1.4  var(--font-family); letter-spacing: 0.01em; }
.t-body-4-semibold { font: 600 13px/1.4  var(--font-family); letter-spacing: 0.01em; }
.t-caption-1-regular { font: 400 12px/1.4 var(--font-family); letter-spacing: 0.01em; }
.t-caption-1-medium  { font: 500 12px/1.4 var(--font-family); letter-spacing: 0.01em; }
.t-caption-2-medium  { font: 500 11px/1.4 var(--font-family); letter-spacing: 0.01em; }
.t-caption-2-semibold { font: 600 11px/1.4 var(--font-family); letter-spacing: 0.01em; }
.t-button-1 { font: 500 15px/1.4 var(--font-family); letter-spacing: 0; }
.t-button-2 { font: 500 14px/1.4 var(--font-family); letter-spacing: 0; }

/* 로고 전용 */
.t-logo-peakda {
  font: 600 30px/1 var(--font-family-logo);
  letter-spacing: -1.2px;
  color: var(--green-700);
}

/* Flower badge utility — 꽃 컬러 @ 20% bg + solid text */
.flower-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-0-5);
  padding: var(--space-0-5) var(--space-1-5);
  border-radius: var(--radius-full);
  background-color: color-mix(in srgb, var(--flower) 20%, transparent);
  color: var(--flower);
}
/* 사용 예: <span class="flower-badge t-caption-2-semibold" style="--flower: var(--flower-plum)">매화</span> */
```

---

## 9. 디자이너 확정 / 보강 필요

- **꽃 그래픽 에셋 보강**: `철쭉`, `핑크뮬리` 컬러 변수는 추가했으나 **꽃 그래픽 PNG 에셋은 미작성**입니다. 디자이너가 추가 제작 필요. 또한 사용 안 하는 8종 그래픽(라벤더/아이리스/메밀꽃/해바라기/목련/장미/튤립/국화)은 향후 정리 가능.
- **컬러 정합성**: 현재 매화 뱃지 BG가 `rgba(255, 168, 180, 0.2)`(=`Pink/200` @ 20%)로 하드코딩된 곳이 있을 수 있습니다 — 새 규칙은 솔리드 `Pink/300` @ 20%이므로 BG 색이 살짝 달라집니다. 디자이너 확인 권장.
- **`Background/Primary-80%` 토큰명 vs 실제값 불일치**: 토큰 이름은 80%인데 실제 alpha는 0.6(60%). 이름을 `Primary-60%`로 정정 또는 실제 alpha를 0.8로 수정 필요.
- **`Background/Quaternary 2` 네이밍**: 공백 포함이라 코드 매핑 시 주의.
- **`Caption 2/Regular` 부재**: Caption 2는 Medium/Semibold만 있고 Regular는 없음. 필요 시 디자이너에게 추가 요청.

---

문의 / 출처 Figma 파일: `https://www.figma.com/design/nUETz1701cxHk1Fk3xp5Kw/PEAKDA?node-id=151-504`
