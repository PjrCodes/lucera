import type { Session } from "next-auth";

export type AuthenticatedSession = Session & {
  user: {
    id: string;
    name: string;
    email: string;
    image: string;
  }
};
