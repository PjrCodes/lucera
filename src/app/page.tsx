import ProfileCircle from "@/components/profileCircle";
import { auth } from "../auth";
import SignIn from "@/components/buttons/signInButton";


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
    <main className="h-screen w-full flex">
      <div className="px-4 py-4">
        <h1 className="text-3xl font-bold">Hi, {session?.user?.name}</h1>
        <p className="text-lg mb-6">
          {isLoggedIn ? "You are logged in!" : "Please log in to continue."}
        </p>
        <p className="text-lg mb-6">
          {isLoggedIn ? "You are called " + session?.user?.name + "." : ""}
        </p>
        <div className="flex justify-center">
          {isLoggedIn ? (
            <ProfileCircle imageUrl={session?.user?.image}/>
          ) : (
            <SignIn />
          )}
        </div>
      </div>
    </main>
  );
}
