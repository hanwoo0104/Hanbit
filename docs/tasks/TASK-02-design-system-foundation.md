# TASK-02: Design System Foundation

## Background

TASK-01에서 프로젝트 기반과 의존성이 준비된다. 한빛 디자인 시스템은 `docs/design-system.md`에 정의되어 있으며, 학교 로고색 `#00017D` 기반의 Hanbit Navy를 사용한다.

이 태스크는 문서화된 디자인 시스템을 실제 앱에 적용하는 단계다. 색상 토큰, 폰트, shadcn primitive, 공용 UI 기반이 준비되어야 이후 홈, 게시판, 커뮤니티 화면이 같은 언어로 만들어진다.

## Goal

- `app/globals.css`에 Hanbit Navy 토큰과 Tailwind CSS v4 `@theme` 매핑을 적용한다.
- `Noto Sans KR`을 `next/font/google`로 적용한다.
- shadcn/ui 기반 primitive를 `components/ui/*`에 추가한다.
- 기본 버튼, 입력, 카드, 배지, 스켈레톤을 사용할 수 있게 한다.

## Prerequisites

- TASK-01의 Done Criteria가 완료되어야 한다.
- `docs/design-system.md`를 다시 읽고 토큰 이름과 사용 규칙을 확인한다.
- 기존 `app/layout.tsx`, `app/globals.css`, `components.json`을 확인한다.

## Options Considered

- 옵션 A: shadcn/ui primitive를 CLI로 생성하고 필요한 부분만 조정한다.
  - 장점: Radix 접근성과 variant 구조를 빠르게 확보한다.
  - 단점: 생성된 코드가 프로젝트 스타일과 다르면 정리가 필요하다.
- 옵션 B: 모든 primitive를 직접 작성한다.
  - 장점: 코드가 작고 통제가 쉽다.
  - 단점: Dialog, Select, Tooltip 같은 접근성 구현 비용이 높다.
- 옵션 C: Tailwind utility만으로 화면마다 직접 구현한다.
  - 장점: 초기 속도가 빠르다.
  - 단점: UI 일관성이 무너지고 반복이 많아진다.

## Selected Approach

옵션 A를 채택한다. shadcn/ui를 primitive 기반으로 소유하되, 색상과 radius는 `docs/design-system.md`의 Hanbit Navy token으로 맞춘다.

## Implementation Steps

1. `app/globals.css` 수정:
   - `docs/design-system.md`의 `:root`, `.dark`, `@theme inline` 토큰을 적용한다.
   - `body`에는 `bg-background`, `text-foreground` 의미가 유지되도록 CSS 변수를 사용한다.
2. `app/layout.tsx` 수정:
   - `Noto_Sans_KR`과 `Geist_Mono`를 `next/font/google`로 불러온다.
   - `html lang="ko"`로 변경한다.
   - metadata를 한빛에 맞춘다.
3. shadcn primitive 추가:
   - 우선 추가: `button`, `badge`, `card`, `input`, `textarea`, `label`, `skeleton`
   - 상호작용 primitive: `tabs`, `dropdown-menu`, `dialog`, `tooltip`
   - 관리자/목록용: `table`, `separator`, `checkbox`, `switch`
4. `lib/utils.ts` 생성:
   - `cn()` helper는 `clsx`와 `tailwind-merge`를 사용한다.
5. 공용 스타일 규칙 확인:
   - card radius는 8px 이하.
   - pill은 badge/chip/D-day에만 `rounded-full`.
   - icon-only button에는 `aria-label` 또는 tooltip을 둔다.

## Tests

- `npm run lint`
- `npm run build`
- 수동 확인:
  - `app/layout.tsx`의 `lang`이 `ko`인지 확인한다.
  - `rg -n "#00017d|--dashboard-bg|--color-brand|Noto" app components lib`
  - shadcn primitive import가 `@/components/ui/*` 경로로 동작하는지 확인한다.

## Done Criteria

- Hanbit Navy 토큰이 `app/globals.css`에 적용되어 있다.
- `Noto Sans KR`이 기본 sans font로 연결되어 있다.
- 기본 UI primitive가 존재하고 import 가능하다.
- `npm run lint`와 `npm run build`가 통과한다.

## Handoff Notes

TASK-03은 UI가 아니라 데이터 기반을 만든다. TASK-02에서 만든 `lib/utils.ts`와 `components/ui/*`는 TASK-05 이후 화면 구현에서 본격적으로 사용된다.
