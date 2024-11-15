import { Providers } from "./providers";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
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
