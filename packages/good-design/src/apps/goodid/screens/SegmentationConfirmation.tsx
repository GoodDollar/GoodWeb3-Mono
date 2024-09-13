import React from "react";
import { IStackProps, Link, VStack } from "native-base";

import { noop } from "lodash";

import { TransText, TransTitle } from "../../../core/layout";
import GoodIdCard from "../components/GoodIdCard";
import { GoodButton } from "../../../core/buttons";
import { withTheme } from "../../../theme/hoc/withTheme";
import { LoaderModal } from "../../../core/web3/modals";
import { SegmentationProps } from "../wizards";

const SegmentationConfirmation = withTheme({ name: "SegmentationConfirmation" })(
  ({
    account,
    isWhitelisted,
    expiryFormatted,
    styles,
    onDone,
    ...props
  }: IStackProps &
    Omit<SegmentationProps, "onLocationRequest" | "availableOffers" | "onDataPermission" | "withNavBar"> & {
      styles?: any;
    }) => {
    const { innerContainer, button } = styles ?? {};

    return isWhitelisted === undefined || !account ? (
      <LoaderModal title={/*i18n*/ "We are creating \n your GoodID"} overlay="dark" loading={true} onClose={noop} />
    ) : (
      <VStack space={200} width={"100%"} {...props}>
        <VStack space={6} alignItems="center" {...innerContainer}>
          <TransTitle t={/*i18n*/ "Your GoodID is ready"} variant="title-gdblue" />
          <GoodIdCard
            certificateSubjects={props.certificateSubjects}
            account={account}
            isWhitelisted={isWhitelisted}
            expiryDate={expiryFormatted}
          />
          <VStack space={0.5} alignItems="center">
            <TransText
              t={/*i18n*/ "You can always access this GoodID \n by connecting your current wallet to {gooddapp}"}
              width="343"
              values={{
                gooddapp: (
                  <Link
                    padding={0}
                    background="none"
                    href="https://gooddapp.org"
                    _text={{
                      fontSize: "2xs",
                      isTruncated: true,
                      fontFamily: "subheading",
                      color: "primary",
                      fontWeight: "600"
                    }}
                  >
                    GoodDapp.
                  </Link>
                )
              }}
              variant="browse-wrap"
            />
          </VStack>
        </VStack>
        <VStack space={4} alignItems="center" width={"100%"}>
          <GoodButton width="343" {...button} onPress={onDone}>
            <TransText
              t={/*i18n*/ "Next"}
              color="white"
              textTransform="uppercase"
              fontWeight="bold"
              fontSize="sm"
              fontFamily="subheading"
            />
          </GoodButton>
        </VStack>
      </VStack>
    );
  }
);

export default SegmentationConfirmation;
