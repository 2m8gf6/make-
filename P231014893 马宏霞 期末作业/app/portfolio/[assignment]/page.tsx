import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import { notFound } from 'next/navigation';

// 辅助函数，用于将文件名转换为更易读的标题
function formatAssignmentName(filename: string): string {
  return filename
    .replace('.html', '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function AssignmentPage({ params }: { params: { assignment: string } }) {
  const { assignment } = params;
  const decodedAssignment = decodeURIComponent(assignment);
  
  const filePath = path.join(process.cwd(), 'zuopinji', decodedAssignment);

  let content: string;
  try {
    content = fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    console.error('File read error:', error);
    // 如果文件不存在或无法读取，则显示404页面
    return notFound();
  }
  
  const assignmentName = formatAssignmentName(decodedAssignment);

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <Link href="/portfolio" className="transition-colors" style={{ color: 'var(--primary)' }}>
          &larr; 返回作品集列表
        </Link>
        <h1 className="text-3xl font-bold mt-2 text-white">{assignmentName}</h1>
      </div>
      <div 
        className="w-full h-full bg-white rounded-lg p-4"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
} 