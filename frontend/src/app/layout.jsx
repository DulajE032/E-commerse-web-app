import '../index.css';
import '../App.css';
import Providers from './Providers';

export const metadata = {
  title: 'Tech Store',
  description: 'AI-Powered E-commerce App',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
