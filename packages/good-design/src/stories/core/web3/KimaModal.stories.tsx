import React, { useState, useEffect } from "react";
import { KimaModal } from "../../../core";
import { W3Wrapper } from "../../W3Wrapper";
import { Box } from "native-base";

const KimaModalExample = () => {
  const [success, setSuccess] = useState<boolean | undefined>(undefined);

  const resetState = () => {
    setSuccess(undefined);
  };

  return (
    <KimaModal success={success} resetState={resetState} networks={{ origin: "Fuse", destination: "Celo" }}>
      <Box w="50%" h="50%" display="flex" flexDir="row" justifyContent="center" alignItems="center">
        <button onClick={() => setSuccess(true)}>Success</button>
        <button onClick={() => setSuccess(false)}>Failed</button>
      </Box>
    </KimaModal>
  );
};

export default {
  title: "Core/Web3/KimaModal",
  component: KimaModalExample,
  decorators: [
    (Story: any) => (
      <W3Wrapper withMetaMask={true} env="fuse">
        <Story />
      </W3Wrapper>
    )
  ],
  argTypes: {}
};

export const KimaModalStory = {
  args: {}
};
