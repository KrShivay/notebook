import type {Metadata} from "next";

// These styles apply to every route in the application
import "../styles/global.css";

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return <div className="h-screen mx-auto max-w-sm">{children}</div>;
}
