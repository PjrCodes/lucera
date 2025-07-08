import { NextResponse } from "next/server";
import { CustomFile } from "../schemas/database";

export type LoadFileFromDiskReturnType =
  | { error: NextResponse; fileRecord?: undefined; fileBuffer?: undefined, fullPath?: undefined }
  | { error?: undefined; fileRecord: CustomFile; fileBuffer: Buffer, fullPath: string };

export type Deadline = {
  id: number;
  title: string;
  dueDate: string;
  course: string;
  type: string;
  courseColor: string;
};
