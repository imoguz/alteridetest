"use client";

import React from "react";
import { Button, Menu } from "antd";
import { useRouter } from "next/navigation";

const MainHeader = () => {
  const router = useRouter();

  const menuItems = [
    { key: "/", label: "Home" },
    { key: "/customers", label: "Customers" },
  ];

  const onMenuClick = ({ key }) => {
    router.push(key);
  };
  return (
    <header className="mainheader sticky top-0 z-50 flex justify-end items-center w-full h-20 px-10 bg-gray-900 border-b border-gray-800">
      <div className="hidden md:block flex-grow">
        <Menu
          mode="horizontal"
          items={menuItems}
          onClick={onMenuClick}
          className="w-full flex justify-center bg-transparent"
        />
      </div>
      <div className="flex gap-3 min-w-36 justify-end">
        <Button
          href="/auth/login"
          size="large"
          style={{ backgroundColor: "transparent", color: "white" }}
        >
          Login
        </Button>
        <Button href="/auth/signup" size="large" type="primary">
          Sign-up
        </Button>
      </div>
    </header>
  );
};

export default MainHeader;
