import { NextResponse } from "next/server";
import { memoriaTrafego } from "@/lib/trafficMemory";

export async function POST(req: Request) {
  try {
    const { ip, userId } = await req.json();
    if (!ip) return NextResponse.json({ error: "IP ausente" }, { status: 400 });

    memoriaTrafego.registrar(ip, userId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}