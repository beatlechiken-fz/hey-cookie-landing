import type { Metadata } from "next";
import {
  Fredoka,
  Pacifico,
  Montserrat,
  Playfair_Display,
} from "next/font/google";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { getMessages, setRequestLocale } from "next-intl/server";
import { MotionConfig } from "framer-motion";
import { SessionProvider } from "@/modules/user/auth/presentation/components/SessionProvider";
import "../../app/globals.css";

const pacifico = Pacifico({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-pacifico",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
});

// Menú principal: redondeada y "cute", en línea con la marca.
const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-fredoka",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.heycookie.mx"),
  title: "Hey Cookie · Bake Lab",
  description:
    "Galletas, pasteles y postres artesanales. Arma tu pastel con precio al instante y pide en línea.",
  openGraph: {
    title: "Hey Cookie · Bake Lab",
    description: "Galletas, pasteles y postres artesanales para consentirte y compartir.",
    images: [{ url: "/img/splash-home-mobile.webp", width: 1672, height: 940 }],
    type: "website",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
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
      className={`overflow-x-hidden ${pacifico.variable} ${fredoka.variable} ${montserrat.variable} ${playfair.variable}`}
    >
      <body className="font-body antialiased overflow-x-hidden">
        <SessionProvider>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <MotionConfig
              reducedMotion="user"
              transition={{ type: "tween", ease: "easeOut" }}
            >
              {children}
            </MotionConfig>
          </NextIntlClientProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
