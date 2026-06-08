<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# 아키텍처에 변화가 생기는 프롬프트가 입력되면 agents.md에도 수정사항을 항상 반영한다.

# 한빛 학생 커뮤니티 아키텍처

## 제품 목표

한빛은 학교 학생들이 학교 생활 정보를 한눈에 보고, 공식 소식과 학생 커뮤니티를 분리해서 사용할 수 있는 MVP 기능형 학생 커뮤니티다. 구현자는 Next.js App Router, TypeScript, Tailwind CSS v4를 기준으로 작성한다.

핵심 경험은 다음과 같다.

- 홈: 첨부 레퍼런스 이미지처럼 다크 톤 대시보드에서 학생 개인화 정보를 한 화면에 보여준다.
- 게시판: 학생회, 학교, 동아리 운영진 등 공식 주체가 공지성 글을 게시한다.
- 커뮤니티: 일반 학생들이 네이버 카페 게시판처럼 카테고리별로 글과 댓글을 작성하며 소통한다.
- 계정: 학교 학생 계정으로 로그인하고 역할에 따라 작성/관리 권한을 분리한다.

## 기술 기준

- Next.js는 `app/` 기반 App Router를 사용한다.
- 기준 런타임 버전은 `next@16.2.7`, `react@19.2.4`, `react-dom@19.2.4`다.
- React Server Components를 기본으로 사용하고, 상호작용이 필요한 폼, 탭, 메뉴, 좋아요, 신고, 필터 UI만 Client Component로 분리한다.
- Tailwind CSS v4 유틸리티를 중심으로 스타일링한다. 전역 토큰은 `app/globals.css`의 `@theme`와 CSS 변수로 관리한다.
- 반복되는 화면 요소는 `components/`에 둔다. 화면별 데이터 조합과 라우팅 책임은 `app/` route 단위에 둔다.
- 서버 로직, 권한 검사, 데이터 접근 함수는 UI 컴포넌트에 직접 섞지 말고 `lib/` 또는 route-local server module로 분리한다.
- 실제 코드 구현 전 `npm install`로 의존성을 설치하고 Next.js 16 로컬 문서를 확인한다. `node_modules/next/dist/docs/`가 없으면 그 사실을 기록하고, 설치된 Next 패키지의 공식 문서 또는 마이그레이션 자료를 확인한 뒤 구현한다.
- Next.js 16 App Router 문서에서 확인한 규칙을 따른다. 특히 `cookies()`는 async API이고, 동적 route의 `params`/`searchParams`는 Promise 형태로 다룬다.
- Server Action과 Server Function은 직접 POST로 호출될 수 있으므로, 페이지 접근 제어와 별개로 함수 내부 또는 DAL에서 인증과 권한을 다시 검증한다.

## 구현 라이브러리 기준

핵심 라이브러리는 다음을 기본값으로 고정한다.

- 데이터베이스와 ORM: PostgreSQL, `prisma@7.8.0`, `@prisma/client@7.8.0`, `@prisma/adapter-pg`, `pg`
- 인증: Auth.js v5 beta, `next-auth@5.0.0-beta.31`, `@auth/prisma-adapter`
- 입력 검증과 보안: `zod`, `bcryptjs`, `server-only`
- UI 보조: `lucide-react`, `clsx`, `class-variance-authority`
- 개발과 검증: `@types/pg`, `tsx`, `@playwright/test`
- 단위 테스트가 필요해지면 `vitest`를 추가한다. MVP 문서 기준에서는 선택 의존성으로 둔다.

구현자는 관련 공식 문서를 우선한다.

- Next.js App Router: `https://nextjs.org/docs/app`
- Auth.js Next.js 설치: `https://authjs.dev/getting-started/installation?framework=Next.js`
- Auth.js Credentials: `https://authjs.dev/getting-started/authentication/credentials`
- Auth.js Prisma Adapter: `https://authjs.dev/getting-started/adapters/prisma`
- Prisma Auth.js + Next.js guide: `https://www.prisma.io/docs/guides/authentication/authjs/nextjs`

## Prisma 7와 데이터 계층

- Prisma는 PostgreSQL 기준으로 설정한다.
- Prisma 설정 파일은 `prisma.config.ts`, 스키마는 `prisma/schema.prisma`, Prisma Client 싱글턴은 `lib/prisma.ts`에 둔다.
- Prisma Client output은 `lib/generated/prisma`로 고정한다.
- Prisma 7 기준으로 `@prisma/adapter-pg`와 `pg`를 사용하고, `DATABASE_URL`은 `prisma.config.ts`와 `lib/prisma.ts`가 공유한다.
- 필수 환경 변수는 `DATABASE_URL`, `AUTH_SECRET`, `SCHOOL_EMAIL_DOMAIN`이다. OAuth 또는 SSO를 추가할 때만 provider별 secret을 추가한다.
- 데이터 접근은 `lib/dal/*`에 둔다. DAL 파일은 `import "server-only"`를 사용하고, DB row 전체가 아니라 화면에 필요한 DTO만 반환한다.
- mutation은 `lib/actions/*`의 얇은 Server Action에서 시작하고, 실제 권한 검사와 DB 변경은 DAL 함수에 위임한다.
- 검증 스키마는 `lib/validators/*`에 둔다. Server Action, Route Handler, Auth.js Credentials `authorize`는 모두 Zod로 입력을 검증한다.
- 역할과 소유권 판단은 `lib/auth/permissions.ts`에 둔다.
- route-local `_components`와 `_lib`는 특정 route에서만 쓰는 화면 조합 코드에 한정한다.

## 라우트 구조

권장 route 구조는 다음을 기본값으로 한다.

- `/`: 홈 대시보드
- `/login`: 로그인
- `/signup`: 회원가입 또는 학교 계정 등록
- `/api/auth/[...nextauth]`: Auth.js GET/POST Route Handler
- `/board`: 공식 게시판 목록
- `/board/[postId]`: 공식 게시글 상세
- `/board/write`: 공식 게시글 작성. `council`, `admin`만 접근 가능
- `/board/[postId]/edit`: 공식 게시글 수정. `council`, `admin`만 접근 가능
- `/community`: 커뮤니티 카테고리/게시글 목록
- `/community/[boardSlug]`: 커뮤니티 카테고리별 목록
- `/community/[boardSlug]/[postId]`: 커뮤니티 게시글 상세와 댓글
- `/community/write`: 커뮤니티 글쓰기. 로그인한 학생 이상 접근 가능
- `/community/[boardSlug]/[postId]/edit`: 커뮤니티 게시글 수정. 작성자 또는 `admin`만 접근 가능
- `/mypage`: 내 정보, 내 글, 내 댓글, 내 할 일
- `/admin`: 신고, 공식 게시판, 사용자 역할 관리. `admin`만 접근 가능
- `/admin/reports`: 신고 목록과 숨김 처리
- `/admin/users`: 사용자 역할과 계정 상태 관리
- `/admin/board`: 공식 게시판 글 관리

상단 내비게이션의 `기숙사`, `스터디`, `학급`은 MVP에서 독립 route로 만들지 않는다. 각각 커뮤니티 카테고리 또는 홈 대시보드의 관련 섹션으로 이동하는 링크로 처리한다.

## 화면 설계

### 홈 대시보드

홈은 학교 생활 정보를 빠르게 스캔하는 첫 화면이다. 레퍼런스 이미지의 분위기를 따른다.

- 전체 배경은 넓은 다크 캔버스와 고대비 흰색 텍스트를 사용한다.
- 상단 내비게이션은 `한빛.` 로고, `홈`, `게시판`, `커뮤니티`, `기숙사`, `스터디`, `학급`, `로그인/마이페이지`를 배치한다.
- 인사말은 학생 이름을 강조한다. 예: `안녕하세요, 홍길동님 오늘도 좋은 하루 되세요!`
- 대시보드 섹션은 학사일정, 시간표, 급식, D-day, 할 일, 최신 공식 글, 인기 커뮤니티 글을 포함한다.
- 시간표와 D-day는 흰색 pill 형태를 사용한다.
- 학사일정은 세로 타임라인 형태를 사용한다.
- 급식은 리스트 형태로 보여주고, 비어 있으면 오늘 등록된 급식이 없다는 상태를 제공한다.
- 모바일에서는 한 열 레이아웃으로 전환하고, 대시보드 항목이 서로 겹치지 않도록 고정 폭 대신 반응형 그리드를 사용한다.

### 게시판

게시판은 공식 소통 공간이다.

- 작성자는 학생회, 학교, 동아리 운영진, 관리자 같은 공식 주체로 제한한다.
- 일반 학생은 게시글 조회, 검색, 댓글 작성 가능 여부를 정책에 따라 제한적으로 제공한다. MVP 기본값은 공식 게시글 댓글 비활성화다.
- 공지 고정, 카테고리, 작성 주체, 작성일, 조회수를 목록에서 표시한다.
- 중요한 글은 `pinned` 상태로 상단에 고정한다.
- 작성/수정/삭제 버튼은 권한이 있는 사용자에게만 렌더링하고, 서버에서도 반드시 같은 권한을 재검증한다.

### 커뮤니티

커뮤니티는 일반 학생 중심의 카테고리형 게시판이다.

- 네이버 카페처럼 카테고리 목록, 게시글 목록, 검색, 정렬, 글쓰기 버튼을 제공한다.
- 기본 카테고리는 `자유게시판`, `질문`, `분실물`, `동아리`, `스터디`, `급식`, `기숙사`로 시작한다.
- 게시글 목록에는 제목, 작성자 표시명, 댓글 수, 좋아요 수, 조회수, 작성 시간을 표시한다.
- 게시글 상세에는 본문, 댓글, 좋아요, 신고, 수정/삭제 액션을 제공한다.
- 본인 글과 본인 댓글은 본인과 관리자만 수정/삭제할 수 있다.
- 신고된 글은 관리자 화면에서 확인하고 숨김 처리할 수 있게 설계한다.

### 계정과 마이페이지

- 회원가입은 학교 이메일 또는 학교 계정 인증을 전제로 한다.
- 실제 학교 이메일 도메인은 환경 변수로 분리한다. 예: `SCHOOL_EMAIL_DOMAIN`.
- 로그인 후 사용자는 자신의 이름, 학번 또는 닉네임, 역할, 작성 글, 댓글, 할 일을 확인한다.
- MVP에서는 학교 이메일과 비밀번호 기반 인증을 Auth.js Credentials Provider로 구현한다.
- 학교 SSO나 OAuth는 후속 확장으로 둔다. Auth.js provider 추가로 확장할 수 있게 UI, Auth.js 설정, Prisma DAL을 분리한다.

## 인증과 권한

인증 라이브러리는 Auth.js v5 beta를 사용한다.

- 루트에 `auth.ts`를 두고 `NextAuth()`에서 `handlers`, `auth`, `signIn`, `signOut`을 export한다.
- `app/api/auth/[...nextauth]/route.ts`는 `auth.ts`의 `handlers`에서 `GET`, `POST`를 export한다.
- Next.js 16 기준 보호 route의 낙관적 리다이렉트와 세션 갱신은 `proxy.ts`를 사용한다. `middleware.ts`를 새로 만들지 않는다.
- `proxy.ts`는 UX용 1차 보호만 담당한다. 권한 최종 판단은 Server Component, Server Action, Route Handler, DAL에서 다시 수행한다.
- Credentials Provider의 `authorize`는 Zod로 이메일과 비밀번호를 검증하고, Prisma로 사용자를 조회한 뒤 `bcryptjs`로 `passwordHash`를 비교한다.
- 회원가입은 Auth.js가 아니라 `lib/actions/auth.ts`의 Server Action과 `lib/dal/users.ts`가 처리한다. 학교 이메일 도메인 검사, 중복 이메일 검사, 비밀번호 해시는 이 경로에서 수행한다.
- Credentials MVP는 `session.strategy = "jwt"`로 고정한다.
- 세션에 노출하는 사용자 필드는 `id`, `role`, `displayName`, `studentNumber`, `status`로 제한한다. TypeScript module augmentation으로 `Session.user` 타입을 확장한다.
- `AUTH_SECRET`은 필수다. 로컬 생성은 `npx auth secret`을 사용한다.

역할은 다음 세 가지를 기본으로 사용한다.

- `student`: 일반 학생. 커뮤니티 글/댓글 작성 가능
- `council`: 학생회 또는 공식 운영진. 커뮤니티 작성 가능, 공식 게시판 작성/수정 가능
- `admin`: 관리자. 모든 게시글/댓글/신고/역할 관리 가능

권한 규칙은 서버에서 먼저 보장한다.

- 세션은 HTTP-only 쿠키 기반으로 설계한다.
- 서버 컴포넌트, Server Action, Route Handler에서 현재 사용자와 역할을 조회한다.
- 권한 없는 사용자는 UI에서 액션을 숨기고, 서버 요청에서도 `401` 또는 `403`으로 차단한다.
- 공식 게시판 작성/수정/삭제는 `council`, `admin`만 허용한다.
- 커뮤니티 작성과 댓글 작성은 로그인한 `student` 이상에게 허용한다.
- 관리자 기능은 `admin`만 접근 가능하다.

## 데이터 모델

핵심 엔티티는 다음을 기준으로 설계한다.

- `User`: Auth.js 사용자와 학생 계정을 겸한다. `name`, `email`, `emailVerified`, `image`에 더해 `displayName`, `studentNumber`, `role`, `status`, `passwordHash`, 생성일, 수정일을 가진다.
- `Account`: Auth.js provider 계정. OAuth나 Credentials 계정 연결을 위해 유지한다.
- `Session`: Auth.js 세션 모델. JWT strategy를 쓰는 MVP에서도 Prisma Adapter 호환성과 후속 database session 전환을 위해 스키마에 둔다.
- `VerificationToken`: Auth.js 이메일 검증, 비밀번호 재설정, 후속 magic link 확장을 위한 토큰 모델이다.
- `Board`: 게시판 또는 커뮤니티 카테고리. 이름, slug, 설명, 타입, 정렬 순서를 가진다.
- `Post`: 공식 게시글과 커뮤니티 게시글. `type = "official" | "community"`로 구분한다.
- `Comment`: 커뮤니티 댓글. 작성자, 게시글, 본문, 부모 댓글, 생성일, 숨김 상태를 가진다.
- `Reaction`: 좋아요 같은 반응. 사용자, 대상 타입, 대상 ID를 가진다.
- `Report`: 신고. 신고자, 대상 타입, 대상 ID, 사유, 처리 상태를 가진다.
- `AcademicEvent`: 학사일정. 제목, 시작일, 종료일, D-day 표시 여부를 가진다.
- `TimetableItem`: 시간표. 사용자 또는 학급, 요일, 교시, 과목, 장소를 가진다.
- `Meal`: 급식. 날짜, 식사 타입, 메뉴 목록을 가진다.
- `Todo`: 할 일. 사용자, 제목, 마감일, 완료 여부를 가진다.

공식 게시글과 커뮤니티 게시글은 같은 `Post` 모델을 공유하되 `type`과 `boardId`로 영역을 구분한다. 구현자가 ORM을 선택할 때도 이 구분은 유지한다.

권장 enum은 다음을 사용한다.

- `UserRole = "student" | "council" | "admin"`
- `UserStatus = "active" | "pending" | "suspended"`
- `BoardType = "official" | "community"`
- `PostType = "official" | "community"`
- `ReportStatus = "pending" | "reviewed" | "dismissed"`

## 데이터 흐름

- 홈 대시보드는 현재 사용자 기준으로 학사일정, 시간표, 급식, D-day, 할 일, 최신 게시글을 병렬 조회해서 구성한다.
- 게시판과 커뮤니티 목록은 서버에서 페이지네이션, 검색어, 카테고리, 정렬 조건을 처리한다.
- 글쓰기, 댓글 작성, 좋아요, 신고는 Server Action 또는 Route Handler로 처리한다.
- 클라이언트 상태는 폼 입력, 탭 선택, 필터 선택처럼 일시적인 UI 상태에만 사용한다.
- 데이터 생성/수정 후에는 관련 route를 revalidate하거나 최신 데이터를 다시 조회한다.
- 데이터 조회는 Server Component에서 DAL 함수를 호출한다. Client Component는 DB, Prisma, Auth.js server helper, secret 환경 변수에 직접 접근하지 않는다.
- 목록과 상세 조회는 페이지네이션과 visibility 조건을 DAL에서 처리한다. 숨김 처리된 신고 글은 작성자와 관리자 외에는 노출하지 않는다.
- Server Action은 성공 후 `revalidatePath` 또는 tag 기반 revalidation을 호출하고, 생성/수정 후 이동이 필요하면 `redirect`를 사용한다.

## UI 컴포넌트 기준

디자인 시스템의 세부 규칙은 [`docs/design-system.md`](docs/design-system.md)를 따른다. 구현 전 이 문서를 먼저 확인하고, 색상 토큰, shadcn/ui 설정, 컴포넌트 구조, 접근성 규칙은 디자인 시스템 문서를 우선한다.

권장 컴포넌트는 다음과 같다.

- `SiteHeader`: 로고, 주요 메뉴, 로그인/마이페이지 링크
- `DashboardSection`: 홈 대시보드 섹션 컨테이너
- `TimelineList`: 학사일정 타임라인
- `TimetableList`: 시간표 pill 리스트
- `MealList`: 급식 메뉴 리스트
- `DdayList`: D-day pill 리스트
- `TodoList`: 할 일 리스트
- `PostList`: 공식 게시판과 커뮤니티 목록 공용 리스트
- `PostEditor`: 글쓰기/수정 폼
- `CommentThread`: 댓글 목록과 작성 폼
- `RoleGate`: 권한별 UI 표시를 위한 서버 중심 래퍼
- `AuthForm`: 로그인과 회원가입 폼. Auth.js `signIn` 호출과 회원가입 Server Action을 분리한다.
- `ReportControls`: 신고와 관리자 처리 액션을 분리한 Client Component
- `LikeButton`: 낙관적 UI를 쓰되 최종 상태는 Server Action 응답과 revalidation으로 맞춘다.

디자인은 학교 커뮤니티답게 정보 밀도와 가독성을 우선한다. 운영 도구처럼 차분하지만, 홈 대시보드는 레퍼런스 이미지의 강한 한글 타이포그래피와 다크 톤을 살린다.

UI 구현 규칙은 다음을 따른다.

- 아이콘 버튼은 `lucide-react`를 우선 사용한다.
- 조건부 클래스 조합은 `clsx`를 사용한다.
- variant가 필요한 버튼, 배지, 입력 컴포넌트는 `class-variance-authority`를 사용한다.
- Client Component에는 필요한 primitive props만 전달하고, Prisma 모델 객체 전체를 넘기지 않는다.

## 테스트와 검증 기준

문서 수정 후 확인할 항목은 다음과 같다.

- 기존 Next.js 16 주의 블록이 삭제되거나 변경되지 않았는지 확인한다.
- 라이브러리 선택, Prisma/Auth.js 구조, route 구조, 권한 규칙, 데이터 모델, 테스트 기준이 모두 문서에 포함됐는지 확인한다.

앱 구현 후 확인할 항목은 다음과 같다.

- `npm run lint`를 통과한다.
- `npm run build`를 통과한다.
- 회원가입과 로그인이 동작한다.
- 일반 학생은 커뮤니티 글과 댓글을 작성할 수 있다.
- 일반 학생은 공식 게시판 글쓰기 화면에 접근할 수 없다.
- `council` 또는 `admin`은 공식 게시글을 작성할 수 있다.
- 홈 대시보드가 데스크톱과 모바일에서 겹침 없이 표시된다.
- 신고된 커뮤니티 글은 관리자 화면에서 확인할 수 있다.
- Playwright로 회원가입, 로그인, 일반 학생의 공식 글쓰기 차단, `council` 또는 `admin`의 공식 글 작성, 커뮤니티 글/댓글, 관리자 신고 확인 플로우를 검증한다.
