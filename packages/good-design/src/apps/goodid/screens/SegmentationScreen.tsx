import React, { useEffect, useState } from "react";
import { Center, Text, VStack } from "native-base";
import { noop } from "lodash";
import { useEthers } from "@usedapp/core";

import { LoaderModal } from "../../../core";

import { Image } from "../../../core";
import RoboBilly from "../../../assets/svg/robo-billy.svg";
import { requestLocationCertificate, useGetEnvChainId, useLocation } from "@gooddollar/web3sdk-v2";

const tempTypes = {
  Gender: "Are you",
  Age: "Aged",
  Location: "In"
};

export const SegmentationScreen = ({ types }: { types?: typeof tempTypes }) => {
  const { account, chainId } = useEthers();
  const { baseEnv } = useGetEnvChainId();
  const [loading, setLoading] = useState(true);
  const { locationState } = useLocation();

  console.log("locationState", { locationState, account, chainId });

  useEffect(() => {
    setLoading(true);
    if (locationState.error || !locationState.location) {
      console.log("testUseEffect -- shouldThrowError -->", { locationState });
      // throw error modal (to be added)
      return;
    } else if (!account) {
      console.log("testUseEffect -- shouldKeepLoadingForAccount", { account });
      return;
    }

    console.log("testUseEffect -- shouldRequestCertificate");
    //todo: where does identity certificate come from?
    //do we request it here or will it be taken from fvSuccess response
    requestLocationCertificate(baseEnv, locationState.location)
      .then(res => {
        console.log("requestLocationCertificate", res);
      })
      .catch(err => {
        console.log("requestlocationcertificate failed -->", { err });
      });
  }, [locationState, account]);

  return (
    <>
      <LoaderModal overlay="dark" loading={loading} onClose={noop} />
      <VStack paddingY={6} space={10}>
        <VStack space={6}>
          <Text fontFamily="heading" fontSize="l" fontWeight="700" color="primary">
            Please confirm
          </Text>
          <VStack paddingY={6} space={4} width={343} borderRadius={15} bgColor="greyCard" shadow={1} textAlign="center">
            {Object.entries(types ?? tempTypes).map(([type, copy]) => (
              <VStack key={type}>
                <Text fontFamily="subheading" fontSize="md" fontWeight="500" color="goodGrey.600">
                  {copy}
                </Text>
                <Text fontFamily="body" fontSize="l" fontWeight="700" color="primary">
                  {type}
                </Text>
              </VStack>
            ))}
            <Center>
              <Image source={RoboBilly} w="75" h="120" style={{ resizeMode: "contain" }} />
            </Center>

            {/* footer buttons here */}
          </VStack>
        </VStack>
      </VStack>
    </>
  );
};
