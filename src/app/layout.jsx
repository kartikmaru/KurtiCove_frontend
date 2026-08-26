import './globals.css'
import { Playfair_Display, Poppins, Dancing_Script } from 'next/font/google'
import ReduxProvider from '../redux/ReduxProvider'
import { Toaster } from 'react-hot-toast'
import Header from '../components/user/Header'
import Footer from '../components/user/Footer'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
})

const dancing = Dancing_Script({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-dancing',
  display: 'swap',
})

export const metadata = {
  title: 'Kurti Cove — Ethnic Wear for Every Woman',
  description:
    'Discover handpicked kurtis that blend Indian tradition with modern elegance. Shop new arrivals, bestsellers and festive collections at Kurti Cove.',
  keywords: 'kurti, kurta, indian ethnic wear, women fashion, anarkali, cotton kurti',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${playfair.variable} ${poppins.variable} ${dancing.variable}`}>
      <body className="font-sans bg-[#FAF5FF] text-[#3B0764] antialiased">
        <ReduxProvider>
          {/* Header renders on every page — fixed, floats above content */}
          <Header />
          {/*
            No pt-20 here — Header component itself renders a spacer div
            (h-16 md:h-20) that pushes content below the fixed header.
            HeroBanner uses -mt-16 md:-mt-20 to cancel that spacer for the
            hero slider only.
          */}
          <main className="min-h-screen">
            {children}
          </main>
          {/* Footer renders on every page */}
          <Footer />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#FAF5FF',
                color: '#3B0764',
                border: '1px solid #E9D5FF',
                borderRadius: '12px',
                fontFamily: 'Poppins, sans-serif',
                fontSize: '13px',
              },
              success: {
                iconTheme: { primary: '#A855F7', secondary: '#FAF5FF' },
              },
            }}
          />
        </ReduxProvider>
      </body>
    </html>
  )
}
