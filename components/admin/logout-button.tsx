"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/cockpit/logout", { method: "POST" });
    router.push("/cockpit/login");
    router.refresh();
  }

  return (
    <Button variant="outline" size="sm" className="gap-1.5" onClick={handleLogout}>
      <LogOut className="size-3.5" aria-hidden="true" />
      Log Out
    </Button>
  );
}
