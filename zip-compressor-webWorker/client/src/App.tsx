import './App.css'
import React, { useCallback } from 'react'
import { useWorker } from './hooks/useWorker';

const MAX_TRUNCATE_LENGTH = 6;

export interface FileType {
  name: string
  size: number
  type: string
}

function App() {

  const [files, setFiles] = React.useState<FileType[]>([]);
  const [counter, setCounter] = React.useState(0);
  const { sendToWorker, tasks } = useWorker("../workers/compressWorker.ts");

  const calculateSizeInKB = (size: number) => {
    return Math.round(size / 1024);
  }

  const typeToImageMapper = useCallback((type: string) => {

    type = type.split('/')[1]

    switch (type) {
      case 'pdf': return 'pdf.png'
      case 'doc': return 'doc.jpg'
      case 'docx': return 'doc.jpg'
      case 'xls': return 'excel.png'
      case 'png': return 'image.jpg'
      case 'jpg': return 'image.jpg'
      case 'jpeg': return 'image.jpg'
      case 'mpeg': return 'mp.png'
    }

  }, [])

  const truncateName = (name: string) => {
    if (name.length > MAX_TRUNCATE_LENGTH) {
      return name.slice(0, MAX_TRUNCATE_LENGTH) + '...'
    }
    return name;
  }

  const handleFiles = (files: FileList | null) => {
    console.log('files', files)
    if (files) {

      const filesArray = Array.from(files).map((file) => {
        return {
          name: file.name,
          size: calculateSizeInKB(file.size),
          type: file.type,
        }
      })

      setFiles(filesArray);


    }
  }

  const handleCompress = () => {
    if (files.length > 0) {
      sendToWorker(files);
    }
  };

  return (
    <div className='main'>
      <h1>
        File compressor using web workers in background
      </h1>

      <div className='inputFiles'>
        <input type="file"
          multiple
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      <div className="showFiles">

        {
          files.map((file, index) => {
            return (
              <div key={index} className='file'>
                <img src={typeToImageMapper(file.type)} alt="file"
                  style={{
                    width: '50px',
                    height: '50px'
                  }}
                />
                <h3>{truncateName(file.name)}</h3>
                <p>{file.size} kb</p>
              </div>
            )
          })
        }

      </div>

      <button
        onClick={handleCompress}
        disabled={
          files.length === 0
        }
      >
        compress
      </button>

      <div className="tasks">
        {tasks.map((task) => (
          <div key={task.id} className="task">
            <h3>Task #{task.id}</h3>
            {task.loading && <p>Compressing... {task.progress}%</p>}
            {task.compressedFile && (
              <a href={URL.createObjectURL(new Blob([task.compressedFile]))} download={`compressed-${task.id}.zip`}>
                Download
              </a>
            )}
            {task.error && <p style={{ color: "red" }}>{task.error}</p>}
          </div>
        ))}
      </div>

      <div
        style={{
          position: 'absolute',
          display: 'flex',
          flexDirection: 'row-reverse',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 10,
          top: 30,
          right: 30,
        }}
      >

        <p>
          {counter}
        </p>

        <button
          onClick={() => setCounter(counter + 1)}
        >
          increment
        </button>
      </div>



    </div>
  )
}

export default App
