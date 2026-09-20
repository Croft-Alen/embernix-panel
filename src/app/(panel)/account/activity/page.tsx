import {
  ActivityTable,
} from "@/components/account/activity-table";

import {
  mockAccountActivity,
} from "@/features/account/mock-account";

export default function ActivityPage() {
  return (
    <ActivityTable
      activities={
        mockAccountActivity
      }
    />
  );
}