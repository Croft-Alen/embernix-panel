import type {
  ReactNode,
} from "react";

import {
  PanelShell,
} from "@/components/layout/panel-shell";

import {
  requireUser,
} from "@/server/auth/require-user";

type PanelLayoutProps = {
  children: ReactNode;
};

export default async function PanelLayout({
  children,
}: PanelLayoutProps) {
  await requireUser();

  return (
    <PanelShell>
      {children}
    </PanelShell>
  );
}