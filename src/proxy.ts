import createMiddleware from 'next-intl/middleware';
import {routing} from '@/i18n/routing';

export default createMiddleware({
  ...routing,
  // Ensure this is set if you want the URL to stay clean
  localePrefix: 'never' 
});

export const config = {
  // Match only internationalized pathnames
  // This is the critical part: it must exclude static files and API routes
  matcher: ['/', '/(en|ar|es|de)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)']
};
