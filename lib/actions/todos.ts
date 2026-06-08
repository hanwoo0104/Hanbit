"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth/permissions";
import { createTodo, deleteTodo, toggleTodo, updateTodo } from "@/lib/dal/todos";
import { getFormString } from "@/lib/validators/post";
import { todoIdSchema, todoInputSchema } from "@/lib/validators/todo";

function parseTodoInput(formData: FormData) {
  return todoInputSchema.safeParse({
    title: getFormString(formData, "title"),
    dueDate: getFormString(formData, "dueDate"),
  });
}

function parseTodoId(todoId: string) {
  return todoIdSchema.parse({
    todoId,
  }).todoId;
}

function revalidateTodoViews() {
  revalidatePath("/");
  revalidatePath("/mypage");
}

export async function createTodoAction(formData: FormData) {
  const user = await requireUser();
  const parsed = parseTodoInput(formData);

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "할 일을 확인해 주세요.");
  }

  await createTodo(parsed.data, user.id);

  revalidateTodoViews();
  redirect("/mypage#todos");
}

export async function updateTodoAction(todoId: string, formData: FormData) {
  const user = await requireUser();
  const parsed = parseTodoInput(formData);

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "할 일을 확인해 주세요.");
  }

  await updateTodo(parseTodoId(todoId), parsed.data, user.id);

  revalidateTodoViews();
  redirect("/mypage#todos");
}

export async function toggleTodoAction(todoId: string) {
  const user = await requireUser();

  await toggleTodo(parseTodoId(todoId), user.id);

  revalidateTodoViews();
  redirect("/mypage#todos");
}

export async function deleteTodoAction(todoId: string) {
  const user = await requireUser();

  await deleteTodo(parseTodoId(todoId), user.id);

  revalidateTodoViews();
  redirect("/mypage#todos");
}
