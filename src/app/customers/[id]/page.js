import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "antd";

export const dynamic = "force-dynamic";

export default async function CustomerDetail({ params }) {
  const { id } = params;

  const decodedId = decodeURIComponent(id);

  const query = `
  {
    customer(id: "${decodedId}") {
      id
      displayName
      firstName
      lastName
      email
      phone
      metafields(first: 10, namespace: "buyer_application") {
        edges {
          node {
            id
            key
            value
          }
        }
      }
    }
  }
`;

  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/customer`, {
    method: "POST",
    body: JSON.stringify({ query }),
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  if (!res.ok) {
    console.error(await res.text());
    notFound();
  }

  const data = await res.json();
  const customer = data?.data?.customer;

  if (!customer) return notFound();

  const metafields = customer?.metafields?.edges || [];

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Customer Detail</h1>

        <div className="bg-white rounded-lg shadow p-6 space-y-4 mb-6">
          <div>
            <strong>ID:</strong> {customer.id}
          </div>
          <div>
            <strong>Name:</strong> {customer.firstName} {customer.lastName}
          </div>
          <div>
            <strong>Email:</strong> {customer.email}
          </div>
          <div>
            <strong>Phone:</strong> {customer.phone || "N/A"}
          </div>
        </div>

        {metafields.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 space-y-4 mb-6">
            <h2 className="text-xl font-semibold mb-2">
              Buyer Application Details
            </h2>
            {metafields.map(({ node }) => (
              <div key={node.id}>
                <strong>{node.key}:</strong> {node.value}
              </div>
            ))}
          </div>
        )}

        <Link
          href={`/buyer-application?id=${encodeURIComponent(customer.id)}`}
          className="inline-block"
        >
          <Button type="primary">Apply as Professional Buyer</Button>
        </Link>
      </div>
    </main>
  );
}
