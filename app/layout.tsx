import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "maako fangajei",
  description: "robotics, reinforcement learning, embedded ml",
  metadataBase: new URL("https://maako.dev"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${plexMono.variable} h-full antialiased`}
    >
      <head>
        <script
          data-goatcounter="https://mfangajei.goatcounter.com/count"
          data-goatcounter-settings='{"no_onload": true}'
          async
          src="//gc.zgo.at/count.js"
        ></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function () {
              function track() {
                if (window.goatcounter && window.goatcounter.count) {
                  window.goatcounter.count();
                }
                var params = new URLSearchParams(window.location.search);
                var source = params.get("utm_source");
                if (source === "linkedin" || source === "resume") {
                  window.history.replaceState(null, "", window.location.pathname + window.location.hash);
                }
              }
              if (document.readyState === "complete") {
                track();
              } else {
                window.addEventListener("load", track);
              }
            })();`,
          }}
        ></script>
      </head>
      <body className="min-h-full flex flex-col bg-paper text-graphite">
        {children}
      </body>
    </html>
  );
}
