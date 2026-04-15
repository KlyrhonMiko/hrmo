module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/frontend/src/app/api/reports/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DELETE",
    ()=>DELETE,
    "GET",
    ()=>GET,
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/next/server.js [app-route] (ecmascript)");
;
// In-memory store for demo — replace with DB in production
let savedReports = [
    {
        id: '1',
        title: 'Q1 2026 Department Headcount',
        description: 'Personnel distribution across all academic departments for the first quarter.',
        groupBy: 'department',
        createdAt: '2026-02-15T08:30:00Z',
        createdBy: 'HR Head',
        results: [
            {
                group: 'CCS',
                value: 45
            },
            {
                group: 'CIHM',
                value: 33
            },
            {
                group: 'COED',
                value: 42
            },
            {
                group: 'CBA',
                value: 65
            },
            {
                group: 'CAS',
                value: 38
            },
            {
                group: 'COE',
                value: 29
            },
            {
                group: 'CON',
                value: 18
            }
        ]
    },
    {
        id: '2',
        title: 'Employment Status Breakdown',
        description: 'Overview of employee types: teaching, non-teaching, and COS personnel.',
        groupBy: 'status',
        createdAt: '2026-03-01T10:15:00Z',
        createdBy: 'HR Head',
        results: [
            {
                group: 'Teaching',
                value: 244
            },
            {
                group: 'Non-Teaching',
                value: 103
            },
            {
                group: 'COS',
                value: 34
            }
        ]
    }
];
function generateMockResults(groupBy) {
    if (groupBy === 'department') {
        return [
            {
                group: 'CCS',
                value: 45
            },
            {
                group: 'CIHM',
                value: 33
            },
            {
                group: 'COED',
                value: 42
            },
            {
                group: 'CBA',
                value: 65
            },
            {
                group: 'CAS',
                value: 38
            },
            {
                group: 'COE',
                value: 29
            },
            {
                group: 'CON',
                value: 18
            }
        ];
    } else if (groupBy === 'status') {
        return [
            {
                group: 'Teaching',
                value: 244
            },
            {
                group: 'Non-Teaching',
                value: 103
            },
            {
                group: 'COS',
                value: 34
            }
        ];
    } else if (groupBy === 'degree') {
        return [
            {
                group: 'Bachelors',
                value: 156
            },
            {
                group: 'Masters',
                value: 180
            },
            {
                group: 'Doctorate',
                value: 45
            }
        ];
    }
    return [];
}
let nextId = 3;
async function GET() {
    return __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        data: savedReports
    }, {
        status: 200
    });
}
async function POST(request) {
    try {
        const body = await request.json();
        const { title, description, groupBy } = body;
        if (!title || !groupBy) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Missing required fields: title, groupBy'
            }, {
                status: 400
            });
        }
        const newReport = {
            id: String(nextId++),
            title,
            description: description || '',
            groupBy,
            createdAt: new Date().toISOString(),
            createdBy: 'HR Head',
            results: generateMockResults(groupBy)
        };
        savedReports.unshift(newReport);
        return __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            data: newReport
        }, {
            status: 201
        });
    } catch  {
        return __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Invalid request body'
        }, {
            status: 400
        });
    }
}
async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Missing id parameter'
            }, {
                status: 400
            });
        }
        const index = savedReports.findIndex((r)=>r.id === id);
        if (index === -1) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Report not found'
            }, {
                status: 404
            });
        }
        savedReports.splice(index, 1);
        return __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true
        }, {
            status: 200
        });
    } catch  {
        return __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Internal Server Error'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__eabb9544._.js.map