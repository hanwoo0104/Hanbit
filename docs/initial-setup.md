# 한빛 초기 환경 셋업

이 문서는 새 머신에서 한빛 프로젝트를 바로 개발할 수 있도록 초기 환경을 구성하는 절차다. 현재 로컬 개발 DB는 Docker Compose로 실행하는 PostgreSQL을 기준으로 하며, 추후 클라우드 PostgreSQL로 전환할 때는 Prisma 스키마를 유지하고 `DATABASE_URL`만 교체한다.

## 기준 환경

- OS: Fedora 또는 Linux 개발 환경
- Runtime: Node.js 20 이상, npm
- Framework: Next.js 16 App Router
- Database: PostgreSQL 17 Docker container
- ORM: Prisma 7
- Auth: Auth.js v5 Credentials

현재 개발용 PostgreSQL 설정은 다음과 같다.

- Compose file: `compose.yml`
- Service: `postgres`
- Container: `hanbit-postgres`
- Image: `postgres:17-alpine`
- Host port: `5432`
- Database: `hanbit`
- User: `postgres`
- Password: `postgres`
- Local URL: `postgresql://postgres:postgres@localhost:5432/hanbit?schema=public`

## 1. 시스템 패키지 설치

Fedora에서 기본 도구를 설치한다.

```bash
sudo dnf install -y git nodejs npm
```

Docker가 없다면 Docker Engine과 Compose plugin을 설치한다.

```bash
sudo dnf config-manager addrepo --from-repofile https://download.docker.com/linux/fedora/docker-ce.repo
sudo dnf install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo systemctl enable --now docker
sudo usermod -aG docker "$USER"
```

`usermod` 이후 Docker 그룹 권한은 새 로그인 세션부터 적용된다. 바로 이어서 작업해야 하면 Docker 명령 앞에 `sudo`를 붙인다.

Docker 설치를 확인한다.

```bash
docker --version
docker compose version
```

권한이 아직 반영되지 않았다면 다음처럼 확인한다.

```bash
sudo docker --version
sudo docker compose version
```

## 2. 프로젝트 가져오기

저장소를 내려받고 프로젝트 폴더로 이동한다.

```bash
git clone <repo-url> hanbit
cd hanbit
```

의존성을 설치한다.

```bash
npm install
```

Next.js 16은 기존 Next.js와 API 차이가 있으므로 구현 전 `AGENTS.md`의 Next.js 16 주의사항과 `node_modules/next/dist/docs/` 문서를 확인한다.

## 3. 환경 변수 준비

`.env.example`을 복사해서 로컬 환경 파일을 만든다.

```bash
cp .env.example .env
```

로컬 Docker PostgreSQL을 사용할 때 `.env`는 다음 값을 기준으로 한다.

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/hanbit?schema=public"
AUTH_SECRET="replace-with-generated-secret"
SCHOOL_EMAIL_DOMAIN="example.school.kr"
```

`AUTH_SECRET`은 다음 명령으로 생성한 값을 사용한다.

```bash
npx auth secret
```

명령이 `.env.local`에 값을 썼다면, 생성된 `AUTH_SECRET` 값을 `.env`에도 반영한다. Prisma seed와 migration은 `dotenv`로 `.env`를 읽는다.

학교 이메일 도메인을 바꾸려면 `SCHOOL_EMAIL_DOMAIN`만 변경한다. seed 계정 이메일도 이 도메인을 기준으로 생성된다.

## 4. 로컬 PostgreSQL 실행

Docker 그룹 권한이 적용되어 있으면 다음 명령을 사용한다.

```bash
npm run db:up
docker compose ps
```

권한이 아직 적용되지 않았다면 다음 명령을 사용한다.

```bash
sudo docker compose up -d postgres
sudo docker compose ps
```

정상 상태에서는 `hanbit-postgres` 컨테이너가 `healthy` 또는 `running` 상태로 표시된다.

PostgreSQL 포트 `5432`를 다른 서비스가 이미 쓰고 있으면 둘 중 하나를 선택한다.

- 기존 로컬 PostgreSQL을 중지한다.
- `compose.yml`의 host port를 예를 들어 `5433:5432`로 바꾸고 `.env`의 `DATABASE_URL`도 `localhost:5433`으로 맞춘다.

## 5. Prisma 초기화

Prisma Client를 생성한다.

```bash
npm run db:generate
```

마이그레이션을 적용한다.

```bash
npm run db:migrate
```

개발용 seed 데이터를 넣는다.

```bash
npm run db:seed
```

seed는 기존 데이터를 지우고 기본 사용자, 게시판, 대시보드 샘플 데이터를 다시 만든다. 로컬 개발 DB 초기화나 테스트 후 원복이 필요할 때 다시 실행할 수 있다.

기본 seed 계정은 모두 비밀번호 `Hanbit123!`를 사용한다.

- `student@example.school.kr`
- `council@example.school.kr`
- `admin@example.school.kr`

`SCHOOL_EMAIL_DOMAIN`을 변경했다면 이메일 도메인도 함께 바뀐다. 예를 들어 `SCHOOL_EMAIL_DOMAIN="school.ac.kr"`이면 `student@school.ac.kr`로 로그인한다.

## 6. 개발 서버 실행

개발 서버를 시작한다.

```bash
npm run dev
```

브라우저에서 다음 주소를 연다.

```text
http://localhost:3000
```

서버가 이미 `3000` 포트를 쓰고 있다면 Next.js가 다른 포트를 안내할 수 있다. 터미널에 표시된 URL을 사용한다.

## 7. 기본 검증

초기 환경이 제대로 잡혔는지 확인한다.

```bash
npm run lint
npm run build
```

E2E까지 확인하려면 Playwright 브라우저를 설치한 뒤 테스트를 실행한다.

```bash
npx playwright install chromium
npm run test:e2e
```

브라우저에서 확인할 기본 흐름은 다음과 같다.

- `/` 홈 대시보드가 표시된다.
- `/login`에서 seed 계정으로 로그인된다.
- 일반 학생 계정은 `/board/write` 접근이 차단된다.
- `council` 또는 `admin` 계정은 `/board/write`에 접근할 수 있다.
- `/board`에서 공식 게시글 목록이 표시된다.
- `/mypage`에서 로그인 사용자 정보가 표시된다.

DB를 직접 확인해야 하면 Prisma Studio를 실행한다.

```bash
npm run db:studio
```

## 8. Playwright 선택 설정

E2E나 화면 검증을 실행할 머신에서는 Playwright 브라우저를 설치한다.

```bash
npx playwright install chromium
```

Fedora에서 브라우저 실행에 필요한 라이브러리가 부족하면 다음 패키지를 설치한다.

```bash
sudo dnf install -y nspr nss atk at-spi2-atk dbus-libs libX11 libXcomposite libXdamage libXext libXfixes libXrandr mesa-libgbm libxcb alsa-lib at-spi2-core cups-libs pango cairo
```

## 9. 클라우드 PostgreSQL로 전환할 때

클라우드 PostgreSQL을 사용할 때는 Docker PostgreSQL을 띄우지 않고 `.env`의 `DATABASE_URL`만 provider에서 발급한 접속 문자열로 바꾼다.

```env
DATABASE_URL="postgresql://<user>:<password>@<host>:<port>/<database>?schema=public"
```

개발용 로컬 DB와 같은 Prisma 스키마를 사용한다. 배포 또는 공유 DB에는 개발용 seed를 함부로 실행하지 않는다.

클라우드 DB에 마이그레이션만 적용할 때는 다음 명령을 사용한다.

```bash
npx prisma migrate deploy
```

테스트용 클라우드 DB라면 필요할 때만 seed를 실행한다.

```bash
npm run db:seed
```

## 10. 종료와 초기화

로컬 PostgreSQL 컨테이너를 중지한다.

```bash
npm run db:down
```

Docker 권한이 없으면 다음 명령을 사용한다.

```bash
sudo docker compose down
```

로컬 DB 데이터를 완전히 삭제하고 새로 시작해야 할 때만 volume까지 삭제한다.

```bash
docker compose down -v
```

권한이 없으면 다음 명령을 사용한다.

```bash
sudo docker compose down -v
```

이후 다시 `npm run db:up`, `npm run db:migrate`, `npm run db:seed` 순서로 초기화한다.

## 자주 막히는 문제

### Docker permission denied

현재 터미널에 Docker 그룹 권한이 아직 반영되지 않은 상태다. 로그아웃 후 다시 로그인하거나 새 터미널을 연다. 바로 진행해야 하면 `sudo docker compose ...`를 사용한다.

### DATABASE_URL is required

`.env` 파일이 없거나 `DATABASE_URL` 값이 비어 있다. `cp .env.example .env`를 다시 확인하고, 프로젝트 루트에서 명령을 실행한다.

### Prisma Client를 찾지 못함

생성된 Prisma Client가 없을 수 있다. 다음 명령을 실행한다.

```bash
npm run db:generate
```

### 로그인은 되지 않고 계정이 없다고 나옴

seed가 실행되지 않았거나 `SCHOOL_EMAIL_DOMAIN`이 바뀐 상태다. 다음 명령으로 seed를 다시 넣고, 현재 `.env`의 도메인에 맞는 이메일로 로그인한다.

```bash
npm run db:seed
```

### 5432 포트 충돌

다른 PostgreSQL이 이미 실행 중이다. 기존 서비스를 중지하거나 `compose.yml` host port와 `.env`의 `DATABASE_URL` 포트를 함께 변경한다.

### Next.js build에서 환경 변수 오류

`npm run build`도 서버 코드를 평가하므로 `.env`의 `DATABASE_URL`, `AUTH_SECRET`, `SCHOOL_EMAIL_DOMAIN`이 필요하다. 로컬 Docker DB를 켜고 환경 변수를 확인한 뒤 다시 빌드한다.
