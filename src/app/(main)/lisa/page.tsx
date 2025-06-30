import LisaClientComponent from "@/components/feature/lisa/lisa-client-component";
import {
  getUserData,
  serverComponentRedirectUnauthenticated,
} from "@/lib/database-service/auth";
import { redirect } from "next/navigation";

export default async function LisaPage() {
  const session = await serverComponentRedirectUnauthenticated();
  let userData;
  try {
    userData = await getUserData(session.user.id);
  } catch {
    redirect("/handle-invalid-user");
  }

  return <LisaClientComponent session={session} userData={userData} />;
}
