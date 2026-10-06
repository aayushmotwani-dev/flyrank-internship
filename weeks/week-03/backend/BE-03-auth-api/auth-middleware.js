function bearerToken(request) {
  const header = request.get("authorization");
  if (!header || !header.startsWith("Bearer ")) return null;
  const token = header.slice("Bearer ".length).trim();
  return token || null;
}

export function requireUser(authClient) {
  return async (request, response, next) => {
    const token = bearerToken(request);
    if (!token) return response.status(401).json({ error: "Access token required" });

    const { data, error } = await authClient.auth.getUser(token);
    if (error || !data?.user) return response.status(401).json({ error: "Invalid or expired token" });

    request.accessToken = token;
    request.user = data.user;
    return next();
  };
}

export { bearerToken };
