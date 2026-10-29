import { Link } from "@/i18n/navigation";

export const metadata = {
  title: "Código no válido — Hey Cookie",
  robots: "noindex, nofollow",
};

export default function QrInvalidoPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-sm w-full text-center bg-white rounded-2xl border border-[#f0e0d0] p-8 shadow-sm">
        <div className="text-4xl mb-3">🔍</div>
        <h1 className="text-lg font-bold text-[#3A1F14] mb-2">
          Este código no es válido
        </h1>
        <p className="text-sm text-[#AA6A42]/80 font-sans mb-6">
          No encontramos una tarjeta del club asociada a este QR. Si crees que
          es un error, contáctanos directamente.
        </p>
        <Link
          href="/club/login"
          className="inline-block px-5 py-2.5 rounded-xl bg-[#c0607a] text-white text-sm font-bold hover:bg-[#a8506a] transition"
        >
          Ir a mi cuenta
        </Link>
      </div>
    </div>
  );
}
