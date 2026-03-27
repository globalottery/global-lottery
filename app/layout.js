import './globals.css';

export const metadata = {
  title: 'Global Lottery',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}