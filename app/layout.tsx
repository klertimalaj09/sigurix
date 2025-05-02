import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "SiguriX",
  description: "Mjete online për gjenerimin e fjalëkalimeve dhe kontrollin e sigurisë së URL-ve",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="sq">
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
