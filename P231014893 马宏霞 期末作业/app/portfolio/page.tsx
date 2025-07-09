import fs from 'fs';
import path from 'path';
import Link from 'next/link';

// 定义作品类型
type Assignment = {
  filename: string;
  name: string;
};

// 辅助函数，用于将文件名转换为更易读的标题
function formatAssignmentName(filename: string): string {
  return filename
    .replace('.html', '') // 移除扩展名
    .replace(/[-_]/g, ' ') // 将连字符和下划线替换为空格
    .replace(/\b\w/g, (char) => char.toUpperCase()); // 将每个单词的首字母大写
}

export default function PortfolioPage() {
  // 在服务器端读取 zuopinji 目录下的文件
  const assignmentsDirectory = path.join(process.cwd(), 'zuopinji');
  let assignments: Assignment[] = [];

  try {
    const filenames = fs.readdirSync(assignmentsDirectory);
    assignments = filenames
      .filter((file) => file.endsWith('.html'))
      .map((filename) => ({
        filename,
        name: formatAssignmentName(filename),
      }));
  } catch (error) {
    console.error('无法读取作品集目录:', error);
    return (
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold mb-6">我的作品集</h1>
        <p className="text-red-500">加载作品列表时出错，请检查服务器日志。</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl text-center my-12">
        我的作品集
      </h1>
      {assignments.length > 0 ? (
        <div 
          className="rounded-lg shadow-lg overflow-hidden"
          style={{ backgroundColor: 'var(--card-background)', border: '1px solid var(--border)' }}
        >
          <div className="flex flex-col divide-y" style={{ borderColor: 'var(--border)' }}>
            {assignments.map((assignment) => (
              <Link key={assignment.filename} href={`/portfolio/${assignment.filename}`}>
                <div 
                  className="flex items-center justify-between p-4 sm:p-6 transition-all duration-300 transform hover:scale-[1.02] hover:bg-gray-800"
                >
                  <div className="flex items-center">
                    <svg className="h-8 w-8 mr-4 shrink-0" style={{ color: 'var(--primary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-lg font-medium text-white">{assignment.name}</span>
                  </div>
                  <div className="px-4 py-2 rounded-md text-sm font-semibold" style={{ backgroundColor: 'var(--primary)', color: 'white' }}>
                    查看
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div 
          className="text-center p-8 rounded-lg"
          style={{ backgroundColor: 'var(--card-background)', border: '1px solid var(--border)' }}
        >
          <p className="text-lg mb-2">
            作品集当前为空
          </p>
          <p className="text-sm opacity-70">
            请将您的 .html 文件添加到 `zuopinji` 目录下。
          </p>
        </div>
      )}
    </div>
  );
} 