import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const token = formData.get('token');
    
    if (!token) {
      return new Response('No token provided', {
        status: 302,
        headers: {
          'Location': 'https://localhost:3000/error'
        }
      });
    }
    
    // Get host from headers (await in Next.js 15)
    const headersList = await headers();
    const host = headersList.get('host');
    
    if (!host) {
      console.error('No host header found');
      return new Response('No host header', {
        status: 302,
        headers: {
          'Location': 'https://localhost:3000/error'
        }
      });
    }
    
    // Create response with redirect header
    const response = new Response('Redirecting...', {
      status: 302,
      headers: {
        'Location': 'https://localhost:3000/',
        'Set-Cookie': `auth_token=${token}; Path=/; Max-Age=86400; SameSite=Lax; Secure`
      }
    });
    
    return response;
  } catch (error) {
    console.error('Auth error:', error);
    return new Response('Error occurred', {
      status: 302,
      headers: {
        'Location': 'https://localhost:3000/error'
      }
    });
  }
} 