import { withAuth } from "next-auth/middleware";

// NextAuth v4 middleware compatible with Next.js 16 Proxy
export const proxy = withAuth({
  pages: {
    signIn: "/login",
  },
});

export default proxy;

export const config = {
  matcher: ["/dashboard/:path*", "/pathway/:path*"],
};
