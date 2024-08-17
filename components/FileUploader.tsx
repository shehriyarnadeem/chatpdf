'use client'
import {useCallback, useEffect, useState} from 'react'
import { useDropzone } from "react-dropzone"
import useUpload from '@/hooks/useUpload';
import { useRouter } from 'next/navigation';
import { BoldIcon, Loader2Icon } from 'lucide-react';

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
      const {getRootProps, getInputProps, isDragActive, isFocused, isDragAccept} = useDropzone({
        onDrop,
        maxFiles:1,
        accept:{
            "application/pdf":[".pdf"]
        }
    })
    const uploadInProgress = progress!==null && progress >=0 && progress <=100
      return (
        <div className='flex flex-col gap-4 items-center max-w-7xl mx-auto'>
           <div className='mt-32 flex flex-col justify-center items-center'>
            {uploadInProgress && (
              
            <div className='flex flex-col justify-center items-center'>
              <div className="radial-progress" role="progressbar" 
              // @ts-ignore
              style={{ "--value": progress, "--size":"12rem", "--thickness":"1.3rem"}} >
               {progress} %
              </div>
              {
               //@ts-ignore
                <p>{status}</p>
              }
              </div>
              )}
            </div>
        {!uploadInProgress && (
        <div {...getRootProps()} className={`p-10 border-2  border-dashed mt-10 w-[90%] border-indigo-600 text-indigo-600 h-96 flex items-center justify-center 
            ${ isFocused || isDragActive ? <BoldIcon className='animate-spin h-7 w-7'/>:"bg-indigo-100"}`}>
          <input {...getInputProps()} />
          <div className='text-center flex flex-col justify-center items-center '>
          {
            isDragAccept ?
              <Loader2Icon className='animate-spin h-7 w-7'/>:
              <p>Drag and drop some files here, or click to select files</p>
          }
          </div>
        </div>
        )}
        </div>
      )
    }

export default FileUploader