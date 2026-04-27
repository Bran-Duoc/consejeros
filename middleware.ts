import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'
import { createClient } from '@/utils/supabase/server'

export async function middleware(request: NextRequest) {
  const { response, supabase } = await updateSession(request)
  
  const { data: { user } } = await supabase.auth.getUser()

  const isProtectedRoute = request.nextUrl.pathname.startsWith('/perfil') || 
                          request.nextUrl.pathname.startsWith('/solicitud') ||
                          request.nextUrl.pathname.startsWith('/admin')
  
  if (isProtectedRoute && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  // Si intenta acceder a /admin pero no es admin o consejero
  if (request.nextUrl.pathname.startsWith('/admin') && user) {
    // Aquí podríamos verificar el rol desde la DB si quisiéramos ser estrictos, 
    // pero por ahora el AppContext maneja la redirección post-login.
    // Una verificación aquí requeriría una consulta a la DB en cada request de admin.
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
