import type { Env } from "./types";
import { handleVisit } from "./visit";
import { requireAdmin } from "./auth";
import { renderDashboard } from "./dashboard";

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/visit" && request.method === "POST") {
      return handleVisit(request, env, ctx);
    }

    if (url.pathname.startsWith("/admin")) {
      const authFailure = requireAdmin(request, env);
      if (authFailure) return authFailure;
      return renderDashboard(request, env);
    }

    return new Response("Not found", { status: 404 });
  },
};
