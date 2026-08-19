import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { CopilotKit } from "@copilotkit/react-core";
import "@copilotkit/react-ui/styles.css";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "futureMe",
  description: "Simulate possible futures for life decisions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/*
          useSingleEndpoint pins runtimeTransport to "single", matching our
          /api/copilotkit route which only exports POST. Left on the default
          ("auto"), CopilotKit's auto-detect mutates the transport to "single"
          while the provider effect keeps resetting it to "auto"; each flip
          re-runs updateRuntimeConnection(), producing ~77 POSTs to
          /api/copilotkit per page load. That burst trips Vercel's DDoS
          mitigation and gets the visitor's IP blocked with a 403.
        */}
        <CopilotKit
          runtimeUrl="/api/copilotkit"
          agent="consultant"
          useSingleEndpoint={true}
          enableInspector={false}
        >
          {children}
        </CopilotKit>
      </body>
    </html>
  );
}
