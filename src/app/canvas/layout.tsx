'use client';
import Sidebar from '@/components/Sidebar/Sidebar';
import { useCanvasStore } from '@/lib/store';

export default function CanvasLayout({ children }: { children: React.ReactNode }) {
  const focusMode = useCanvasStore(s => s.focusMode);
  const presentationMode = useCanvasStore(s => s.presentationMode);
  return (
    <div className={`canvas-layout${focusMode ? ' focus-mode' : ''}${presentationMode ? ' presentation-mode' : ''}`}>
      <Sidebar />
      <div className="canvas-main">{children}</div>
    </div>
  );
}