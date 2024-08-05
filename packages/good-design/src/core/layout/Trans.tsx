import React from "react";
import { Trans as LinguiTrans } from "@lingui/react";

import { Heading, IButtonProps, ITextProps, IHeadingProps, Text } from "native-base";
import Title from "./Title";
import { GoodButton } from "../buttons";

/**
 * Use this component when wanting to apply Text variants (see theme.tsx)
 * @param t text that needs to be translated
 * @returns Text
 */
export const TransText = ({ t, ...props }: { t: string } & ITextProps) => (
  <LinguiTrans id={t} render={({ translation }: { translation: any }) => <Text {...props}>{translation}</Text>} />
);

/**
 * Use this component when wanting to apply Text variants (see theme.tsx)
 * @param t text that needs to be translated
 * @returns Heading
 */
export const TransHeading = ({ t, ...props }: { t: string } & IHeadingProps) => (
  <LinguiTrans id={t} render={({ translation }: { translation: any }) => <Heading {...props}>{translation}</Heading>} />
);

/**
 * Use this component when wanting to apply Title variants (see Title.tsx)
 * @param t text that needs to be translated
 * @returns Title
 */
export const TransTitle = ({ t, ...props }: { t: string } & ITextProps) => (
  <LinguiTrans id={t} render={({ translation }: { translation: any }) => <Title {...props}>{translation}</Title>} />
);

/**
 * Use this component when wanting to apply GoodButton variants (see GoodButton.tsx)
 * @param t text that needs to be translated
 * @returns Title
 */
export const TransButton = ({ t, ...props }: { t: string } & IButtonProps) => (
  <LinguiTrans
    id={t}
    render={({ translation }: { translation: any }) => <GoodButton {...props}>{translation}</GoodButton>}
  />
);
