import AppBar from "@/core/components/app-bar/AppBar";
import FooterBar from "@/core/components/footer-bar/FooterBar";
import { CustomPipeline } from "@/modules/user/store/presentation/components/CustomPipeline";
import Link from "next/link";
import Image from "next/image";
import Images from "@/core/assets/Images";

export default function CustomPage() {
  return (
    <main className="min-h-screen flex flex-col bg-[#FAF3E0]">
      <div className="relative z-50">
        <div className="flex h-[60px] md:h-[70px]">
          <div className="relative w-[100px] h-[86px] ml-3 lg:ml-8 md:-mt-1 overflow-visible">
            <Link href="/es">
              <Image
                src={Images.logoShortOpacity}
                alt="Hey Cookie"
                width={100}
                height={100}
                className="absolute cursor-pointer"
              />
            </Link>
          </div>
          <AppBar />
        </div>
      </div>

      <section className="flex-1 overflow-y-auto">
        <CustomPipeline />
      </section>

      <FooterBar />
    </main>
  );
}
