"use server";

import {
  serverComponentRedirectUnauthenticated,
  setUserRoleInDb,
} from "@/lib/database-service/auth";
import { redirect } from "next/navigation";
import * as z from "zod/v4";

const setUserRoleSchema = z.object({
  role: z.enum(["student", "teacher"], {
    error: (issue) =>
      issue.input === undefined ? "Please pick a role!" : "Invalid role selected!",
  }),
  reason: z.enum(["newuser"]).optional(),
  callbackUrl: z.string().optional(),
});

export type SelectRoleFormState = {
  error?: string;
  success?: boolean;
};

export async function setUserRole(
  prevState: SelectRoleFormState,
  data: FormData
): Promise<SelectRoleFormState> {
  "use server";

  // Let Zod handle FormData directly
  const parsedData = setUserRoleSchema.safeParse(
    Object.fromEntries(data.entries())
  );
  if (!parsedData.success) {
    return {
      error: parsedData.error.issues.map((issue) => issue.message).join(", "),
      success: false,
    };
  }

  try {
    // get current user session on the server
    const session = await serverComponentRedirectUnauthenticated();

    // Update the user's role in the database
    await setUserRoleInDb(
      parsedData.data.reason,
      session.user.id,
      parsedData.data.role
    );

    redirect(parsedData.data.callbackUrl || "/");
  } catch (error) {
    // if error is NEXT_REDIRECT then throw it
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }

    return {
      error: "Failed to set user role in the database.",
      success: false,
    };
  }
}
