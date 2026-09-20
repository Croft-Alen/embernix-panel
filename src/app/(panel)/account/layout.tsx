import type {
  ReactNode,
} from "react";

import {
  UserRound,
} from "lucide-react";

import {
  AccountTabs,
} from "@/components/account/account-tabs";

type AccountLayoutProps = {
  children:
    ReactNode;
};

export default function AccountLayout({
  children,
}: AccountLayoutProps) {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <UserRound className="h-5 w-5 text-[var(--primary)]" />

          <h1 className="font-[family-name:var(--font-plus-jakarta)] text-2xl font-semibold tracking-tight">
            Account
          </h1>
        </div>

        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          Manage your profile, security and personal panel preferences.
        </p>
      </div>

      <AccountTabs />

      {children}
    </div>
  );
}