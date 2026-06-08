import { Search } from "lucide-react";

import { updateAdminUserAction } from "@/lib/actions/admin-users";
import { getAdminUsers, getAdminUserStats } from "@/lib/dal/admin-users";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type AdminUsersPageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  dateStyle: "medium",
});

const roleLabels = {
  student: "학생",
  council: "운영진",
  admin: "관리자",
};

const statusLabels = {
  active: "활성",
  pending: "대기",
  suspended: "정지",
};

function statusVariant(status: "active" | "pending" | "suspended") {
  if (status === "suspended") {
    return "destructive";
  }

  return status === "pending" ? "outline" : "secondary";
}

export default async function AdminUsersPage({
  searchParams,
}: AdminUsersPageProps) {
  const params = await searchParams;
  const query = params.q ?? "";
  const [users, stats] = await Promise.all([
    getAdminUsers(query),
    getAdminUserStats(),
  ]);

  return (
    <section className="grid min-w-0 gap-4">
      <div className="grid gap-3 sm:grid-cols-4">
        <Stat label="전체" value={stats.total} />
        <Stat label="활성" value={stats.active} />
        <Stat label="정지" value={stats.suspended} />
        <Stat label="관리자" value={stats.admins} />
      </div>

      <form
        action="/admin/users"
        className="grid gap-3 rounded-lg border border-border bg-card p-3 sm:grid-cols-[minmax(0,1fr)_auto]"
      >
        <label className="relative min-w-0">
          <span className="sr-only">사용자 검색</span>
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            name="q"
            defaultValue={query}
            placeholder="이름, 이메일, 학번 검색"
            className="h-10 pl-9"
          />
        </label>
        <Button type="submit" className="h-10">
          검색
        </Button>
      </form>

      <div className="min-w-0 overflow-hidden rounded-lg border border-border bg-card p-2">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>사용자</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>활동</TableHead>
              <TableHead>가입일</TableHead>
              <TableHead>관리</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="grid gap-1">
                    <p className="font-medium">{user.displayName}</p>
                    <p className="text-xs text-muted-foreground">
                      {user.email ?? "-"}
                    </p>
                    <p className="font-mono text-xs text-muted-foreground">
                      {user.studentNumber ?? "-"}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant={user.role === "admin" ? "default" : "outline"}>
                      {roleLabels[user.role]}
                    </Badge>
                    <Badge variant={statusVariant(user.status)}>
                      {statusLabels[user.status]}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="grid gap-1 text-xs text-muted-foreground">
                    <span>글 {user.postCount}</span>
                    <span>댓글 {user.commentCount}</span>
                    <span>신고 {user.reportCount}</span>
                  </div>
                </TableCell>
                <TableCell>{dateFormatter.format(user.createdAt)}</TableCell>
                <TableCell>
                  <form
                    action={updateAdminUserAction}
                    className="flex min-w-[18rem] flex-wrap items-center gap-2"
                  >
                    <input type="hidden" name="userId" value={user.id} />
                    <label>
                      <span className="sr-only">역할</span>
                      <select
                        name="role"
                        defaultValue={user.role}
                        className="h-9 rounded-lg border border-input bg-background px-2 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                      >
                        <option value="student">학생</option>
                        <option value="council">운영진</option>
                        <option value="admin">관리자</option>
                      </select>
                    </label>
                    <label>
                      <span className="sr-only">상태</span>
                      <select
                        name="status"
                        defaultValue={user.status}
                        className="h-9 rounded-lg border border-input bg-background px-2 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                      >
                        <option value="active">활성</option>
                        <option value="pending">대기</option>
                        <option value="suspended">정지</option>
                      </select>
                    </label>
                    <Button type="submit" variant="outline" className="h-9">
                      저장
                    </Button>
                  </form>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}
