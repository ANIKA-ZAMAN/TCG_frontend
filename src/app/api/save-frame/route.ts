import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const { name, data } = await req.json();
    const dir = path.join(process.cwd(), "public", "frames");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    
    const base64Data = data.replace(/^data:image\/png;base64,/, "");
    fs.writeFileSync(path.join(dir, `${name}.png`), Buffer.from(base64Data, "base64"));
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
