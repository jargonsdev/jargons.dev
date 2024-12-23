import { useState, useEffect } from 'react';

export default function useResizablePanes() {
  const [paneWidths, setPaneWidths] = useState({ editor: 50, preview: 50 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      const newEditorWidth = (e.clientX / window.innerWidth) * 100;
      const newPreviewWidth = 100 - newEditorWidth;
      setPaneWidths({ editor: newEditorWidth, preview: newPreviewWidth });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    const handleMouseDown = () => {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  return paneWidths;
}
