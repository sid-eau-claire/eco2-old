"use client";
import React, { useState, useRef } from "react";
import  StrapiImage from "./StrapiImage";

// import { Input } from "@/components/ui/input";
import { FileInput } from "@/components/Input/FileInput";
import { set } from "zod";
// import { Label } from "@/components/ui/label";

interface ImagePickerProps {
  id: string;
  name: string;
  label: string;
  showCard?: boolean;
  defaultValue?: string;
  data?: any;
  setData?: any;
}

function generateDataUrl(file: File, callback: (imageUrl: string) => void) {
  const reader = new FileReader();
  reader.onload = () => callback(reader.result as string);
  reader.readAsDataURL(file);
}

function FilePreview({ dataUrl, fileType }: { dataUrl: string; fileType: string }) {
  // console.log(dataUrl, fileType)
  if (fileType.startsWith('image')) {
    return <StrapiImage src={dataUrl} alt="preview" height={200} width={200} className="rounded-lg w-full object-cover" />;
  } else if (fileType === 'application/pdf') {
    return (
      <iframe
        src={dataUrl}
        width="100%"
        height="200px"
        style={{ border: "none" }}
        allow="autoplay"
      >
        <p>iframe is used</p>
      </iframe>
    );
  } else {
    return <p>File format not supported for preview</p>;
  }
}

function ImageCard({
  dataUrl,
  fileInput,
  fileType,
}: {
  dataUrl: string;
  fileType: string;
  fileInput: React.RefObject<HTMLInputElement>;
}) {
  const filePreview = dataUrl ? <FilePreview dataUrl={dataUrl} fileType={fileType} /> : <p>No file selected</p>;

  return (
    <div className="w-full relative">
      <div className="flex items-center space-x-4 rounded-md border border-stroke p-4">
        {filePreview}
      </div>
      <button
        onClick={() => fileInput.current?.click()}
        className="w-full absolute inset-0"
        type="button"
      ></button>
    </div>
  );
}

export default function ImagePicker({
  id,
  name,
  label,
  data,
  setData,
  // defaultValue,
}: Readonly<ImagePickerProps>) {
  const fileInput = useRef<HTMLInputElement>(null);
  // const [dataUrl, setDataUrl] = useState<string | null>(defaultValue ?? null);
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image') || file.type === 'application/pdf') {
        generateDataUrl(file, setDataUrl);
        setFileType(file.type);
        setData(file);
        // Prepare FormData to send to the backend
        const formData = new FormData();
        formData.append('files.originalStatement', file, file.name);

        // Optionally, add other related fields or data
        formData.append('data', JSON.stringify({
          relatedField: 'exampleData'
        }));
        // console.log(file)
        // console.log(formData)
        // Post to Strapi (example endpoint)
        // postDataToStrapi(formData);
      }
    }
};

  return (
    <React.Fragment>
      <div className="">
        <FileInput
          label={label}
          name={name}
          onChange={handleFileChange}
          ref={fileInput}
          accept="image/*,application/pdf"
        />
      </div>
      <ImageCard dataUrl={dataUrl ?? ""} fileInput={fileInput} fileType={fileType} />
    </React.Fragment>
  );
}
