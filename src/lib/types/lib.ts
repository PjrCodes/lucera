import { NextResponse } from "next/server";
import { CustomFile } from "../schemas/database";

export type LoadFileFromDiskReturnType =
  | { error: NextResponse; fileRecord?: undefined; fileBuffer?: undefined }
  | { error?: undefined; fileRecord: CustomFile; fileBuffer: Buffer };
