# zuoyenan - 个人作品集与AI对话系统

本项目是一个基于 Next.js 的现代化 Web 应用。它不仅整合并展示了个人作品集，还集成了一个由 QAnything 大语言模型驱动的智能问答机器人。整个网站采用了具有科技感的深色主题，并应用了全新的UI布局。

## ✨ 项目特点

- **作品集展示**: 以一个交互式的列表动态展示 `zuopinji` 目录下的所有作品。
- **AI 问答**: 集成了 QAnything API，提供了一个流畅、美观的聊天界面，能够进行智能对话。
- **WakaTime 集成**: 在页脚实时展示个人的 WakaTime 总编码时长。
- **现代化UI**: 采用深色主题，并为作品集和聊天界面设计了全新的UI布局和交互效果。

## 🛠️ 技术栈

- **框架**: [Next.js](https://nextjs.org/)
- **语言**: [TypeScript](https://www.typescriptlang.org/)
- **UI**: [React](https://reactjs.org/), [Tailwind CSS](https://tailwindcss.com/)
- **API**: [WakaTime API](https://wakatime.com/developers), [QAnything API](https://qanything.ai/)

## 🚀 本地开发指南

1.  **克隆仓库**
    ```bash
    git clone [你的仓库URL]
    cd final-project
    ```

2.  **安装依赖**
    ```bash
    npm install
    ```

3.  **设置环境变量**
    创建 `.env.local` 文件，并填入您的 API 密钥：
    ```
    WAKATIME_API_KEY="YOUR_WAKATIME_API_KEY"
    QANYTHING_API_KEY="YOUR_QANYTHING_API_KEY" 
    ```
    *确保 `QANYTHING_API_KEY` 是必需的，如果您的QAnything服务不需要密钥，则可以忽略。*

4.  **运行开发服务器**
    ```bash
    npm run dev
    ```

    在浏览器中打开 [http://localhost:3000](http://localhost:3000) 查看。

## 📂 项目结构

```
/final-project
├── app/
│   ├── components/       # 共享组件 (Header, Footer)
│   ├── portfolio/        # 作品集页面及路由
│   ├── qanything/        # AI 问答页面
│   ├── api/              # 后端 API 路由
│   ├── layout.tsx        # 全局布局
│   └── page.tsx          # 首页
├── zuopinji/             # 存放作品集 .html 文件
├── public/               # 静态资源 (图片等)
├── .env.local            # 环境变量
├── README.md             # 项目说明文件
└── ...                   # 其他 Next.js 配置文件
```

---
*该项目作为一个课程期末作业，展示了从前端基础到全栈框架应用的综合能力。*
