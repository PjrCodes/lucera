import ProfileCircle from "@/components/profileCircle";
import { auth } from "../auth";
import SignIn from "@/components/buttons/signInButton";
import { IoMdNotifications } from "react-icons/io";
import { CiEdit } from "react-icons/ci";
import SearchBarElement from "@/components/SearchBarElement";

export default async function Home() {
  const session = await auth();

  const isLoggedIn = session?.user ? true : false;

  if (!isLoggedIn) {
    return (
      <main className="h-screen w-full flex flex-col space-y-2 items-center justify-center">
        <SignIn />
        <p>You are not logged in. Please sign in to continue.</p>
      </main>
    );
  }

  return (
    <main className="h-screen w-full flex flex-col px-4 py-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl">Hi, {session?.user?.name}</h1>
        <div className="flex flex-row items-center justify-end space-x-2">
          <SearchBarElement />
          <IoMdNotifications size={32} className="cursor-pointer hover:text-gray-500" />
          <CiEdit  size={32} className="cursor-pointer hover:text-gray-500" />
          <div className="flex justify-center">
            <ProfileCircle imageUrl={session?.user?.image} size={38} />
          </div>
        </div>
      </div>
      <div className="flex flex-row w-full h-full gap-4">
        <div className="flex-7 bg-blue-200 rounded-lg flex items-center justify-center">
          <span className="text-lg font-semibold">Column 1</span>
        </div>
        <div className="flex-3 bg-green-200 rounded-lg flex items-center justify-center">
          <span className="text-lg font-semibold">Column 2</span>
        </div>
      </div>
    </main>
  );
}
