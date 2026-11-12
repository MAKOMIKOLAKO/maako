import Footer from "@/components/Footer";

export const metadata = {
  title: "Photo21 — maako fangajei",
};

export default function CopyrightClaim() {
  return (
    <div className="relative flex flex-1 flex-col">
      <main className="mx-auto w-full max-w-3xl px-6 sm:px-8 py-16">
        <a href="/Photo21.JPG">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/Photo21.JPG"
            alt="Photo21 — two people overlooking a river valley, original photograph by maako fangajei"
            className="w-full h-auto"
          />
        </a>
        <p className="mt-4 text-sm">
          Photo21 — original photograph © maako fangajei.{" "}
          <a href="/Photo21.JPG" className="underline">
            Full-resolution original
          </a>
        </p>
      </main>
      <div className="mx-auto w-full max-w-3xl px-6 sm:px-8">
        <Footer />
      </div>
    </div>
  );
}
