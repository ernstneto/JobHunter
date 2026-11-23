import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ProfileProvider } from "@/lib/ProfileContext";
import { JobTrackerProvider } from "@/lib/JobTrackerContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "JobHunter AI — Intelligent Job Search & Resume Tailoring",
  description: "Search jobs, calculate AI match score, and generate ATS-friendly CVs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ProfileProvider>
          <JobTrackerProvider>
            {children}
          </JobTrackerProvider>
        </ProfileProvider>
      </body>
    </html>
  );
}