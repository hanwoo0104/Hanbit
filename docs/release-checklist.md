# 한빛 MVP 릴리스 체크리스트

이 문서는 한빛 MVP를 로컬 또는 배포 전 환경에서 릴리스 가능한 상태로 확인하는 기준이다. TASK-10 이후 기능 추가보다 회귀 방지와 운영 준비를 우선한다.

## 필수 명령

로컬 PostgreSQL이 실행 중이어야 한다.

```bash
npm run db:up
npm run db:migrate
npm run db:seed
npm run lint
npm run build
npm run test:e2e
```

Playwright 브라우저가 없으면 먼저 설치한다.

```bash
npx playwright install chromium
```

## E2E 검증 범위

`npm run test:e2e`는 다음 흐름을 검증한다.

- 회원가입, 로그인, 로그아웃
- 일반 학생의 공식 글쓰기 접근 차단
- 학생의 커뮤니티 글, 댓글, 좋아요 작성
- 운영진의 공식 게시글 작성
- 신고 생성 후 관리자 신고 화면 확인
- 관리자의 신고 대상 숨김 처리
- 숨김 처리된 커뮤니티 글의 일반 목록 제외
- 관리자의 사용자 역할/상태 변경
- 정지 사용자의 로그인 차단
- 마이페이지 내 글, 내 댓글, 할 일 확인
- 할 일 추가, 완료 토글, 수정, 삭제
- 홈, 게시판, 커뮤니티 상세, 관리자 화면의 desktop/mobile overflow 점검

## 환경 변수

`.env.example`과 실제 환경 변수를 비교한다.

- `DATABASE_URL`: PostgreSQL 접속 문자열
- `AUTH_SECRET`: Auth.js secret. 로컬 생성은 `npx auth secret`
- `SCHOOL_EMAIL_DOMAIN`: 학교 이메일 도메인

클라우드 PostgreSQL 전환 시 Prisma 스키마는 유지하고 `DATABASE_URL`만 교체한다. 공유 DB나 운영 DB에서는 개발용 seed를 임의로 실행하지 않는다.

## 수동 QA

자동화 후에도 다음을 눈으로 확인한다.

- 홈 다크 대시보드가 desktop/mobile에서 겹침 없이 보인다.
- 게시판, 커뮤니티, 관리자 화면의 밝은 UI가 읽기 쉽다.
- 키보드 Tab 이동 시 버튼과 링크 focus ring이 보인다.
- icon-only button은 `aria-label`이 있다.
- 로그인, 글쓰기, 댓글, 신고, 관리자 처리 후 다음 이동 위치가 자연스럽다.
- error, loading, not-found 상태가 빈 화면으로 보이지 않는다.

## 릴리스 전 문서 확인

- [README.md](../README.md): 로컬 실행, seed 계정, 검증 명령
- [docs/initial-setup.md](initial-setup.md): 새 머신 초기 셋업
- [AGENTS.md](../AGENTS.md): 아키텍처와 권한 규칙
- [docs/design-system.md](design-system.md): Hanbit Navy 디자인 시스템
- [docs/tasks/](tasks/): TASK-01부터 TASK-10까지 완료 기준

## MVP 이후 항목

다음은 릴리스 차단 항목이 아니라 후속 확장이다.

- 운영 배포 환경 구성
- 학교 SSO 또는 OAuth provider 연동
- 이메일 인증, 비밀번호 재설정, 알림 발송
- 외부 급식/학사일정 API 연동
- 운영 DB 백업, 모니터링, 감사 로그
