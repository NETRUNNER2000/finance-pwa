// pages/_app.tsx
import type { AppProps } from 'next/app'
import { ThemeProvider } from 'next-themes'
import { SettingsProvider } from '../context/SettingsContext'
import { UserProvider } from '../context/UserContext'
import { DashboardProvider } from '../context/DashboardContext'
import '@/styles/globals.css'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <UserProvider>
      <SettingsProvider>
        <DashboardProvider>
          <ThemeProvider attribute="class" defaultTheme="system" disableTransitionOnChange>
            <Component {...pageProps} />
          </ThemeProvider>
        </DashboardProvider>
      </SettingsProvider>
    </UserProvider>
  )
}