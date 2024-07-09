import React from "react";
import { Trans } from "@lingui/react";

const withTranslations = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  translationIds: { [key: string]: string },
  restProps?: any
) => {
  return (props: P) => {
    const renderTranslations = (translations: Record<string, string>) => {
      return <WrappedComponent {...props} {...translations} {...restProps} />;
    };

    const renderNestedTrans = (keys: string[], sequence = 0, acc: Record<string, string> = {}) => {
      if (sequence >= keys.length) {
        return renderTranslations(acc);
      }

      const key = keys[sequence];
      const id = translationIds[key];

      return (
        <Trans
          id={id}
          render={({ translation }: { translation: any }) =>
            renderNestedTrans(keys, sequence + 1, { ...acc, [key]: translation })
          }
        />
      );
    };

    const keys = Object.keys(translationIds);

    return renderNestedTrans(keys);
  };
};

export default withTranslations;
