import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

/**
 * Proxy de Next.js 16 (anteriormente Middleware).
 * Gestiona la persistencia de sesión de Supabase y la protección de rutas.
 */
export async function proxy(request: NextRequest) {
  const { response, supabase } = await updateSession(request)
  
  // Obtenemos el usuario de forma segura
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl;

  // 1. BARRERA DE SEGURIDAD: Validación de Dominio (Solo para Google)
  const isGoogleLogin = user?.app_metadata?.provider === 'google';
  if (user && isGoogleLogin && user.email && !user.email.endsWith("@duocuc.cl")) {
    await supabase.auth.signOut();
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('error', 'invalid_domain');
    return NextResponse.redirect(loginUrl);
  }

  // 2. PROTECCIÓN DE RUTAS
  const isAdminRoute = pathname.startsWith('/admin');
  const isLoginAdminRoute = pathname === '/admin/login';
  const isStudentProtectedRoute = ['/solicitud', '/perfil'].some((path) => pathname.startsWith(path));

  // Redirección para Admin
  if (isAdminRoute && !isLoginAdminRoute && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/admin/login';
    return NextResponse.redirect(redirectUrl);
  }

  // Redirección para Estudiante
  if (isStudentProtectedRoute && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Evitar ir a login si ya está autenticado
  if ((pathname === '/login' || pathname === '/admin/login') && user) {
    const redirectPath = isAdminRoute ? '/admin' : '/';
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Aplica el proxy a todas las rutas EXCEPTO:
     * - Archivos estáticos de Next.js (_next/static, _next/image)
     * - favicon.ico, sitemap.xml, robots.txt
     * - Imágenes (svg, png, jpg, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
