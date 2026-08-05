import { Inter, Plus_Jakarta_Sans, Black_Ops_One } from 'next/font/google';
import '../index.css';
import '../App.css';
import Providers from './Providers';
import ScrollButtons from '../components/ScrollButtons';

// 1. Black Ops One (Logo Font)
const blackOpsOne = Black_Ops_One({ 
  weight: '400', 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-black-ops', 
});

// 2. Inter (Body Font)
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter', 
});

// 3. Plus Jakarta Sans (Professional Heading Font)
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'], 
  variable: '--font-heading',
});

export const metadata = {
  title: 'Tech Store',
  description: 'AI-Powered E-commerce App',
};

export default function RootLayout({ children }) {
  return (
    // ✅ Injecting the new highly professional font stack
    <html lang="en" className={`${inter.variable} ${blackOpsOne.variable} ${plusJakartaSans.variable}`}>
      <body>
        <Providers>
          {children}
          <ScrollButtons />
        </Providers>
      </body>
    </html>
  );
}