// Sans geométrica de los paneles internos (admin y club): más legible en
// tablas y formularios. Se aplica junto con la clase `.admin-ui`.
import { Plus_Jakarta_Sans } from "next/font/google";

export const panelFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-admin",
});
