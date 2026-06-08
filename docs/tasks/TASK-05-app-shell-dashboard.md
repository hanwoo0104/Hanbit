# TASK-05: App Shell and Dashboard

## Background

TASK-04까지 완료되면 인증과 권한, 디자인 primitive, Prisma 데이터가 준비된다. 이제 사용자가 처음 보는 홈 대시보드와 전체 app shell을 구현한다.

홈은 한빛의 핵심 경험이다. 학교 생활 정보를 다크 네이비 캔버스에서 빠르게 스캔할 수 있어야 하고, 모바일에서도 겹침이 없어야 한다.

## Goal

- `SiteHeader`와 앱 기본 shell을 만든다.
- 홈 대시보드에서 학사일정, 시간표, 급식, D-day, 할 일, 최신 공식 글, 인기 커뮤니티 글을 표시한다.
- 현재 사용자 기준 데이터를 DAL에서 병렬 조회한다.
- desktop/mobile에서 홈이 겹침 없이 표시된다.

## Prerequisites

- TASK-02의 디자인 토큰과 primitive가 준비되어야 한다.
- TASK-03의 seed 데이터가 있어야 한다.
- TASK-04의 `auth()`와 session field가 동작해야 한다.

## Options Considered

- 옵션 A: 모든 대시보드 데이터를 Server Component에서 병렬 조회한다.
  - 장점: RSC 원칙과 AGENTS.md 데이터 흐름에 맞고 client JS가 작다.
  - 단점: 일부 위젯이 느리면 Suspense 구성이 필요하다.
- 옵션 B: 클라이언트에서 fetch로 각 위젯을 불러온다.
  - 장점: 위젯별 로딩 구현이 쉽다.
  - 단점: API surface가 불필요하게 늘고 인증/권한 중복이 생긴다.
- 옵션 C: 정적 mock UI를 먼저 만든다.
  - 장점: 시각 구현이 빠르다.
  - 단점: 실제 데이터 계약 검증이 늦어진다.

## Selected Approach

옵션 A를 채택한다. `app/page.tsx`는 Server Component로 두고, DAL 함수들을 `Promise.all`로 병렬 호출한다. 상호작용이 필요한 할 일 toggle 같은 기능만 후속 Client Component로 분리한다.

## Implementation Steps

1. 공용 shell:
   - `components/common/site-header.tsx`
   - logo `한빛.`
   - nav: 홈, 게시판, 커뮤니티, 기숙사, 스터디, 학급
   - 기숙사/스터디/학급은 독립 route가 아니라 커뮤니티 카테고리 또는 대시보드 anchor로 연결.
2. Dashboard components:
   - `DashboardSection`
   - `TimelineList`
   - `TimetableList`
   - `MealList`
   - `DdayList`
   - `TodoList`
   - `PostList`의 compact variant
3. DAL:
   - `lib/dal/dashboard.ts`
   - `getDashboardData(userId)` 또는 위젯별 DTO 함수.
   - 숨김 처리된 커뮤니티 글은 제외.
4. Home route:
   - `app/page.tsx`를 기본 Next template에서 한빛 대시보드로 교체.
   - 비로그인 사용자는 샘플/게스트 대시보드를 보여주고 CTA로 로그인/가입 제공.
   - 로그인 사용자는 이름 기반 인사말 표시.
5. Responsive:
   - 모바일 한 열.
   - desktop은 `grid-cols-12`와 `minmax(0, 1fr)`로 패널 배치.
   - 긴 제목과 메뉴는 `min-w-0`, `truncate`, `break-words` 처리.
6. Empty states:
   - 급식 없음, 할 일 없음, 일정 없음 상태를 각각 제공.

## Tests

- `npm run lint`
- `npm run build`
- 수동 확인:
  - 로그인/비로그인 홈 표시.
  - 모바일 폭에서 패널이 한 열로 흐른다.
  - 시간표와 D-day pill이 텍스트와 겹치지 않는다.
- 가능하면 Playwright screenshot:
  - desktop `1440x900`
  - mobile `390x844`

## Done Criteria

- 홈 대시보드가 실제 seed/DAL 데이터로 렌더링된다.
- `SiteHeader`가 주요 route에서 재사용 가능하다.
- desktop/mobile에서 대시보드 항목이 겹치지 않는다.
- `npm run lint`와 `npm run build`가 통과한다.

## Handoff Notes

TASK-06은 `SiteHeader`와 `PostList` 패턴을 공식 게시판으로 확장한다. TASK-05에서 만든 `PostList` DTO가 공식/커뮤니티 모두에 충분하지 않으면 TASK-06에서 공용 타입을 정리한다.
