import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const { price, miles } = body;

  if (!price || !miles) {
    return NextResponse.json(
      { error: "Preço e milhas são obrigatórios" },
      { status: 400 }
    );
  }

  const priceNum = parseFloat(price);
  const milesNum = parseInt(miles);

  if (isNaN(priceNum) || isNaN(milesNum) || priceNum <= 0 || milesNum <= 0) {
    return NextResponse.json(
      { error: "Preço e milhas devem ser números positivos" },
      { status: 400 }
    );
  }

  const vpm = priceNum / (milesNum / 1000);

  let rating: string;
  if (vpm < 15) {
    rating = "Excelente";
  } else if (vpm <= 25) {
    rating = "Bom";
  } else if (vpm <= 35) {
    rating = "Regular";
  } else {
    rating = "Ruim";
  }

  return NextResponse.json({
    price: priceNum,
    miles: milesNum,
    vpm: parseFloat(vpm.toFixed(2)),
    rating,
    description: `R$ ${priceNum.toFixed(2)} por ${milesNum.toLocaleString("pt-BR")} milhas = R$ ${vpm.toFixed(2)} por mil milhas`,
  });
}
