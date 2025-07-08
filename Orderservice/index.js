import { Hono } from "hono";
const app=new Hono();
Bun.serve({
    port: 3000,
    fetch: app.fetch,
}); 