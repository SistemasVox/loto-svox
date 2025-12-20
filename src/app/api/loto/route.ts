// src/app/api/loto/route.ts
import { NextRequest, NextResponse } from "next/server";
import { loteriaPrisma } from "@/lib/loteriaPrisma";

export async function GET() {
  try {
    const lotos = await loteriaPrisma.loto.findMany({
      orderBy: { concurso: "desc" },
    });
    return NextResponse.json(lotos);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Erro ao buscar registros: " + error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const { data_concurso, concurso, dezenas } = await req.json();
  
  // Garantir que data_concurso seja string no formato YYYY-MM-DD
  const dataFormatada = data_concurso 
    ? new Date(data_concurso).toISOString().split('T')[0] 
    : null;

  try {
    const novo = await loteriaPrisma.loto.create({
      data: {
        data_concurso: dataFormatada,
        concurso: Number(concurso),
        dezenas,
      },
    });
    return NextResponse.json(novo, { status: 201 });
  } catch (error: any) {
    let mensagemErro = "Erro ao criar registro";
    let status = 400;
    
    // Detectar erro de duplicata específico do Prisma
    if (error.code === 'P2002') {
      mensagemErro = `Concurso ${concurso} já existe!`;
      status = 409; // Conflict
    }
    
    return NextResponse.json(
      { error: mensagemErro, details: error.message },
      { status }
    );
  }
}

export async function PUT(req: NextRequest) {
  const { data_concurso, concurso, dezenas } = await req.json();
  
  // Garantir que data_concurso seja string no formato YYYY-MM-DD
  const dataFormatada = data_concurso 
    ? new Date(data_concurso).toISOString().split('T')[0] 
    : null;

  try {
    const alterado = await loteriaPrisma.loto.update({
      where: { concurso: Number(concurso) },
      data: { 
        data_concurso: dataFormatada, 
        dezenas 
      },
    });
    return NextResponse.json(alterado);
  } catch (error: any) {
    let mensagemErro = "Erro ao atualizar registro";
    let status = 400;
    
    // Detectar erro de registro não encontrado
    if (error.code === 'P2025') {
      mensagemErro = `Concurso ${concurso} não encontrado!`;
      status = 404;
    }
    
    return NextResponse.json(
      { error: mensagemErro, details: error.message },
      { status }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const { concurso } = await req.json();
  
  try {
    await loteriaPrisma.loto.delete({ 
      where: { concurso: Number(concurso) } 
    });
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    let mensagemErro = "Erro ao excluir registro";
    let status = 400;
    
    // Detectar erro de registro não encontrado
    if (error.code === 'P2025') {
      mensagemErro = `Concurso ${concurso} não encontrado!`;
      status = 404;
    }
    
    return NextResponse.json(
      { error: mensagemErro, details: error.message },
      { status }
    );
  }
}