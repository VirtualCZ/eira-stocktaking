import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function GET(request) {
  try {
    // Get token from URL query parameters
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    
    if (!token) {
      return new Response('No token provided', {
        status: 302,
        headers: {
          'Location': '/error'
        }
      });
    }
    
    // Get host from headers (await in Next.js 15)
    const headersList = await headers();
    const host = headersList.get('host');
    const protocol = headersList.get('x-forwarded-proto') || 'http';
    
    if (!host) {
      console.error('No host header found');
      return new Response('No host header', {
        status: 302,
        headers: {
          'Location': '/error'
        }
      });
    }
    
    // Create response with redirect header
    const response = new Response('Redirecting...', {
      status: 302,
      headers: {
        'Location': '/',
        'Set-Cookie': `auth_token=${token}; Path=/; Max-Age=86400; SameSite=Lax; ${protocol === 'https' ? 'Secure;' : ''}`
      }
    });
    
    return response;
  } catch (error) {
    console.error('Auth error:', error);
    return new Response('Error occurred', {
      status: 302,
      headers: {
        'Location': '/error'
      }
    });
  }
} 