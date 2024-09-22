import React, { useCallback, useState } from "react";

import { classNames } from "@/utils";

import { XMarkIcon } from "@heroicons/react/24/solid";

import { Icon } from "@msaaqcom/abjad";
import { ImageAdd01Icon, ImageUpload01Icon } from "@msaaqcom/hugeicons/rounded/twotone";

function Dropzone({ setValue, name, value }: { setValue: any; name: string; value: any }) {
  const [file, setImage] = useState<any>(value);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((event: any) => {
    event.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragEnter = useCallback((event: any) => {
    event.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((event: any) => {
    event.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = (e: any) => {
    e.preventDefault();
    setIsDragOver(false);

    if (e.target.files && e.target.files[0]) {
      if (e.target.files[0].type.includes("image")) {
        let reader = new FileReader();

        reader.onload = function (e) {
          setImage(e?.target?.result ?? "");
        };
        setValue(name, [{ file: e.target.files[0] }], { shouldValidate: true, shouldDirty: true });
        reader.readAsDataURL(e.target.files[0]);
      }
    } else {
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
        if (e.dataTransfer.files[0].type.includes("image")) {
          let file = e.dataTransfer.files[0];
          let reader = new FileReader();

          reader.onload = function (e) {
            setImage(e?.target?.result ?? "");
          };

          setValue(name, [{ file: file }], { shouldValidate: true, shouldDirty: true });
          reader.readAsDataURL(file);
        }
      }
    }
  };

  return (
    <label
      className={classNames("flex w-fit flex-col rounded-2xl", isDragOver ? "bg-gray-300" : "bg-gray-200")}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        className="hidden"
        accept="image/*"
        onChange={(e) => {
          handleDrop(e);
        }}
      />
      {!file && (
        <div className="flex h-32 w-32 items-center justify-center rounded-2xl">
          <Icon
            children={
              isDragOver ? (
                <ImageUpload01Icon className="!text-gray-700" />
              ) : (
                <ImageAdd01Icon className="!text-gray-700" />
              )
            }
          />
        </div>
      )}
      {file && (
        <div className="relative w-fit">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setImage(undefined);
              setValue(name, undefined, { shouldDirty: true });
            }}
            className="absolute right-2 top-2 rounded-full bg-danger"
          >
            <Icon
              className="text-white"
              size="sm"
            >
              <XMarkIcon />
            </Icon>
          </button>
          <img
            src={file}
            className="h-32 w-32 rounded-2xl object-cover"
            alt="Uploaded"
          />
        </div>
      )}
    </label>
  );
}

export default Dropzone;
