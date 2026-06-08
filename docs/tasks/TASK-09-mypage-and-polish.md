# TASK-09: My Page and Product Polish

## Background

TASK-08까지 핵심 기능과 관리자 흐름이 구현된다. 이제 로그인 사용자가 자신의 정보, 작성 글, 댓글, 할 일, 상태를 확인하는 마이페이지와 전반적인 UX polish를 완성한다.

이 태스크는 기능 사이의 이동이 끊기지 않도록 empty/loading/error 상태와 모바일 반응형을 정리하는 단계다.

## Goal

- `/mypage`를 구현한다.
- 내 정보, 내 글, 내 댓글, 내 할 일을 표시한다.
- empty, loading, error state를 주요 화면에 정리한다.
- 주요 사용자 흐름이 앱 안에서 자연스럽게 이어지도록 navigation과 링크를 polish한다.

## Prerequisites

- TASK-04 인증과 session field가 동작해야 한다.
- TASK-07 커뮤니티 글/댓글이 구현되어야 한다.
- TASK-08 hidden/status 정책이 확정되어야 한다.

## Options Considered

- 옵션 A: `/mypage` 한 화면에 요약과 탭을 제공한다.
  - 장점: MVP에 충분하고 route가 단순하다.
  - 단점: 데이터가 많아지면 페이지가 길어진다.
- 옵션 B: `/mypage/posts`, `/mypage/comments`, `/mypage/todos`로 분리한다.
  - 장점: 확장성이 좋다.
  - 단점: MVP 구현량과 navigation이 늘어난다.
- 옵션 C: 마이페이지를 프로필 정보만 제공한다.
  - 장점: 간단하다.
  - 단점: AGENTS.md의 내 글/댓글/할 일 요구를 만족하지 못한다.

## Selected Approach

옵션 A를 채택한다. `/mypage`는 Server Component로 요약 데이터를 조회하고, 탭 또는 segmented control로 내 글/댓글/할 일을 전환한다. 할 일 완료 toggle처럼 상호작용이 필요한 부분만 Client Component로 분리한다.

## Implementation Steps

1. Route:
   - `app/mypage/page.tsx`
   - 로그인 필요. 비로그인은 `/login?callbackUrl=/mypage`.
2. DAL:
   - `lib/dal/mypage.ts`
   - current user profile DTO.
   - my posts, my comments, my todos.
   - hidden content는 본인에게 표시하되 hidden badge를 붙인다.
3. Actions:
   - `lib/actions/todos.ts`
   - create/update/toggle/delete todo.
   - ownership 검증 필수.
4. UI:
   - profile summary.
   - role/status badge.
   - tabs: 내 글, 내 댓글, 할 일.
   - 각각 empty state 제공.
5. Polish:
   - 모든 주요 route에 loading/error/not-found가 필요한지 확인.
   - form error message 영역 정리.
   - header active link 상태 정리.
   - 모바일 toolbar wrapping 문제 해결.
6. Content links:
   - 내 글은 해당 board/detail로 이동.
   - 내 댓글은 댓글이 달린 post detail로 이동.
   - admin/council 사용자는 관련 관리/작성 CTA를 제공.

## Tests

- `npm run lint`
- `npm run build`
- 수동 시나리오:
  - 로그인 사용자가 `/mypage` 접근 가능.
  - 비로그인은 로그인으로 이동.
  - 내 글/댓글/할 일이 표시.
  - 할 일 완료 toggle이 ownership 검증과 함께 동작.
  - 빈 상태가 어색한 빈 카드로 보이지 않음.
  - 모바일에서 탭과 목록 텍스트가 겹치지 않음.

## Done Criteria

- `/mypage`에서 내 정보, 내 글, 내 댓글, 내 할 일을 확인할 수 있다.
- 주요 화면에 empty/loading/error 상태가 정리되어 있다.
- desktop/mobile에서 주요 사용자 흐름이 끊기지 않는다.
- `npm run lint`와 `npm run build`가 통과한다.

## Handoff Notes

TASK-10은 전체 E2E와 릴리스 준비를 담당한다. TASK-09에서 발견한 UX 취약점이나 미검증 흐름은 TASK-10의 Playwright 시나리오에 포함한다.
