import { NextResponse } from "next/server";
import { appendSentence, getSentences } from "./db";

export async function GET() {
  const sentences = await getSentences();
  return NextResponse.json({ sentences }, { status: 200 });
}

export async function POST(request) {
  const { sentence } = await request.json();
  await appendSentence(sentence);

  const sentences = await getSentences();
  return NextResponse.json({ sentences }, { status: 200 });
}
