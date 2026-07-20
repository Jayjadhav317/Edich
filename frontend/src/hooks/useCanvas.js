import { useState } from "react";

export const useCanvas = () => {
  const [elements, setElements] = useState([]);
  const [history, setHistory] = useState([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Set elements and push to the history stack (for final actions)
  const updateElements = (newElements) => {
    setElements(newElements);
    const nextHistory = history.slice(0, historyIndex + 1);
    setHistory([...nextHistory, newElements]);
    setHistoryIndex(nextHistory.length);
  };

  // Set elements without pushing to history (for mousemove previews)
  const rawSetElements = (newElements) => {
    setElements(newElements);
  };

  // Seed initial elements from the backend database and reset history
  const initializeElements = (initialElements) => {
    const elementsToSet = initialElements || [];
    setElements(elementsToSet);
    setHistory([elementsToSet]);
    setHistoryIndex(0);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const nextIndex = historyIndex - 1;
      setHistoryIndex(nextIndex);
      setElements(history[nextIndex]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      setElements(history[nextIndex]);
    }
  };

  return {
    elements,
    setElements: updateElements,
    rawSetElements,
    initializeElements,
    undo,
    redo,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1
  };
};
