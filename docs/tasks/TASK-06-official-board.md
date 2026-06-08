# TASK-06: Official Board

## Background

TASK-05까지 앱 shell과 홈 대시보드가 준비된다. 이제 학생회, 학교, 동아리 운영진, 관리자가 공지성 글을 게시하는 공식 게시판을 구현한다.

공식 게시판은 일반 학생 커뮤니티와 권한 정책이 다르다. 일반 학생은 조회만 가능하고, MVP 기본값은 공식 게시글 댓글 비활성화다.

## Goal

- 공식 게시판 목록, 상세, 작성, 수정 route를 구현한다.
- `pinned`, 카테고리, 작성 주체, 작성일, 조회수를 표시한다.
- `council`과 `admin`만 작성/수정/삭제 가능하게 한다.
- 일반 학생은 `/board/write`와 edit action에서 차단된다.

## Prerequisites

- TASK-03의 `Board`, `Post` 모델과 seed official board가 있어야 한다.
- TASK-04의 role permission helper가 동작해야 한다.
- TASK-05의 `SiteHeader`와 `PostList` 기반이 있어야 한다.

## Options Considered

- 옵션 A: 공식 게시판과 커뮤니티가 같은 `Post` 모델과 공용 list component를 공유한다.
  - 장점: AGENTS.md 모델 결정과 일치하고 중복이 줄어든다.
  - 단점: type별 정책 분기를 명확히 해야 한다.
- 옵션 B: 공식 게시판 전용 모델과 컴포넌트를 만든다.
  - 장점: 정책이 단순하다.
  - 단점: 커뮤니티와 중복이 많고 데이터 모델 원칙과 다르다.
- 옵션 C: 관리자 화면에서만 공식 글 작성 기능을 제공한다.
  - 장점: route가 줄어든다.
  - 단점: `/board/write` 요구사항을 만족하지 못한다.

## Selected Approach

옵션 A를 채택한다. `Post.type = "official"`과 `board.type = "official"`을 DAL에서 강제하고, UI는 공용 `PostList`에 official variant를 제공한다.

## Implementation Steps

1. Routes:
   - `app/board/page.tsx`
   - `app/board/[postId]/page.tsx`
   - `app/board/write/page.tsx`
   - `app/board/[postId]/edit/page.tsx`
2. DAL:
   - `lib/dal/official-board.ts`
   - 목록: search, pagination, category, pinned first 정렬.
   - 상세: 조회수 증가 정책을 명확히 구현.
   - 생성/수정/삭제: `requireRole(["council", "admin"])`.
3. Validators:
   - `lib/validators/post.ts`
   - title, content, boardId, category, pinned 검증.
4. Actions:
   - `lib/actions/official-board.ts`
   - `createOfficialPostAction`
   - `updateOfficialPostAction`
   - `deleteOfficialPostAction`
   - 성공 후 `/board` 또는 상세 route revalidate.
5. UI:
   - `PostEditor`를 작성/수정 공용으로 사용.
   - 권한 없는 사용자는 write/edit 버튼을 렌더링하지 않는다.
   - 서버에서도 반드시 401/403 처리.
6. Official comments:
   - MVP에서는 댓글 UI를 표시하지 않는다.
   - 상세 화면에 댓글 비활성 정책이 UI를 어지럽히지 않게 간단히 처리한다.

## Tests

- `npm run lint`
- `npm run build`
- 수동 시나리오:
  - 비로그인/학생이 `/board/write` 접근 시 로그인 또는 권한 차단.
  - `council`이 공식 글 작성 성공.
  - `admin`이 pinned 공지 수정 성공.
  - 목록에서 pinned 글이 상단에 표시.
  - 공식 상세에 댓글 작성 폼이 없다.

## Done Criteria

- 공식 게시판 목록/상세/작성/수정 route가 동작한다.
- 일반 학생은 공식 글 작성/수정/삭제가 불가능하다.
- `council` 또는 `admin`은 공식 글을 작성할 수 있다.
- `npm run lint`와 `npm run build`가 통과한다.

## Handoff Notes

TASK-07은 같은 `Post` 모델로 커뮤니티 기능을 구현한다. TASK-06에서 만든 `PostEditor`, `PostList`, post validator를 커뮤니티 요구에 맞게 재사용 가능한 형태로 유지한다.
