"use client";

export const dynamic = "force-dynamic";

import { useEffect } from "react";
import { Button, Checkbox, Form, Input, Typography } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { useRouter, useSearchParams } from "next/navigation";

import Link from "next/link";

const { Title } = Typography;

const LoginPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");

  const onFinish = async (values) => {
    try {
      console.log(values);
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <Title level={3} className="text-center">
          Login
        </Title>

        <Form
          name="login-form"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, message: "Please enter your email" }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Email"
              className="py-2"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: "Please enter your password" }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
              className="py-2"
            />
          </Form.Item>

          <Form.Item name="remember" valuePropName="checked" noStyle>
            <Checkbox>Remember me</Checkbox>
          </Form.Item>

          <Form.Item className="mt-6">
            <Button
              type="primary"
              htmlType="submit"
              block
              className="bg-blue-500 hover:bg-blue-600"
            >
              Log In
            </Button>
          </Form.Item>
        </Form>
        <div className="flex justify-between mx-1 mt-5 text-sm  text-blue-500">
          <Link href="/auth/login/forgot-password">
            <span className="text-sm text-blue-500 hover:text-blue-600 underline">
              Forgot password?
            </span>
          </Link>
          <div className="text-gray-800 ">
            Don&apos;t have an account?
            <Link href="/auth/signup">
              <span className="text-blue-500 hover:text-blue-600 ml-1 underline">
                Sign up
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
