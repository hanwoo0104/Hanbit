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

개발 서버를 실행합니다.

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 엽니다.

## Architecture Docs

- [AGENTS.md](AGENTS.md): 제품/기술 아키텍처와 구현 규칙
- [docs/design-system.md](docs/design-system.md): Hanbit Navy 디자인 시스템
- [docs/tasks](docs/tasks): 순차 실행 태스크 로드맵

## Verification

TASK-01 기준 검증 명령입니다.

```bash
npm run lint
npm run build
```
