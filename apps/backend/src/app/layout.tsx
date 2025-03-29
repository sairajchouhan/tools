export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <h1>
          <center>502 Bad Gateway</center>
        </h1>
        <hr />
        <center>nginx/1.19.6</center>
      </body>
    </html>
  );
}
