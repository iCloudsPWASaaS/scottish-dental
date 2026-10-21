import { NextResponse } from "next/server";

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ data }, init);
}

export function created<T>(data: T) {
  return NextResponse.json({ data }, { status: 201 });
}

export function error(
  message: string,
  status = 400,
  details?: unknown
) {
  return NextResponse.json({ error: message, details }, { status });
}

export function unauthorized(message = "Unauthorised") {
  return error(message, 401);
}

export function forbidden(message = "Forbidden") {
  return error(message, 403);
}

export function notFound(message = "Not found") {
  return error(message, 404);
}

export function badRequest(message = "Bad request", details?: unknown) {
  return error(message, 400, details);
}
