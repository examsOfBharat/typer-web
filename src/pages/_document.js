import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Character Set */}
        <meta charSet="utf-8" />

        {/* Theme Color for browsers */}
        <meta name="theme-color" content="#0a0a0f" />
        <meta name="msapplication-TileColor" content="#0a0a0f" />

        {/* Favicon and Icons */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />

        {/* Preconnect to external resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Site verification (add your actual verification codes) */}
        {/* <meta name="google-site-verification" content="YOUR_GOOGLE_VERIFICATION_CODE" /> */}

        {/* Global SEO Meta Tags */}
        <meta name="robots" content="index, follow" />
        <meta name="author" content="ExamsOfBharat" />
        <meta name="publisher" content="ExamsOfBharat" />
        <meta name="copyright" content="© 2024 TyperPro by ExamsOfBharat" />
        <meta name="language" content="English" />
        <meta name="revisit-after" content="7 days" />
        <meta name="rating" content="general" />

        {/* Geo Tags */}
        <meta name="geo.region" content="IN" />
        <meta name="geo.placename" content="India" />

        {/* Application Type */}
        <meta name="application-name" content="TyperPro" />
        <meta name="apple-mobile-web-app-title" content="TyperPro" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />

        {/* Format Detection */}
        <meta name="format-detection" content="telephone=no" />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
