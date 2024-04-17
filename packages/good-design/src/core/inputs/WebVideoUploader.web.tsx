import { View } from "native-base";
import React, { useCallback, useRef } from "react";
import { GoodButton } from "../../core";

type Props = {
  onDone: (video?: { base64: string; extension: string }, error?: Error) => Promise<void>;
};

export const WebVideoUploader = ({ onUpload, isLoading }: { onUpload: Props["onDone"]; isLoading: boolean }) => {
  const fileRef = useRef<any>(null);

  const handleVideoUpload = useCallback(
    (event: any) => {
      event.preventDefault();
      const imageFile = event.target.files[0];
      if (imageFile) {
        console.log({ imageFile });
        const reader = new FileReader();
        reader.onload = function (r) {
          const extension = imageFile.name.match(/\.([^.]+)$/)?.[1] || "mp4";

          void onUpload({ base64: ((r.target?.result as string) || "").split(",")[1] as string, extension });
        };

        reader.onerror = function (ex) {
          console.error(ex);
          void onUpload(undefined, new Error(reader.error?.message));
        };

        reader.readAsDataURL(imageFile);
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
