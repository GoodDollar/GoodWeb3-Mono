import { View } from "native-base";
import React, { useCallback } from "react";
import { PermissionsAndroid } from "react-native";
import * as ImagePicker from "react-native-image-picker";
import RNFS from "react-native-fs";
import { GoodButton } from "../../core";

type Props = {
  onDone: (video?: { base64: string; extension: string }, error?: Error) => Promise<void>;
};

export const WebVideoUploader = ({ onUpload, isLoading }: { onUpload: Props["onDone"]; isLoading: boolean }) => {
  const handleVideoUpload = useCallback(async () => {
    try {
      const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA);

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        const { errorMessage, errorCode, didCancel, assets } = await ImagePicker.launchCamera({
          mediaType: "video",
          cameraType: "front",
          durationLimit: 60,
          videoQuality: "low"
        });
        if (assets?.[0]?.uri) {
          const extension = assets?.[0]?.uri.match(/\.([^.]+)$/)?.[1] || "mp4";

          const base64 = await RNFS.readFile(assets[0].uri, "base64");
          return onUpload({ base64, extension });
        }
        if (!didCancel) {
          void onUpload(undefined, new Error(`video upload failed: ${errorMessage} ${errorCode}`));
        }
      } else {
        throw new Error("Camera permission denied. You need to manually give permissions in your app settings.");
      }
    } catch (e) {
      void onUpload(undefined, e as Error);
    }
  }, [onUpload]);

  return (
    <View>
      <GoodButton onPress={handleVideoUpload} isLoading={isLoading} variant="standard">
        Next
      </GoodButton>
    </View>
  );
};
