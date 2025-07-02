import { auth } from "@/lib/auth";
import { Sidebar, SidebarContent } from "@/components/ui/sidebar";
import Link from "next/link";
import {
  BotMessageSquare,
  LayoutDashboard,
  Lightbulb,
  MessageCircleMore,
  Settings,
  TrendingUp,
} from "lucide-react";

export async function AppSidebar() {
  const session = await auth();
  const isLoggedIn = session?.user ? true : false;

  return (
    <Sidebar className="h-full">
      <div className="px-4 pt-4 bg-primary-50 flex flex-col text-3xl font-bold">
        <Link href="/university">Sample University</Link>
      </div>
      <SidebarContent>
        {!isLoggedIn ? (
          <div className="h-full bg-primary-50 px-4 py-4">
            Log in to continue
          </div>
        ) : (
          <div className="h-full flex flex-col bg-primary-50">
            <nav className="flex-1">
              <div className="flex-1 px-4 py-6">
                <ul className="space-y-4">
                  <li>
                    <Link
                      href="/"
                      className="flex items-center gap-3 px-4 py-2 text-black  hover:bg-primary-200 rounded-md transition-colors"
                    >
                      <LayoutDashboard size={20} />
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/lisa"
                      className="flex items-center gap-3 px-4 py-2 text-black hover:bg-primary-200 rounded-md transition-colors"
                    >
                      <BotMessageSquare size={20} />
                      LISA
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/progress"
                      className="flex items-center gap-3 px-4 py-2 text-black  hover:bg-primary-200 rounded-md transition-colors"
                    >
                      <TrendingUp size={20} />
                      Progress
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/lighthouse"
                      className="flex items-center gap-3 px-4 py-2 text-black hover:bg-primary-200 rounded-md transition-colors"
                    >
                      <Lightbulb size={20} />
                      Lighthouse
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/messages"
                      className="flex items-center gap-3 px-4 py-2 text-black  hover:bg-primary-200 rounded-md transition-colors"
                    >
                      <MessageCircleMore size={20} />
                      Messages
                    </Link>
                  </li>
                </ul>
              </div>
            </nav>
            <div className="px-4 py-4">
              {isLoggedIn ? (
                <Link
                  href="/settings"
                  className="flex items-center gap-3 px-4 py-2 text-black hover:bg-primary-200 rounded-md transition-colors mb-4"
                >
                  <Settings size={20} />
                  Settings
                </Link>
              ) : null}
              <div className="px-4 text-sm">Powered by Lucera</div>
            </div>
          </div>
        )}
      </SidebarContent>
      {/* <SidebarFooter> */}

      {/* </SidebarFooter> */}
    </Sidebar>
  );
}
