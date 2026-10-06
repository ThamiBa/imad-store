import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        let apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
        apiUrl = apiUrl.replace(/\/$/, "");
        
        if (apiUrl.endsWith("/api/api")) {
            apiUrl = apiUrl.replace(/\/api\/api$/, "/api");
        } else if (!apiUrl.endsWith("/api")) {
            apiUrl += "/api";
        }

        const url = new URL(req.url);
        const clean = url.searchParams.get("clean") === "true";
        
        const fetchUrl = `${apiUrl}/seed${clean ? "?clean=true" : ""}`;
        const res = await fetch(fetchUrl, { method: "GET", cache: "no-store" });
        const data = await res.json();
        
        return NextResponse.json(data, { status: res.status });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
