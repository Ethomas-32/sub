// src/app/api/chat/route.ts

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  const response = await fetch("http://localhost:5001/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message: body.query }),
  });

  const data = await response.json();

  return NextResponse.json(data);
}
