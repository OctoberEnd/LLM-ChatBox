import { DocumentTextIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { asyncFileUpload } from "~/apis/data";
import { FileInfoInter } from "~/types";
interface Props {
  file: FileInfoInter;
  removeFile?: () => void;
  updateFile?: (file: FileInfoInter) => void;
}
export default function FileCard({ file, removeFile, updateFile }: Props) {
  const [item, setItem] = useState<FileInfoInter>();
  const handleUpload = async () => {
    try {
      setItem({
        ...file,
        status: "uploading",
      });
      const res = await asyncFileUpload(file.file);
      console.log("res", res);
      if (res.code == 0) {
        const { id } = res.data;
        const newFile: FileInfoInter = {
          ...file,
          file_id: id,
          status: "uploaded",
        };
        setItem(newFile);
        updateFile?.(newFile);
      } else if (res.msg) {
        throw new Error(res.msg);
      } else throw new Error("File upload failed!");
    } catch (error) {
      toast.error((error as Error).message);
      setItem({
        ...file,
        status: "failed",
      });
      console.error("Error processing file:", error);
    }
  };
  useEffect(() => {
    console.log("item", item);
    handleUpload();
  }, []);
  return (
    <div className="relative group">
      <div className="flex gap-3 items-center p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
        <DocumentTextIcon className="w-5 h-5 text-primary" />
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <p className="text-sm truncate">{item?.name}</p>
          {item?.status === "uploading" && (
            <p className="text-xs text-muted-foreground">正在上传...</p>
          )}
          {item?.status === "uploaded" && (
            <p className="text-xs text-green-500">上传成功！</p>
          )}
          {item?.status === "failed" && (
            <p className="text-xs text-destructive">上传失败！</p>
          )}
        </div>
        {removeFile && (
          <button
            onClick={removeFile}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-accent rounded-full"
            aria-label="删除文件"
          >
            <XMarkIcon className="w-4 h-4 text-muted-foreground hover:text-destructive" />
          </button>
        )}
      </div>
    </div>
  );
}
