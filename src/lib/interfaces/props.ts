import { UserData } from "@/lib/schemas/database";
import { AuthenticatedSession } from "../types/auth";

export interface SessionAndDataProps {
  session: AuthenticatedSession;
  userData: UserData;
}
