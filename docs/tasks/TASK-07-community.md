# TASK-07: Community

## Background

TASK-06에서 공식 게시판이 구현된다. 이제 일반 학생들이 카테고리별로 글과 댓글을 작성하는 커뮤니티를 구현한다.

커뮤니티는 네이버 카페형 게시판 경험이 핵심이다. 목록 탐색, 카테고리, 검색, 정렬, 댓글, 좋아요, 신고 진입이 자연스러워야 한다.

## Goal

- 커뮤니티 카테고리 목록, 게시글 목록, 상세, 작성, 수정 route를 구현한다.
- 로그인한 학생 이상이 글과 댓글을 작성할 수 있다.
- 본인 글/댓글과 관리자는 수정/삭제 가능하다.
- 좋아요와 신고 진입을 구현한다.

## Prerequisites

- TASK-03의 community board seed가 있어야 한다.
- TASK-04의 auth와 ownership permission helper가 동작해야 한다.
- TASK-06의 `PostEditor`, `PostList`, post validator를 재사용할 수 있어야 한다.

## Options Considered

- 옵션 A: 커뮤니티도 Server Component 목록/상세 + Server Action mutation으로 구현한다.
  - 장점: AGENTS.md 데이터 흐름과 일치하고 권한 재검증이 명확하다.
  - 단점: 좋아요 같은 즉각 반응은 작은 Client Component가 필요하다.
- 옵션 B: 커뮤니티를 Route Handler API + 클라이언트 fetch 중심으로 구현한다.
  - 장점: SPA 같은 반응성을 얻기 쉽다.
  - 단점: 인증/권한과 캐시 재검증이 중복된다.
- 옵션 C: 댓글과 좋아요를 MVP에서 제외한다.
  - 장점: 구현량이 줄어든다.
  - 단점: AGENTS.md의 커뮤니티 핵심 경험을 만족하지 못한다.

## Selected Approach

옵션 A를 채택한다. 목록과 상세는 Server Component와 DAL을 사용하고, 좋아요/신고/댓글 폼처럼 상호작용이 필요한 부분만 Client Component 또는 Server Action form으로 분리한다.

## Implementation Steps

1. Routes:
   - `app/community/page.tsx`
   - `app/community/[boardSlug]/page.tsx`
   - `app/community/[boardSlug]/[postId]/page.tsx`
   - `app/community/write/page.tsx`
   - `app/community/[boardSlug]/[postId]/edit/page.tsx`
2. DAL:
   - `lib/dal/community.ts`
   - board list, category detail, post detail, comments, reaction summary.
   - hidden post/comment visibility는 작성자와 admin 외에는 제외.
3. Actions:
   - `lib/actions/community.ts`
   - create/update/delete community post.
   - create/update/delete comment.
   - toggle reaction.
   - create report는 TASK-08에서 최종 확장하되 신고 버튼 진입은 만든다.
4. Validators:
   - post title/content.
   - comment content.
   - reaction target type.
   - report reason 기초 schema.
5. UI:
   - category sidebar 또는 top segmented nav.
   - 목록: 제목, 작성자 표시명, 댓글 수, 좋아요 수, 조회수, 작성 시간.
   - 상세: 본문, `CommentThread`, `LikeButton`, `ReportControls`.
   - 모바일에서 카테고리는 horizontal tabs 또는 select로 전환.
6. Permissions:
   - 로그인한 `student` 이상만 글/댓글 작성.
   - post/comment author 또는 admin만 수정/삭제.
   - council도 커뮤니티에서는 일반 로그인 사용자처럼 작성 가능.

## Tests

- `npm run lint`
- `npm run build`
- 수동 시나리오:
  - 비로그인은 글쓰기 접근 시 로그인으로 이동.
  - student가 글 작성 성공.
  - student가 댓글 작성 성공.
  - 다른 student는 남의 글 수정 버튼을 볼 수 없음.
  - admin은 신고/숨김 처리를 위해 관리 가능 상태를 볼 수 있음.
  - 좋아요 toggle 후 count가 반영.

## Done Criteria

- 커뮤니티 목록/상세/작성/수정 route가 동작한다.
- 로그인 학생은 글과 댓글을 작성할 수 있다.
- 본인과 admin만 글/댓글 수정/삭제가 가능하다.
- 좋아요와 신고 진입 UI가 존재한다.
- `npm run lint`와 `npm run build`가 통과한다.

## Handoff Notes

TASK-08은 신고 처리와 관리자 기능을 완성한다. TASK-07에서 만든 `ReportControls`는 신고 생성까지만 두고, 관리자 처리 로직은 TASK-08에서 확장한다.
