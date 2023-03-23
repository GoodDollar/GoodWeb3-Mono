import React, { useEffect } from "react";
import { useModal } from "../../hooks/useModal";
import { Box, Text } from "native-base";
import { isEmpty } from "lodash";
import { LearnButton } from "../buttons";

interface KimaModalProps {
  success: boolean | undefined;
  children: any;
}

const KimaModalCopy = (success: boolean) => ({
  header: (
    <Box backgroundColor={"white"}>
      <Text color="goodGrey.500" fontSize="sm" fontFamily="subheading">
        {success
          ? `You have succesfully bridged from NetworkX to NetworkY`
          : `Something went wrong while trying to bridge your tokens`}
      </Text>
    </Box>
  ),
  body: <LearnButton source="bridging" />
});

export const KimaModal = ({ success, children }: KimaModalProps) => {
  const { Modal, showModal } = useModal();
  const kimaCopy = KimaModalCopy(success ?? false);

  useEffect(() => {
    if (!isEmpty(success) && success) {
      showModal();
    }
  }, [success, showModal]);

  return (
    <React.Fragment>
      <Modal {...kimaCopy} closeText="x" />
      {children}
    </React.Fragment>
  );
};
