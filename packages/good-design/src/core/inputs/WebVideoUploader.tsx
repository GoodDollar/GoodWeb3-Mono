import { View } from "native-base";
import React, { useCallback, useRef } from "react";
import { readAsDataURL } from "@gooddollar/web3sdk-v2";
import { first } from "lodash";
import { GoodButton } from "..";

type Props = {
  onDone: (video?: { base64: string; extension: string }, error?: Error) => Promise<void>;
};

const extname = (filename: string) => (/[.]/.exec(filename) ? first(/[^.]+$/.exec(filename)) : undefined);

export const WebVideoUploader = ({ onUpload, isLoading }: { onUpload: Props["onDone"]; isLoading: boolean }) => {
  const fileRef = useRef<any>(null);
  const maxSize = 1024 * 1024 * 20;

  const handleVideoUpload = useCallback(
    (event: any) => {
      event.preventDefault();
      const [videoFile] = event.target.files;
      if (videoFile.size > maxSize) {
        void onUpload(undefined, new Error("File size is too large."));
        return;
      }

      if (videoFile) {
        readAsDataURL(videoFile)
          .then((dataUrl: any) => {
            const base64 = dataUrl.split(",")[1];
            const extension = extname(videoFile.name) ?? "mp4";

            if (["mp4", "webm", "ogg", "mov", "3gp", "m4v", "avi", "mkv"].includes(extension)) {
              void onUpload({ base64, extension });
            } else {
              void onUpload(
                undefined,
                new Error(`It seems the video format you uploaded is unsupported. 😕
Supported formats include: MP4, WEBM, OGG, MOV, 3GP, M4V, AVI, and MKV.
Please upload your video in one of these formats. Thank you!`)
              );
              return;
            }
          })
          .catch((error: DOMException) => {
            console.error(error);
            void onUpload(undefined, new Error(error.message));
          });
      }
    },
    [onUpload]
  );

  return (
    <View>
      <input type="file" accept="video/*" capture="user" hidden ref={fileRef} onChange={handleVideoUpload} />
      <GoodButton onPress={() => fileRef?.current?.click()} isLoading={isLoading} variant="standard">
        Next
      </GoodButton>
    </View>
  );
};
