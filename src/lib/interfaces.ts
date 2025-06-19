import { Session } from "next-auth";
import { UserData } from "@/lib/schemas";

export interface PropsForEveryDashboardCard {
  session: Session;
  userData: UserData;
}
