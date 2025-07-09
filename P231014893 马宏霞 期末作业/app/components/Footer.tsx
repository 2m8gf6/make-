import WakaTimeStats from './WakaTimeStats';

export default function Footer() {
  return (
    <footer className="p-4 mt-auto border-t" style={{ borderColor: 'var(--border)' }}>
      <div className="container mx-auto text-center" style={{ color: 'var(--foreground)' }}>
        <WakaTimeStats />
        <p className="opacity-70">&copy; {new Date().getFullYear()} 课程期末作业</p>
      </div>
    </footer>
  );
} 