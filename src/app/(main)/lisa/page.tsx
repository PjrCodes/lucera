import LisaClientComponent from "@/components/feature/lisa/lisa-client-component";
import { getSessionAndUserData } from "@/lib/database-service/auth";

export default async function LisaPage() {
  const { session, userData } = await getSessionAndUserData();

  return <LisaClientComponent session={session} userData={userData} />;
}
