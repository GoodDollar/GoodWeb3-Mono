import React, { useCallback, useEffect, useState } from "react";
import { Center, Text, VStack } from "native-base";
import { noop } from "lodash";
import { useEthers } from "@usedapp/core";
import {
  AsyncStorage,
  requestLocationCertificate,
  useCertificates,
  useFVLink,
  useGetEnvChainId,
  useLocation
} from "@gooddollar/web3sdk-v2";

import { LoaderModal } from "../../../core";

import { Image } from "../../../core";
import RoboBilly from "../../../assets/svg/robo-billy.svg";

const tempTypes = {
  Gender: "Are you",
  Age: "Aged",
  Location: "In"
};

export const SegmentationScreen = ({ types }: { types?: typeof tempTypes }) => {
  const { account } = useEthers();
  const { baseEnv } = useGetEnvChainId();
  const [loading, setLoading] = useState(true);
  const { locationState } = useLocation();
  const fvLink = useFVLink();
  const { storeCertificate } = useCertificates(account ?? "");

  const fetchLocationCertificate = useCallback(async () => {
    if (locationState.error || !locationState.location) {
      return;
    }

    if (!account) {
      return;
    }

    try {
      let fvsig = await AsyncStorage.getItem("fvSig");
      if (!fvsig) {
        fvsig = await fvLink.getFvSig();
      }
      const result = await requestLocationCertificate(baseEnv, locationState.location, fvsig, account);
      if (result && result.certificate) {
        await storeCertificate(result.certificate);
      }
    } catch (e) {
      console.error("Failed to get a location certificate:", { e });
      // should trigger error modal
    } finally {
      setLoading(false);
    }
  }, [account, baseEnv, fvLink, locationState, storeCertificate]);

  useEffect(() => {
    void (async () => {
      // should fetch location and identity certificates
      // todo: add fetch identity certificate
      await fetchLocationCertificate();
    })();
  }, [fetchLocationCertificate]);

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
