module.exports = [
"[project]/apps/frontend/lib/api-client.ts [app-ssr] (ecmascript, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.all([
  "server/chunks/ssr/_50945f11._.js",
  "server/chunks/ssr/[root-of-the-server]__cc560426._.js"
].map((chunk) => __turbopack_context__.l(chunk))).then(() => {
        return parentImport("[project]/apps/frontend/lib/api-client.ts [app-ssr] (ecmascript)");
    });
});
}),
];