import {
  AppearanceSettings,
} from "@/components/account/appearance-settings";

import {
  ProfileSettings,
} from "@/components/account/profile-settings";

import {
  mockAccountAppearance,
  mockAccountProfile,
} from "@/features/account/mock-account";

export default function AccountPage() {
  return (
    <div className="space-y-6">
      <ProfileSettings
        initialProfile={
          mockAccountProfile
        }
      />

      <AppearanceSettings
        initialAppearance={
          mockAccountAppearance
        }
      />
    </div>
  );
}