# TASK-03: Database and Prisma Schema

## Background

TASK-01과 TASK-02에서 프로젝트 기반과 디자인 시스템이 준비된다. 이제 앱이 실제 데이터를 저장하고 조회할 수 있도록 Prisma 7 + PostgreSQL 기반을 만들어야 한다.

`AGENTS.md`는 Auth.js 호환 모델과 한빛 도메인 모델을 함께 사용하도록 정했다. 이 태스크는 인증, 게시판, 커뮤니티, 대시보드가 공유할 데이터 계약을 만든다.

## Goal

- Prisma 7 설정과 PostgreSQL 연결을 구성한다.
- 로컬 개발에서는 Docker Compose PostgreSQL을 사용하고, 추후 클라우드 PostgreSQL은 `DATABASE_URL` 교체로 전환한다.
- Auth.js 호환 모델과 한빛 도메인 모델을 `prisma/schema.prisma`에 정의한다.
- seed 데이터로 student, council, admin, 기본 게시판, 샘플 대시보드 데이터를 만든다.
- Prisma generate, migration, seed가 성공한다.

## Prerequisites

- TASK-01의 의존성 설치가 완료되어야 한다.
- Fedora 개발 환경에서는 Docker Engine과 Docker Compose Plugin이 설치되어 있어야 한다.
- `compose.yml`의 로컬 PostgreSQL이 실행 중이어야 한다.
- `.env`에 `DATABASE_URL`이 있어야 한다.

## Options Considered

- 옵션 A: Prisma 7 + PostgreSQL을 즉시 사용한다.
  - 장점: 운영 배포와 가장 유사하고 AGENTS.md와 일치한다.
  - 단점: 로컬 DB 준비가 필요하다.
- 옵션 B: SQLite로 먼저 구현하고 나중에 PostgreSQL로 전환한다.
  - 장점: 로컬 시작이 간단하다.
  - 단점: 배열, enum, transaction, 배포 차이로 전환 비용이 생긴다.
- 옵션 C: 임시 in-memory mock 데이터로 UI를 먼저 만든다.
  - 장점: 화면 구현이 빠르다.
  - 단점: Auth.js와 권한/소유권 구현 검증이 늦어진다.

## Selected Approach

옵션 A를 채택한다. 한빛은 권한과 커뮤니티 데이터가 핵심이므로 초기부터 PostgreSQL과 Prisma 모델을 기준으로 구현한다.

로컬에서는 Docker Compose로 PostgreSQL을 띄운다. 이렇게 하면 운영 DB와 같은 PostgreSQL 기능을 검증하면서도, 나중에 클라우드 호스팅 PostgreSQL로 갈 때 앱 코드와 Prisma 스키마를 바꾸지 않고 `DATABASE_URL`만 교체하면 된다.

## Implementation Steps

1. Prisma 설정:
   - `compose.yml`을 생성하고 `postgres:17-alpine` 기반 로컬 DB를 `localhost:5432`에 노출한다.
   - `dotenv`를 통해 Prisma CLI와 seed 스크립트가 `.env`의 `DATABASE_URL`을 읽게 한다.
   - `prisma.config.ts`를 생성한다.
   - `prisma/schema.prisma`의 client output을 `../lib/generated/prisma`로 설정한다.
   - PostgreSQL datasource는 `DATABASE_URL`을 사용한다.
2. Prisma client:
   - `lib/prisma.ts`에 `server-only` import와 Prisma Client 싱글턴을 만든다.
   - Prisma 7 adapter 기준으로 `@prisma/adapter-pg`와 `pg`를 사용한다.
3. Auth.js 모델:
   - `User`, `Account`, `Session`, `VerificationToken`
   - `User`에는 `displayName`, `studentNumber`, `role`, `status`, `passwordHash`를 추가한다.
4. 도메인 모델:
   - `Board`, `Post`, `Comment`, `Reaction`, `Report`
   - `AcademicEvent`, `TimetableItem`, `Meal`, `Todo`
   - `Post`는 `type = official | community`와 `boardId`로 영역을 구분한다.
5. enum 정의:
   - `UserRole`, `UserStatus`, `BoardType`, `PostType`, `ReportStatus`
6. seed:
   - `prisma/seed.ts`를 만든다.
   - 테스트 사용자 3명: student, council, admin
   - 기본 커뮤니티 카테고리: 자유게시판, 질문, 분실물, 동아리, 스터디, 급식, 기숙사
   - 공식 게시판 board 1개, 샘플 pinned 공지 1개, 커뮤니티 글 2개, 대시보드 샘플 데이터
7. script:
   - `package.json`에 `prisma`, `db:up`, `db:down`, `db:generate`, `db:migrate`, `db:seed`, `db:studio` 스크립트를 추가한다.

## Tests

- `npm run db:up`
- `npm run db:generate`
- `npm run db:migrate`
- `npm run db:seed`
- `npm run lint`
- `npm run build`
- 수동 확인:
  - Prisma Studio 또는 SQL query로 seed 사용자와 게시판이 생성됐는지 확인한다.

## Done Criteria

- Prisma schema가 Auth.js와 한빛 도메인 모델을 모두 포함한다.
- Docker PostgreSQL이 로컬에서 실행되고 `.env`의 `DATABASE_URL`로 연결된다.
- migration과 seed가 성공한다.
- `lib/generated/prisma`와 `lib/prisma.ts` import가 빌드에서 동작한다.
- `npm run lint`와 `npm run build`가 통과한다.

## Handoff Notes

TASK-04는 이 스키마를 기반으로 Auth.js Credentials와 권한 검사를 구현한다. seed 사용자의 이메일과 비밀번호는 TASK-04 테스트에서 사용할 수 있게 README 또는 seed 주석에 명확히 남긴다.
