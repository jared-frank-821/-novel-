"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Edit, Home, List } from "lucide-react";

const Navbar = () => {
  const pathname = usePathname();

  const navItems = [
    { name: "首页", href: "/", icon: <Home size={20} />, id: "home"},
    { name: "编辑器", href: "/editor", icon: <Edit size={20} />, id: "editor" },
    { name: "小说列表", href: "/novels", icon: <List size={20} />, id: "novels"},
  ];

  return (
    <nav className="bg-linear-to-r from-blue-600 to-blue-800 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen size={24} />
            <span className="text-xl font-bold">My Novel</span>
          </div>
          
          <div className="flex space-x-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
               <Link href={item.href} key={item.id}  id={`nav-link-${item.id}`}> {item.name}
               </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;