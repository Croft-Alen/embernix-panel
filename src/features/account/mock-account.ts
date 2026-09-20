import type {
  AccountActivity,
  AccountAppearance,
  AccountProfile,
  AccountSession,
} from "@/features/account/types";

export const mockAccountProfile: AccountProfile = {
  firstName: "Zohaib",
  lastName: "Sajjad",
  username: "zohaib",
  email: "zohaib@example.com",
};

export const mockAccountAppearance: AccountAppearance = {
  displayMode: "normal",
  privacyMode: false,
  animations: true,
};

export const mockAccountSessions: AccountSession[] = [
  {
    id: "session_01",
    os: "Windows",
    browser: "Chrome 152.0.0.0",
    ipAddress: "172.70.108.173",
    loggedInAt: "2026-09-18T14:07:00.000Z",
    current: true,
  },
  {
    id: "session_02",
    os: "macOS",
    browser: "Firefox 152.0",
    ipAddress: "172.71.182.25",
    loggedInAt: "2026-07-26T15:32:00.000Z",
  },
  {
    id: "session_03",
    os: "macOS",
    browser: "Firefox 152.0",
    ipAddress: "104.23.168.76",
    loggedInAt: "2026-07-26T15:14:00.000Z",
  },
  {
    id: "session_04",
    os: "Android",
    browser: "Chrome Mobile 149",
    ipAddress: "172.69.39.127",
    loggedInAt: "2026-06-18T19:13:00.000Z",
  },
  {
    id: "session_05",
    os: "Linux",
    browser: "Firefox 151.0",
    ipAddress: "172.70.216.155",
    loggedInAt: "2026-06-17T19:10:00.000Z",
  },
];

export const mockAccountActivity: AccountActivity[] = [
  {
    id: "activity_01",
    event: "Signed in successfully",
    ipAddress: "172.70.108.173",
    createdAt: "2026-09-18T14:07:00.000Z",
  },
  {
    id: "activity_02",
    event: "Profile updated",
    ipAddress: "172.70.108.173",
    createdAt: "2026-09-16T11:24:00.000Z",
  },
  {
    id: "activity_03",
    event: "Password changed",
    ipAddress: "172.71.103.138",
    createdAt: "2026-07-26T14:58:00.000Z",
  },
  {
    id: "activity_04",
    event: "Signed in successfully",
    ipAddress: "172.71.182.25",
    createdAt: "2026-07-26T15:32:00.000Z",
  },
  {
    id: "activity_05",
    event: "Appearance settings updated",
    ipAddress: "104.23.170.29",
    createdAt: "2026-06-23T11:12:00.000Z",
  },
];