export const metadata = {
  title: "Life Calendar API",
  description: "A configurable life/goal calendar image API."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
