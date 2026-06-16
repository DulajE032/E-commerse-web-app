"use client"; // <--- CRITICAL FOR NEXT.JS
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUploadCloud, FiX } from 'react-icons/fi';

const ImageUploader = () => {
  const [files, setFiles] = useState([]);

  const onDrop = useCallback((acceptedFiles) => {
    const newFiles = acceptedFiles.map(file => Object.assign(file, {
      preview: URL.createObjectURL(file) 
    }));
    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: { 'image/*': [] } 
  });

  const removeFile = (name) => {
    setFiles(files.filter(file => file.name !== name));
  };

  return (
    <div className="flex flex-col gap-4">
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-blue-500 bg-blue-500/10' : 'border-slate-700 bg-slate-800/50 hover:border-slate-500'
        }`}
      >
        <input {...getInputProps()} />
        <FiUploadCloud className="w-10 h-10 mx-auto text-slate-400 mb-4" />
        <p className="text-slate-300 font-medium">
          {isDragActive ? "Drop the files here..." : "Drag & drop images here, or click to select"}
        </p>
      </div>

      {files.length > 0 && (
        <div className="flex flex-wrap gap-4 mt-2">
          {files.map((file) => (
            <div key={file.name} className="relative w-24 h-24 rounded-xl overflow-hidden border border-slate-700">
              <img src={file.preview} alt="preview" className="w-full h-full object-cover" />
              <button 
                onClick={(e) => { e.stopPropagation(); removeFile(file.name); }}
                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
              >
                <FiX className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;