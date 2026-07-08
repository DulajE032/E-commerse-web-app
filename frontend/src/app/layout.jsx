import { Inter, Sora, Black_Ops_One } from 'next/font/google';
import '../index.css';
import '../App.css';
import Providers from './Providers';

// 1. Black Ops One (FIXED)
const blackOpsOne = Black_Ops_One({ 
  weight: '400', 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-black-ops', 
});

// 2. Inter
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter', 
});

// 3. Sora
const sora = Sora({
  subsets: ['latin'],
  display: 'swap',
  weight: ['700', '800'], 
  variable: '--font-logo',
});

export const metadata = {
  title: 'Tech Store',
  description: 'AI-Powered E-commerce App',
};

export default function RootLayout({ children }) {
  return (
    // ✅ Now all three variables will perfectly inject into the HTML
    <html lang="en" className={`${inter.variable} ${blackOpsOne.variable} ${sora.variable}`}>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}