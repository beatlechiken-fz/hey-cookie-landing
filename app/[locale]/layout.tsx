import type { Metadata } from "next";
import { Dancing_Script, Pacifico, Montserrat } from "next/font/google";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { getMessages, setRequestLocale } from "next-intl/server";
import { MotionConfig } from "framer-motion";
import "../../app/globals.css";

const pacifico = Pacifico({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-pacifico",
});

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dancing",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Hey Cookie",
  description: "Cookies & Bakery",
  icons: {
    icon: "/icon.ico",
  },
};

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function RootLayout({ children, params }: Props) {
  const { locale } = await params; // ✅ AQUÍ

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`overflow-x-hidden ${pacifico.variable} ${dancingScript.variable} ${montserrat.variable}`}
    >
      <body className="font-body antialiased overflow-x-hidden">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <MotionConfig
            reducedMotion="user"
            transition={{ type: "tween", ease: "easeOut" }}
          >
            {children}
          </MotionConfig>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
