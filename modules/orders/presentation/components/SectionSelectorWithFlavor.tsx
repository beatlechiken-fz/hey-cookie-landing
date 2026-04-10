import { useTranslations } from "next-intl";

export default function SectionSelectorWithFlavor({
  title,
  options,
  flavors,
  selected,
  onSelect,
  onSelectFlavor,
  onSelectLiquor,
  onNext,
  onBack,
  showBack = false,
  showLiquorToggle = false,
}: any) {
  const t = useTranslations("orders");

  return (
    <div className="space-y-6">
      {/* TÍTULO */}
      <h2 className="text-xl font-semibold">{title}</h2>

      {/* GRID OPCIONES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {options.map((opt: any) => (
          <div
            key={opt.value}
            onClick={() => onSelect(opt.value)}
            className={`
              border rounded-lg overflow-hidden cursor-pointer transition shadow-sm 
              ${selected.type === opt.value ? "border-pink-500 shadow-lg" : "border-gray-300"}
            `}
          >
            {opt.image && (
              <div className="overflow-hidden">
                <img
                  src={opt.image}
                  className="
                    w-full h-40 object-cover transition-transform duration-300 
                    hover:scale-105
                  "
                />
              </div>
            )}

            <div className="p-3">
              <p className="font-medium">{opt.label}</p>
              {opt.desc && <p className="text-gray-500 text-sm">{opt.desc}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* SELECCIÓN DE SABOR */}
      {selected.type && (
        <div className="space-y-4">
          {/* Si el tipo es "ninguno", NO mostramos sabor */}
          {selected.type !== "ninguno" && (
            <>
              <p className="font-medium">Elige el sabor</p>

              <select
                value={selected.flavor}
                onChange={(e) => onSelectFlavor(e.target.value)}
                className="
            w-full p-3 rounded-xl border
            border-[#edcecc]
            bg-[#fff8f6]
            text-[#6b4a2b]
            shadow-sm
            focus:outline-none focus:ring-2 focus:ring-[#c87d87]
            [&>option[value='']]:text-[#d7bda6]
          "
              >
                <option value="">Selecciona sabor</option>
                {flavors.map((f: string) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </>
          )}

          {/* Toggle de licor SOLO si hay sabor y no es 'ninguno' */}
          {showLiquorToggle &&
            selected.type !== "ninguno" &&
            selected.flavor && (
              <div className="flex items-center justify-between bg-[#fff8f6] border border-[#edcecc] p-3 rounded-xl shadow-sm">
                <span className="text-[#6b4a2b] font-medium">
                  ¿Lleva licor?
                </span>

                <button
                  onClick={() => onSelectLiquor(!selected.withLiquor)}
                  className={`
              w-14 h-7 rounded-full flex items-center transition-all duration-300 px-1
              ${selected.withLiquor ? "bg-[#c87d87]" : "bg-[#d7bda6]"}
            `}
                >
                  <div
                    className={`
                w-5 h-5 rounded-full bg-white shadow-md transform transition-all duration-300
                ${selected.withLiquor ? "translate-x-7" : "translate-x-0"}
              `}
                  />
                </button>
              </div>
            )}

          {/* BOTONES */}
          <div className="flex gap-3 pt-2">
            {showBack && (
              <button
                onClick={onBack}
                className="
            w-1/2 py-3 rounded-xl text-lg font-semibold
            transition-all duration-300 shadow-md
            bg-[#c87d87] text-white hover:bg-[#b36b75]
          "
              >
                {t("back")}
              </button>
            )}

            {/* Reglas para botón NEXT */}
            {(selected.type === "ninguno" || selected.flavor) && (
              <button
                onClick={onNext}
                className="
            w-full py-3 rounded-xl text-lg font-semibold
            transition-all duration-300 shadow-md

            enabled:bg-[#8a5a2f]
            enabled:text-[#fff7f1]
            enabled:hover:bg-[#754a26]
            cursor-pointer

            disabled:bg-[#d7bda6]
            disabled:text-[#f2e8df]
            disabled:cursor-not-allowed
          "
              >
                {t("next")}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
