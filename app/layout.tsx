import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from 'react-hot-toast'
import { NegocioProvider } from '@/src/context/NegocioContext'
import { ThemeProvider } from '@/src/context/ThemeContext'
import { ClientesProvider } from '@/src/context/ClientesContext'
import { PedidosProvider } from '@/src/context/PedidosContext'
import { SidebarProvider } from '@/src/context/SidebarContext'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ProdManager Pro",
  description: "Gestión de Producción Multi-Negocio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <SidebarProvider>
            <NegocioProvider>
              <ClientesProvider>
                <PedidosProvider>
                  {children}
                  <Toaster position="top-right" />
                </PedidosProvider>
              </ClientesProvider>
            </NegocioProvider>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
