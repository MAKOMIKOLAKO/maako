import Footer from "@/components/Footer";

export const metadata = {
  title: "Privacy — maako fangajei",
};

export default function Privacy() {
  return (
    <div className="relative flex flex-1 flex-col">
      <main className="mx-auto w-full max-w-3xl px-6 sm:px-8 py-16 prose">
        <h1>Privacy</h1>
        <p>
          This site logs basic visit data for analytics purposes: IP address,
          browser/OS/device type, referring page, the page path visited, and
          any query parameters. IP addresses are used to identify the
          visiting organization (e.g. company or ISP name) via a third-party
          IP lookup service; this lookup is skipped if your browser sends a
          Do Not Track or Global Privacy Control signal.
        </p>
        <p>
          A first-party cookie is set to recognize repeat visits from the
          same browser. This only identifies the same browser/device, not a
          person — clearing cookies, private browsing, or using a different
          device resets it. No fingerprinting or third-party tracking is
          used.
        </p>
        <p>
          This data is not sold, shared, or made public. If you have
          questions, contact reachmaako@gmail.com.
        </p>
      </main>
      <div className="mx-auto w-full max-w-3xl px-6 sm:px-8">
        <Footer />
      </div>
    </div>
  );
}
