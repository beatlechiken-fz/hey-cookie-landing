import { useState } from "react";
import { CakeSizeKey } from "../helpers/cakeSizeLabels";

export function useCakeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCake, setSelectedCake] = useState<any | null>(null);
  const [selectedSize, setSelectedSize] = useState<CakeSizeKey | null>(null);

  const openModal = (cake: any) => {
    setSelectedCake(cake);
    setSelectedSize(null);
    setIsOpen(true);
  };

  const closeModal = () => setIsOpen(false);

  return {
    isOpen,
    selectedCake,
    selectedSize,
    setSelectedSize,
    openModal,
    closeModal,
  };
}
