import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { GATE_COOKIE, isValidGateToken } from "@/lib/gate";

export default async function ToolLayout({ children }: LayoutProps<"/">) {
  const token = (await cookies()).get(GATE_COOKIE)?.value;
  if (!(await isValidGateToken(token))) {
    redirect("/login");
  }
  return children;
}
