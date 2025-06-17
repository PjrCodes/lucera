import { NextResponse } from "next/server";

export const UnauthServerResponse = NextResponse.json({ error: "Unauthorized" }, { status: 401 });
