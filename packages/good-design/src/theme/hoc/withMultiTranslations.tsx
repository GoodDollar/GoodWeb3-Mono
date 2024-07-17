import React from "react";
import { Trans } from "@lingui/react";

/**
 * A HOC that wraps a component with translations
 * mainly used in any context where you cannot use <Trans> (e.g. in fragmented modals)
 * can be used to simplify larger ui components with multiple translations
 * @param WrappedComponent  The component to be wrapped
 * @param translationIds translation ids, key-value pairs. the value to translate should be prefixed with i18n flag.
 * @param restProps any props of the component which are not translations, but should still be present.
 * @returns A component with the translations
 * @example withTranslations(Component, { title: /\*\i18n\*\/ "Title", content: /\*\i18n\*\/ "Content" }, { props })
 */

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
