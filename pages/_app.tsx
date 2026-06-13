import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { Playfair_Display, DM_Sans } from 'next/font/google';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div className={`${playfair.variable} ${dmSans.variable}`}>
      <Component {...pageProps} />
    </div>
  );
}
