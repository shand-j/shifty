(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/apps/frontend/components/ui/card.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Card",
    ()=>Card,
    "CardAction",
    ()=>CardAction,
    "CardContent",
    ()=>CardContent,
    "CardDescription",
    ()=>CardDescription,
    "CardFooter",
    ()=>CardFooter,
    "CardHeader",
    ()=>CardHeader,
    "CardTitle",
    ()=>CardTitle
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/frontend/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/frontend/lib/utils.ts [app-client] (ecmascript)");
;
;
function Card({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/apps/frontend/components/ui/card.tsx",
        lineNumber: 7,
        columnNumber: 5
    }, this);
}
_c = Card;
function CardHeader({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card-header",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/apps/frontend/components/ui/card.tsx",
        lineNumber: 20,
        columnNumber: 5
    }, this);
}
_c1 = CardHeader;
function CardTitle({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card-title",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('leading-none font-semibold', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/apps/frontend/components/ui/card.tsx",
        lineNumber: 33,
        columnNumber: 5
    }, this);
}
_c2 = CardTitle;
function CardDescription({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card-description",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('text-muted-foreground text-sm', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/apps/frontend/components/ui/card.tsx",
        lineNumber: 43,
        columnNumber: 5
    }, this);
}
_c3 = CardDescription;
function CardAction({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card-action",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('col-start-2 row-span-2 row-start-1 self-start justify-self-end', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/apps/frontend/components/ui/card.tsx",
        lineNumber: 53,
        columnNumber: 5
    }, this);
}
_c4 = CardAction;
function CardContent({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card-content",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('px-6', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/apps/frontend/components/ui/card.tsx",
        lineNumber: 66,
        columnNumber: 5
    }, this);
}
_c5 = CardContent;
function CardFooter({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card-footer",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('flex items-center px-6 [.border-t]:pt-6', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/apps/frontend/components/ui/card.tsx",
        lineNumber: 76,
        columnNumber: 5
    }, this);
}
_c6 = CardFooter;
;
var _c, _c1, _c2, _c3, _c4, _c5, _c6;
__turbopack_context__.k.register(_c, "Card");
__turbopack_context__.k.register(_c1, "CardHeader");
__turbopack_context__.k.register(_c2, "CardTitle");
__turbopack_context__.k.register(_c3, "CardDescription");
__turbopack_context__.k.register(_c4, "CardAction");
__turbopack_context__.k.register(_c5, "CardContent");
__turbopack_context__.k.register(_c6, "CardFooter");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/frontend/components/ui/input.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Input",
    ()=>Input
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/frontend/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/frontend/lib/utils.ts [app-client] (ecmascript)");
;
;
function Input({ className, type, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
        type: type,
        "data-slot": "input",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm', 'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]', 'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/apps/frontend/components/ui/input.tsx",
        lineNumber: 7,
        columnNumber: 5
    }, this);
}
_c = Input;
;
var _c;
__turbopack_context__.k.register(_c, "Input");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/frontend/components/ui/scroll-area.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ScrollArea",
    ()=>ScrollArea,
    "ScrollBar",
    ()=>ScrollBar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/frontend/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$scroll$2d$area$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/frontend/node_modules/@radix-ui/react-scroll-area/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/frontend/lib/utils.ts [app-client] (ecmascript)");
'use client';
;
;
;
function ScrollArea({ className, children, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$scroll$2d$area$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Root"], {
        "data-slot": "scroll-area",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('relative', className),
        ...props,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$scroll$2d$area$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Viewport"], {
                "data-slot": "scroll-area-viewport",
                className: "focus-visible:ring-ring/50 size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:outline-1",
                children: children
            }, void 0, false, {
                fileName: "[project]/apps/frontend/components/ui/scroll-area.tsx",
                lineNumber: 19,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ScrollBar, {}, void 0, false, {
                fileName: "[project]/apps/frontend/components/ui/scroll-area.tsx",
                lineNumber: 25,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$scroll$2d$area$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Corner"], {}, void 0, false, {
                fileName: "[project]/apps/frontend/components/ui/scroll-area.tsx",
                lineNumber: 26,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/frontend/components/ui/scroll-area.tsx",
        lineNumber: 14,
        columnNumber: 5
    }, this);
}
_c = ScrollArea;
function ScrollBar({ className, orientation = 'vertical', ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$scroll$2d$area$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ScrollAreaScrollbar"], {
        "data-slot": "scroll-area-scrollbar",
        orientation: orientation,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('flex touch-none p-px transition-colors select-none', orientation === 'vertical' && 'h-full w-2.5 border-l border-l-transparent', orientation === 'horizontal' && 'h-2.5 flex-col border-t border-t-transparent', className),
        ...props,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$scroll$2d$area$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ScrollAreaThumb"], {
            "data-slot": "scroll-area-thumb",
            className: "bg-border relative flex-1 rounded-full"
        }, void 0, false, {
            fileName: "[project]/apps/frontend/components/ui/scroll-area.tsx",
            lineNumber: 50,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/apps/frontend/components/ui/scroll-area.tsx",
        lineNumber: 37,
        columnNumber: 5
    }, this);
}
_c1 = ScrollBar;
;
var _c, _c1;
__turbopack_context__.k.register(_c, "ScrollArea");
__turbopack_context__.k.register(_c1, "ScrollBar");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/frontend/components/ui/tabs.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Tabs",
    ()=>Tabs,
    "TabsContent",
    ()=>TabsContent,
    "TabsList",
    ()=>TabsList,
    "TabsTrigger",
    ()=>TabsTrigger
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/frontend/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$tabs$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/frontend/node_modules/@radix-ui/react-tabs/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/frontend/lib/utils.ts [app-client] (ecmascript)");
'use client';
;
;
;
function Tabs({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$tabs$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Root"], {
        "data-slot": "tabs",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('flex flex-col gap-2', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/apps/frontend/components/ui/tabs.tsx",
        lineNumber: 13,
        columnNumber: 5
    }, this);
}
_c = Tabs;
function TabsList({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$tabs$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["List"], {
        "data-slot": "tabs-list",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/apps/frontend/components/ui/tabs.tsx",
        lineNumber: 26,
        columnNumber: 5
    }, this);
}
_c1 = TabsList;
function TabsTrigger({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$tabs$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Trigger"], {
        "data-slot": "tabs-trigger",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("data-[state=active]:bg-background dark:data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 text-foreground dark:text-muted-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/apps/frontend/components/ui/tabs.tsx",
        lineNumber: 42,
        columnNumber: 5
    }, this);
}
_c2 = TabsTrigger;
function TabsContent({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$tabs$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Content"], {
        "data-slot": "tabs-content",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('flex-1 outline-none', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/apps/frontend/components/ui/tabs.tsx",
        lineNumber: 58,
        columnNumber: 5
    }, this);
}
_c3 = TabsContent;
;
var _c, _c1, _c2, _c3;
__turbopack_context__.k.register(_c, "Tabs");
__turbopack_context__.k.register(_c1, "TabsList");
__turbopack_context__.k.register(_c2, "TabsTrigger");
__turbopack_context__.k.register(_c3, "TabsContent");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/frontend/components/ui/collapsible.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Collapsible",
    ()=>Collapsible,
    "CollapsibleContent",
    ()=>CollapsibleContent,
    "CollapsibleTrigger",
    ()=>CollapsibleTrigger
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/frontend/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$collapsible$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/frontend/node_modules/@radix-ui/react-collapsible/dist/index.mjs [app-client] (ecmascript)");
'use client';
;
;
function Collapsible({ ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$collapsible$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Root"], {
        "data-slot": "collapsible",
        ...props
    }, void 0, false, {
        fileName: "[project]/apps/frontend/components/ui/collapsible.tsx",
        lineNumber: 8,
        columnNumber: 10
    }, this);
}
_c = Collapsible;
function CollapsibleTrigger({ ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$collapsible$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CollapsibleTrigger"], {
        "data-slot": "collapsible-trigger",
        ...props
    }, void 0, false, {
        fileName: "[project]/apps/frontend/components/ui/collapsible.tsx",
        lineNumber: 15,
        columnNumber: 5
    }, this);
}
_c1 = CollapsibleTrigger;
function CollapsibleContent({ ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$collapsible$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CollapsibleContent"], {
        "data-slot": "collapsible-content",
        ...props
    }, void 0, false, {
        fileName: "[project]/apps/frontend/components/ui/collapsible.tsx",
        lineNumber: 26,
        columnNumber: 5
    }, this);
}
_c2 = CollapsibleContent;
;
var _c, _c1, _c2;
__turbopack_context__.k.register(_c, "Collapsible");
__turbopack_context__.k.register(_c1, "CollapsibleTrigger");
__turbopack_context__.k.register(_c2, "CollapsibleContent");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/frontend/components/api-docs/api-docs-hub.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ApiDocsHub",
    ()=>ApiDocsHub
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/frontend/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/frontend/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$code$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileCode2$3e$__ = __turbopack_context__.i("[project]/apps/frontend/node_modules/lucide-react/dist/esm/icons/file-code-2.js [app-client] (ecmascript) <export default as FileCode2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__ = __turbopack_context__.i("[project]/apps/frontend/node_modules/lucide-react/dist/esm/icons/search.js [app-client] (ecmascript) <export default as Search>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$copy$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Copy$3e$__ = __turbopack_context__.i("[project]/apps/frontend/node_modules/lucide-react/dist/esm/icons/copy.js [app-client] (ecmascript) <export default as Copy>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__ = __turbopack_context__.i("[project]/apps/frontend/node_modules/lucide-react/dist/esm/icons/check.js [app-client] (ecmascript) <export default as Check>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__ = __turbopack_context__.i("[project]/apps/frontend/node_modules/lucide-react/dist/esm/icons/chevron-right.js [app-client] (ecmascript) <export default as ChevronRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__ = __turbopack_context__.i("[project]/apps/frontend/node_modules/lucide-react/dist/esm/icons/chevron-down.js [app-client] (ecmascript) <export default as ChevronDown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Lock$3e$__ = __turbopack_context__.i("[project]/apps/frontend/node_modules/lucide-react/dist/esm/icons/lock.js [app-client] (ecmascript) <export default as Lock>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2d$open$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Unlock$3e$__ = __turbopack_context__.i("[project]/apps/frontend/node_modules/lucide-react/dist/esm/icons/lock-open.js [app-client] (ecmascript) <export default as Unlock>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__ = __turbopack_context__.i("[project]/apps/frontend/node_modules/lucide-react/dist/esm/icons/zap.js [app-client] (ecmascript) <export default as Zap>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$database$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Database$3e$__ = __turbopack_context__.i("[project]/apps/frontend/node_modules/lucide-react/dist/esm/icons/database.js [app-client] (ecmascript) <export default as Database>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__ = __turbopack_context__.i("[project]/apps/frontend/node_modules/lucide-react/dist/esm/icons/users.js [app-client] (ecmascript) <export default as Users>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$test$2d$tube$2d$diagonal$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TestTube2$3e$__ = __turbopack_context__.i("[project]/apps/frontend/node_modules/lucide-react/dist/esm/icons/test-tube-diagonal.js [app-client] (ecmascript) <export default as TestTube2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__ = __turbopack_context__.i("[project]/apps/frontend/node_modules/lucide-react/dist/esm/icons/sparkles.js [app-client] (ecmascript) <export default as Sparkles>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$play$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__PlayCircle$3e$__ = __turbopack_context__.i("[project]/apps/frontend/node_modules/lucide-react/dist/esm/icons/circle-play.js [app-client] (ecmascript) <export default as PlayCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$git$2d$branch$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__GitBranch$3e$__ = __turbopack_context__.i("[project]/apps/frontend/node_modules/lucide-react/dist/esm/icons/git-branch.js [app-client] (ecmascript) <export default as GitBranch>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chart$2d$column$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BarChart3$3e$__ = __turbopack_context__.i("[project]/apps/frontend/node_modules/lucide-react/dist/esm/icons/chart-column.js [app-client] (ecmascript) <export default as BarChart3>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$brain$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Brain$3e$__ = __turbopack_context__.i("[project]/apps/frontend/node_modules/lucide-react/dist/esm/icons/brain.js [app-client] (ecmascript) <export default as Brain>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trophy$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trophy$3e$__ = __turbopack_context__.i("[project]/apps/frontend/node_modules/lucide-react/dist/esm/icons/trophy.js [app-client] (ecmascript) <export default as Trophy>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$webhook$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Webhook$3e$__ = __turbopack_context__.i("[project]/apps/frontend/node_modules/lucide-react/dist/esm/icons/webhook.js [app-client] (ecmascript) <export default as Webhook>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$building$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Building2$3e$__ = __turbopack_context__.i("[project]/apps/frontend/node_modules/lucide-react/dist/esm/icons/building-2.js [app-client] (ecmascript) <export default as Building2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$target$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Target$3e$__ = __turbopack_context__.i("[project]/apps/frontend/node_modules/lucide-react/dist/esm/icons/target.js [app-client] (ecmascript) <export default as Target>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$folder$2d$kanban$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FolderKanban$3e$__ = __turbopack_context__.i("[project]/apps/frontend/node_modules/lucide-react/dist/esm/icons/folder-kanban.js [app-client] (ecmascript) <export default as FolderKanban>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2d$cog$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__UserCog$3e$__ = __turbopack_context__.i("[project]/apps/frontend/node_modules/lucide-react/dist/esm/icons/user-cog.js [app-client] (ecmascript) <export default as UserCog>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__ = __turbopack_context__.i("[project]/apps/frontend/node_modules/lucide-react/dist/esm/icons/settings.js [app-client] (ecmascript) <export default as Settings>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$activity$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Activity$3e$__ = __turbopack_context__.i("[project]/apps/frontend/node_modules/lucide-react/dist/esm/icons/activity.js [app-client] (ecmascript) <export default as Activity>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/frontend/components/ui/card.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/frontend/components/ui/input.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/frontend/components/ui/button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/frontend/components/ui/badge.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$components$2f$ui$2f$scroll$2d$area$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/frontend/components/ui/scroll-area.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$components$2f$ui$2f$tabs$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/frontend/components/ui/tabs.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$components$2f$ui$2f$collapsible$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/frontend/components/ui/collapsible.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
;
;
const apiSections = [
    {
        name: "Authentication",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Lock$3e$__["Lock"],
        description: "User authentication and session management",
        endpoints: [
            {
                method: "POST",
                path: "/api/auth/login",
                summary: "Authenticate user",
                description: "Authenticates a user with email and password, returns JWT tokens",
                auth: false,
                requestBody: {
                    email: "string (required)",
                    password: "string (required)"
                },
                responseBody: {
                    accessToken: "string",
                    refreshToken: "string",
                    user: {
                        id: "string",
                        email: "string",
                        name: "string",
                        persona: "po | dev | qa | designer | manager | gtm",
                        role: "admin | member | viewer"
                    },
                    expiresIn: "number (seconds)"
                }
            },
            {
                method: "POST",
                path: "/api/auth/refresh",
                summary: "Refresh access token",
                description: "Exchange refresh token for new access token",
                auth: false,
                requestBody: {
                    refreshToken: "string (required)"
                },
                responseBody: {
                    accessToken: "string",
                    expiresIn: "number"
                }
            },
            {
                method: "POST",
                path: "/api/auth/logout",
                summary: "Logout user",
                description: "Invalidates the current session and all tokens",
                auth: true,
                responseBody: {
                    success: "boolean"
                }
            }
        ]
    },
    {
        name: "Organization",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$building$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Building2$3e$__["Building2"],
        description: "Organization-level management and insights",
        endpoints: [
            {
                method: "GET",
                path: "/api/organization",
                summary: "Get organization overview",
                description: "Returns aggregated organization metrics, maturity distribution, and quality scores",
                auth: true,
                responseBody: {
                    id: "string",
                    name: "string",
                    slug: "string",
                    metrics: {
                        totalTeams: "number",
                        totalProjects: "number",
                        totalMembers: "number",
                        avgMaturityScore: "number (0-100)",
                        avgAdoptionScore: "number (0-100)",
                        qualityCultureScore: "number (0-100)"
                    },
                    maturityDistribution: {
                        learning: "number",
                        developing: "number",
                        established: "number",
                        optimizing: "number",
                        leading: "number"
                    },
                    doraMetrics: {
                        deploymentFrequency: "string",
                        leadTime: "string",
                        changeFailureRate: "number (percentage)",
                        mttr: "string"
                    }
                }
            },
            {
                method: "GET",
                path: "/api/organization/leaderboard",
                summary: "Get organization leaderboard",
                description: "Returns top performers across the organization by XP, contributions, and quality metrics",
                auth: true,
                queryParams: [
                    {
                        name: "metric",
                        type: "string",
                        required: false,
                        description: "xp | healings | tests | sessions"
                    },
                    {
                        name: "limit",
                        type: "number",
                        required: false,
                        description: "Number of results (default: 10)"
                    }
                ],
                responseBody: {
                    leaders: [
                        {
                            rank: "number",
                            userId: "string",
                            name: "string",
                            avatar: "string",
                            teamId: "string",
                            teamName: "string",
                            xp: "number",
                            contributions: "number",
                            accuracy: "number"
                        }
                    ]
                }
            },
            {
                method: "GET",
                path: "/api/organization/culture-assessment",
                summary: "Get quality culture assessment",
                description: "Returns detailed quality culture metrics and recommendations",
                auth: true,
                responseBody: {
                    overall: "number (0-100)",
                    dimensions: {
                        testFirst: "number",
                        collaboration: "number",
                        continuousImprovement: "number",
                        ownership: "number",
                        automation: "number"
                    },
                    recommendations: [
                        "string"
                    ],
                    benchmarks: {
                        industry: "number",
                        similar_size: "number"
                    }
                }
            }
        ]
    },
    {
        name: "Teams",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"],
        description: "Team management, maturity tracking, and collaboration",
        endpoints: [
            {
                method: "GET",
                path: "/api/teams",
                summary: "List all teams",
                description: "Returns all teams with maturity levels and key metrics",
                auth: true,
                queryParams: [
                    {
                        name: "maturityLevel",
                        type: "string",
                        required: false,
                        description: "Filter by maturity: learning | developing | established | optimizing | leading"
                    },
                    {
                        name: "needsAttention",
                        type: "boolean",
                        required: false,
                        description: "Filter teams flagged for attention"
                    },
                    {
                        name: "sortBy",
                        type: "string",
                        required: false,
                        description: "maturity | adoption | testCoverage | name"
                    }
                ],
                responseBody: {
                    teams: [
                        {
                            id: "string",
                            name: "string",
                            slug: "string",
                            maturityLevel: "learning | developing | established | optimizing | leading",
                            maturityScore: "number (0-100)",
                            adoptionScore: "number (0-100)",
                            testCoverage: "number (percentage)",
                            memberCount: "number",
                            projectCount: "number",
                            needsAttention: "boolean",
                            attentionReason: "string | null"
                        }
                    ],
                    total: "number"
                }
            },
            {
                method: "GET",
                path: "/api/teams/:id",
                summary: "Get team details",
                description: "Returns comprehensive team information including members, projects, and metrics",
                auth: true,
                responseBody: {
                    id: "string",
                    name: "string",
                    description: "string",
                    maturityLevel: "string",
                    maturityScore: "number",
                    metrics: {
                        testCoverage: "number",
                        passRate: "number",
                        healingsAccepted: "number",
                        avgCycleTime: "string",
                        flakyTestRate: "number"
                    },
                    cultureScores: {
                        testFirst: "number",
                        collaboration: "number",
                        ownership: "number"
                    },
                    members: [
                        {
                            id: "string",
                            name: "string",
                            avatar: "string",
                            role: "string",
                            xp: "number",
                            needsAttention: "boolean"
                        }
                    ],
                    projects: [
                        {
                            id: "string",
                            name: "string",
                            status: "string",
                            confidence: "number"
                        }
                    ],
                    recentActivity: [
                        {
                            type: "string",
                            description: "string",
                            userId: "string",
                            timestamp: "ISO 8601"
                        }
                    ]
                }
            },
            {
                method: "GET",
                path: "/api/teams/:id/maturity-assessment",
                summary: "Get team maturity assessment",
                description: "Returns detailed maturity assessment with dimension breakdowns and improvement areas",
                auth: true,
                responseBody: {
                    overall: "number",
                    level: "string",
                    dimensions: {
                        testAutomation: {
                            score: "number",
                            trend: "string"
                        },
                        cicdIntegration: {
                            score: "number",
                            trend: "string"
                        },
                        qualityOwnership: {
                            score: "number",
                            trend: "string"
                        },
                        collaborationPractices: {
                            score: "number",
                            trend: "string"
                        },
                        continuousImprovement: {
                            score: "number",
                            trend: "string"
                        }
                    },
                    improvements: [
                        {
                            area: "string",
                            recommendation: "string",
                            impact: "high | medium | low",
                            effort: "high | medium | low"
                        }
                    ],
                    historicalTrend: [
                        {
                            date: "ISO 8601",
                            score: "number"
                        }
                    ]
                }
            },
            {
                method: "GET",
                path: "/api/teams/:id/members/:memberId",
                summary: "Get team member profile",
                description: "Returns individual contributor profile with skills, activity, and development recommendations",
                auth: true,
                responseBody: {
                    id: "string",
                    name: "string",
                    email: "string",
                    avatar: "string",
                    role: "string",
                    persona: "string",
                    teamId: "string",
                    xp: "number",
                    level: "number",
                    badges: [
                        "string"
                    ],
                    skills: {
                        testAutomation: "number (0-100)",
                        healingReview: "number (0-100)",
                        triageAccuracy: "number (0-100)",
                        collaboration: "number (0-100)"
                    },
                    needsAttention: "boolean",
                    attentionFlags: [
                        {
                            type: "string",
                            severity: "low | medium | high",
                            description: "string",
                            recommendation: "string"
                        }
                    ],
                    recentActivity: [
                        {
                            type: "string",
                            description: "string",
                            timestamp: "ISO 8601",
                            xpEarned: "number"
                        }
                    ],
                    developmentPlan: {
                        currentFocus: "string",
                        nextMilestone: "string",
                        recommendedMissions: [
                            "string"
                        ]
                    }
                }
            }
        ]
    },
    {
        name: "Projects",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$folder$2d$kanban$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FolderKanban$3e$__["FolderKanban"],
        description: "Project and feature confidence tracking",
        endpoints: [
            {
                method: "GET",
                path: "/api/projects",
                summary: "List all projects",
                description: "Returns projects with confidence scores and test coverage",
                auth: true,
                queryParams: [
                    {
                        name: "teamId",
                        type: "string",
                        required: false,
                        description: "Filter by team"
                    },
                    {
                        name: "status",
                        type: "string",
                        required: false,
                        description: "active | archived | at_risk"
                    }
                ],
                responseBody: {
                    projects: [
                        {
                            id: "string",
                            name: "string",
                            teamId: "string",
                            status: "string",
                            confidence: "number (0-100)",
                            testCoverage: "number",
                            riskLevel: "low | medium | high | critical",
                            lastActivity: "ISO 8601"
                        }
                    ]
                }
            },
            {
                method: "GET",
                path: "/api/projects/:id",
                summary: "Get project details",
                description: "Returns detailed project information with feature breakdown and test pyramid",
                auth: true,
                responseBody: {
                    id: "string",
                    name: "string",
                    description: "string",
                    teamId: "string",
                    teamName: "string",
                    status: "string",
                    overallConfidence: "number",
                    features: [
                        {
                            id: "string",
                            name: "string",
                            confidence: "number",
                            testCount: "number",
                            lastTested: "ISO 8601",
                            riskFactors: [
                                "string"
                            ]
                        }
                    ],
                    testPyramid: {
                        unit: {
                            count: "number",
                            coverage: "number"
                        },
                        integration: {
                            count: "number",
                            coverage: "number"
                        },
                        e2e: {
                            count: "number",
                            coverage: "number"
                        },
                        visual: {
                            count: "number",
                            coverage: "number"
                        }
                    },
                    riskSummary: {
                        critical: "number",
                        high: "number",
                        medium: "number",
                        low: "number"
                    },
                    recentChanges: [
                        {
                            type: "string",
                            description: "string",
                            impact: "string",
                            timestamp: "ISO 8601"
                        }
                    ]
                }
            },
            {
                method: "GET",
                path: "/api/projects/:id/features/:featureId",
                summary: "Get feature confidence details",
                description: "Returns deep dive into feature-level quality metrics and risk factors",
                auth: true,
                responseBody: {
                    id: "string",
                    name: "string",
                    description: "string",
                    confidence: "number",
                    confidenceFactors: {
                        testCoverage: {
                            score: "number",
                            weight: "number"
                        },
                        testStability: {
                            score: "number",
                            weight: "number"
                        },
                        recentActivity: {
                            score: "number",
                            weight: "number"
                        },
                        codeChurn: {
                            score: "number",
                            weight: "number"
                        }
                    },
                    riskFactors: [
                        {
                            type: "string",
                            severity: "string",
                            description: "string",
                            mitigation: "string"
                        }
                    ],
                    tests: [
                        {
                            id: "string",
                            name: "string",
                            type: "unit | integration | e2e",
                            status: "passing | failing | flaky",
                            lastRun: "ISO 8601"
                        }
                    ]
                }
            }
        ]
    },
    {
        name: "Adoption",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$target$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Target$3e$__["Target"],
        description: "Platform adoption metrics and engagement tracking",
        endpoints: [
            {
                method: "GET",
                path: "/api/adoption/metrics",
                summary: "Get adoption metrics",
                description: "Returns platform-wide adoption metrics and trends",
                auth: true,
                queryParams: [
                    {
                        name: "timeRange",
                        type: "string",
                        required: false,
                        description: "7d | 30d | 90d | 1y"
                    }
                ],
                responseBody: {
                    overall: {
                        adoptionRate: "number (percentage)",
                        activeUsers: "number",
                        totalUsers: "number",
                        trend: "string"
                    },
                    byFeature: [
                        {
                            feature: "string",
                            adoptionRate: "number",
                            activeUsers: "number",
                            trend: "string"
                        }
                    ],
                    byTeam: [
                        {
                            teamId: "string",
                            teamName: "string",
                            adoptionScore: "number",
                            engagementLevel: "low | medium | high"
                        }
                    ],
                    onboardingFunnel: {
                        invited: "number",
                        activated: "number",
                        firstAction: "number",
                        regularUser: "number",
                        powerUser: "number"
                    }
                }
            },
            {
                method: "GET",
                path: "/api/adoption/engagement",
                summary: "Get engagement analytics",
                description: "Returns detailed engagement metrics and user behavior patterns",
                auth: true,
                responseBody: {
                    dau: "number",
                    wau: "number",
                    mau: "number",
                    stickiness: "number (DAU/MAU ratio)",
                    avgSessionDuration: "number (minutes)",
                    actionsPerSession: "number",
                    retentionCohorts: [
                        {
                            cohort: "string",
                            week1: "number",
                            week2: "number",
                            week4: "number",
                            week8: "number"
                        }
                    ],
                    churnRisk: [
                        {
                            userId: "string",
                            name: "string",
                            lastActive: "ISO 8601",
                            riskScore: "number",
                            reason: "string"
                        }
                    ]
                }
            }
        ]
    },
    {
        name: "Tests",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$test$2d$tube$2d$diagonal$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TestTube2$3e$__["TestTube2"],
        description: "Test case management and execution",
        endpoints: [
            {
                method: "GET",
                path: "/api/tests",
                summary: "List all tests",
                description: "Retrieves paginated list of test cases with filtering",
                auth: true,
                queryParams: [
                    {
                        name: "page",
                        type: "number",
                        required: false,
                        description: "Page number (default: 1)"
                    },
                    {
                        name: "limit",
                        type: "number",
                        required: false,
                        description: "Items per page (default: 20)"
                    },
                    {
                        name: "status",
                        type: "string",
                        required: false,
                        description: "passing | failing | flaky | skipped"
                    },
                    {
                        name: "suiteId",
                        type: "string",
                        required: false,
                        description: "Filter by test suite"
                    },
                    {
                        name: "projectId",
                        type: "string",
                        required: false,
                        description: "Filter by project"
                    },
                    {
                        name: "teamId",
                        type: "string",
                        required: false,
                        description: "Filter by team"
                    },
                    {
                        name: "tags",
                        type: "string[]",
                        required: false,
                        description: "Filter by tags"
                    },
                    {
                        name: "search",
                        type: "string",
                        required: false,
                        description: "Search in test name"
                    }
                ],
                responseBody: {
                    data: [
                        {
                            id: "string",
                            name: "string",
                            suiteId: "string",
                            projectId: "string",
                            status: "passing | failing | flaky | skipped",
                            tags: "string[]",
                            owner: "string",
                            lastRun: "ISO 8601 timestamp",
                            avgDuration: "number (ms)"
                        }
                    ],
                    pagination: {
                        page: "number",
                        limit: "number",
                        total: "number",
                        totalPages: "number"
                    }
                }
            },
            {
                method: "GET",
                path: "/api/tests/:id",
                summary: "Get test details",
                description: "Retrieves full test case details including code and history",
                auth: true,
                responseBody: {
                    id: "string",
                    name: "string",
                    description: "string",
                    suiteId: "string",
                    projectId: "string",
                    status: "string",
                    code: "string",
                    framework: "playwright | cypress | jest | vitest",
                    selectors: "string[]",
                    tags: "string[]",
                    owner: "User",
                    createdAt: "ISO 8601",
                    updatedAt: "ISO 8601",
                    runs: [
                        {
                            id: "string",
                            status: "string",
                            duration: "number",
                            error: "string | null",
                            timestamp: "ISO 8601"
                        }
                    ]
                }
            },
            {
                method: "POST",
                path: "/api/tests/generate",
                summary: "Generate tests from spec",
                description: "Uses AI to generate test cases from natural language specification",
                auth: true,
                requestBody: {
                    specification: "string (required) - Natural language test description",
                    framework: "playwright | cypress (required)",
                    targetUrl: "string (required) - URL of page to test",
                    projectId: "string - Associate with project",
                    context: "string - Additional context or requirements"
                },
                responseBody: {
                    jobId: "string",
                    status: "queued | processing | completed | failed",
                    estimatedTime: "number (seconds)"
                }
            },
            {
                method: "GET",
                path: "/api/tests/generate/:jobId",
                summary: "Get generation job status",
                description: "Polls the status of an async test generation job",
                auth: true,
                responseBody: {
                    jobId: "string",
                    status: "queued | processing | completed | failed",
                    progress: "number (0-100)",
                    result: {
                        tests: [
                            {
                                name: "string",
                                code: "string",
                                confidence: "number"
                            }
                        ]
                    },
                    error: "string | null"
                }
            }
        ]
    },
    {
        name: "Healing",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"],
        description: "Intelligent test healing and repair for selectors, race conditions, test data, and code quality",
        endpoints: [
            {
                method: "GET",
                path: "/api/healing/queue",
                summary: "Get healing queue",
                description: "Returns items pending human review for healing approval across all categories",
                auth: true,
                queryParams: [
                    {
                        name: "status",
                        type: "string",
                        required: false,
                        description: "pending | approved | rejected"
                    },
                    {
                        name: "category",
                        type: "string",
                        required: false,
                        description: "selector | race_condition | test_data | code_quality | breaking_change | environment"
                    },
                    {
                        name: "minConfidence",
                        type: "number",
                        required: false,
                        description: "Minimum AI confidence (0-1)"
                    },
                    {
                        name: "teamId",
                        type: "string",
                        required: false,
                        description: "Filter by team"
                    },
                    {
                        name: "projectId",
                        type: "string",
                        required: false,
                        description: "Filter by project"
                    }
                ],
                responseBody: {
                    items: [
                        {
                            id: "string",
                            testId: "string",
                            testName: "string",
                            category: "selector | race_condition | test_data | code_quality | breaking_change | environment",
                            rootCause: "string",
                            analysis: "string",
                            originalIssue: {
                                type: "string",
                                code: "string",
                                error: "string"
                            },
                            proposedFix: {
                                description: "string",
                                code: "string",
                                diff: "string"
                            },
                            confidence: "number",
                            domSnapshot: "string | null",
                            status: "string",
                            createdAt: "ISO 8601"
                        }
                    ],
                    total: "number",
                    byCategory: {
                        selector: "number",
                        race_condition: "number",
                        test_data: "number",
                        code_quality: "number",
                        breaking_change: "number",
                        environment: "number"
                    }
                }
            },
            {
                method: "POST",
                path: "/api/healing/:id/approve",
                summary: "Approve healing suggestion",
                description: "Approves AI-suggested fix and optionally creates PR",
                auth: true,
                requestBody: {
                    createPR: "boolean - Whether to auto-create PR",
                    comment: "string - Optional review comment",
                    targetBranch: "string - Branch to create PR against"
                },
                responseBody: {
                    success: "boolean",
                    prUrl: "string | null",
                    appliedFix: "object",
                    xpEarned: "number"
                }
            },
            {
                method: "POST",
                path: "/api/healing/:id/reject",
                summary: "Reject healing suggestion",
                description: "Rejects suggestion with feedback for model improvement",
                auth: true,
                requestBody: {
                    reason: "string (required) - Rejection reason for training",
                    correctFix: "string - Manual fix if different",
                    category: "string - Correct category if misclassified"
                },
                responseBody: {
                    success: "boolean",
                    xpEarned: "number"
                }
            },
            {
                method: "GET",
                path: "/api/healing/:id/analysis",
                summary: "Get detailed healing analysis",
                description: "Returns comprehensive AI analysis of the failure including root cause and fix rationale",
                auth: true,
                responseBody: {
                    id: "string",
                    category: "string",
                    rootCauseAnalysis: {
                        summary: "string",
                        evidence: [
                            "string"
                        ],
                        confidence: "number",
                        alternativeCauses: [
                            {
                                cause: "string",
                                likelihood: "number"
                            }
                        ]
                    },
                    fixRationale: {
                        approach: "string",
                        steps: [
                            "string"
                        ],
                        risks: [
                            "string"
                        ],
                        alternatives: [
                            {
                                description: "string",
                                tradeoffs: "string"
                            }
                        ]
                    },
                    relatedFailures: [
                        {
                            testId: "string",
                            testName: "string",
                            similarity: "number"
                        }
                    ]
                }
            }
        ]
    },
    {
        name: "Sessions",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$play$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__PlayCircle$3e$__["PlayCircle"],
        description: "Manual test session management and recording",
        endpoints: [
            {
                method: "GET",
                path: "/api/sessions",
                summary: "List sessions",
                description: "Get all manual test sessions",
                auth: true,
                queryParams: [
                    {
                        name: "status",
                        type: "string",
                        required: false,
                        description: "draft | active | completed | archived"
                    },
                    {
                        name: "type",
                        type: "string",
                        required: false,
                        description: "scripted | exploratory | accessibility | performance | design_validation"
                    },
                    {
                        name: "ownerId",
                        type: "string",
                        required: false,
                        description: "Filter by session owner"
                    }
                ],
                responseBody: {
                    sessions: [
                        {
                            id: "string",
                            name: "string",
                            type: "scripted | exploratory | accessibility | performance | design_validation",
                            status: "draft | active | completed | archived",
                            owner: "User",
                            progress: "number",
                            totalSteps: "number",
                            createdAt: "ISO 8601"
                        }
                    ]
                }
            },
            {
                method: "POST",
                path: "/api/sessions",
                summary: "Create session",
                description: "Creates a new manual test session",
                auth: true,
                requestBody: {
                    name: "string (required)",
                    type: "scripted | exploratory | accessibility | performance | design_validation",
                    description: "string",
                    targetUrl: "string (required)",
                    projectId: "string",
                    designAssets: "[{ url: string, name: string }] - For design validation sessions",
                    steps: "[{ title: string, description: string, expectedResult: string }]"
                },
                responseBody: {
                    id: "string",
                    name: "string",
                    status: "draft",
                    recordingUrl: "string - WebSocket URL for live recording"
                }
            },
            {
                method: "POST",
                path: "/api/sessions/:id/start",
                summary: "Start recording session",
                description: "Initiates the recording of a session with browser instrumentation",
                auth: true,
                requestBody: {
                    browserConfig: {
                        viewport: "{ width: number, height: number }",
                        userAgent: "string",
                        locale: "string"
                    }
                },
                responseBody: {
                    sessionId: "string",
                    recordingActive: "boolean",
                    wsEndpoint: "string",
                    browserInstanceId: "string"
                }
            },
            {
                method: "POST",
                path: "/api/sessions/:id/record",
                summary: "Record session action",
                description: "Records a user action during session playback",
                auth: true,
                requestBody: {
                    action: "click | type | navigate | scroll | assert | hover | drag",
                    selector: "string",
                    value: "string | null",
                    timestamp: "number",
                    screenshot: "string (base64)",
                    elementMetadata: "{ tagName: string, attributes: object }"
                },
                responseBody: {
                    actionId: "string",
                    recorded: "boolean",
                    suggestedAssertion: "string | null"
                }
            },
            {
                method: "POST",
                path: "/api/sessions/:id/generate-tests",
                summary: "Generate tests from session",
                description: "Converts recorded session into Playwright test code with intelligent assertions",
                auth: true,
                requestBody: {
                    format: "playwright | cypress",
                    includeAssertions: "boolean",
                    optimizeSelectors: "boolean",
                    createPR: "boolean"
                },
                responseBody: {
                    tests: [
                        {
                            name: "string",
                            code: "string",
                            assertions: "number"
                        }
                    ],
                    prUrl: "string | null"
                }
            }
        ]
    },
    {
        name: "Pipelines",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$git$2d$branch$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__GitBranch$3e$__["GitBranch"],
        description: "CI/CD pipeline integration and monitoring",
        endpoints: [
            {
                method: "GET",
                path: "/api/pipelines",
                summary: "List pipelines",
                description: "Get all CI pipeline runs with filtering",
                auth: true,
                queryParams: [
                    {
                        name: "status",
                        type: "string",
                        required: false,
                        description: "running | passed | failed | cancelled"
                    },
                    {
                        name: "repo",
                        type: "string",
                        required: false,
                        description: "Filter by repository"
                    },
                    {
                        name: "branch",
                        type: "string",
                        required: false,
                        description: "Filter by branch"
                    },
                    {
                        name: "teamId",
                        type: "string",
                        required: false,
                        description: "Filter by team"
                    }
                ],
                responseBody: {
                    pipelines: [
                        {
                            id: "string",
                            repo: "string",
                            branch: "string",
                            commit: "string",
                            status: "running | passed | failed | cancelled",
                            duration: "number (ms)",
                            testsTotal: "number",
                            testsPassed: "number",
                            testsFailed: "number",
                            healsApplied: "number",
                            triggeredAt: "ISO 8601",
                            triggeredBy: "string"
                        }
                    ]
                }
            },
            {
                method: "GET",
                path: "/api/pipelines/:id",
                summary: "Get pipeline details",
                description: "Get detailed pipeline run information with stage breakdown",
                auth: true,
                responseBody: {
                    id: "string",
                    repo: "string",
                    branch: "string",
                    commit: "string",
                    commitMessage: "string",
                    status: "string",
                    stages: [
                        {
                            name: "string",
                            status: "string",
                            duration: "number",
                            startedAt: "ISO 8601",
                            finishedAt: "ISO 8601"
                        }
                    ],
                    testResults: {
                        total: "number",
                        passed: "number",
                        failed: "number",
                        skipped: "number",
                        flaky: "number"
                    },
                    healings: [
                        {
                            testId: "string",
                            testName: "string",
                            category: "string",
                            applied: "boolean"
                        }
                    ],
                    artifacts: [
                        {
                            name: "string",
                            type: "string",
                            url: "string",
                            size: "number"
                        }
                    ]
                }
            },
            {
                method: "POST",
                path: "/api/pipelines/configure",
                summary: "Configure pipeline integration",
                description: "Sets up CI/CD pipeline integration with Shifty",
                auth: true,
                requestBody: {
                    provider: "github | gitlab | jenkins | circleci | azure_devops",
                    repoUrl: "string (required)",
                    webhookSecret: "string",
                    autoHeal: "boolean - Enable automatic healing",
                    healingThreshold: "number - Confidence threshold for auto-healing",
                    notifications: {
                        slack: "string | null",
                        email: "string[] | null"
                    }
                },
                responseBody: {
                    configId: "string",
                    webhookUrl: "string",
                    status: "active | pending_verification"
                }
            },
            {
                method: "POST",
                path: "/api/pipelines/webhook",
                summary: "CI webhook receiver",
                description: "Receives webhook events from CI providers",
                auth: false,
                requestBody: {
                    provider: "github | gitlab | jenkins | circleci",
                    event: "run_started | run_completed | test_failed",
                    payload: "object - Provider-specific payload",
                    signature: "string - HMAC signature for verification"
                },
                responseBody: {
                    received: "boolean",
                    pipelineId: "string"
                }
            },
            {
                method: "GET",
                path: "/api/pipelines/:id/logs",
                summary: "Get pipeline logs",
                description: "Retrieves test execution logs for a pipeline run",
                auth: true,
                responseBody: {
                    logs: [
                        {
                            testId: "string",
                            testName: "string",
                            status: "string",
                            duration: "number",
                            output: "string",
                            error: "string | null",
                            healingAttempted: "boolean",
                            healingSucceeded: "boolean",
                            screenshots: [
                                "string"
                            ]
                        }
                    ]
                }
            }
        ]
    },
    {
        name: "Insights",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chart$2d$column$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BarChart3$3e$__["BarChart3"],
        description: "Analytics, DORA metrics, and ROI tracking",
        endpoints: [
            {
                method: "GET",
                path: "/api/insights/dashboard",
                summary: "Get dashboard metrics",
                description: "Retrieves aggregated metrics for the insights dashboard",
                auth: true,
                queryParams: [
                    {
                        name: "timeRange",
                        type: "string",
                        required: false,
                        description: "7d | 30d | 90d | 1y"
                    },
                    {
                        name: "teamId",
                        type: "string",
                        required: false,
                        description: "Filter by team"
                    },
                    {
                        name: "projectId",
                        type: "string",
                        required: false,
                        description: "Filter by project"
                    }
                ],
                responseBody: {
                    testHealth: {
                        total: "number",
                        passing: "number",
                        failing: "number",
                        flaky: "number",
                        coverage: "number (percentage)"
                    },
                    doraMetrics: {
                        deploymentFrequency: {
                            value: "string",
                            trend: "string",
                            status: "elite | high | medium | low"
                        },
                        leadTime: {
                            value: "string",
                            trend: "string",
                            status: "string"
                        },
                        changeFailureRate: {
                            value: "number",
                            trend: "string",
                            status: "string"
                        },
                        mttr: {
                            value: "string",
                            trend: "string",
                            status: "string"
                        }
                    },
                    trends: [
                        {
                            date: "ISO 8601",
                            passRate: "number",
                            avgDuration: "number",
                            healingsApplied: "number"
                        }
                    ],
                    testPyramid: {
                        unit: {
                            count: "number",
                            percentage: "number"
                        },
                        integration: {
                            count: "number",
                            percentage: "number"
                        },
                        e2e: {
                            count: "number",
                            percentage: "number"
                        },
                        visual: {
                            count: "number",
                            percentage: "number"
                        }
                    },
                    riskHotspots: [
                        {
                            id: "string",
                            component: "string",
                            riskScore: "number",
                            failureRate: "number",
                            lastFailure: "ISO 8601",
                            riskFactors: [
                                {
                                    type: "string",
                                    impact: "high | medium | low",
                                    description: "string"
                                }
                            ]
                        }
                    ]
                }
            },
            {
                method: "GET",
                path: "/api/insights/roi",
                summary: "Get ROI metrics",
                description: "Calculates return on investment for QE automation",
                auth: true,
                queryParams: [
                    {
                        name: "timeRange",
                        type: "string",
                        required: false,
                        description: "30d | 90d | 1y | all"
                    }
                ],
                responseBody: {
                    summary: {
                        totalSavings: "number (currency)",
                        hoursSaved: "number",
                        bugsPreventedEstimate: "number",
                        automationROI: "number (percentage)",
                        paybackPeriod: "string"
                    },
                    breakdown: {
                        healingValue: "number",
                        testGenerationValue: "number",
                        flakyTestReduction: "number",
                        ciTimeReduction: "number",
                        manualTestingReduction: "number"
                    },
                    trends: [
                        {
                            period: "string",
                            savings: "number",
                            hoursSaved: "number"
                        }
                    ]
                }
            },
            {
                method: "GET",
                path: "/api/insights/roi/config",
                summary: "Get ROI configuration",
                description: "Returns current cost parameters for ROI calculation",
                auth: true,
                responseBody: {
                    devHourlyRate: "number",
                    qaHourlyRate: "number",
                    ciCostPerMinute: "number",
                    bugCostEstimate: "number",
                    currency: "string (ISO 4217)",
                    avgBugFixTime: "number (hours)",
                    avgTestWriteTime: "number (minutes)"
                }
            },
            {
                method: "PUT",
                path: "/api/insights/roi/config",
                summary: "Update ROI configuration",
                description: "Updates cost parameters for accurate ROI calculation",
                auth: true,
                requestBody: {
                    devHourlyRate: "number",
                    qaHourlyRate: "number",
                    ciCostPerMinute: "number",
                    bugCostEstimate: "number",
                    currency: "string (ISO 4217)",
                    avgBugFixTime: "number (hours)",
                    avgTestWriteTime: "number (minutes)"
                },
                responseBody: {
                    updated: "boolean",
                    config: "object",
                    recalculatedROI: "number"
                }
            }
        ]
    },
    {
        name: "Knowledge",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$brain$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Brain$3e$__["Brain"],
        description: "Knowledge base management, search, and AI chat",
        endpoints: [
            {
                method: "GET",
                path: "/api/knowledge",
                summary: "Search knowledge base",
                description: "Searches knowledge entries with optional filters",
                auth: true,
                queryParams: [
                    {
                        name: "q",
                        type: "string",
                        required: false,
                        description: "Search query"
                    },
                    {
                        name: "type",
                        type: "string",
                        required: false,
                        description: "architecture | domain | expert | risk | cost | decision | insight | date"
                    },
                    {
                        name: "source",
                        type: "string",
                        required: false,
                        description: "agent | manual | pipeline | session"
                    },
                    {
                        name: "tags",
                        type: "string[]",
                        required: false,
                        description: "Filter by tags"
                    }
                ],
                responseBody: {
                    entries: [
                        {
                            id: "string",
                            type: "string",
                            title: "string",
                            summary: "string",
                            source: "string",
                            confidence: "number",
                            tags: "string[]",
                            updatedAt: "ISO 8601",
                            relatedEntities: "string[]"
                        }
                    ],
                    total: "number"
                }
            },
            {
                method: "GET",
                path: "/api/knowledge/:id",
                summary: "Get knowledge entry",
                description: "Returns full knowledge entry with relationships",
                auth: true,
                responseBody: {
                    id: "string",
                    type: "string",
                    title: "string",
                    content: "string (markdown)",
                    summary: "string",
                    source: "string",
                    confidence: "number",
                    tags: "string[]",
                    metadata: "object",
                    relatedEntries: [
                        {
                            id: "string",
                            title: "string",
                            type: "string",
                            relevance: "number"
                        }
                    ],
                    history: [
                        {
                            action: "created | updated",
                            by: "string",
                            timestamp: "ISO 8601",
                            changes: "string"
                        }
                    ],
                    createdAt: "ISO 8601",
                    updatedAt: "ISO 8601"
                }
            },
            {
                method: "POST",
                path: "/api/knowledge/chat",
                summary: "Chat with knowledge base",
                description: "Natural language query against knowledge base using LLM",
                auth: true,
                requestBody: {
                    message: "string (required)",
                    conversationId: "string - For multi-turn conversations",
                    includeSources: "boolean - Whether to return source entries",
                    context: "{ teamId?: string, projectId?: string } - Scope the knowledge"
                },
                responseBody: {
                    response: "string",
                    sources: [
                        {
                            id: "string",
                            title: "string",
                            type: "string",
                            relevance: "number",
                            excerpt: "string"
                        }
                    ],
                    conversationId: "string",
                    suggestedFollowUps: [
                        "string"
                    ]
                }
            },
            {
                method: "POST",
                path: "/api/knowledge",
                summary: "Create knowledge entry",
                description: "Manually adds a knowledge entry",
                auth: true,
                requestBody: {
                    type: "string (required)",
                    title: "string (required)",
                    content: "string (required) - Markdown supported",
                    tags: "string[]",
                    relatedEntities: "string[]",
                    metadata: "object"
                },
                responseBody: {
                    id: "string",
                    created: "boolean"
                }
            },
            {
                method: "GET",
                path: "/api/knowledge/graph",
                summary: "Get knowledge graph",
                description: "Returns knowledge entities and relationships for visualization",
                auth: true,
                queryParams: [
                    {
                        name: "rootId",
                        type: "string",
                        required: false,
                        description: "Center graph on specific entry"
                    },
                    {
                        name: "depth",
                        type: "number",
                        required: false,
                        description: "Relationship traversal depth (default: 2)"
                    }
                ],
                responseBody: {
                    nodes: [
                        {
                            id: "string",
                            type: "string",
                            label: "string",
                            size: "number"
                        }
                    ],
                    edges: [
                        {
                            source: "string",
                            target: "string",
                            relationship: "string",
                            strength: "number"
                        }
                    ]
                }
            }
        ]
    },
    {
        name: "Agent PRs",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$webhook$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Webhook$3e$__["Webhook"],
        description: "Manage pull requests created by Shifty agents",
        endpoints: [
            {
                method: "GET",
                path: "/api/agent-prs",
                summary: "List agent PRs",
                description: "Get all pull requests created by Shifty agents",
                auth: true,
                queryParams: [
                    {
                        name: "status",
                        type: "string",
                        required: false,
                        description: "open | merged | closed | draft"
                    },
                    {
                        name: "agent",
                        type: "string",
                        required: false,
                        description: "healing | test-gen | labeling | selector-update"
                    },
                    {
                        name: "repo",
                        type: "string",
                        required: false,
                        description: "Filter by repository"
                    },
                    {
                        name: "teamId",
                        type: "string",
                        required: false,
                        description: "Filter by team"
                    }
                ],
                responseBody: {
                    prs: [
                        {
                            id: "string",
                            title: "string",
                            description: "string",
                            agent: "healing | test-gen | labeling | selector-update",
                            repo: "string",
                            branch: "string",
                            baseBranch: "string",
                            status: "open | merged | closed | draft",
                            url: "string",
                            filesChanged: "number",
                            additions: "number",
                            deletions: "number",
                            checks: {
                                passed: "number",
                                failed: "number",
                                pending: "number"
                            },
                            reviewers: [
                                "string"
                            ],
                            createdAt: "ISO 8601",
                            updatedAt: "ISO 8601"
                        }
                    ],
                    summary: {
                        total: "number",
                        open: "number",
                        merged: "number",
                        closed: "number"
                    }
                }
            },
            {
                method: "GET",
                path: "/api/agent-prs/:id",
                summary: "Get PR details",
                description: "Returns detailed PR information with diff and rationale",
                auth: true,
                responseBody: {
                    id: "string",
                    title: "string",
                    description: "string",
                    agent: "string",
                    agentRationale: "string - Why the agent made these changes",
                    repo: "string",
                    branch: "string",
                    status: "string",
                    url: "string",
                    files: [
                        {
                            path: "string",
                            status: "added | modified | deleted",
                            additions: "number",
                            deletions: "number",
                            diff: "string"
                        }
                    ],
                    relatedItems: {
                        healingId: "string | null",
                        testIds: "string[]",
                        sessionId: "string | null"
                    },
                    reviews: [
                        {
                            reviewer: "string",
                            status: "approved | changes_requested | commented",
                            comment: "string",
                            timestamp: "ISO 8601"
                        }
                    ]
                }
            },
            {
                method: "POST",
                path: "/api/agent-prs/:id/approve",
                summary: "Approve and merge PR",
                description: "Approves and optionally merges an agent-created PR",
                auth: true,
                requestBody: {
                    merge: "boolean - Whether to merge after approval",
                    mergeMethod: "merge | squash | rebase",
                    comment: "string - Approval comment"
                },
                responseBody: {
                    approved: "boolean",
                    merged: "boolean",
                    sha: "string | null"
                }
            },
            {
                method: "POST",
                path: "/api/agent-prs/:id/request-changes",
                summary: "Request changes on PR",
                description: "Requests changes with feedback for agent improvement",
                auth: true,
                requestBody: {
                    comment: "string (required)",
                    suggestions: "[{ file: string, line: number, suggestion: string }]"
                },
                responseBody: {
                    submitted: "boolean"
                }
            }
        ]
    },
    {
        name: "Arcade",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trophy$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trophy$3e$__["Trophy"],
        description: "HITL gamification, missions, and training tasks",
        endpoints: [
            {
                method: "GET",
                path: "/api/arcade/missions",
                summary: "Get available missions",
                description: "Lists HITL missions available to the user",
                auth: true,
                queryParams: [
                    {
                        name: "type",
                        type: "string",
                        required: false,
                        description: "label | verify | triage | review_test_plan | design_validation"
                    },
                    {
                        name: "difficulty",
                        type: "string",
                        required: false,
                        description: "easy | medium | hard"
                    }
                ],
                responseBody: {
                    missions: [
                        {
                            id: "string",
                            title: "string",
                            description: "string",
                            type: "label | verify | triage | review_test_plan | design_validation",
                            xpReward: "number",
                            taskCount: "number",
                            estimatedTime: "string",
                            difficulty: "easy | medium | hard",
                            claimed: "boolean",
                            prerequisites: "string[]"
                        }
                    ],
                    dailyBonus: {
                        available: "boolean",
                        multiplier: "number",
                        expiresAt: "ISO 8601"
                    }
                }
            },
            {
                method: "POST",
                path: "/api/arcade/missions/:id/start",
                summary: "Start a mission",
                description: "Claims and starts a HITL mission",
                auth: true,
                responseBody: {
                    missionId: "string",
                    tasks: [
                        {
                            id: "string",
                            type: "string",
                            data: "object - Task-specific data",
                            instructions: "string"
                        }
                    ],
                    timeLimit: "number (seconds) | null"
                }
            },
            {
                method: "POST",
                path: "/api/arcade/missions/:id/submit",
                summary: "Submit mission results",
                description: "Submits completed mission tasks for scoring",
                auth: true,
                requestBody: {
                    responses: [
                        {
                            taskId: "string",
                            answer: "object - Task-specific response",
                            timeSpent: "number (seconds)",
                            confidence: "number - User's confidence in answer"
                        }
                    ]
                },
                responseBody: {
                    score: "number",
                    xpEarned: "number",
                    accuracy: "number (percentage)",
                    feedback: [
                        {
                            taskId: "string",
                            correct: "boolean",
                            explanation: "string"
                        }
                    ],
                    newBadges: [
                        "string"
                    ],
                    levelUp: "boolean",
                    newLevel: "number | null"
                }
            },
            {
                method: "GET",
                path: "/api/arcade/leaderboard",
                summary: "Get leaderboard",
                description: "Returns top contributors by XP",
                auth: true,
                queryParams: [
                    {
                        name: "scope",
                        type: "string",
                        required: false,
                        description: "global | team | weekly | monthly"
                    },
                    {
                        name: "teamId",
                        type: "string",
                        required: false,
                        description: "For team scope"
                    }
                ],
                responseBody: {
                    leaders: [
                        {
                            rank: "number",
                            userId: "string",
                            name: "string",
                            avatar: "string",
                            teamName: "string",
                            xp: "number",
                            level: "number",
                            badges: [
                                "string"
                            ],
                            accuracy: "number",
                            streak: "number"
                        }
                    ],
                    userRank: {
                        rank: "number",
                        xp: "number",
                        percentile: "number"
                    }
                }
            },
            {
                method: "GET",
                path: "/api/arcade/profile",
                summary: "Get user arcade profile",
                description: "Returns user's gamification profile and achievements",
                auth: true,
                responseBody: {
                    xp: "number",
                    level: "number",
                    nextLevelXp: "number",
                    badges: [
                        {
                            id: "string",
                            name: "string",
                            description: "string",
                            earnedAt: "ISO 8601",
                            rarity: "common | uncommon | rare | epic | legendary"
                        }
                    ],
                    stats: {
                        missionsCompleted: "number",
                        tasksCompleted: "number",
                        accuracy: "number",
                        currentStreak: "number",
                        longestStreak: "number"
                    },
                    recentActivity: [
                        {
                            type: "string",
                            description: "string",
                            xpEarned: "number",
                            timestamp: "ISO 8601"
                        }
                    ]
                }
            }
        ]
    },
    {
        name: "Telemetry",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$activity$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Activity$3e$__["Activity"],
        description: "OpenTelemetry ingestion and metrics",
        endpoints: [
            {
                method: "POST",
                path: "/api/telemetry/ingest",
                summary: "Ingest telemetry data",
                description: "Receives OpenTelemetry traces and metrics from SDK",
                auth: true,
                requestBody: {
                    format: "otlp | prometheus",
                    data: "object - OpenTelemetry protobuf or JSON",
                    source: "sdk | browser | ci"
                },
                responseBody: {
                    accepted: "boolean",
                    tracesReceived: "number",
                    metricsReceived: "number",
                    processingId: "string"
                }
            },
            {
                method: "GET",
                path: "/api/telemetry/metrics",
                summary: "Query metrics",
                description: "Retrieves Prometheus-compatible metrics",
                auth: true,
                queryParams: [
                    {
                        name: "query",
                        type: "string",
                        required: true,
                        description: "PromQL query"
                    },
                    {
                        name: "start",
                        type: "string",
                        required: false,
                        description: "Start time (ISO 8601)"
                    },
                    {
                        name: "end",
                        type: "string",
                        required: false,
                        description: "End time (ISO 8601)"
                    },
                    {
                        name: "step",
                        type: "string",
                        required: false,
                        description: "Query resolution step"
                    }
                ],
                responseBody: {
                    resultType: "matrix | vector | scalar",
                    result: "array"
                }
            },
            {
                method: "GET",
                path: "/api/telemetry/traces/:traceId",
                summary: "Get trace details",
                description: "Returns detailed trace information with spans",
                auth: true,
                responseBody: {
                    traceId: "string",
                    rootSpan: {
                        spanId: "string",
                        operationName: "string",
                        duration: "number",
                        status: "string",
                        children: "Span[]"
                    },
                    services: [
                        "string"
                    ],
                    duration: "number",
                    timestamp: "ISO 8601"
                }
            }
        ]
    },
    {
        name: "Settings",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__["Settings"],
        description: "User preferences and tenant configuration",
        endpoints: [
            {
                method: "GET",
                path: "/api/settings",
                summary: "Get user settings",
                description: "Returns user preferences and notification settings",
                auth: true,
                responseBody: {
                    theme: "light | dark | system",
                    notifications: {
                        email: "boolean",
                        slack: "boolean",
                        inApp: "boolean",
                        healingAlerts: "boolean",
                        pipelineFailures: "boolean",
                        weeklyDigest: "boolean"
                    },
                    defaultPersona: "string",
                    timezone: "string",
                    language: "string"
                }
            },
            {
                method: "PUT",
                path: "/api/settings",
                summary: "Update user settings",
                description: "Updates user preferences",
                auth: true,
                requestBody: {
                    theme: "light | dark | system",
                    notifications: "object",
                    defaultPersona: "string",
                    timezone: "string",
                    language: "string"
                },
                responseBody: {
                    updated: "boolean",
                    settings: "object"
                }
            },
            {
                method: "GET",
                path: "/api/settings/tenant",
                summary: "Get tenant settings",
                description: "Returns tenant-level configuration (admin only)",
                auth: true,
                responseBody: {
                    id: "string",
                    name: "string",
                    slug: "string",
                    logo: "string | null",
                    features: {
                        healing: "boolean",
                        testGeneration: "boolean",
                        arcade: "boolean",
                        knowledgeBase: "boolean"
                    },
                    integrations: {
                        github: "boolean",
                        gitlab: "boolean",
                        slack: "boolean",
                        jira: "boolean"
                    },
                    limits: {
                        maxUsers: "number",
                        maxProjects: "number",
                        maxTestsPerMonth: "number"
                    },
                    billing: {
                        plan: "free | pro | enterprise",
                        status: "active | trialing | past_due",
                        trialEndsAt: "ISO 8601 | null"
                    }
                }
            },
            {
                method: "PUT",
                path: "/api/settings/tenant",
                summary: "Update tenant settings",
                description: "Updates tenant configuration (admin only)",
                auth: true,
                requestBody: {
                    name: "string",
                    logo: "string",
                    features: "object"
                },
                responseBody: {
                    updated: "boolean"
                }
            }
        ]
    },
    {
        name: "Users & Members",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2d$cog$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__UserCog$3e$__["UserCog"],
        description: "User management and team membership",
        endpoints: [
            {
                method: "GET",
                path: "/api/users/me",
                summary: "Get current user",
                description: "Returns the authenticated user profile",
                auth: true,
                responseBody: {
                    id: "string",
                    email: "string",
                    name: "string",
                    avatar: "string | null",
                    persona: "string",
                    role: "admin | member | viewer",
                    tenant: {
                        id: "string",
                        name: "string",
                        slug: "string"
                    },
                    teams: [
                        {
                            id: "string",
                            name: "string",
                            role: "string"
                        }
                    ],
                    preferences: "object",
                    createdAt: "ISO 8601"
                }
            },
            {
                method: "GET",
                path: "/api/users",
                summary: "List users",
                description: "Returns all users in the tenant (admin only)",
                auth: true,
                queryParams: [
                    {
                        name: "role",
                        type: "string",
                        required: false,
                        description: "Filter by role"
                    },
                    {
                        name: "teamId",
                        type: "string",
                        required: false,
                        description: "Filter by team membership"
                    },
                    {
                        name: "search",
                        type: "string",
                        required: false,
                        description: "Search by name or email"
                    }
                ],
                responseBody: {
                    users: [
                        {
                            id: "string",
                            email: "string",
                            name: "string",
                            avatar: "string",
                            role: "string",
                            persona: "string",
                            teams: "string[]",
                            lastActive: "ISO 8601",
                            status: "active | invited | deactivated"
                        }
                    ],
                    total: "number"
                }
            },
            {
                method: "POST",
                path: "/api/users/invite",
                summary: "Invite user",
                description: "Sends invitation to new user",
                auth: true,
                requestBody: {
                    email: "string (required)",
                    role: "admin | member | viewer",
                    teamIds: "string[]",
                    persona: "string"
                },
                responseBody: {
                    invited: "boolean",
                    invitationId: "string"
                }
            },
            {
                method: "GET",
                path: "/api/tenants",
                summary: "List user tenants",
                description: "Lists all tenants the user has access to",
                auth: true,
                responseBody: {
                    tenants: [
                        {
                            id: "string",
                            name: "string",
                            slug: "string",
                            logo: "string | null",
                            role: "string",
                            plan: "string"
                        }
                    ]
                }
            },
            {
                method: "POST",
                path: "/api/tenants/:id/switch",
                summary: "Switch tenant context",
                description: "Switches the user active tenant context",
                auth: true,
                responseBody: {
                    success: "boolean",
                    tenant: "object",
                    newAccessToken: "string"
                }
            }
        ]
    }
];
const methodColors = {
    GET: "bg-emerald-500/20 text-emerald-400",
    POST: "bg-blue-500/20 text-blue-400",
    PUT: "bg-amber-500/20 text-amber-400",
    PATCH: "bg-orange-500/20 text-orange-400",
    DELETE: "bg-red-500/20 text-red-400"
};
function ApiDocsHub() {
    _s();
    const [searchQuery, setSearchQuery] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [expandedSections, setExpandedSections] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([
        "Authentication"
    ]);
    const [expandedEndpoints, setExpandedEndpoints] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [copiedPath, setCopiedPath] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [activeTab, setActiveTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("all");
    const toggleSection = (name)=>{
        setExpandedSections((prev)=>prev.includes(name) ? prev.filter((s)=>s !== name) : [
                ...prev,
                name
            ]);
    };
    const toggleEndpoint = (path)=>{
        setExpandedEndpoints((prev)=>prev.includes(path) ? prev.filter((p)=>p !== path) : [
                ...prev,
                path
            ]);
    };
    const copyPath = (path)=>{
        navigator.clipboard.writeText(path);
        setCopiedPath(path);
        setTimeout(()=>setCopiedPath(null), 2000);
    };
    const categoryGroups = {
        all: apiSections.map((s)=>s.name),
        core: [
            "Authentication",
            "Users & Members",
            "Settings"
        ],
        organization: [
            "Organization",
            "Teams",
            "Projects",
            "Adoption"
        ],
        testing: [
            "Tests",
            "Healing",
            "Sessions",
            "Pipelines"
        ],
        intelligence: [
            "Insights",
            "Knowledge",
            "Agent PRs",
            "Arcade",
            "Telemetry"
        ]
    };
    const filteredSections = apiSections.filter((section)=>categoryGroups[activeTab].includes(section.name)).map((section)=>({
            ...section,
            endpoints: section.endpoints.filter((endpoint)=>searchQuery === "" || endpoint.path.toLowerCase().includes(searchQuery.toLowerCase()) || endpoint.summary.toLowerCase().includes(searchQuery.toLowerCase()))
        })).filter((section)=>section.endpoints.length > 0);
    const totalEndpoints = apiSections.reduce((acc, s)=>acc + s.endpoints.length, 0);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "p-6 space-y-6",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                className: "text-2xl font-bold flex items-center gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$code$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileCode2$3e$__["FileCode2"], {
                                        className: "w-7 h-7 text-primary"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                                        lineNumber: 2000,
                                        columnNumber: 13
                                    }, this),
                                    "API Documentation"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                                lineNumber: 1999,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-muted-foreground mt-1",
                                children: "Consumer contracts for Shifty platform backend integration"
                            }, void 0, false, {
                                fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                                lineNumber: 2003,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                        lineNumber: 1998,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                variant: "outline",
                                children: "v1.0.0"
                            }, void 0, false, {
                                fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                                lineNumber: 2006,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                variant: "outline",
                                className: "bg-primary/10 text-primary",
                                children: "OpenAPI 3.1"
                            }, void 0, false, {
                                fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                                lineNumber: 2007,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                variant: "outline",
                                size: "sm",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$copy$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Copy$3e$__["Copy"], {
                                        className: "w-4 h-4 mr-2"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                                        lineNumber: 2011,
                                        columnNumber: 13
                                    }, this),
                                    "Export OpenAPI"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                                lineNumber: 2010,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                        lineNumber: 2005,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                lineNumber: 1997,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-4 gap-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardContent"], {
                            className: "p-4",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "p-2 rounded-lg bg-primary/10",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__["Zap"], {
                                            className: "w-5 h-5 text-primary"
                                        }, void 0, false, {
                                            fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                                            lineNumber: 2023,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                                        lineNumber: 2022,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-2xl font-bold",
                                                children: totalEndpoints
                                            }, void 0, false, {
                                                fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                                                lineNumber: 2026,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-sm text-muted-foreground",
                                                children: "Endpoints"
                                            }, void 0, false, {
                                                fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                                                lineNumber: 2027,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                                        lineNumber: 2025,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                                lineNumber: 2021,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                            lineNumber: 2020,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                        lineNumber: 2019,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardContent"], {
                            className: "p-4",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "p-2 rounded-lg bg-chart-2/10",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$database$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Database$3e$__["Database"], {
                                            className: "w-5 h-5 text-chart-2"
                                        }, void 0, false, {
                                            fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                                            lineNumber: 2036,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                                        lineNumber: 2035,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-2xl font-bold",
                                                children: apiSections.length
                                            }, void 0, false, {
                                                fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                                                lineNumber: 2039,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-sm text-muted-foreground",
                                                children: "Resource Groups"
                                            }, void 0, false, {
                                                fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                                                lineNumber: 2040,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                                        lineNumber: 2038,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                                lineNumber: 2034,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                            lineNumber: 2033,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                        lineNumber: 2032,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardContent"], {
                            className: "p-4",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "p-2 rounded-lg bg-chart-3/10",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Lock$3e$__["Lock"], {
                                            className: "w-5 h-5 text-chart-3"
                                        }, void 0, false, {
                                            fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                                            lineNumber: 2049,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                                        lineNumber: 2048,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-2xl font-bold",
                                                children: "JWT"
                                            }, void 0, false, {
                                                fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                                                lineNumber: 2052,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-sm text-muted-foreground",
                                                children: "Auth Method"
                                            }, void 0, false, {
                                                fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                                                lineNumber: 2053,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                                        lineNumber: 2051,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                                lineNumber: 2047,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                            lineNumber: 2046,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                        lineNumber: 2045,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardContent"], {
                            className: "p-4",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "p-2 rounded-lg bg-emerald-500/10",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$webhook$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Webhook$3e$__["Webhook"], {
                                            className: "w-5 h-5 text-emerald-500"
                                        }, void 0, false, {
                                            fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                                            lineNumber: 2062,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                                        lineNumber: 2061,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-2xl font-bold",
                                                children: "REST"
                                            }, void 0, false, {
                                                fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                                                lineNumber: 2065,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-sm text-muted-foreground",
                                                children: "Protocol"
                                            }, void 0, false, {
                                                fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                                                lineNumber: 2066,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                                        lineNumber: 2064,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                                lineNumber: 2060,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                            lineNumber: 2059,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                        lineNumber: 2058,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                lineNumber: 2018,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$components$2f$ui$2f$tabs$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Tabs"], {
                value: activeTab,
                onValueChange: setActiveTab,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$components$2f$ui$2f$tabs$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TabsList"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$components$2f$ui$2f$tabs$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TabsTrigger"], {
                            value: "all",
                            children: "All APIs"
                        }, void 0, false, {
                            fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                            lineNumber: 2076,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$components$2f$ui$2f$tabs$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TabsTrigger"], {
                            value: "core",
                            children: "Core"
                        }, void 0, false, {
                            fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                            lineNumber: 2077,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$components$2f$ui$2f$tabs$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TabsTrigger"], {
                            value: "organization",
                            children: "Organization"
                        }, void 0, false, {
                            fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                            lineNumber: 2078,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$components$2f$ui$2f$tabs$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TabsTrigger"], {
                            value: "testing",
                            children: "Testing"
                        }, void 0, false, {
                            fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                            lineNumber: 2079,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$components$2f$ui$2f$tabs$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TabsTrigger"], {
                            value: "intelligence",
                            children: "Intelligence"
                        }, void 0, false, {
                            fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                            lineNumber: 2080,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                    lineNumber: 2075,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                lineNumber: 2074,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                        className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
                    }, void 0, false, {
                        fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                        lineNumber: 2086,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                        placeholder: "Search endpoints...",
                        value: searchQuery,
                        onChange: (e)=>setSearchQuery(e.target.value),
                        className: "pl-10"
                    }, void 0, false, {
                        fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                        lineNumber: 2087,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                lineNumber: 2085,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-4 gap-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                        className: "col-span-1 h-fit sticky top-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardHeader"], {
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardTitle"], {
                                    className: "text-sm",
                                    children: "Resources"
                                }, void 0, false, {
                                    fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                                    lineNumber: 2100,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                                lineNumber: 2099,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardContent"], {
                                className: "p-0",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$components$2f$ui$2f$scroll$2d$area$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ScrollArea"], {
                                    className: "h-[600px]",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "p-2 space-y-1",
                                        children: apiSections.filter((section)=>categoryGroups[activeTab].includes(section.name)).map((section)=>{
                                            const Icon = section.icon;
                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>toggleSection(section.name),
                                                className: `w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-left transition-colors ${expandedSections.includes(section.name) ? "bg-primary/10 text-primary" : "hover:bg-muted text-muted-foreground"}`,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                                                        className: "w-4 h-4"
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                                                        lineNumber: 2119,
                                                        columnNumber: 25
                                                    }, this),
                                                    section.name,
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                        variant: "secondary",
                                                        className: "ml-auto text-xs",
                                                        children: section.endpoints.length
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                                                        lineNumber: 2121,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, section.name, true, {
                                                fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                                                lineNumber: 2110,
                                                columnNumber: 23
                                            }, this);
                                        })
                                    }, void 0, false, {
                                        fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                                        lineNumber: 2104,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                                    lineNumber: 2103,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                                lineNumber: 2102,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                        lineNumber: 2098,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "col-span-3 space-y-4",
                        children: filteredSections.map((section)=>{
                            const Icon = section.icon;
                            const isExpanded = expandedSections.includes(section.name);
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$components$2f$ui$2f$collapsible$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Collapsible"], {
                                open: isExpanded,
                                onOpenChange: ()=>toggleSection(section.name),
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$components$2f$ui$2f$collapsible$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CollapsibleTrigger"], {
                                            className: "w-full",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardHeader"], {
                                                className: "cursor-pointer hover:bg-muted/50 transition-colors",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center justify-between",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex items-center gap-3",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "p-2 rounded-lg bg-muted",
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                                                                        className: "w-5 h-5 text-muted-foreground"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                                                                        lineNumber: 2146,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                                                                    lineNumber: 2145,
                                                                    columnNumber: 27
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "text-left",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardTitle"], {
                                                                            className: "text-base",
                                                                            children: section.name
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                                                                            lineNumber: 2149,
                                                                            columnNumber: 29
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardDescription"], {
                                                                            className: "text-sm",
                                                                            children: section.description
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                                                                            lineNumber: 2150,
                                                                            columnNumber: 29
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                                                                    lineNumber: 2148,
                                                                    columnNumber: 27
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                                                            lineNumber: 2144,
                                                            columnNumber: 25
                                                        }, this),
                                                        isExpanded ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                                                            className: "w-5 h-5 text-muted-foreground"
                                                        }, void 0, false, {
                                                            fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                                                            lineNumber: 2154,
                                                            columnNumber: 27
                                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"], {
                                                            className: "w-5 h-5 text-muted-foreground"
                                                        }, void 0, false, {
                                                            fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                                                            lineNumber: 2156,
                                                            columnNumber: 27
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                                                    lineNumber: 2143,
                                                    columnNumber: 23
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                                                lineNumber: 2142,
                                                columnNumber: 21
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                                            lineNumber: 2141,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$components$2f$ui$2f$collapsible$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CollapsibleContent"], {
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardContent"], {
                                                className: "pt-0 space-y-3",
                                                children: section.endpoints.map((endpoint)=>{
                                                    const endpointKey = `${endpoint.method}-${endpoint.path}`;
                                                    const isEndpointExpanded = expandedEndpoints.includes(endpointKey);
                                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$components$2f$ui$2f$collapsible$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Collapsible"], {
                                                        open: isEndpointExpanded,
                                                        onOpenChange: ()=>toggleEndpoint(endpointKey),
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "border rounded-lg overflow-hidden",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$components$2f$ui$2f$collapsible$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CollapsibleTrigger"], {
                                                                    className: "w-full",
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "flex items-center gap-3 p-3 bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                                                className: `${methodColors[endpoint.method]} font-mono text-xs w-16 justify-center`,
                                                                                children: endpoint.method
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                                                                                lineNumber: 2177,
                                                                                columnNumber: 35
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                                                                className: "text-sm font-mono flex-1 text-left",
                                                                                children: endpoint.path
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                                                                                lineNumber: 2182,
                                                                                columnNumber: 35
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: "flex items-center gap-2",
                                                                                children: [
                                                                                    endpoint.auth ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Lock$3e$__["Lock"], {
                                                                                        className: "w-4 h-4 text-muted-foreground"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                                                                                        lineNumber: 2185,
                                                                                        columnNumber: 39
                                                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2d$open$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Unlock$3e$__["Unlock"], {
                                                                                        className: "w-4 h-4 text-muted-foreground"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                                                                                        lineNumber: 2187,
                                                                                        columnNumber: 39
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                        className: "text-sm text-muted-foreground hidden md:block",
                                                                                        children: endpoint.summary
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                                                                                        lineNumber: 2189,
                                                                                        columnNumber: 37
                                                                                    }, this),
                                                                                    isEndpointExpanded ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                                                                                        className: "w-4 h-4"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                                                                                        lineNumber: 2193,
                                                                                        columnNumber: 39
                                                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"], {
                                                                                        className: "w-4 h-4"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                                                                                        lineNumber: 2195,
                                                                                        columnNumber: 39
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                                                                                lineNumber: 2183,
                                                                                columnNumber: 35
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                                                                        lineNumber: 2176,
                                                                        columnNumber: 33
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                                                                    lineNumber: 2175,
                                                                    columnNumber: 31
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$components$2f$ui$2f$collapsible$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CollapsibleContent"], {
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "p-4 space-y-4 bg-card",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: "flex items-center justify-between",
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                        className: "text-sm text-muted-foreground",
                                                                                        children: endpoint.description
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                                                                                        lineNumber: 2204,
                                                                                        columnNumber: 37
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                                                        variant: "ghost",
                                                                                        size: "sm",
                                                                                        onClick: ()=>copyPath(endpoint.path),
                                                                                        children: copiedPath === endpoint.path ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__["Check"], {
                                                                                            className: "w-4 h-4 text-green-500"
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                                                                                            lineNumber: 2207,
                                                                                            columnNumber: 41
                                                                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$copy$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Copy$3e$__["Copy"], {
                                                                                            className: "w-4 h-4"
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                                                                                            lineNumber: 2209,
                                                                                            columnNumber: 41
                                                                                        }, this)
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                                                                                        lineNumber: 2205,
                                                                                        columnNumber: 37
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                                                                                lineNumber: 2203,
                                                                                columnNumber: 35
                                                                            }, this),
                                                                            endpoint.queryParams && endpoint.queryParams.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                                                        className: "text-sm font-medium mb-2",
                                                                                        children: "Query Parameters"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                                                                                        lineNumber: 2216,
                                                                                        columnNumber: 39
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                        className: "bg-muted rounded-lg p-3 space-y-2",
                                                                                        children: endpoint.queryParams.map((param)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                                className: "flex items-start gap-2 text-sm",
                                                                                                children: [
                                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                                                                                        className: "text-primary",
                                                                                                        children: param.name
                                                                                                    }, void 0, false, {
                                                                                                        fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                                                                                                        lineNumber: 2220,
                                                                                                        columnNumber: 45
                                                                                                    }, this),
                                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                                        className: "text-muted-foreground",
                                                                                                        children: [
                                                                                                            "(",
                                                                                                            param.type,
                                                                                                            ")"
                                                                                                        ]
                                                                                                    }, void 0, true, {
                                                                                                        fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                                                                                                        lineNumber: 2221,
                                                                                                        columnNumber: 45
                                                                                                    }, this),
                                                                                                    param.required && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                                                                        variant: "destructive",
                                                                                                        className: "text-xs",
                                                                                                        children: "required"
                                                                                                    }, void 0, false, {
                                                                                                        fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                                                                                                        lineNumber: 2223,
                                                                                                        columnNumber: 47
                                                                                                    }, this),
                                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                                        className: "text-muted-foreground",
                                                                                                        children: [
                                                                                                            "- ",
                                                                                                            param.description
                                                                                                        ]
                                                                                                    }, void 0, true, {
                                                                                                        fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                                                                                                        lineNumber: 2227,
                                                                                                        columnNumber: 45
                                                                                                    }, this)
                                                                                                ]
                                                                                            }, param.name, true, {
                                                                                                fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                                                                                                lineNumber: 2219,
                                                                                                columnNumber: 43
                                                                                            }, this))
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                                                                                        lineNumber: 2217,
                                                                                        columnNumber: 39
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                                                                                lineNumber: 2215,
                                                                                columnNumber: 37
                                                                            }, this),
                                                                            endpoint.requestBody && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                                                        className: "text-sm font-medium mb-2",
                                                                                        children: "Request Body"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                                                                                        lineNumber: 2236,
                                                                                        columnNumber: 39
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("pre", {
                                                                                        className: "bg-muted rounded-lg p-3 text-xs overflow-x-auto",
                                                                                        children: JSON.stringify(endpoint.requestBody, null, 2)
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                                                                                        lineNumber: 2237,
                                                                                        columnNumber: 39
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                                                                                lineNumber: 2235,
                                                                                columnNumber: 37
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                                                        className: "text-sm font-medium mb-2",
                                                                                        children: "Response"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                                                                                        lineNumber: 2244,
                                                                                        columnNumber: 37
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("pre", {
                                                                                        className: "bg-muted rounded-lg p-3 text-xs overflow-x-auto",
                                                                                        children: JSON.stringify(endpoint.responseBody, null, 2)
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                                                                                        lineNumber: 2245,
                                                                                        columnNumber: 37
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                                                                                lineNumber: 2243,
                                                                                columnNumber: 35
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                                                                        lineNumber: 2202,
                                                                        columnNumber: 33
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                                                                    lineNumber: 2201,
                                                                    columnNumber: 31
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                                                            lineNumber: 2174,
                                                            columnNumber: 29
                                                        }, this)
                                                    }, endpointKey, false, {
                                                        fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                                                        lineNumber: 2169,
                                                        columnNumber: 27
                                                    }, this);
                                                })
                                            }, void 0, false, {
                                                fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                                                lineNumber: 2163,
                                                columnNumber: 21
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                                            lineNumber: 2162,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                                    lineNumber: 2140,
                                    columnNumber: 17
                                }, this)
                            }, section.name, false, {
                                fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                                lineNumber: 2139,
                                columnNumber: 15
                            }, this);
                        })
                    }, void 0, false, {
                        fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                        lineNumber: 2133,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
                lineNumber: 2096,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/frontend/components/api-docs/api-docs-hub.tsx",
        lineNumber: 1995,
        columnNumber: 5
    }, this);
}
_s(ApiDocsHub, "38hwGSddM/ca08SLDGPerLhNpuc=");
_c = ApiDocsHub;
var _c;
__turbopack_context__.k.register(_c, "ApiDocsHub");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=apps_frontend_components_e8014260._.js.map