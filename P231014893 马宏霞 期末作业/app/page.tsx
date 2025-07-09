import Image from "next/image";

export default function Home() {
  return (
    <div className="text-center">
      <h1 className="text-4xl sm:text-5xl font-bold mb-6">
        欢迎来到我的课程期末项目
      </h1>
      <p className="text-lg text-gray-300 max-w-2xl mx-auto">
        本项目旨在展示 Next.js, React, 和 Tailwind CSS 的学习成果。
        请使用上方的导航栏浏览我的作品集，或与 QAnything 智能问答机器人进行互动。
      </p>
    </div>
  );
}
