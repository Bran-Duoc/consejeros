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

  // Obtener la sesión actual (no lanza error, devuelve null si no hay sesión)
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { pathname } = request.nextUrl;

  // Rutas que requieren sesión activa
  const protectedPaths = ['/solicitud', '/portal', '/admin'];
  const isProtected = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );

  // Si la ruta está protegida y no hay sesión, redirigir a /login
  if (isProtected && !session) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    // Guardar la ruta de origen para redirigir después del login
    loginUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Si ya hay sesión y se intenta acceder a /login, redirigir al inicio
  if (pathname === '/login' && session) {
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
