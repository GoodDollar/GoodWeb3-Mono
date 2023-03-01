import { get, isString } from "lodash";
import React, { FC, useEffect, useMemo, useState } from "react";
import { Image as NativeImage, StyleSheet } from "react-native";
import { Image as BaseImage, IImageProps } from "native-base";

const isAutoHeight = (width: IImageProps["w"], height: IImageProps["h"]) => !!width && "auto" === height;

const Image: FC<IImageProps> = ({ source, style = {}, w, h, ...props }) => {
  const [aspectRatio, setAspectRatio] = useState<number>();

  const flattenStyle = useMemo(() => StyleSheet.flatten(style), [style]);

  // image source could be base64 data uri
  const uri = useMemo(() => get(source, "uri", isString(source) ? source : null), [source]);
  const fixed = !isAutoHeight(w, h);

  const imageStyle = useMemo(
    () =>
      fixed
        ? flattenStyle
        : {
            ...flattenStyle,
            aspectRatio
          },
    [fixed, flattenStyle, aspectRatio]
  );

  useEffect(() => {
    const onImageSize = (width: number, height: number) => setAspectRatio(width / height);

    if (!uri || fixed) {
      return;
    }

    NativeImage.getSize(uri, onImageSize);
  }, [uri, fixed]);

  if (!aspectRatio && !fixed) {
    return null;
  }

  return <BaseImage alt="GoodDollar" {...props} source={source} style={imageStyle} w={w} h={h} />;
};

export default Image;
