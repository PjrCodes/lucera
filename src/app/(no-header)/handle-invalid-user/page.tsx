import { getUserData, serverComponentRedirectUnauthenticated } from "@/lib/database-service/auth";
import { redirect } from "next/navigation";

export default async function HandleInvalidUserPage() {
  // check if the user is now validated
  const session = await serverComponentRedirectUnauthenticated();
  let errorMessage = "";
  try {
    await getUserData(session.user.id);
    return redirect("/");
  } catch (error) {
    // error message shown to user is the entire developer error trace
    errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred.";
    // add trace and full details
    console.error("Error fetching user data:", error);

    // if error is NEXT_REDIRECT, raise it
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-3xl font-bold">Update Your Profile</h1>
      <p className="mt-4 text-lg text-center max-w-xl">
        Your profile information is incomplete or contains errors. Subsequently,
        no further pages can be loaded. Please reach out to the support team for
        assistance.
        <br></br>
        <span className="text-red-600 font-semibold text-center text-sm">
          Error Message: {errorMessage}
        </span>
      </p>
    </div>
  );
}
