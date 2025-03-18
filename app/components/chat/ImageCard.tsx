import { XMarkIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { asyncFileUpload } from "~/apis/data";
import { handleFileToBase64 } from "~/utils/file";
import { FileInfoInter } from "~/types";
interface Props {
  file: FileInfoInter;
  removeFile?: () => void;
  updateFile?: (file: FileInfoInter) => void;
}
export default function ImageCard({ file, removeFile, updateFile }: Props) {
  const [item, setItem] = useState<FileInfoInter>();
  const handleUpload = async () => {
    try {
      setItem({
        ...file,
        status: "uploading",
      });
      const base64 = await handleFileToBase64(file.file);
      const res = await asyncFileUpload(file.file);
      console.log("res", res);
      if (res.code == 0) {
        const { id } = res.data;
        const newFile: FileInfoInter = {
          ...file,
          base64,
          file_id: id,
          status: "uploaded",
        };
        setItem(newFile);
        updateFile?.(newFile);
      } else if (res.msg) {
        throw new Error(res.msg);
      } else {
        throw new Error("Image upload failed!");
      }
    } catch (error) {
      console.error("Error processing file:", error);
      toast.error((error as Error).message);
      setItem({
        ...file,
        status: "failed",
      });
    }
  };
  useEffect(() => {
    handleUpload();
  }, []);
  return (
    <div className="relative group">
      <div className="rounded-lg overflow-hidden transition-all hover:ring-2 hover:ring-primary/20">
        {item?.status === "uploading" && (
          <div className="w-14 h-14 flex items-center justify-center bg-secondary/50 text-xs text-muted-foreground">
            正在上传...
          </div>
        )}

        {item?.status === "uploaded" && (
          <img
            src={item?.base64}
            className="w-14 h-14 object-cover"
            alt={file.name}
          />
        )}

        {item?.status === "failed" && (
          <div className="w-14 h-14 flex items-center justify-center bg-destructive/10 text-xs text-destructive">
            上传失败
          </div>
        )}

        {removeFile && (
          <button
            onClick={removeFile}
            className="absolute -right-1 -top-1 p-1 rounded-full bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-accent"
            aria-label="删除图片"
          >
            <XMarkIcon className="w-3 h-3 text-muted-foreground hover:text-destructive" />
          </button>
        )}
      </div>
    </div>
  );
}
