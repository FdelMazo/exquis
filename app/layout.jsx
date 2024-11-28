import "@fontsource/almendra";
import "@fontsource/creepster";
import "@fontsource/libre-baskerville";
import { Providers } from "./providers";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <title>Los Años 20 | Exquis</title>
      <link rel="shortcut icon" href="/static/favicon.png"></link>
      <meta name="viewport" content="width=device-width, initial-scale=1" />

      <body
        style={{
          backgroundImage: "url('static/texture.jpg')",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
        }}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
