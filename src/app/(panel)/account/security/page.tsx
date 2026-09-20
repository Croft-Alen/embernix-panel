import {
  PasswordSettings,
} from "@/components/account/password-settings";

import {
  SessionHistory,
} from "@/components/account/session-history";

import {
  TwoFactorSettings,
} from "@/components/account/two-factor-settings";

import {
  mockAccountSessions,
} from "@/features/account/mock-account";

export default function SecurityPage() {
  return (
    <div className="space-y-6">
      <PasswordSettings />

      <TwoFactorSettings />

      <SessionHistory
        sessions={
          mockAccountSessions
        }
      />
    </div>
  );
}