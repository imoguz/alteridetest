import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files");

    if (!files.length) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    // Shopify Staged Uploads Create
    const stagedRes = await fetch(
      `https://${process.env.SHOPIFY_STORE}/admin/api/2024-07/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": process.env.SHOPIFY_ADMIN_API_TOKEN,
        },
        body: JSON.stringify({
          query: `
            mutation stagedUploadsCreate($input: [StagedUploadInput!]!) {
              stagedUploadsCreate(input: $input) {
                stagedTargets {
                  resourceUrl
                  url
                  parameters {
                    name
                    value
                  }
                }
                userErrors {
                  field
                  message
                }
              }
            }
          `,
          variables: {
            input: files.map((file) => ({
              filename: file.name,
              httpMethod: "POST",
              mimeType: file.type || "application/pdf",
              resource: "FILE",
            })),
          },
        }),
      }
    );

    const stagedJson = await stagedRes.json();
    const staged = stagedJson.data?.stagedUploadsCreate;

    if (!staged || staged.userErrors?.length) {
      return NextResponse.json(
        { error: staged?.userErrors || "Staging failed" },
        { status: 400 }
      );
    }

    // Upload files to staged S3 targets
    const resourceUrls = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const target = staged.stagedTargets[i];

      const uploadForm = new FormData();

      target.parameters.forEach((param) => {
        uploadForm.append(param.name, param.value);
      });

      uploadForm.append(
        "file",
        new Blob([await file.arrayBuffer()]),
        file.name
      );

      const uploadRes = await fetch(target.url, {
        method: "POST",
        body: uploadForm,
      });

      if (!uploadRes.ok) {
        return NextResponse.json(
          { error: `S3 upload failed for ${file.name}` },
          { status: 500 }
        );
      }

      resourceUrls.push(target.resourceUrl);
    }

    // Final fileCreate mutation
    const fileCreateRes = await fetch(
      `https://${process.env.SHOPIFY_STORE}/admin/api/2024-07/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": process.env.SHOPIFY_ADMIN_API_TOKEN,
        },
        body: JSON.stringify({
          query: `
            mutation fileCreate($files: [FileCreateInput!]!) {
              fileCreate(files: $files) {
                files {
                  __typename
                  ... on GenericFile {
                    id
                    url
                  }
                }
                userErrors {
                  field
                  message
                }
              }
            }
          `,
          variables: {
            files: resourceUrls.map((url) => ({
              originalSource: url,
              contentType: "FILE",
              alt: "Uploaded File",
            })),
          },
        }),
      }
    );

    const fileCreateJson = await fileCreateRes.json();
    const fileCreate = fileCreateJson.data?.fileCreate;

    if (!fileCreate || fileCreate.userErrors?.length) {
      return NextResponse.json(
        { error: fileCreate?.userErrors || "fileCreate failed" },
        { status: 400 }
      );
    }

    return NextResponse.json(fileCreate);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
