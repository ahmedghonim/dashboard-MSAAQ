import { useState } from "react";

import * as TusClient from "tus-js-client";
import { DetailedError, Upload, UploadOptions } from "tus-js-client";

export type TusUpload = Upload & {
  startOrResumeUpload: () => void;
};

type Statuses = "idle" | "uploading" | "paused" | "finished" | "error";

interface ReturnType {
  upload: TusUpload | null;
  setUpload: (file: File, overwriteOptions: UploadOptions) => TusUpload;
  startOrResumeUpload: () => void;
  status: Statuses;
}

type useTusProps = {
  onError?: (error: Error) => void;
  onProgress?: (params: { bytesUploaded: number; bytesTotal: number; percentage: string | number }) => void;
  onSuccess?: (upload: TusUpload) => void;
};

export const useTus = ({
  onProgress: onProgressCallback,
  onSuccess: onSuccessCallback,
  onError: onErrorCallback
}: useTusProps): ReturnType => {
  const [uploadState, setUploadState] = useState<TusUpload | null>(null);
  const [status, setStatus] = useState<Statuses>("idle");

  const startOrResumeUpload = (upload: TusUpload | null = null) => {
    if (!upload) {
      return;
    }

    // Check if there are any previous uploads to continue.
    upload.findPreviousUploads().then((previousUploads) => {
      // Found previous uploads so we select the first one.
      if (previousUploads.length) {
        upload.resumeFromPreviousUpload(previousUploads[0]);
      }

      // Start the upload
      upload.start();
    });
  };

  const onError = (error: Error) => {
    setStatus("error");

    onErrorCallback?.(error);
  };

  const onProgress = (bytesUploaded: number, bytesTotal: number) => {
    let percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);

    setStatus(percentage === "100.00" ? "finished" : "uploading");

    onProgressCallback?.({ bytesUploaded, bytesTotal, percentage });
  };

  const onSuccess = (upload: TusUpload) => {
    setStatus("finished");

    onSuccessCallback?.(upload);
  };

  const options: UploadOptions = {
    // Endpoint is the upload creation URL from your tus server
    endpoint: "https://tusd.tusdemo.net/files/",
    // Retry delays will enable tus-js-client to automatically retry on errors
    retryDelays: [0, 3000, 5000, 10000, 20000],
    // Callback for errors which cannot be fixed using retries
    onError,
    // Callback for reporting upload progress
    onProgress,
    onShouldRetry: (err: DetailedError | any, retryAttempt, options) => {
      const status = err.originalResponse ? err.originalResponse.getStatus() : 0;
      // If the status is a 403, we do not want to retry.
      if (status === 403) {
        return false;
      }

      // For any other status code, tus-js-client should retry.
      return true;
    }
  };

  const setUpload = (file: File, overwriteOptions: UploadOptions = {}): TusUpload => {
    // @ts-ignore
    const upload: TusUpload = new TusClient.Upload(file, {
      ...options,
      // Attach additional metadata about the file for the server
      metadata: {
        filename: file.name,
        filetype: file.type
      },
      ...overwriteOptions,
      // Callback for once the upload is completed
      onSuccess: () => onSuccess(upload)
    });

    upload.startOrResumeUpload = () => startOrResumeUpload(upload);

    setUploadState(upload);

    return upload;
  };

  return {
    startOrResumeUpload,
    upload: uploadState,
    status,
    setUpload
  };
};
