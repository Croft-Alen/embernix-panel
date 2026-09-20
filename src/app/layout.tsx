import type { Metadata } from "next";

import {
  Inter,
  Plus_Jakarta_Sans,
} from "next/font/google";

import {
  ThemeProvider,
} from "@/components/theme/theme-provider";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable:
    "--font-inter",
});

const plusJakartaSans =
  Plus_Jakarta_Sans({
    subsets: ["latin"],
    display: "swap",
    variable:
      "--font-plus-jakarta",
  });

export const metadata: Metadata = {
  title: {
    default:
      "Embernix Panel",
    template:
      "%s | Embernix",
  },

  description:
    "Manage and deploy your websites with Embernix.",
};

const themeScript = `
(function() {
  try {
    var stored = localStorage.getItem("embernix-theme");
    var mode =
      stored === "light" ||
      stored === "dark" ||
      stored === "system"
        ? stored
        : "system";

    var resolved =
      mode === "system"
        ? (
            window.matchMedia(
              "(prefers-color-scheme: dark)"
            ).matches
              ? "dark"
              : "light"
          )
        : mode;

    document.documentElement.dataset.theme = resolved;
  } catch (e) {
    document.documentElement.dataset.theme = "dark";
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children:
    React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              themeScript,
          }}
        />
      </head>

      <body
        className={`${inter.variable} ${plusJakartaSans.variable}`}
      >
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}