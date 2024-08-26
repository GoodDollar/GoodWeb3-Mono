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
export const TransText = ({ t, values, ...props }: { t: string; values?: any } & ITextProps) => (
  <Text {...props}>
    <LinguiTrans id={t} values={values}>
      {t}
    </LinguiTrans>
  </Text>
);

/**
 * Use this component when wanting to apply Text variants (see theme.tsx)
 * @param t text that needs to be translated
 * @returns Heading
 */
export const TransHeading = ({ t, ...props }: { t: string } & IHeadingProps) => (
  <Heading {...props}>
    <LinguiTrans id={t}>{t}</LinguiTrans>
  </Heading>
);

/**
 * Use this component when wanting to apply Title variants (see Title.tsx)
 * @param t text that needs to be translated
 * @returns Title
 */
export const TransTitle = ({ t, values, ...props }: { t: string; values?: any } & ITextProps) => (
  <Title {...props}>
    <LinguiTrans id={t} values={values}>
      {t}
    </LinguiTrans>
  </Title>
);

/**
 * Use this component when wanting to apply GoodButton variants (see GoodButton.tsx)
 * @param t text that needs to be translated
 * @returns Title
 */
export const TransButton = ({ t, ...props }: { t: string } & IButtonProps) => (
  <GoodButton {...props}>
    <LinguiTrans id={t}>{t}</LinguiTrans>
  </GoodButton>
);
