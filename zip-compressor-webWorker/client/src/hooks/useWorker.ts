import { useState, useEffect } from "react";
import { FileType } from "../App";

interface Task {
  id: number;
  files: FileType[];
  progress: number;
  loading: boolean;
  compressedFile: Uint8Array | null;
  error: string | null;
}

export function useWorker(workerPath: string) {
  const [worker, setWorker] = useState<Worker | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskIdCounter, setTaskIdCounter] = useState(0);

  useEffect(() => {
    const newWorker = new Worker(new URL(workerPath, import.meta.url), { type: "module" });

    newWorker.onmessage = (e) => {
      const { id, status, progress, compressed, error } = e.data;

      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === id
            ? {
                ...task,
                progress: progress !== undefined ? progress : task.progress,
                loading: status ? true : task.loading,
                compressedFile: compressed || task.compressedFile,
                error: error || task.error,
              }
            : task
        )
      );
    };

    setWorker(newWorker);

    return () => {
      newWorker.terminate();
    };
  }, [workerPath]);

  const sendToWorker = (files: FileType[]) => {
    if (!worker) return;

    const newTaskId = taskIdCounter + 1;
    setTaskIdCounter(newTaskId);

    setTasks((prevTasks) => [
      ...prevTasks,
      { id: newTaskId, files, progress: 0, loading: true, compressedFile: null, error: null },
    ]);

    worker.postMessage({ id: newTaskId, files });
  };

  return { sendToWorker, tasks };
}
