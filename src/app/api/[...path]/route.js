const API_BASE_URL = (process.env.API_BASE_URL || "http://localhost:8088")
  .trim()
  .replace(/\/$/, "");

function buildTargetUrl(baseUrl, pathSegments, requestUrl) {
  const joinedPath = (pathSegments || []).join("/");
  const incomingUrl = new URL(requestUrl);
  const targetUrl = new URL(
    `${baseUrl}/api/inventory/${joinedPath}${incomingUrl.search}`
  );
  return targetUrl.toString();
}

function buildForwardHeaders(requestHeaders) {
  const headers = new Headers(requestHeaders);
  headers.delete("host");
  headers.delete("content-length");
  return headers;
}

async function proxy(request, context) {
  try {
    const params = await context?.params;
    const pathSegments = params?.path;
    const targetUrl = buildTargetUrl(API_BASE_URL, pathSegments, request.url);

    const method = request.method;
    const hasBody = method !== "GET" && method !== "HEAD";
    const headers = buildForwardHeaders(request.headers);

    const upstreamResponse = await fetch(targetUrl, {
      method,
      headers,
      body: hasBody ? await request.text() : undefined,
      cache: "no-store",
    });

    const responseHeaders = new Headers(upstreamResponse.headers);
    responseHeaders.delete("content-encoding");
    responseHeaders.delete("content-length");

    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    return Response.json(
      {
        error: "Proxy request failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 502 }
    );
  }
}

export async function GET(request, context) {
  return proxy(request, context);
}

export async function POST(request, context) {
  return proxy(request, context);
}

export async function PUT(request, context) {
  return proxy(request, context);
}

export async function PATCH(request, context) {
  return proxy(request, context);
}

export async function DELETE(request, context) {
  return proxy(request, context);
}
