import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const resposta = NextResponse.json({ ok: true });
    
    // Limpeza de cookie padrão
    resposta.cookies.set("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: new Date(0), // Data no passado (Unix Epoch)
      path: "/",
    });

    return resposta;
  } catch (erro) {
    console.error("[CRITICAL] Erro no logout:", erro);
    return NextResponse.json({ erro: "Internal Error" }, { status: 500 });
  }
}