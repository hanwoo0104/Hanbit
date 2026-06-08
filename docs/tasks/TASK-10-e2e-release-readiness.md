# TASK-10: E2E and Release Readiness

## Background

TASK-09까지 완료되면 한빛 MVP의 주요 기능이 구현되어 있어야 한다. 마지막 태스크는 전체 흐름을 자동/수동으로 검증하고, AGENTS.md의 완료 기준을 모두 만족하는지 확인한다.

이 태스크는 새 기능을 크게 추가하지 않는다. 대신 버그를 잡고, Playwright 시나리오와 release checklist를 통해 "완전히 동작하는 MVP" 상태를 만든다.

## Goal

- `npm run lint`와 `npm run build`를 안정적으로 통과한다.
- Playwright E2E로 핵심 사용자/권한/관리자 흐름을 검증한다.
- desktop/mobile screenshot으로 홈과 주요 화면의 겹침, 대비, 가독성을 확인한다.
- 릴리스 전 체크리스트를 문서화한다.

## Prerequisites

- TASK-01부터 TASK-09까지 Done Criteria가 완료되어야 한다.
- seed 데이터 또는 테스트 fixture가 안정적으로 생성되어야 한다.
- Playwright가 설치되어 있어야 한다.

## Options Considered

- 옵션 A: Playwright E2E 중심으로 핵심 흐름을 검증한다.
  - 장점: 실제 사용자 관점에서 권한과 화면을 함께 확인할 수 있다.
  - 단점: 테스트 작성 시간이 필요하고 fixture 안정성이 중요하다.
- 옵션 B: unit test와 manual QA만 사용한다.
  - 장점: 빠르게 작성 가능하다.
  - 단점: 인증/권한/route 흐름 회귀를 놓치기 쉽다.
- 옵션 C: build 통과만 릴리스 기준으로 둔다.
  - 장점: 가장 간단하다.
  - 단점: MVP 동작 보장을 거의 하지 못한다.

## Selected Approach

옵션 A를 채택한다. 한빛의 핵심 리스크는 인증, 역할, Server Action 권한, 반응형 UI이므로 Playwright가 가장 적합하다. 필요한 경우 작은 unit test는 보조로 추가한다.

## Implementation Steps

1. Playwright 설정:
   - `playwright.config.ts` 생성.
   - `npm` script 추가: `test:e2e`, `test:e2e:ui`.
   - dev server는 `npm run dev` 또는 production preview 방식 중 하나로 고정.
2. Test fixture:
   - `prisma/seed.ts`가 deterministic해야 한다.
   - 테스트 계정: student, council, admin.
   - 테스트 시작 전 DB reset/seed 절차를 문서화한다.
3. E2E scenarios:
   - 회원가입 성공.
   - 로그인/로그아웃.
   - 일반 학생이 커뮤니티 글과 댓글 작성.
   - 일반 학생은 공식 게시판 글쓰기 접근 불가.
   - council 또는 admin은 공식 게시글 작성 가능.
   - 신고 생성 후 admin 화면에서 확인.
   - admin이 신고된 글 숨김 처리.
   - 마이페이지에서 내 글/댓글/할 일 확인.
4. Visual/responsive checks:
   - 홈 desktop/mobile screenshot.
   - 게시판 목록 mobile.
   - 커뮤니티 상세 mobile.
   - 관리자 신고 화면 desktop.
5. Accessibility checks:
   - keyboard focus visible.
   - icon-only button aria-label.
   - form label/error 연결.
6. Release checklist:
   - `.env.example` 최신성.
   - README local setup.
   - AGENTS.md와 docs 최신성.
   - migration/seed 실행 방법.

## Tests

- `npm run lint`
- `npm run build`
- `npm run test:e2e`
- 수동 확인:
  - desktop/mobile screenshot 확인.
  - 키보드만으로 로그인, 메뉴, dialog 기본 조작 가능.
  - 색 대비와 텍스트 겹침 확인.

## Done Criteria

- `AGENTS.md`의 앱 구현 후 확인 항목이 모두 통과한다.
- Playwright E2E가 핵심 흐름을 검증한다.
- desktop/mobile에서 홈 대시보드와 주요 화면이 겹침 없이 표시된다.
- README 또는 docs에 로컬 실행, DB seed, 테스트 실행 방법이 정리되어 있다.
- 알려진 미해결 이슈가 있으면 MVP 이후 항목으로 분리되어 있다.

## Handoff Notes

TASK-10 완료 후에는 기능 추가보다 유지보수 흐름으로 전환한다. 이후 아키텍처, 디자인 시스템, 권한 정책이 바뀌면 `AGENTS.md`, `docs/design-system.md`, 관련 `docs/tasks/TASK-##.md`를 함께 갱신한다.
