import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Middleware de protección de rutas.
 * Redirige a /login si no hay sesión activa de Supabase.
 * Rutas protegidas: /solicitud, /portal, /admin (y subrutas).
 */
export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Use getUser instead of getSession to ensure accurate auth state
  const { data: { user } } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // BARRERA DE SEGURIDAD SECUNDARIA (Dominio)
  const isGoogleLogin = user?.app_metadata?.provider === 'google';
  if (user && isGoogleLogin && user.email && !user.email.endsWith("@duocuc.cl")) {
    await supabase.auth.signOut();
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('error', 'invalid_domain');
    return NextResponse.redirect(loginUrl);
  }

  // PROTECCIÓN DE RUTAS DE ADMINISTRADOR
  const isAdminRoute = pathname.startsWith('/admin');
  const isLoginAdminRoute = pathname === '/admin/login';

  if (isAdminRoute && !isLoginAdminRoute && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/admin/login';
    return NextResponse.redirect(redirectUrl);
  }

  if (isLoginAdminRoute && user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/admin';
    return NextResponse.redirect(redirectUrl);
  }

  // PROTECCIÓN DE RUTAS DE ESTUDIANTE
  const isStudentProtected = ['/solicitud', '/perfil'].some((path) => pathname.startsWith(path));

  if (isStudentProtected && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === '/login' && user) {
    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = '/';
    return NextResponse.redirect(homeUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Aplica el middleware a todas las rutas EXCEPTO:
     * - Archivos estáticos de Next.js (_next/static, _next/image)
     * - favicon.ico, archivos de imagen pública
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
