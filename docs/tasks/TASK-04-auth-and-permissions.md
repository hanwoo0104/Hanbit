# TASK-04: Auth and Permissions

## Background

TASK-03에서 사용자와 세션, 게시판 도메인 모델이 준비된다. 이제 학교 이메일 + 비밀번호 로그인, 회원가입, 역할 기반 권한 검사를 실제로 연결해야 한다.

`AGENTS.md`는 Auth.js v5 beta Credentials Provider, JWT session strategy, `proxy.ts`, 서버 중심 권한 재검증을 기준으로 한다.

## Goal

- Auth.js Credentials 기반 로그인과 로그아웃을 구현한다.
- 회원가입 Server Action을 구현하고 학교 이메일 도메인, 중복 이메일, 비밀번호 해시를 처리한다.
- `student`, `council`, `admin` 권한 helper와 `RoleGate`를 만든다.
- 보호 route와 Server Action에서 권한 차단이 동작한다.

## Prerequisites

- TASK-03의 Prisma migration과 seed가 완료되어야 한다.
- `.env`에 `AUTH_SECRET`, `SCHOOL_EMAIL_DOMAIN`, `DATABASE_URL`이 있어야 한다.
- Auth.js v5 beta와 `@auth/prisma-adapter`가 설치되어 있어야 한다.

## Options Considered

- 옵션 A: Auth.js Credentials + JWT strategy를 사용한다.
  - 장점: AGENTS.md와 일치하고 학교 이메일/비밀번호 MVP에 맞다.
  - 단점: 회원가입과 비밀번호 보안은 직접 구현해야 한다.
- 옵션 B: Auth.js database session strategy를 사용한다.
  - 장점: DB에서 세션 폐기와 감사가 쉽다.
  - 단점: Credentials MVP 초기 구현이 더 복잡해진다.
- 옵션 C: 커스텀 세션 쿠키를 직접 구현한다.
  - 장점: 완전한 통제.
  - 단점: 사용자가 Auth.js를 선택했고 보안 구현 부담이 크다.

## Selected Approach

옵션 A를 채택한다. Credentials MVP는 `session.strategy = "jwt"`로 고정하고, DB에는 Auth.js 호환 모델을 유지해 후속 확장을 열어 둔다.

## Implementation Steps

1. Auth.js entry:
   - 루트 `auth.ts` 생성.
   - `NextAuth()`에서 `handlers`, `auth`, `signIn`, `signOut` export.
   - Prisma Adapter 연결.
2. Auth route:
   - `app/api/auth/[...nextauth]/route.ts`에서 `GET`, `POST` export.
3. Credentials authorize:
   - `lib/validators/auth.ts`에 login/signup schema 작성.
   - 이메일 도메인이 `SCHOOL_EMAIL_DOMAIN`과 일치하는지 검증.
   - Prisma로 user 조회.
   - `bcryptjs.compare`로 `passwordHash` 검증.
   - `status !== "active"`는 로그인 차단.
4. Session typing:
   - `types/next-auth.d.ts` 또는 `auth.ts` 주변 module augmentation 추가.
   - `Session.user`에 `id`, `role`, `displayName`, `studentNumber`, `status`만 노출.
5. Server Actions:
   - `lib/actions/auth.ts`에 `signupAction`, `loginAction`, `logoutAction` 작성.
   - 회원가입은 `bcryptjs.hash`, 중복 검사, 기본 role `student`, status `active`를 사용한다.
6. Permissions:
   - `lib/auth/permissions.ts`에 `requireUser`, `requireRole`, `canManageOfficialPost`, `canEditPost`, `canEditComment`, `isAdmin` 구현.
   - `components/common/role-gate.tsx`는 Server Component로 만든다.
7. Proxy:
   - `proxy.ts`로 `/mypage`, `/community/write`, `/board/write`, `/admin` 보호 UX를 구현한다.
   - `proxy.ts`는 UX용이고 최종 권한 검사는 DAL/Action에서 다시 한다.
8. Pages:
   - `/login`, `/signup` route를 추가하고 `AuthForm`을 연결한다.
   - 로그인 후 `/` 또는 `callbackUrl`로 이동한다.

## Tests

- `npm run lint`
- `npm run build`
- 수동 시나리오:
  - 학교 도메인 이메일로 회원가입 성공.
  - 다른 도메인 이메일은 회원가입 실패.
  - seed student/council/admin 로그인 성공.
  - `student`가 `/board/write` 접근 시 차단.
  - `admin`이 `/admin` 접근 가능.

## Done Criteria

- 회원가입, 로그인, 로그아웃이 동작한다.
- 세션에 노출되는 필드가 제한되어 있다.
- role helper와 `RoleGate`가 동작한다.
- 보호 route는 UX 차단과 서버 재검증을 모두 갖춘다.
- `npm run lint`와 `npm run build`가 통과한다.

## Handoff Notes

TASK-05는 현재 사용자 정보를 홈 대시보드와 header에서 사용한다. `auth()` helper와 session field 이름이 바뀌면 TASK-05 시작 전에 문서와 타입을 함께 갱신한다.
