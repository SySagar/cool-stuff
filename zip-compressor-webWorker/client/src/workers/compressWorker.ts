import { zip } from "fflate";
import { FileType } from "../App";

const taskQueue: { id: number; files: FileType[] }[] = [];
let isProcessing = false;

self.onmessage = (event) => {
  const { id, files } = event.data as { id: number; files: FileType[] };

  if (!files || !files.length) {
    self.postMessage({ id, error: "No files to compress" });
    return;
  }

  // Add task to queue
  taskQueue.push({ id, files });

  // Start processing if not already running
  if (!isProcessing) {
    processNextTask();
  }
};

function processNextTask() {
  if (taskQueue.length === 0) {
    isProcessing = false;
    return;
  }

  isProcessing = true;
  const { id, files } = taskQueue.shift()!; // removes the first task from the queue

  self.postMessage({ id, status: "Compressing...", progress: 0 });

  const fileMap: Record<string, Uint8Array> = {};
  let processed = 0;
  const totalSize = files.length;

  files.forEach(async(file) => {
    const reader = new FileReader();

    // delay to simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 10000));

    reader.onload = () => {
      const fileData = new Uint8Array(reader.result as ArrayBuffer);
      fileMap[file.name] = fileData;
      processed++;

      self.postMessage({ id, progress: Math.round((processed / totalSize) * 100) });

      if (processed === totalSize) {
        zip(fileMap, (err, compressed) => {
          if (err) {
            self.postMessage({ id, error: "Compression failed" });
          } else {
            self.postMessage({ id, compressed });
          }
          processNextTask(); // Move to the next task in queue
        });
      }
    };

    // @ts-ignore
    reader.readAsArrayBuffer(new Blob([file], { type: file.type }));
  });
}
