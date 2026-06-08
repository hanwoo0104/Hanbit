"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export type PostEditorState = {
  message?: string;
  fieldErrors?: Partial<Record<string, string[]>>;
};

const initialState: PostEditorState = {};

type PostEditorBoard = {
  id: string;
  name: string;
};

type PostEditorProps = {
  title: string;
  description: string;
  action: (
    previousState: PostEditorState,
    formData: FormData,
  ) => Promise<PostEditorState>;
  boards: PostEditorBoard[];
  submitLabel: string;
  cancelHref: string;
  initialBoardId?: string;
  initialPost?: {
    title: string;
    content: string;
    boardId: string;
    pinned?: boolean;
  };
  showPinned?: boolean;
};

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) {
    return null;
  }

  return <p className="text-sm text-destructive">{errors[0]}</p>;
}

export function PostEditor({
  title,
  description,
  action,
  boards,
  submitLabel,
  cancelHref,
  initialBoardId,
  initialPost,
  showPinned = true,
}: PostEditorProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const selectedBoardId = initialPost?.boardId ?? initialBoardId ?? boards[0]?.id ?? "";

  return (
    <Card className="mx-auto w-full max-w-3xl rounded-lg border border-border shadow-sm">
      <CardHeader>
        <h1 className="text-xl font-semibold leading-tight">{title}</h1>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="grid gap-5">
          <div className="grid gap-2">
            <Label htmlFor="boardId">게시판</Label>
            <select
              id="boardId"
              name="boardId"
              defaultValue={selectedBoardId}
              aria-invalid={Boolean(state.fieldErrors?.boardId) || undefined}
              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              required
            >
              {boards.map((board) => (
                <option key={board.id} value={board.id}>
                  {board.name}
                </option>
              ))}
            </select>
            <FieldError errors={state.fieldErrors?.boardId} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="title">제목</Label>
            <Input
              id="title"
              name="title"
              defaultValue={initialPost?.title}
              aria-invalid={Boolean(state.fieldErrors?.title) || undefined}
              required
            />
            <FieldError errors={state.fieldErrors?.title} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="content">본문</Label>
            <Textarea
              id="content"
              name="content"
              defaultValue={initialPost?.content}
              aria-invalid={Boolean(state.fieldErrors?.content) || undefined}
              className="min-h-72 resize-y leading-7"
              required
            />
            <FieldError errors={state.fieldErrors?.content} />
          </div>
          {showPinned ? (
            <label className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 px-3 py-3 text-sm font-medium">
              <Checkbox name="pinned" defaultChecked={initialPost?.pinned} />
              공지 상단 고정
            </label>
          ) : null}
          {state.message ? (
            <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {state.message}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <Button type="submit" className="h-10" disabled={pending}>
              {pending ? "저장 중" : submitLabel}
            </Button>
            <Link
              href={cancelHref}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              취소
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
