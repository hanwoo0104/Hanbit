import "server-only";

import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import type { TodoInput } from "@/lib/validators/todo";

function parseDueDate(value: TodoInput["dueDate"]) {
  if (!value) {
    return null;
  }

  return new Date(`${value}T23:59:59+09:00`);
}

async function findOwnedTodo(todoId: string, userId: string) {
  const todo = await prisma.todo.findFirst({
    where: {
      id: todoId,
      userId,
    },
    select: {
      id: true,
      completed: true,
    },
  });

  if (!todo) {
    notFound();
  }

  return todo;
}

export async function createTodo(input: TodoInput, userId: string) {
  return prisma.todo.create({
    data: {
      userId,
      title: input.title,
      dueDate: parseDueDate(input.dueDate),
    },
    select: {
      id: true,
    },
  });
}

export async function updateTodo(
  todoId: string,
  input: TodoInput,
  userId: string,
) {
  const todo = await findOwnedTodo(todoId, userId);

  return prisma.todo.update({
    where: {
      id: todo.id,
    },
    data: {
      title: input.title,
      dueDate: parseDueDate(input.dueDate),
    },
    select: {
      id: true,
    },
  });
}

export async function toggleTodo(todoId: string, userId: string) {
  const todo = await findOwnedTodo(todoId, userId);

  return prisma.todo.update({
    where: {
      id: todo.id,
    },
    data: {
      completed: !todo.completed,
    },
    select: {
      id: true,
    },
  });
}

export async function deleteTodo(todoId: string, userId: string) {
  const todo = await findOwnedTodo(todoId, userId);

  await prisma.todo.delete({
    where: {
      id: todo.id,
    },
  });
}
