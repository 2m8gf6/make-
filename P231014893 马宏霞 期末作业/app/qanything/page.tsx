'use client';

import { useState, useRef, useEffect, useLayoutEffect } from 'react';

// 定义消息源信息的接口
interface Source {
  fileId: string;
  fileName: string;
  content: string;
  score: string;
}

// 定义聊天消息的角色和内容
interface Message {
  role: 'user' | 'assistant';
  content: string;
  thinkContent?: string; // 可选的思考过程内容
  sources?: Source[]; // 可选的消息源信息
}

/**
 * 处理API返回的消息内容，提取<response>标签中的内容
 */
function processApiResponse(text: string): string {
  // 如果包含<response>标签，则只显示<response>标签内的内容
  if (text.includes('<response>')) {
    const responseMatch = text.match(/<response>([\s\S]*?)<\/response>/);
    if (responseMatch && responseMatch[1]) {
      return responseMatch[1].trim();
    }
  }
  
  // 如果包含<think>标签但没有<response>标签，则过滤掉<think>标签内容
  if (text.includes('<think>')) {
    return text.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
  }
  
  // 如果没有任何标签，则返回原始文本
  return text;
}

/**
 * 加载动画组件
 */
function LoadingIndicator() {
  return (
    <div className="flex items-center space-x-2">
      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'var(--primary)', animation: 'bounce 1s infinite' }}></div>
      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'var(--primary)', animation: 'bounce 1s infinite 0.2s' }}></div>
      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'var(--primary)', animation: 'bounce 1s infinite 0.4s' }}></div>
    </div>
  );
}

/**
 * 消息源信息组件
 */
function SourceInfo({ sources }: { sources: Source[] }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!sources || sources.length === 0) return null;
  
  return (
    <div className="mt-4 text-xs">
      <button 
        onClick={() => setIsExpanded(!isExpanded)} 
        className="flex items-center transition-colors"
        style={{ color: 'var(--primary)' }}
      >
        <span>{isExpanded ? '隐藏来源' : '查看来源'}</span>
        <svg 
          className={`w-4 h-4 ml-1 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>
      
      {isExpanded && (
        <div 
          className="mt-2 p-3 rounded-md text-sm"
          style={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)' }}
        >
          {sources.map((source, index) => (
            <div key={index} className="mb-2 pb-2 last:border-b-0" style={{ borderBottom: '1px solid var(--border)' }}>
              <div className="font-semibold text-white">文件: {source.fileName}</div>
              <div className="mt-1 whitespace-pre-wrap" style={{ color: 'var(--foreground)', opacity: 0.8 }}>{source.content}</div>
              <div className="mt-1" style={{ color: 'var(--foreground)', opacity: 0.6 }}>相关度: {parseFloat(source.score).toFixed(2)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function QAnythingPage() {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: question };
    
    // 构建历史记录 (使用上一次的 messages 状态)
    const historyMessages = messages.reduce((acc: { question: string; response: string }[], msg, index) => {
      if (msg.role === 'user' && messages[index + 1]?.role === 'assistant') {
        acc.push({ question: msg.content, response: messages[index + 1].content });
      }
      return acc;
    }, []);

    // 添加用户消息和助手的空"占位"消息
    const assistantPlaceholder: Message = { role: 'assistant', content: '', thinkContent: '' };
    setMessages([...messages, userMessage, assistantPlaceholder]);
    setQuestion('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/qanything', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: question,
          history: historyMessages.slice(-2),
        }),
      });

      if (!res.ok || !res.body) {
        throw new Error('API request failed');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullResponseText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        let newlineIndex;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          const line = buffer.slice(0, newlineIndex).trim();
          buffer = buffer.slice(newlineIndex + 1);

          if (line.startsWith('data:')) {
            const jsonStr = line.substring(5).trim();
            if (jsonStr) {
              try {
                const parsed = JSON.parse(jsonStr);
                
                if (parsed.result?.response) {
                  fullResponseText += parsed.result.response;
                }
                
                const sources = parsed.result?.source;

                // --- 全新的、更健壮的解析逻辑 ---
                const thinkMatch = fullResponseText.match(/<think>([\s\S]*?)<\/think>/);
                const responseMatch = fullResponseText.match(/<response>([\s\S]*?)<\/response>/);

                const thinkContent = thinkMatch ? thinkMatch[1].trim() : '';
                let content = '';

                if (responseMatch) {
                  content = responseMatch[1].trim();
                } else {
                  content = fullResponseText.replace(/<think>[\s\S]*?<\/think>/, '').trim();
                }

                // --- 持续更新最后一条消息（占位符） ---
                setMessages(prevMessages => {
                  const newMessages = [...prevMessages];
                  const lastMessage = newMessages[newMessages.length - 1];
                  if (lastMessage && lastMessage.role === 'assistant') {
                    lastMessage.content = content;
                    lastMessage.thinkContent = thinkContent;
                    lastMessage.sources = sources;
                  }
                  return newMessages;
                });

              } catch (e) {
                console.error("无法解析收到的JSON:", jsonStr, e);
              }
            }
          }
        }
      }
    } catch (error: any) {
      console.error('Fetch error:', error);
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage && lastMessage.role === 'assistant') {
          lastMessage.content = `抱歉，请求出错了：\n${error.message}`;
        }
        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="flex flex-col h-[calc(100vh-12rem)] max-w-4xl mx-auto w-full rounded-lg shadow-2xl"
      style={{ backgroundColor: 'var(--card-background)', border: '1px solid var(--border)' }}
    >
      {/* 聊天消息区域 */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-full text-center" style={{ color: 'var(--foreground)' }}>
             <svg className="w-16 h-16 mb-4 opacity-30" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9.5 9.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5zm3 3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5zm4.5-3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5z"/></svg>
            <h2 className="text-2xl font-semibold text-white">你好，我是 zuoyenan AI</h2>
            <p className="mt-2 max-w-md opacity-70">你可以问我任何问题，我会尽力为你解答。试着问问关于"作品集"里的内容。</p>
          </div>
        ) : (
          <>
            {messages.map((msg, index) => (
              <div key={index} className={`flex items-start gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {/* Avatar */}
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)' }}>
                    <svg className="w-5 h-5" style={{ color: 'var(--primary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                  </div>
                )}
                
                <div
                  className={`max-w-md lg:max-w-lg px-4 py-3 rounded-lg shadow-md ${
                    msg.role === 'user' ? 'text-white' : 'text-white'
                  }`}
                  style={{ 
                    backgroundColor: msg.role === 'user' ? 'var(--primary)' : 'var(--card-background)',
                    border: msg.role === 'user' ? 'none' : '1px solid var(--border)'
                  }}
                >
                  {/* 显示思考过程 */}
                  {msg.thinkContent && (
                    <div className="mb-2 p-2 rounded-md text-sm" style={{ backgroundColor: 'rgba(0,0,0,0.1)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <h4 className="font-semibold" style={{ color: 'var(--foreground)' }}>思考中...</h4>
                      <p className="opacity-80">{msg.thinkContent}</p>
                    </div>
                  )}
                  
                  {msg.content ? msg.content : <LoadingIndicator />}
                  
                  {msg.role === 'assistant' && msg.sources && <SourceInfo sources={msg.sources} />}
                </div>

                {/* User Avatar */}
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--primary)' }}>
                     <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                  </div>
                )}
              </div>
            ))}
          </>
        )}
      </div>

      {/* 输入区域 */}
      <div className="p-4" style={{ borderTop: '1px solid var(--border)' }}>
        <form onSubmit={handleSubmit} className="flex items-center space-x-4">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="在这里输入你的问题..."
            disabled={isLoading}
            className="flex-1 w-full px-4 py-2 rounded-lg focus:outline-none transition-shadow focus:ring-2 focus:ring-[var(--primary)]"
            style={{ 
              backgroundColor: 'var(--background)',
              color: 'var(--foreground)',
              border: '1px solid var(--border)',
            }}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 rounded-lg text-white font-semibold transition-opacity flex items-center disabled:opacity-50"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            {isLoading ? <LoadingIndicator /> : (
              <>
                <span className="mr-2">发送</span>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
} 