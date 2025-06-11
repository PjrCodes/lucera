import { auth } from "@/auth";
import {
  Sidebar,
  SidebarContent,
} from "@/components/ui/sidebar";
import {
  MdChat,
  MdDashboard,
  MdLightbulb,
  MdMessage,
  MdSettings,
  MdTrendingUp,
} from "react-icons/md";
import Link from "next/link";

export async function AppSidebar() {
  const session = await auth();
  const isLoggedIn = session?.user ? true : false;

  return (
    <Sidebar className="top-(--header-height) h-[calc(100svh-var(--header-height))]! border-r border-red-950">
      <div className="px-4 pt-4 bg-lucerabrown-3 flex flex-col text-3xl font-bold">
          <Link href="/university">Sample University</Link>
      </div>
      <SidebarContent>
        {!isLoggedIn ? (
          <div className="h-full bg-lucerabrown-3 px-4 py-4">Log in to continue</div>
        ) : (
          <div className="h-full flex flex-col bg-lucerabrown-3">
          <nav className="flex-1">
            <div className="flex-1 px-4 py-6">
              <ul className="space-y-4">
                <li>
                  <Link
                    href="/"
                    className="flex items-center gap-3 px-4 py-2 text-black  hover:bg-lucerabrown-2 rounded-md transition-colors"
                  >
                    <MdDashboard size={20} />
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    href="/lisa"
                    className="flex items-center gap-3 px-4 py-2 text-black hover:bg-lucerabrown-2 rounded-md transition-colors"
                  >
                    <MdChat size={20} />
                    LISA
                  </Link>
                </li>
                <li>
                  <Link
                    href="/progress"
                    className="flex items-center gap-3 px-4 py-2 text-black  hover:bg-lucerabrown-2 rounded-md transition-colors"
                  >
                    <MdTrendingUp size={20} />
                    Progress
                  </Link>
                </li>
                <li>
                  <Link
                    href="/lighthouse"
                    className="flex items-center gap-3 px-4 py-2 text-black hover:bg-lucerabrown-2 rounded-md transition-colors"
                  >
                    <MdLightbulb size={20} />
                    Lighthouse
                  </Link>
                </li>
                <li>
                  <Link
                    href="/messages"
                    className="flex items-center gap-3 px-4 py-2 text-black  hover:bg-lucerabrown-2 rounded-md transition-colors"
                  >
                    <MdMessage size={20} />
                    Messages
                  </Link>
                </li>
              </ul>
            </div>
             
          </nav>
          <div className="px-4 py-4 border-t border-red-950">
          {isLoggedIn ? (
            <Link
              href="/settings"
              className="flex items-center gap-3 px-4 py-2 text-black hover:bg-lucerabrown-2 rounded-md transition-colors mb-4"
            >
              <MdSettings size={20} />
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
