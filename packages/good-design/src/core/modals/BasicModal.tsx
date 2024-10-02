import { noop } from "lodash";
import { Button, useColorModeValue, Text, View, VStack } from "native-base";
import React, { FC, ReactNode, useCallback } from "react";
import { Platform } from "react-native";
import { Dialog as NBModal } from "react-native-paper";

export interface BasicModalProps {
  modalVisible: boolean;
  header?: ReactNode;
  body: ReactNode;
  footer?: ReactNode;
  actionText?: string;
  closeText?: string;
  hasCloseButton?: boolean;
  hasTopBorder?: boolean;
  hasBottomBorder?: boolean;
  bgColor?: string;
  type?: string;
  withOverlay?: string;
  onClose?: () => void;
  onAction?: () => void;
  _modal?: any;
  _modalContainer?: any;
  _body?: any;
  _footer?: any;
  _header?: any;
}

const BasicModal: FC<BasicModalProps> = ({
  modalVisible,
  header,
  body,
  footer,
  actionText,
  closeText,
  hasCloseButton = !!closeText,
  hasTopBorder = false,
  hasBottomBorder = true,
  onClose = noop,
  onAction = noop,
  withOverlay,
  bgColor = "white",
  _modal = {},
  _modalContainer = {},
  _header,
  _body = {},
  _footer
}) => {
  const onActionButtonPress = useCallback(() => {
    onAction();
    onClose();
  }, [onAction, onClose]);

  const overlayDark = useColorModeValue("mainDarkContracts:alpha.40", "white:alpha.40");
  const overlayBlur = "purple.300"; //todo: add blur overlay

  const bgOverlay = withOverlay === "dark" ? overlayDark : withOverlay === "blur" ? overlayBlur : "transparent";

  const actionButton = actionText ? <Button onPress={onActionButtonPress}>{actionText}</Button> : null;

  return modalVisible ? (
    <View
      {...Platform.select({
        web: { height: "100vh" }
      })}
      flex={1}
      justifyContent="center"
      alignItems="center"
    >
      <NBModal
        visible={modalVisible}
        onDismiss={onClose}
        dismissable={hasCloseButton}
        {..._modal}
        style={{
          width: 343,
          padding: 0,
          marginHorizontal: "auto",
          marginLeft: "auto",
          marginRight: "auto"
        }}
        bgColor={bgOverlay}
      >
        <NBModal.Content style={{ maxWidth: 343, padding: 0, paddingTop: 0, ..._modalContainer }}>
          {hasCloseButton ? (
            <NBModal.Actions style={{ position: "absolute", top: 0, right: 0, zIndex: 1 }}>
              <Button
                onPress={onClose}
                {...Platform.select({ web: { backgroundColor: "none" }, android: { backgroundColor: "transparent" } })}
                color="goodGrey.400"
                _hover={{ backgroundColor: "goodGrey.400:alpha.40" }}
              >
                <Text>X</Text>
              </Button>
            </NBModal.Actions>
          ) : null}
          <VStack space={6}>
            {header ? (
              <NBModal.Title
                style={{ marginBottom: 0, padding: 10 }}
                backgroundColor={bgColor}
                borderBottomWidth={hasTopBorder ? 1 : 0}
                {..._header}
              >
                {header}
              </NBModal.Title>
            ) : null}

            <NBModal.Content {..._body} bgColor={bgColor}>
              {body}
            </NBModal.Content>
          </VStack>
          {footer ? (
            <VStack paddingTop={6}>
              <NBModal.Actions borderTopWidth={hasBottomBorder ? 1 : 0} {..._footer} padding="0" bgColor={bgColor}>
                {footer}
                {actionButton ? <Button.Group space={2}>{actionButton}</Button.Group> : null}
              </NBModal.Actions>
            </VStack>
          ) : null}
        </NBModal.Content>
      </NBModal>
    </View>
  ) : null;
};

export default BasicModal;
