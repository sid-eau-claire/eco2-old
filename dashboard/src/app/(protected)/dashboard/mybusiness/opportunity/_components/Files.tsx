import React, { useState, useRef } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

type File = {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: Date;
};

type FilesProps = {
  opportunityId: string;
  files: File[];
  onFileAdded: (fileInfo: { name: string; type: string; size: number }, fileContentBase64: string) => Promise<void>;
  onFileDeleted: (id: string) => Promise<void>;
};

const Files: React.FC<FilesProps> = ({
  opportunityId,
  files,
  onFileAdded,
  onFileDeleted
}) => {
  const [isAddFileDialogOpen, setIsAddFileDialogOpen] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        setUploadError(null);
        const fileInfo = {
          name: file.name,
          type: file.type,
          size: file.size
        };

        const fileContentBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        // Remove the data URL prefix
        const base64Content = fileContentBase64.split(',')[1];

        await onFileAdded(fileInfo, base64Content);
        setIsAddFileDialogOpen(false);
      } catch (error) {
        console.error('Failed to add file:', error);
        setUploadError(error instanceof Error ? error.message : 'An unknown error occurred');
      }
    }
  };

  const handleDeleteFile = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      try {
        await onFileDeleted(id);
      } catch (error) {
        console.error('Failed to delete file:', error);
        // You might want to show an error message to the user here
      }
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        {/* <h2 className="text-xl font-semibold">Files</h2> */}
        <Button type="button" onClick={() => setIsAddFileDialogOpen(true)}>Add Document</Button>
      </div>
      
      {files.map((file) => (
        <div key={file.id} className="border p-4 rounded-md flex justify-between items-center">
          <div>
            <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
              {file.name}
            </a>
            <p className="text-sm text-gray-500">
              {formatFileSize(file.size)} • {file.type} • Uploaded at: {new Date(file.uploadedAt).toLocaleString()}
            </p>
          </div>
          <Button variant="destructive" onClick={() => handleDeleteFile(file.id)}>Delete</Button>
        </div>
      ))}

      <Dialog open={isAddFileDialogOpen} onOpenChange={setIsAddFileDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New File</DialogTitle>
          </DialogHeader>
          <Input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="mt-2"
          />
          {uploadError && (
            <p className="text-red-500 mt-2">{uploadError}</p>
          )}
          <DialogFooter>
            <Button type="button" onClick={() => fileInputRef.current?.click()}>Upload File</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Files;