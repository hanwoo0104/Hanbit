# 한빛

한빛은 학교 학생들이 학교 생활 정보, 공식 소식, 학생 커뮤니티를 분리해서 사용할 수 있는 Next.js 16 기반 학생 커뮤니티 MVP입니다.

## Getting Started

의존성을 설치합니다.

```bash
npm install
```

환경 변수를 준비합니다.

```bash
cp .env.example .env
```

`AUTH_SECRET`은 로컬에서 다음 명령으로 생성한 값을 사용합니다.

```bash
npx auth secret
```

로컬 개발용 PostgreSQL을 Docker로 실행합니다.

```bash
npm run db:up
```

Docker 그룹 권한이 현재 터미널에 반영되지 않았다면 새 터미널로 다시 열거나 `sudo docker compose up -d postgres`를 사용합니다.

Prisma 스키마를 적용하고 seed 데이터를 넣습니다.

```bash
npm run db:migrate
npm run db:seed
```

seed 계정은 모두 비밀번호 `Hanbit123!`를 사용합니다.

- `student@example.school.kr`
- `council@example.school.kr`
- `admin@example.school.kr`

개발 서버를 실행합니다.

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 엽니다.

## Architecture Docs

- [AGENTS.md](AGENTS.md): 제품/기술 아키텍처와 구현 규칙
- [docs/design-system.md](docs/design-system.md): Hanbit Navy 디자인 시스템
- [docs/initial-setup.md](docs/initial-setup.md): 새 머신 초기 환경 셋업
- [docs/release-checklist.md](docs/release-checklist.md): MVP 릴리스 전 검증 체크리스트
- [docs/tasks](docs/tasks): 순차 실행 태스크 로드맵

## Verification

릴리스 전 기본 검증 명령입니다.

```bash
npm run lint
npm run build
npm run test:e2e
```
