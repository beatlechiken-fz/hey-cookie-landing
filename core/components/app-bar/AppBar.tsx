import NativeSelect from "../native-selec/NativeSelect";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";

export default function AppBar() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  const handleSetLang = (value: string) => {
    router.push(pathname, { locale: value });
  };

  return (
    <main className="flex fixed top-0 left-0 z-50 gap-4 items-center justify-end w-full h-[60px] py-4 px-8">
      <section>
        <NativeSelect
          value={locale}
          onChange={(e) => handleSetLang(e)}
          options={[
            { value: "es", label: "es" },
            { value: "en", label: "en" },
          ]}
        />
      </section>
    </main>
  );
}
