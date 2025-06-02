import { auth } from "../auth";


export default async function Home() {
  const session = await auth();

  const isLoggedIn = session?.user ? true : false;

  return (
    <main className="h-screen w-full flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to Lucera</h1>
        <p className="text-lg mb-6">
          {isLoggedIn ? "You are logged in!" : "Please log in to continue."}
        </p>
        <p className="text-lg mb-6">
          {isLoggedIn ? "You are called " + session?.user?.name + "." : ""}
        </p>
      </div>
    </main>
  );
}
