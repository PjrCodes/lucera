import { NextPage } from "next";
import { auth } from "@/lib/auth";
import { getUserData } from "@/lib/database-service/auth";
import Header from "./header";
import { redirect } from "next/navigation";

const HeaderWrapper: NextPage = async () => {
  const session = await auth();

  if (!session?.user) {
    return <Header session={null} userData={null} />;
  }

  let userData;
  try {
    userData = await getUserData(session?.user?.id || "");
  } catch {
    return redirect("/handle-invalid-user");
  }

  return <Header session={session} userData={userData} />;
};

export default HeaderWrapper;
