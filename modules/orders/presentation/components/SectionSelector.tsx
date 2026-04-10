import { useTranslations } from "next-intl";

export default function SectionSelector({
  title,
  options,
  selected,
  onSelect,
  onNext,
  showBack = false,
  onBack,
}: any) {
  const t = useTranslations("orders");

  return (
    <div className="space-y-6">
      {/* TITLE */}
      <h2 className="text-xl font-semibold">{title}</h2>

      {/* OPTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {options.map((opt: any) => (
          <div
            key={opt.value}
            onClick={() => onSelect(opt.value)}
            className={`
              border rounded-lg overflow-hidden cursor-pointer transition-all duration-300
              transform hover:scale-[1.03]
              ${selected === opt.value ? "border-[#c87d87] border-2 shadow-lg" : "border-gray-300"}
            `}
          >
            <img src={opt.image} className="w-full h-40 object-cover" />
            <div className="p-3 font-medium text-center">{opt.label}</div>
          </div>
        ))}
      </div>

      {/* BUTTONS */}
      <div className="flex gap-3 pt-2">
        {/* BOTÓN BACK (opcional) */}
        {showBack && (
          <button
            onClick={onBack}
            className="
              w-full py-3 rounded-xl text-xl font-semibold
              transition-all duration-300 shadow-md

              bg-[#c87d87]              /* palo de rosa oscuro */
              text-white
              hover:bg-[#b36b76]        /* más profundo */
              active:bg-[#9d5c66]
              cursor-pointer
            "
          >
            {t("back")}
          </button>
        )}

        {/* BOTÓN NEXT */}
        {selected && (
          <button
            onClick={onNext}
            className="
              w-full py-3 rounded-xl text-xl font-semibold
              transition-all duration-300 shadow-md

              bg-[#8a5a2f]           /* café caramelo oscuro */
              text-[#fff7f1]         /* crema suave */
              hover:bg-[#754a26]     /* caramelo más profundo */
              active:bg-[#60401e]
              cursor-pointer
            "
          >
            {t("next")}
          </button>
        )}
      </div>
    </div>
  );
}
