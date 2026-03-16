import Link from "next/link";
import { BookOpen, Edit, List, Sparkles, Users, Zap } from "lucide-react";

export default function Home() {
  const features = [
    {
      icon: <Edit className="text-blue-600" size={24} />,
      title: "智能编辑器",
      description: "内置气泡菜单，支持加粗、斜体等格式，让创作更流畅",
    },
    {
      icon: <BookOpen className="text-blue-600" size={24} />,
      title: "作品管理",
      description: "轻松管理你的所有小说作品，随时查看和编辑",
    },
    {
      icon: <Sparkles className="text-blue-600" size={24} />,
      title: "AI辅助",
      description: "智能提示和语法检查，提升创作效率",
    },
    {
      icon: <Users className="text-blue-600" size={24} />,
      title: "社区分享",
      description: "与创作者交流，分享你的故事",
    },
  ];

  const quickActions = [
    {
      title: "开始创作",
      description: "使用我们的智能编辑器开始写作",
      href: "/editor",
      icon: <Edit size={20} />,
      color: "bg-gradient-to-r from-blue-500 to-blue-600",
    },
    {
      title: "查看作品",
      description: "浏览和管理你的所有小说",
      href: "/novels",
      icon: <List size={20} />,
      color: "bg-gradient-to-r from-blue-600 to-blue-700",
    },
    {
      title:"临时创作",
      description:"试一下api能否连接",
      href:"/try",
      icon: <Edit size={20} />,
      color:"bg-gradient-to-r from-blue-400 to-blue-500"
    }
  ];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center space-y-6">
        <div className="inline-flex items-center justify-center p-3 bg-linear-to-r from-blue-500 to-blue-600 rounded-full mb-4">
          <Zap className="text-white" size={32} />
        </div>
        <h1 className="text-5xl font-bold text-gray-900">
          欢迎来到 <span className="text-blue-600">My Novel</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          一个专为创作者设计的小说写作平台，提供智能编辑器和完整的作品管理功能
        </p>
      </section>

      {/* Quick Actions */}
      <section>
        <h2 className="text-3xl font-bold text-gray-900 mb-6">快速开始</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              href={action.href}
              className={`${action.color} text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300`}
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/20 rounded-lg">
                  {action.icon}
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-bold">{action.title}</h3>
                  <p className="text-blue-100">{action.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Features */}
      <section>
        <h2 className="text-3xl font-bold text-gray-900 mb-6">核心功能</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-xl shadow-md border border-blue-100 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="bg-linear-to-r from-blue-50 to-blue-100 rounded-2xl p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-blue-600">1000+</div>
            <div className="text-gray-600">活跃创作者</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-blue-600">5000+</div>
            <div className="text-gray-600">已创作作品</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-blue-600">99%</div>
            <div className="text-gray-600">用户满意度</div>
          </div>
        </div>
      </section>
    </div>
  );
}
