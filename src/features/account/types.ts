export type AccountProfile = {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
};

export type DisplayMode =
  | "normal"
  | "compact";

export type AccountAppearance = {
  displayMode: DisplayMode;
  privacyMode: boolean;
  animations: boolean;
};

export type AccountSession = {
  id: string;
  os: string;
  browser: string;
  ipAddress: string;
  loggedInAt: string;
  current?: boolean;
};

export type AccountActivity = {
  id: string;
  event: string;
  ipAddress: string;
  createdAt: string;
};