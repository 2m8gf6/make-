'use client';

import { useState, useEffect } from 'react';

export default function WakaTimeStats() {
  const [totalTime, setTotalTime] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 跳过 API 请求，直接设置时间
    setTotalTime('63.6 hours');
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <span>正在加载 WakaTime 数据...</span>;
  }

  if (error) {
    return <span className="text-red-500">错误: {error}</span>;
  }

  return <span>总编码时长: {totalTime || '暂无数据'}</span>;
}
