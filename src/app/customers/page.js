"use client";

import { Spin } from "antd";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await fetch("/api/customers");
        if (!res.ok) {
          throw new Error("Failed to fetch customers");
        }
        const data = await res.json();
        setCustomers(data.data.customers.nodes);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);
  console.log(customers);
  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-8">
          Alteride Cabinet
        </h1>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-6 pb-2">Customers List</h2>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Spin />
            </div>
          ) : customers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse border-spacing-0">
                <thead className="bg-gray-100 text-left">
                  <tr>
                    <th className="p-2">NAME</th>
                    <th className="p-2">EMAIL</th>
                    <th className="p-2">ID</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {customers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="hover:bg-blue-200 cursor-pointer"
                      onClick={() =>
                        router.push(
                          `/customers/${encodeURIComponent(customer.id)}`
                        )
                      }
                    >
                      <td className="p-2 whitespace-nowrap">
                        {customer.firstName} {customer.lastName}
                      </td>
                      <td className="p-2 whitespace-nowrap">
                        {customer.email}
                      </td>
                      <td className="p-2 whitespace-nowrap">{customer.id}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">No customers found</div>
          )}
        </div>
      </div>
    </main>
  );
};

export default Customers;
