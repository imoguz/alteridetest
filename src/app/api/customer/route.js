export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

export async function POST(req) {
  const { query } = await req.json();

  const SHOPIFY_STORE = process.env.SHOPIFY_STORE;
  const ADMIN_API_TOKEN = process.env.SHOPIFY_ADMIN_API_TOKEN;

  if (!SHOPIFY_STORE || !ADMIN_API_TOKEN) {
    return NextResponse.json(
      { error: "Missing environment variables" },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      `https://${SHOPIFY_STORE}/admin/api/2025-07/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": ADMIN_API_TOKEN,
        },
        body: JSON.stringify({ query }),
      }
    );

    const data = await response.json();

    if (!response.ok || data.errors) {
      return NextResponse.json(
        { error: data.errors || "API error" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
