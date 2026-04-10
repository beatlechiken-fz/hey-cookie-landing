import { useState } from "react";
import { CakeSizeKey, sizePriority } from "../helpers/cakeSizeLabels";
import { JellyTypeKey } from "../helpers/jellyTypeLabels";
import { jellyTypes } from "../helpers/jellyTypeLabels";

export function useCakeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCake, setSelectedCake] = useState<any | null>(null);

  const [selectedSize, setSelectedSize] = useState<CakeSizeKey | null>(null);
  const [selectedJelly, setSelectedJelly] = useState<JellyTypeKey | null>(null);

  const openModal = (cake: any) => {
    setSelectedCake(cake);

    // 🔥 Autoseleccionar tamaño
    const availableSizes = Object.keys(cake).filter((key) =>
      key.startsWith("size"),
    ) as CakeSizeKey[];

    const bestSize =
      sizePriority.find((s) => availableSizes.includes(s)) ?? null;
    setSelectedSize(bestSize);

    // 🔥 Autoseleccionar jalea
    const availableJellies = Object.keys(cake).filter((key) =>
      Object.keys(jellyTypes).includes(key),
    ) as JellyTypeKey[];

    setSelectedJelly(availableJellies[0] ?? null);

    setIsOpen(true);
  };

  const closeModal = () => setIsOpen(false);

  return {
    isOpen,
    selectedCake,
    selectedSize,
    selectedJelly,
    setSelectedSize,
    setSelectedJelly,
    openModal,
    closeModal,
  };
}
