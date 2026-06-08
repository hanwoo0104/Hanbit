import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

import {
  BoardType,
  MealType,
  PostType,
  PrismaClient,
  TargetType,
  UserRole,
} from "../lib/generated/prisma/client";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to seed the database.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg(databaseUrl),
});

const seedPassword = "Hanbit123!";
const schoolDomain = process.env.SCHOOL_EMAIL_DOMAIN ?? "example.school.kr";

async function main() {
  const passwordHash = await bcrypt.hash(seedPassword, 12);

  await prisma.$transaction([
    prisma.report.deleteMany(),
    prisma.reaction.deleteMany(),
    prisma.comment.deleteMany(),
    prisma.todo.deleteMany(),
    prisma.timetableItem.deleteMany(),
    prisma.meal.deleteMany(),
    prisma.academicEvent.deleteMany(),
    prisma.post.deleteMany(),
    prisma.board.deleteMany(),
    prisma.session.deleteMany(),
    prisma.account.deleteMany(),
    prisma.verificationToken.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  const [student, council, admin] = await Promise.all([
    prisma.user.create({
      data: {
        name: "홍길동",
        displayName: "홍길동",
        email: `student@${schoolDomain}`,
        studentNumber: "2026001",
        role: UserRole.student,
        passwordHash,
      },
    }),
    prisma.user.create({
      data: {
        name: "한빛 학생회",
        displayName: "학생회",
        email: `council@${schoolDomain}`,
        studentNumber: "2026002",
        role: UserRole.council,
        passwordHash,
      },
    }),
    prisma.user.create({
      data: {
        name: "관리자",
        displayName: "관리자",
        email: `admin@${schoolDomain}`,
        studentNumber: "0000001",
        role: UserRole.admin,
        passwordHash,
      },
    }),
  ]);

  const officialBoard = await prisma.board.create({
    data: {
      name: "공식 게시판",
      slug: "official",
      description: "학생회와 운영진이 올리는 공식 공지입니다.",
      type: BoardType.official,
      sortOrder: 0,
    },
  });

  const communityBoards = await Promise.all(
    [
      ["자유게시판", "free", "학교 생활 이야기를 자유롭게 나눕니다."],
      ["질문", "questions", "수업, 일정, 학교 생활 질문을 올립니다."],
      ["분실물", "lost-found", "잃어버린 물건과 찾은 물건을 공유합니다."],
      ["동아리", "clubs", "동아리 모집과 활동 소식을 나눕니다."],
      ["스터디", "study", "스터디 모집과 학습 정보를 공유합니다."],
      ["급식", "meals", "급식 메뉴와 후기를 이야기합니다."],
      ["기숙사", "dorm", "기숙사 생활 정보를 공유합니다."],
    ].map(([name, slug, description], index) =>
      prisma.board.create({
        data: {
          name,
          slug,
          description,
          type: BoardType.community,
          sortOrder: index + 1,
        },
      }),
    ),
  );

  const [freeBoard, questionBoard] = communityBoards;

  const officialPost = await prisma.post.create({
    data: {
      boardId: officialBoard.id,
      authorId: council.id,
      type: PostType.official,
      title: "2026학년도 1학기 학생회 안내",
      content:
        "이번 학기 학생회 주요 일정과 학교생활 안내를 한빛에서 순차적으로 공유합니다.",
      pinned: true,
      viewCount: 128,
    },
  });

  const communityPost = await prisma.post.create({
    data: {
      boardId: freeBoard.id,
      authorId: student.id,
      type: PostType.community,
      title: "오늘 자습실 자리 여유 있나요?",
      content:
        "방과 후에 2층 자습실을 쓰려고 하는데 최근에 사람이 많은지 궁금합니다.",
      viewCount: 42,
      comments: {
        create: [
          {
            authorId: council.id,
            content: "오늘은 6시 이후부터 자리가 조금 여유 있을 것 같아요.",
          },
        ],
      },
    },
  });

  const questionPost = await prisma.post.create({
    data: {
      boardId: questionBoard.id,
      authorId: council.id,
      type: PostType.community,
      title: "수행평가 일정은 어디서 확인하나요?",
      content:
        "학급별 수행평가 일정이 한눈에 보이면 좋을 것 같아서 공유 방법을 찾고 있어요.",
      viewCount: 31,
    },
  });

  await Promise.all([
    prisma.reaction.create({
      data: {
        userId: council.id,
        targetType: TargetType.post,
        postId: communityPost.id,
      },
    }),
    prisma.report.create({
      data: {
        reporterId: student.id,
        targetType: TargetType.post,
        postId: questionPost.id,
        reason: "관리자 신고 화면 검증용 샘플 신고입니다.",
      },
    }),
    prisma.academicEvent.createMany({
      data: [
        {
          title: "1학기 중간고사",
          startDate: new Date("2026-04-20T00:00:00+09:00"),
          endDate: new Date("2026-04-24T00:00:00+09:00"),
          showDday: true,
        },
        {
          title: "학교 축제",
          startDate: new Date("2026-05-15T00:00:00+09:00"),
          showDday: true,
        },
      ],
    }),
    prisma.timetableItem.createMany({
      data: [
        {
          userId: student.id,
          weekday: 1,
          period: 1,
          subject: "국어",
          location: "2-1",
        },
        {
          userId: student.id,
          weekday: 1,
          period: 2,
          subject: "수학",
          location: "2-1",
        },
        {
          userId: student.id,
          weekday: 1,
          period: 3,
          subject: "영어",
          location: "어학실",
        },
      ],
    }),
    prisma.meal.create({
      data: {
        date: new Date("2026-06-08T00:00:00+09:00"),
        type: MealType.lunch,
        menus: ["현미밥", "미역국", "닭갈비", "배추김치", "요구르트"],
      },
    }),
    prisma.todo.createMany({
      data: [
        {
          userId: student.id,
          title: "수학 프린트 제출",
          dueDate: new Date("2026-06-10T23:59:59+09:00"),
        },
        {
          userId: student.id,
          title: "동아리 발표 자료 정리",
          dueDate: new Date("2026-06-12T23:59:59+09:00"),
        },
      ],
    }),
  ]);

  console.log("Seed completed.");
  console.log(`${student.email} / ${seedPassword}`);
  console.log(`${council.email} / ${seedPassword}`);
  console.log(`${admin.email} / ${seedPassword}`);
  console.log(`Pinned official post: ${officialPost.title}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
