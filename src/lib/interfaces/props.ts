import { Session } from "next-auth";
import { UserData } from "@/lib/schemas/database";

export interface PropsForEveryDashboardCard {
  session: Session;
  userData: UserData;
}
