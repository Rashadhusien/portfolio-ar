import React from "react"
import type { Metadata } from 'next'
import { Cairo, JetBrains_Mono } from 'next/font/google'

import './globals.css'

const cairoFont = Cairo({
  subsets: ['latin', 'arabic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-cairo',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
})

export const metadata: Metadata = {
  title: 'بوكتوكر | مراجعات كتب وصناعة محتوى ثقافي',
  description: 'منصة متخصصة في مراجعات الكتب والتسويق الثقافي على وسائل التواصل الاجتماعي',
  generator: 'v0.app',
  openGraph: {
    title: 'بوكتوكر | مراجعات كتب وصناعة محتوى ثقافي',
    description: 'منصة متخصصة في مراجعات الكتب والتسويق الثقافي على وسائل التواصل الاجتماعي',
    locale: 'ar_SA',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${cairoFont.variable} ${jetbrainsMono.variable}`}>
      <body className="font-cairo antialiased bg-background text-foreground">{children}</body>
    </html>
  )
}
