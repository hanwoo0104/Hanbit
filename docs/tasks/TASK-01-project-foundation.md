# TASK-01: Project Foundation

## Background

한빛은 현재 기본 Next.js 16 App Router 프로젝트 상태다. `AGENTS.md`에는 Prisma 7, PostgreSQL, Auth.js v5 beta, Tailwind CSS v4, shadcn/ui 기반 아키텍처가 확정되어 있고, `docs/design-system.md`에는 Hanbit Navy 디자인 시스템이 정리되어 있다.

이 태스크는 이후 모든 구현의 기반을 만든다. 의존성, 환경 변수, 기본 폴더 구조, Next.js 16 문서 확인 기록, shadcn 준비가 끝나지 않으면 뒤 태스크가 불안정해진다.

## Goal

- 앱 구현에 필요한 런타임/개발 의존성을 설치한다.
- Next.js 16 로컬 문서를 확인하고 구현 기준을 기록한다.
- `.env.example`, 기본 폴더 구조, shadcn/ui 설정 준비를 만든다.
- 기존 기본 페이지가 깨지지 않는 상태에서 `npm run lint`와 `npm run build`를 통과한다.

## Prerequisites

- `AGENTS.md`와 `docs/design-system.md`를 읽는다.
- `node_modules/next/dist/docs/`가 존재하는지 확인한다.
- 작업 전 `git status --short`로 사용자 변경이 있는지 확인한다.

## Options Considered

- 옵션 A: 모든 의존성과 설정을 한 번에 설치하고 다음 태스크로 넘긴다.
  - 장점: 이후 태스크가 바로 코드를 작성할 수 있다.
  - 단점: 사용하지 않는 컴포넌트나 패키지가 초기에 늘어날 수 있다.
- 옵션 B: 각 기능 태스크에서 필요한 의존성을 그때그때 설치한다.
  - 장점: 초기 변경이 작다.
  - 단점: 태스크마다 설치 판단이 반복되고 버전 불일치 위험이 커진다.
- 옵션 C: 문서만 만들고 의존성은 설치하지 않는다.
  - 장점: 파일 변경이 작다.
  - 단점: 뒤 태스크가 "기반"을 다시 해야 한다.

## Selected Approach

옵션 A를 채택한다. `AGENTS.md`가 이미 핵심 라이브러리와 버전을 결정했으므로, 첫 태스크에서 설치와 기본 설정을 끝내는 것이 가장 안정적이다. 실제 shadcn primitive 생성은 TASK-02에서 수행하되, `components.json`과 alias 기준은 이 태스크에서 준비한다.

## Implementation Steps

1. Next.js 16 문서 확인:
   - `node_modules/next/dist/docs/01-app/01-getting-started/02-project-structure.md`
   - `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md`
   - `node_modules/next/dist/docs/01-app/01-getting-started/07-mutating-data.md`
   - `node_modules/next/dist/docs/01-app/02-guides/data-security.md`
   - 확인한 핵심 규칙을 작업 메모 또는 PR 설명에 남긴다.
2. 의존성 설치:
   - runtime: `prisma@7.8.0`, `@prisma/client@7.8.0`, `@prisma/adapter-pg`, `pg`, `next-auth@5.0.0-beta.31`, `@auth/prisma-adapter`, `zod`, `bcryptjs`, `server-only`, `lucide-react`, `clsx`, `class-variance-authority`, `tailwind-merge`
   - dev: `@types/pg`, `tsx`, `@playwright/test`
3. 기본 폴더 생성:
   - `components/ui`
   - `components/common`
   - `lib/actions`
   - `lib/auth`
   - `lib/dal`
   - `lib/validators`
   - `prisma`
4. `components.json` 생성:
   - style: `base-nova`
   - rsc: `true`
   - tsx: `true`
   - Tailwind CSS: `app/globals.css`
   - cssVariables: `true`
   - baseColor: `neutral`
   - aliases: `@/components`, `@/components/ui`, `@/lib`
5. `.env.example` 작성:
   - `DATABASE_URL="postgresql://postgres:postgres@localhost:5432/hanbit?schema=public"`
   - `AUTH_SECRET="replace-with-npx-auth-secret"`
   - `SCHOOL_EMAIL_DOMAIN="example.school.kr"`
6. `README.md`에 로컬 시작 흐름이 부족하면 최소 실행 명령을 보강한다.

## Tests

- `npm run lint`
- `npm run build`
- `test -d node_modules/next/dist/docs`
- `test -f components.json`
- `test -f .env.example`

## Done Criteria

- 설치된 의존성이 `package.json`과 `package-lock.json`에 반영되어 있다.
- `components.json`, `.env.example`, 기본 폴더 구조가 존재한다.
- `npm run lint`와 `npm run build`가 통과한다.
- 다음 태스크가 디자인 토큰과 shadcn primitive를 추가할 수 있는 상태다.

## Handoff Notes

TASK-02는 `docs/design-system.md`의 Hanbit Navy 토큰을 실제 `app/globals.css`에 반영한다. TASK-01에서 shadcn CLI를 실행하지 않았다면, TASK-02 시작 시 `components.json`의 설정을 먼저 확인한다.
