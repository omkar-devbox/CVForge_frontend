import React, { forwardRef, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { UploadCloud, File as FileIcon, X } from "lucide-react";
import { cn } from "../../utils";
import { formFieldBaseStyles as s } from "../../styles/style";

export interface FileUploadFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "value"> {
  error?: string | boolean;
  value?: File | File[];
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  onFileSelect?: (file: File | null) => void;
}

export const FileUploadField = forwardRef<HTMLInputElement, FileUploadFieldProps>(
  (
    { id, name, disabled, required, className, error, accept, onChange, onFileSelect, value, ...rest },
    ref
  ) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    
    // Determine the current file to display
    const currentFile = value instanceof File ? value : null;

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      
      if (disabled) return;
      
      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        // Validate accept
        if (accept) {
          const file = files[0];
          const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
          const acceptedTypes = accept.split(",").map(t => t.trim().toLowerCase());
          
          if (!acceptedTypes.some(t => t === fileExtension || t === file.type)) {
            // Ignore if invalid type
            return;
          }
        }
        
        handleFiles(files);
      }
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      if (onChange) onChange(e);
      if (e.target.files) {
        handleFiles(e.target.files);
      }
    };

    const handleFiles = (files: FileList) => {
      if (files.length > 0) {
        const file = files[0];
        if (onFileSelect) {
          onFileSelect(file);
        } else if (onChange) {
          // Construct a synthetic event
          const dt = new DataTransfer();
          dt.items.add(file);
          if (inputRef.current) {
            inputRef.current.files = dt.files;
            const event = new Event("change", { bubbles: true });
            inputRef.current.dispatchEvent(event);
          }
        }
      }
    };

    const clearFile = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (inputRef.current) {
        inputRef.current.value = "";
      }
      if (onFileSelect) {
        onFileSelect(null);
      } else if (onChange) {
        const dt = new DataTransfer();
        if (inputRef.current) {
          inputRef.current.files = dt.files;
          const event = new Event("change", { bubbles: true });
          inputRef.current.dispatchEvent(event);
        }
      }
    };

    return (
      <div className={cn("w-full", className)}>
        <input
          ref={(node) => {
            // Merge refs
            (inputRef as any).current = node;
            if (typeof ref === "function") ref(node);
            else if (ref) (ref as any).current = node;
          }}
          type="file"
          id={id}
          name={name}
          accept={accept}
          className="hidden"
          disabled={disabled}
          onChange={handleChange}
          required={required}
          {...rest}
        />
        
        <div
          className={cn(
            "relative w-full transition-all duration-200 ease-in-out",
            disabled && "opacity-50 cursor-not-allowed pointer-events-none"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {currentFile ? (
            <div className="flex flex-col w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4 rounded-xl shadow-sm gap-5">
              <div className="flex justify-between items-start">
                <div className="flex gap-4 items-center">
                  {/* File Icon with Badge */}
                  <div className="relative flex items-center justify-center w-10 h-12 bg-blue-50 dark:bg-blue-900/20 rounded shadow-sm">
                    <div className="absolute top-0 right-0 w-3 h-3 bg-white dark:bg-slate-900 rounded-bl" style={{ clipPath: "polygon(100% 0, 0 0, 0 100%)" }}></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-blue-600 text-white text-[10px] font-bold px-1 py-0.5 rounded-sm z-10 w-[120%] text-center shadow-sm">
                        {currentFile.name.split('.').pop()?.toUpperCase() || 'FILE'}
                      </div>
                    </div>
                    {/* Fold effect */}
                    <div className="absolute top-0 right-0 w-3 h-3 bg-blue-100 dark:bg-blue-800 rounded-bl"></div>
                  </div>
                  
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate max-w-[200px] sm:max-w-xs">
                      {currentFile.name}
                    </span>
                    <span className="text-xs text-slate-400 mt-0.5">
                      {(currentFile.size / 1024).toFixed(0)}kb
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={clearFile}
                  className="flex items-center justify-center w-5 h-5 rounded-full border-[1.5px] border-slate-300 text-slate-400 hover:text-slate-500 hover:border-slate-400 transition-colors mt-1"
                >
                  <X size={12} strokeWidth={3} />
                </button>
              </div>

              {/* Progress bar mock (100% complete) */}
              <div className="flex items-center gap-3">
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full transition-all duration-500 ease-out" style={{ width: '100%' }}></div>
                </div>
                <span className="text-xs text-slate-500 font-medium">100%</span>
              </div>
            </div>
          ) : (
            <div 
              onClick={() => !disabled && inputRef.current?.click()}
              className={cn(
                "flex items-center justify-between w-full bg-slate-50 dark:bg-slate-800/30 rounded-xl p-2 pl-4 border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/50",
                isDragging ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20" : "",
                error ? "border-red-300 bg-red-50" : ""
              )}
            >
              <span className="text-slate-500 dark:text-slate-400 text-sm">
                {isDragging ? "Drop file here..." : "Upload .docx file"}
              </span>
              <div className="bg-slate-200/80 dark:bg-slate-700 text-slate-500 dark:text-slate-300 text-[13px] font-medium px-4 py-1.5 rounded-lg">
                Upload
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
);

FileUploadField.displayName = "FileUploadField";
