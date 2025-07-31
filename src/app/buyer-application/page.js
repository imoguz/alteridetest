"use client";

export const dynamic = "force-dynamic";

import {
  Form,
  Input,
  InputNumber,
  Select,
  Checkbox,
  Radio,
  Button,
  Upload,
  message,
  Spin,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

export default function BuyerApplication() {
  const searchParams = useSearchParams();
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    const customerId = searchParams.get("id");

    const formData = new FormData();
    values.supportingDocuments.forEach((file) => {
      formData.append("files", file.originFileObj);
    });

    const uploadRes = await fetch("/api/uploadShopifyFiles", {
      method: "POST",
      body: formData,
    });

    const uploadJson = await uploadRes.json();
    console.log("uploadJson", uploadJson);

    const uploadedFiles = uploadJson?.data?.fileCreate?.files || [];
    const fileGids = uploadedFiles.map((f) => f.id);

    const metafields = [
      {
        namespace: "buyer_application",
        key: "company_name",
        type: "single_line_text_field",
        value: values.companyName,
      },
      {
        namespace: "buyer_application",
        key: "ein_number",
        type: "single_line_text_field",
        value: values.einNumber,
      },
      {
        namespace: "sellerintegral",
        key: "supporting_documents",
        type: "list.file_reference",
        value: JSON.stringify(fileGids),
      },
    ];

    const query = `
    mutation customerUpdate($input: CustomerInput!) {
      customerUpdate(input: $input) {
        customer { id }
        userErrors { field message }
      }
    }
  `;

    await fetch("/api/updateCustomer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query,
        variables: { input: { id: customerId, metafields } },
      }),
    });
  };

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  const businessType = [
    { value: "Contractor", label: "Contractor" },
    { value: "Builder", label: "Builder" },
    { value: "Dealer", label: "Dealer" },
  ];

  const annualRevenue = [
    { value: "<250K", label: "<250K" },
    { value: "250K-500K", label: "250K-500K" },
    { value: "500K-1M", label: "500K-1M" },
    { value: "1M+", label: "1M+" },
  ];

  return (
    <Suspense fallback={<Spin />}>
      <main className="min-h-screen p-8 bg-gray-50">
        <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
          <h1 className="text-2xl font-bold mb-4">
            Professional Buyer Application
          </h1>

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{
              servicesProvided: [],
              hasShowroom: "Yes",
            }}
          >
            <div className="flex gap-4">
              <Form.Item
                label="Company Name"
                name="companyName"
                rules={[
                  { required: true, message: "Please enter company name" },
                ]}
                className="w-full"
              >
                <Input />
              </Form.Item>

              <Form.Item
                label="EIN Number"
                name="einNumber"
                rules={[
                  { required: true, message: "Please enter EIN number" },
                  { pattern: /^[0-9]+$/, message: "EIN must be numeric" },
                ]}
                className="w-full"
              >
                <Input />
              </Form.Item>
            </div>
            <div className="flex gap-4">
              <Form.Item
                label="Business Phone Number"
                name="businessPhone"
                rules={[
                  { required: true, message: "Please enter business phone" },
                  {
                    pattern: /^[0-9+\-\s()]+$/,
                    message: "Invalid phone format",
                  },
                ]}
                className="w-full"
              >
                <Input />
              </Form.Item>

              <Form.Item
                label="Business Type"
                name="businessType"
                className="w-full"
                rules={[
                  { required: true, message: "Please select business type" },
                ]}
              >
                <Select
                  placeholder="Select business type"
                  options={businessType}
                />
              </Form.Item>
            </div>

            <Form.Item
              label="Company Address"
              name="companyAddress"
              rules={[
                { required: true, message: "Please enter company address" },
              ]}
              className="w-full"
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Services Provided"
              name="servicesProvided"
              rules={[
                {
                  required: true,
                  type: "array",
                  min: 1,
                  message: "Please select at least one service",
                },
              ]}
            >
              <Checkbox.Group>
                <Checkbox value="Kitchen Remodeling">
                  Kitchen Remodeling
                </Checkbox>
                <Checkbox value="Flooring">Flooring</Checkbox>
                <Checkbox value="Bathroom Remodeling">
                  Bathroom Remodeling
                </Checkbox>
              </Checkbox.Group>
            </Form.Item>

            <div className="flex gap-4">
              <Form.Item
                label="Company Website"
                name="companyWebsite"
                rules={[{ type: "url", message: "Invalid URL" }]}
                className="w-full"
              >
                <Input placeholder="https://..." />
              </Form.Item>

              <Form.Item
                label="Google Maps Location"
                name="googleMapsLocation"
                rules={[{ type: "url", message: "Invalid URL" }]}
                className="w-full"
              >
                <Input placeholder="https://..." />
              </Form.Item>
            </div>
            <div className="flex gap-4">
              <Form.Item
                label="Number of Employees"
                name="numberOfEmployees"
                rules={[
                  {
                    required: true,
                    message: "Please enter number of employees",
                  },
                ]}
                className="w-full"
              >
                <InputNumber min={1} className="w-full" />
              </Form.Item>

              <Form.Item
                label="Average Annual Revenue"
                name="averageAnnualRevenue"
                rules={[
                  { required: true, message: "Please select revenue range" },
                ]}
                className="w-full"
              >
                <Select
                  placeholder="Select revenue range"
                  options={annualRevenue}
                  className="w-full"
                />
              </Form.Item>
            </div>

            <Form.Item
              label="Do You Have a Showroom?"
              name="hasShowroom"
              rules={[{ required: true, message: "Please select an option" }]}
            >
              <Radio.Group>
                <Radio value="Yes">Yes</Radio>
                <Radio value="No">No</Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item
              label="Primary Service Areas"
              name="primaryServiceAreas"
              rules={[
                {
                  required: true,
                  message: "Please enter primary service areas",
                },
              ]}
            >
              <Input placeholder="e.g. New York, Los Angeles" />
            </Form.Item>

            <Form.Item
              label="Supporting Business Documents (PDFs, max 5 files)"
              name="supportingDocuments"
              valuePropName="fileList"
              getValueFromEvent={normFile}
              rules={[
                {
                  required: true,
                  message: "Please upload supporting documents",
                },
              ]}
            >
              <Upload
                name="files"
                multiple
                accept=".pdf"
                maxCount={5}
                beforeUpload={(file) => {
                  const isPdf = file.type === "application/pdf";
                  if (!isPdf) {
                    message.error(`${file.name} is not a PDF file`);
                  }
                  const isLt10M = file.size / 1024 / 1024 < 10;
                  if (!isLt10M) {
                    message.error(`${file.name} must be smaller than 10MB`);
                  }
                  return isPdf && isLt10M ? true : Upload.LIST_IGNORE;
                }}
              >
                <Button icon={<UploadOutlined />}>Select File(s)</Button>
              </Upload>
            </Form.Item>

            <Form.Item className="flex justify-end">
              <Button type="primary" htmlType="submit">
                Submit Application
              </Button>
            </Form.Item>
          </Form>
        </div>
      </main>
    </Suspense>
  );
}
