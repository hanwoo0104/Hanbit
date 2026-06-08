# TASK-08: Reporting and Admin

## Background

TASK-07까지 커뮤니티 글, 댓글, 좋아요, 신고 진입이 준비된다. 이제 신고를 실제로 저장하고, 관리자가 신고된 콘텐츠와 사용자 역할/상태를 관리할 수 있게 해야 한다.

관리자 기능은 모든 게시글/댓글/신고/역할 관리 권한을 가진 `admin`에게만 열려야 한다.

## Goal

- 신고 Server Action과 관리자 신고 목록을 구현한다.
- 신고된 글/댓글을 숨김 처리할 수 있다.
- 관리자 사용자 역할/상태 관리 화면을 구현한다.
- 공식 게시판 관리 진입을 제공한다.

## Prerequisites

- TASK-04의 `admin` 권한 helper가 동작해야 한다.
- TASK-07의 신고 버튼과 community post/comment 모델이 있어야 한다.
- TASK-06의 official board action이 관리자 화면에서 재사용 가능해야 한다.

## Options Considered

- 옵션 A: 관리자 기능을 `/admin/reports`, `/admin/users`, `/admin/board`로 분리한다.
  - 장점: AGENTS.md route 구조와 일치하고 화면 책임이 명확하다.
  - 단점: layout과 navigation을 별도로 만들어야 한다.
- 옵션 B: `/admin` 한 페이지에 모든 탭을 넣는다.
  - 장점: route 수가 적다.
  - 단점: 데이터와 권한, loading 상태가 복잡해진다.
- 옵션 C: 신고만 구현하고 사용자 관리는 미룬다.
  - 장점: 구현량이 줄어든다.
  - 단점: MVP 관리자 권한 요구를 만족하지 못한다.

## Selected Approach

옵션 A를 채택한다. 관리자 하위 route를 분리하고 공용 `AdminShell` 또는 route group layout으로 navigation과 권한 검사를 공유한다.

## Implementation Steps

1. Admin routes:
   - `app/admin/page.tsx`
   - `app/admin/reports/page.tsx`
   - `app/admin/users/page.tsx`
   - `app/admin/board/page.tsx`
2. Admin layout:
   - admin 전용 navigation.
   - route 진입 시 `requireRole(["admin"])`.
3. Reports DAL/actions:
   - `lib/dal/reports.ts`
   - `lib/actions/reports.ts`
   - create report, mark reviewed, dismiss report, hide target.
4. Hidden content policy:
   - post/comment에 hidden 상태를 두고, 일반 목록/상세에서는 제외.
   - 작성자와 admin은 숨김 상태를 식별할 수 있게 badge를 표시.
5. Users admin:
   - `lib/dal/admin-users.ts`
   - role 변경: `student`, `council`, `admin`
   - status 변경: `active`, `pending`, `suspended`
   - 자기 자신의 admin 권한을 마지막 admin에서 제거하지 않도록 방어한다.
6. Board admin:
   - 공식 게시글 목록 관리.
   - pinned toggle, edit/delete 진입.
7. UI:
   - table, filter, badge, dialog 사용.
   - destructive action은 confirm dialog.
   - 모바일에서는 table을 card/list로 전환.

## Tests

- `npm run lint`
- `npm run build`
- 수동 시나리오:
  - student는 `/admin` 접근 불가.
  - admin은 신고 목록을 볼 수 있음.
  - community post 신고 생성 후 `/admin/reports`에 표시.
  - admin이 신고된 글을 숨김 처리하면 일반 목록에서 사라짐.
  - admin이 사용자 role을 council로 변경하면 공식 글 작성 가능.
  - suspended 사용자는 로그인 또는 mutation이 차단됨.

## Done Criteria

- 신고된 커뮤니티 글/댓글을 관리자 화면에서 확인할 수 있다.
- admin은 신고를 처리하고 콘텐츠를 숨김 처리할 수 있다.
- admin은 사용자 역할과 상태를 관리할 수 있다.
- non-admin은 모든 admin route와 action에서 차단된다.
- `npm run lint`와 `npm run build`가 통과한다.

## Handoff Notes

TASK-09는 마이페이지와 사용자 흐름 polish를 담당한다. TASK-08에서 사용자 status나 hidden 정책이 바뀌면 TASK-09의 내 글/내 댓글 조회에도 같은 visibility 규칙을 적용해야 한다.
