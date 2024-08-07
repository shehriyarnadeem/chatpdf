'use client'
import {useCallback, useEffect} from 'react'
import { useDropzone } from "react-dropzone"
import useUpload from '@/hooks/useUpload';
import { useRouter } from 'next/navigation';

function FileUploader() {


    const {progress, status, fileId, handleUpload} = useUpload();
    const router = useRouter();

    useEffect(() =>{
        if(fileId){
            router.push(`/dashboard/files/${fileId}`)
        }
    },[fileId, router])


    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        // Do something with the files
        const file = acceptedFiles[0];
        if(file){
            await handleUpload(file);
        } else{
            // toast
        }
        console.log(acceptedFiles,'--files')
      }, [])
      const {getRootProps, getInputProps, isDragActive, isFocused} = useDropzone({
        onDrop,
        maxFiles:1,
        accept:{
            "application/pdf":[".pdf"]
        }
    })
      return (
        <div className='flex flex-col gap-4 items-center max-w-7xl mx-auto'>
            {/* Loading section..tomorow */}
        <div {...getRootProps()} className={`p-10 border-2  border-dashed mt-10 w-[90%] border-indigo-600 text-indigo-600 h-96 flex items-center justify-center 
            ${ isFocused || isDragActive ? "bg-indigo-600":"bg-indigo-100"}`}>
          <input {...getInputProps()} />
          <div className='text-center flex flex-col justify-center items-center '>
          {
            isDragActive ?
              <p>Drop the files here ...</p> :
              <p>Drag and drop some files here, or click to select files</p>
          }
          </div>
        </div>
        </div>
      )
    }

export default FileUploader