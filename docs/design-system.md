# 한빛 디자인 시스템

이 문서는 한빛 학생 커뮤니티 MVP의 UI 구현 기준이다. 앱 화면을 만들기 전 이 문서를 먼저 확인하고, 색상과 컴포넌트 규칙은 여기 정의된 값을 우선한다.

## 디자인 시스템 결정

- 기본 시스템은 `shadcn/ui`, Radix UI Primitives, Tailwind CSS v4 theme tokens, `lucide-react` 조합으로 고정한다.
- `shadcn/ui`는 완성형 외부 UI 라이브러리처럼 숨겨서 쓰지 않고, `components/ui/*`에 복사해 프로젝트가 소유하는 primitive 컴포넌트로 사용한다.
- 복잡한 상호작용이 필요한 Dialog, Dropdown Menu, Select, Tabs, Tooltip, Sheet, Popover는 Radix 기반 shadcn 컴포넌트를 우선 사용한다.
- Tailwind CSS v4의 `@theme`와 `:root`/`.dark` CSS 변수를 사용해 색상, radius, shadow, font token을 관리한다.
- 아이콘은 `lucide-react`를 우선 사용한다. 직접 SVG를 만들거나 텍스트로 아이콘 역할을 대신하지 않는다.

참고 문서:

- shadcn/ui Next.js: `https://v3.shadcn.com/docs/installation/next`
- shadcn/ui theming: `https://ui.shadcn.com/docs/theming`
- Radix UI Primitives: `https://www.radix-ui.com/primitives/docs/overview/introduction`
- Tailwind CSS theme variables: `https://tailwindcss.com/docs/theme`

## 시각 방향

한빛은 학교 커뮤니티답게 신뢰감 있고 읽기 쉬운 정보형 UI를 목표로 한다. 마케팅 랜딩 페이지처럼 과장된 hero나 장식 중심 화면을 만들지 않는다.

- 전체 인상: modern, crisp, dense, trustworthy
- 브랜드 느낌: 학교 로고색 `#00017D`를 중심으로 한 선명한 네이비
- 홈: 브랜드 네이비 기반 다크 대시보드, 큰 한글 타이포그래피, 고대비 정보 카드
- 게시판/커뮤니티/관리자: 밝은 배경, 정돈된 테이블/리스트, 절제된 네이비 강조
- 상호작용: 빠르게 훑고 바로 행동할 수 있는 버튼, 탭, 필터, 메뉴

## 컬러 스키마: Hanbit Navy

학교 로고색 `#00017D`를 primary brand로 사용한다. 네이비가 화면 전체를 무겁게 덮지 않도록 light surface는 warm neutral로 두고, 현재 상태와 보조 강조는 sky/cyan, 일정과 D-day는 amber를 사용한다.

### Brand

| Token | Hex | Usage |
| --- | --- | --- |
| `brand` | `#00017D` | 로고, 주요 CTA, 활성 navigation, 공식 게시판 강조 |
| `brand-hover` | `#1014A8` | primary button hover, active link hover |
| `brand-active` | `#07095F` | pressed state, selected dark navy |
| `brand-soft` | `#EEF0FF` | light selected row, subtle badge, info background |
| `brand-ring` | `#5B6CFF` | focus ring, keyboard focus outline |
| `brand-foreground` | `#FFFFFF` | brand 배경 위 텍스트와 아이콘 |

### Light App

| Token | Hex | Usage |
| --- | --- | --- |
| `background` | `#F7F8FC` | 게시판, 커뮤니티, 관리자 기본 배경 |
| `foreground` | `#111827` | 기본 텍스트 |
| `card` | `#FFFFFF` | 리스트 컨테이너, 폼, 관리자 패널 |
| `border` | `#E4E7F0` | 카드, 테이블, 입력 경계 |
| `muted` | `#EEF1F7` | secondary surface, table header, empty state |
| `muted-foreground` | `#667085` | 설명, placeholder, 보조 메타데이터 |

### Dark Dashboard

| Token | Hex | Usage |
| --- | --- | --- |
| `dashboard-bg` | `#070816` | 홈 대시보드 전체 캔버스 |
| `dashboard-surface` | `#101225` | 홈 기본 패널 |
| `dashboard-surface-raised` | `#171A33` | 강조 패널, 현재 시간표, hover panel |
| `dashboard-border` | `#2A2F55` | 홈 패널 경계 |
| `dashboard-text` | `#F8FAFC` | 홈 주요 텍스트 |
| `dashboard-muted` | `#A8B0CC` | 홈 보조 텍스트 |

### Accent and Semantic

| Token | Hex | Usage |
| --- | --- | --- |
| `accent-sky` | `#38BDF8` | 홈 active 상태, 현재 시간표, 링크 강조 |
| `accent-cyan` | `#22D3EE` | 실시간 상태, hover glow 대신 얇은 accent line |
| `warning` | `#F59E0B` | D-day, 마감 임박, 중요 일정 |
| `success` | `#22C55E` | 완료, 승인, 정상 상태 |
| `danger` | `#EF4444` | 삭제, 신고, 오류, 정지 상태 |
| `community-accent` | `#8B5CF6` | 인기 커뮤니티, 스터디, 보조 카테고리 강조 |

### 색상 사용 규칙

- `#00017D`는 로고, primary CTA, 활성 navigation, 공식 게시판 강조에만 강하게 사용한다.
- 홈 대시보드는 네이비 다크 캔버스를 쓰되 `accent-sky`와 `accent-cyan`으로 현재 상태와 active 요소를 구분한다.
- 게시판, 커뮤니티, 관리자 화면은 밝은 배경을 기본으로 하고 네이비는 헤더, 버튼, 선택 상태에 절제해서 사용한다.
- `warning`은 D-day, 마감 임박, 중요 일정에만 사용한다.
- `danger`는 삭제, 신고, 오류, 정지 상태에만 사용한다.
- 한 화면의 목표 색 비율은 neutral 70%, navy 20%, accent/semantic 10%다.
- 색만으로 상태를 전달하지 않는다. badge text, icon, label을 함께 사용한다.

## Tailwind와 shadcn 토큰 매핑

`app/globals.css`에는 shadcn semantic token과 한빛 brand token을 함께 둔다. 컴포넌트는 가능한 `bg-background`, `text-foreground`, `border-border`, `bg-primary`, `text-primary-foreground` 같은 semantic utility를 사용한다.

```css
@import "tailwindcss";

:root {
  --background: #f7f8fc;
  --foreground: #111827;
  --card: #ffffff;
  --card-foreground: #111827;
  --popover: #ffffff;
  --popover-foreground: #111827;
  --primary: #00017d;
  --primary-foreground: #ffffff;
  --secondary: #eef1f7;
  --secondary-foreground: #111827;
  --muted: #eef1f7;
  --muted-foreground: #667085;
  --accent: #eef0ff;
  --accent-foreground: #00017d;
  --destructive: #ef4444;
  --destructive-foreground: #ffffff;
  --border: #e4e7f0;
  --input: #e4e7f0;
  --ring: #5b6cff;
  --radius: 8px;

  --brand: #00017d;
  --brand-hover: #1014a8;
  --brand-active: #07095f;
  --brand-soft: #eef0ff;
  --brand-ring: #5b6cff;
  --brand-foreground: #ffffff;
  --dashboard-bg: #070816;
  --dashboard-surface: #101225;
  --dashboard-surface-raised: #171a33;
  --dashboard-border: #2a2f55;
  --dashboard-text: #f8fafc;
  --dashboard-muted: #a8b0cc;
  --accent-sky: #38bdf8;
  --accent-cyan: #22d3ee;
  --warning: #f59e0b;
  --success: #22c55e;
  --danger: #ef4444;
  --community-accent: #8b5cf6;
}

.dark {
  --background: #070816;
  --foreground: #f8fafc;
  --card: #101225;
  --card-foreground: #f8fafc;
  --popover: #171a33;
  --popover-foreground: #f8fafc;
  --primary: #5b6cff;
  --primary-foreground: #ffffff;
  --secondary: #171a33;
  --secondary-foreground: #f8fafc;
  --muted: #171a33;
  --muted-foreground: #a8b0cc;
  --accent: #1014a8;
  --accent-foreground: #ffffff;
  --destructive: #ef4444;
  --destructive-foreground: #ffffff;
  --border: #2a2f55;
  --input: #2a2f55;
  --ring: #5b6cff;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-brand: var(--brand);
  --color-brand-hover: var(--brand-hover);
  --color-brand-active: var(--brand-active);
  --color-brand-soft: var(--brand-soft);
  --color-dashboard-bg: var(--dashboard-bg);
  --color-dashboard-surface: var(--dashboard-surface);
  --color-dashboard-surface-raised: var(--dashboard-surface-raised);
  --color-dashboard-border: var(--dashboard-border);
  --color-dashboard-text: var(--dashboard-text);
  --color-dashboard-muted: var(--dashboard-muted);
  --color-accent-sky: var(--accent-sky);
  --color-accent-cyan: var(--accent-cyan);
  --color-warning: var(--warning);
  --color-success: var(--success);
  --color-danger: var(--danger);
  --color-community-accent: var(--community-accent);
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: var(--radius);
  --radius-xl: 12px;
}
```

## shadcn/ui 설정 기준

`components.json`을 만들 때 다음 선택을 기본값으로 한다.

- `style`: `base-nova`
- `rsc`: `true`
- `tsx`: `true`
- `tailwind.css`: `app/globals.css`
- `tailwind.cssVariables`: `true`
- `tailwind.baseColor`: `neutral`
- `aliases.components`: `@/components`
- `aliases.ui`: `@/components/ui`
- `aliases.lib`: `@/lib`

필수 primitive는 MVP 초기에 먼저 추가한다.

- `button`, `badge`, `card`, `input`, `textarea`, `label`, `select`
- `tabs`, `dropdown-menu`, `dialog`, `sheet`, `tooltip`, `avatar`
- `table`, `separator`, `skeleton`, `checkbox`, `switch`

## 타이포그래피

- 한국어 UI 기본 폰트는 `Noto Sans KR`을 `next/font/google`로 불러와 `--font-sans`에 연결한다.
- 숫자, 학번, 시간표 교시, 코드성 텍스트는 현재 mono font를 보조로 사용한다.
- `letter-spacing`은 기본 `0`으로 둔다. 작은 라벨에서만 필요한 경우 `tracking-wide` 이하로 제한한다.
- 홈 인사말과 대시보드 핵심 문구는 큰 한글 타이포그래피를 허용한다.
- 게시판, 관리자, 폼, 카드 내부 heading은 compact scale을 사용한다.

권장 scale:

- Page title: `text-3xl` 또는 `text-4xl`
- Section title: `text-xl` 또는 `text-2xl`
- Card title: `text-base` 또는 `text-lg`
- Body: `text-sm` 또는 `text-base`
- Metadata: `text-xs` 또는 `text-sm`

## Spacing, Radius, Shadow

- spacing은 Tailwind 기본 4px scale을 사용한다.
- desktop page container는 `max-w-7xl`을 기본으로 하고, 게시글 본문은 `max-w-3xl` 또는 `max-w-4xl`로 제한한다.
- radius 기본값은 `8px`다. 카드, 패널, 버튼, 입력은 8px 이하를 사용한다.
- badge, chip, D-day pill, 시간표 pill만 `rounded-full`을 허용한다.
- page section을 카드처럼 띄우지 않는다. 카드는 반복 item, modal, 실제 framed tool에만 사용한다.
- 카드 안에 카드를 중첩하지 않는다.
- shadow는 얕게 사용한다. 밝은 화면은 `border` 중심, 다크 대시보드는 border와 surface contrast 중심으로 계층을 만든다.

## 컴포넌트 구조

- `components/ui/*`: shadcn primitive와 variant 정의. 앱 도메인 로직을 넣지 않는다.
- `components/common/*`: `SiteHeader`, `PostList`, `RoleGate`처럼 여러 route가 공유하는 앱 조합 컴포넌트.
- `app/**/_components/*`: 특정 route에서만 쓰는 화면 전용 조합.
- `app/**/_lib/*`: 특정 route의 데이터 조합, formatting, view model helper.
- `lib/actions/*`, `lib/dal/*`, `lib/validators/*`는 UI 컴포넌트와 직접 섞지 않는다.

컴포넌트 구현 규칙:

- 버튼은 명령형 액션에만 사용한다. route 이동은 `Link`를 우선한다.
- icon-only button에는 `aria-label` 또는 Tooltip을 반드시 제공한다.
- 입력 필드는 label, description, error message 영역을 고정해서 validation 상태에서 레이아웃이 크게 흔들리지 않게 한다.
- destructive action은 빨간색과 명확한 텍스트를 함께 사용하고, 삭제/숨김 처리처럼 되돌리기 어려운 작업은 Dialog 확인을 사용한다.
- table은 관리자와 게시판 관리 화면에 사용하고, 모바일에서는 card/list pattern으로 전환한다.

## 화면별 패턴

### 홈 대시보드

- `bg-dashboard-bg text-dashboard-text`를 기반으로 한다.
- 상단 navigation은 투명하거나 매우 어두운 surface를 사용하고, active item은 `accent-sky` 또는 `brand-ring`으로 표시한다.
- 대시보드 패널은 `dashboard-surface`, 강조 패널은 `dashboard-surface-raised`를 사용한다.
- 시간표와 D-day는 pill 형태를 사용한다.
- 학사일정은 세로 timeline으로 표시하고, 중요 일정은 `warning`을 사용한다.
- 정보가 없는 섹션은 빈 카드만 두지 말고 짧은 empty state 문구와 보조 action을 제공한다.

### 게시판

- 공식 게시판은 `brand`를 강조색으로 사용한다.
- pinned 글은 `brand-soft` 배경 또는 왼쪽 border accent로 표시한다.
- 목록은 제목, 카테고리, 작성 주체, 작성일, 조회수를 한눈에 비교할 수 있게 밀도 있게 구성한다.
- 작성/수정/삭제 버튼은 권한 있는 사용자에게만 보이고, 위험 액션은 `danger`를 사용한다.

### 커뮤니티

- 커뮤니티는 밝은 배경과 리스트 중심 UI를 사용한다.
- 카테고리 active state는 `brand-soft`와 `brand` 텍스트를 사용한다.
- 인기 글, 스터디, 동아리 같은 보조 강조는 `community-accent`를 제한적으로 사용한다.
- 댓글, 좋아요, 조회수는 작은 icon + 숫자 조합으로 표시한다.

### 계정과 관리자

- 계정 화면은 폼 안정성과 오류 가독성을 우선한다.
- 관리자 화면은 table, filter, tabs, dialog를 중심으로 구성한다.
- 사용자 상태 `pending`, `suspended`, 신고 상태는 badge 색상과 텍스트를 함께 사용한다.

## 접근성

- 텍스트와 배경 대비는 WCAG AA를 목표로 한다.
- 모든 interactive element는 keyboard focus가 보여야 한다. focus ring은 `brand-ring`을 사용한다.
- 터치 타깃은 최소 44px 높이를 목표로 한다. dense table의 보조 action도 icon-only면 36px 미만으로 만들지 않는다.
- Dialog, Sheet, Dropdown, Select는 Radix 기반 컴포넌트를 사용해 focus trap, escape close, keyboard navigation을 보장한다.
- skeleton, loading, empty, error state를 각 주요 화면에 둔다.
- 색상만으로 상태를 전달하지 않고 text label이나 icon을 함께 제공한다.

## 반응형 규칙

- 모바일 기본은 한 열 레이아웃이다.
- 대시보드는 `grid-template-columns`와 `minmax(0, 1fr)`를 사용해 겹침을 방지한다.
- 고정 폭 카드 대신 `w-full`, `max-w-*`, responsive grid를 사용한다.
- toolbar는 모바일에서 wrapping 또는 horizontal scroll이 아니라 주요 action만 남기고 secondary action은 menu로 이동한다.
- 긴 제목, 사용자 이름, 이메일은 `min-w-0`, `truncate`, `break-words` 중 맥락에 맞게 처리한다.

## Motion

- motion은 120-200ms 범위의 짧은 transition을 사용한다.
- hover는 색, border, surface 변화 중심으로 표현한다.
- layout shift가 생기는 scale animation은 핵심 action에 쓰지 않는다.
- `prefers-reduced-motion` 사용자는 animation을 줄인다.

## 구현 체크리스트

- `app/globals.css`에 Hanbit Navy token을 추가한다.
- `components.json`을 shadcn/ui 기준에 맞게 생성한다.
- `components/ui/*` primitive를 먼저 만들고, 앱 조합 컴포넌트는 그 위에서 작성한다.
- `Noto Sans KR`을 `app/layout.tsx`에서 `next/font/google`로 적용한다.
- desktop과 mobile Playwright screenshot으로 홈 다크 대시보드, 게시판 목록, 커뮤니티 상세, 관리자 신고 화면을 확인한다.
