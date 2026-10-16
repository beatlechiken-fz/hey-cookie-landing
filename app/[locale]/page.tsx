import { getTranslations } from "next-intl/server";
import FooterBar from "@/core/components/footer-bar/FooterBar";
import SectionCover, { BandaTemporada } from "@/core/components/section-cover/SectionCover";
import { portadaDe } from "@/core/data/portadas";
import { Link } from "@/i18n/navigation";
import Hero from "@/modules/home/presentation/components/Hero";
import Cookies from "@/modules/home/presentation/components/Cookies";
import CategoryCards from "@/modules/home/presentation/components/CategoryCards";
import SectionChips from "@/modules/home/presentation/components/SectionChips";
import { ArmaTuPastelBlock, EventosBlock } from "@/modules/home/presentation/components/HomeFeatures";
import ProductGrid from "@/modules/cake/presentation/components/ProductGrid";
import { fetchCatalogoPublico } from "@/modules/cake/data/datasources/CatalogoPublico.datasource";
import { getSupabaseAdmin } from "@/core/helpers/supabase";
import type { GalletaPublica } from "@/modules/home/presentation/components/Cookies";
import { parsePromo } from "@/modules/admin/store/domain/entities/Promocion.entity";
import type { ColeccionProducto } from "@/modules/admin/store/domain/entities/Producto.entity";

// Menú de temporada en PDF (public/menus), el mismo que enlaza /halloween.
const MENU_PDF = "/menus/menu-halloween-dia-de-muertos.pdf";

/**
 * Galletas activas de una línea (sweet/fitness) del catálogo regular, o de una
 * colección de temporada (cualquier línea; cada galleta conserva su etiqueta).
 */
async function fetchGalletas(
  filtro: { linea: "sweet" | "fitness" } | { coleccion: ColeccionProducto },
): Promise<GalletaPublica[]> {
  try {
    let q = getSupabaseAdmin()
      .from("productos")
      .select("id, nombre, descripcion, imagen_url, precio_establecido, promo, linea")
      .eq("categoria", "cookie")
      .eq("activo", true);
    q =
      "coleccion" in filtro
        ? q.eq("coleccion", filtro.coleccion)
        : q.eq("linea", filtro.linea).is("coleccion", null);
    const { data, error } = await q.order("nombre");

    if (error) return [];

    return (data ?? []).map((row: any): GalletaPublica => ({
      id: row.id,
      nombre: row.nombre,
      descripcion: row.descripcion ?? null,
      imagenUrl: row.imagen_url ?? null,
      precioEstablecido: row.precio_establecido != null ? Number(row.precio_establecido) : null,
      linea: row.linea ?? ("linea" in filtro ? filtro.linea : "sweet"),
      promo: parsePromo(row.promo),
    }));
  } catch {
    return [];
  }
}

const CONTENIDO = "mx-auto max-w-6xl px-4 pb-10 pt-14 sm:px-6 md:pt-20";

export default async function Home() {
  const [halloween, sweet, fitness, pasteles, t, tc] = await Promise.all([
    fetchGalletas({ coleccion: "halloween-muertos" }),
    fetchGalletas({ linea: "sweet" }),
    fetchGalletas({ linea: "fitness" }),
    fetchCatalogoPublico("pastel", { soloRegulares: true }),
    getTranslations("home"),
    getTranslations("cookies"),
  ]);

  return (
    <main className="bg-crema min-h-full">
      <Hero />

      <CategoryCards />

      <SectionChips />

      <BandaTemporada
        id="temporada"
        kicker={t("temporada.kicker")}
        titulo={tc("titleHalloween")}
        descripcion={t("temporada.desc")}
        imagen={portadaDe("temporada", halloween[0]?.imagenUrl)}
        anterior="#FAF3E0"
        siguiente="#F6DDE4"
        acciones={
          <>
            <Link
              href="/halloween"
              className="inline-flex rounded-full bg-calabaza px-5 py-2.5 font-body text-sm font-semibold text-noche transition-colors hover:bg-calabaza-hover"
            >
              {t("temporada.verMenu")}
            </Link>
            <a
              href={MENU_PDF}
              download
              className="inline-flex rounded-full border-2 border-crema/70 px-5 py-2 font-body text-sm font-semibold text-crema transition-colors hover:bg-crema hover:text-noche"
            >
              PDF
            </a>
          </>
        }
      >
        <Cookies productos={halloween} tono="noche" mostrarLinea oscuro />
      </BandaTemporada>

      <section aria-label={tc("title")}>
        <SectionCover
          id="galletas"
          kicker={t("galletas.kicker")}
          titulo={tc("title")}
          descripcion={t("galletas.desc")}
          tono="rosa"
          imagen={portadaDe("galletas", sweet[0]?.imagenUrl)}
        />
        <div className={CONTENIDO}>
          <Cookies productos={sweet} />
        </div>
      </section>

      <section aria-label={tc("titleFiness")}>
        <SectionCover
          id="fitness"
          kicker={t("fitness.kicker")}
          titulo={tc("titleFiness")}
          descripcion={t("fitness.desc")}
          tono="olivo"
          imagen={portadaDe("fitness", fitness[0]?.imagenUrl)}
        />
        <div className={CONTENIDO}>
          <Cookies productos={fitness} />
        </div>
      </section>

      <section aria-label={t("pasteles.kicker")}>
        <SectionCover
          id="pasteles"
          kicker={t("pasteles.kicker")}
          titulo={t("chips.pasteles")}
          descripcion={t("pasteles.desc")}
          tono="caramelo"
          imagen={portadaDe("pasteles", pasteles.productos[0]?.imagenUrl)}
          acciones={
            <Link
              href="/cake"
              className="inline-flex rounded-full border-2 border-espresso/70 px-5 py-2 font-body text-sm font-semibold text-espresso transition-colors hover:bg-espresso hover:text-crema"
            >
              {t("pasteles.verTodos")}
            </Link>
          }
        />
        <div className={CONTENIDO}>
          <ProductGrid
            items={pasteles.productos.map((producto) => ({
              producto,
              precio: pasteles.precios[producto.id] ?? null,
            }))}
          />
        </div>
      </section>

      <ArmaTuPastelBlock />

      <EventosBlock />

      <FooterBar />
    </main>
  );
}
