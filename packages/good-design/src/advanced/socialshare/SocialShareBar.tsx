import React, { useState, useCallback } from "react";
import { HStack, IconButton, Text, VStack, Button, Modal, useToast, Pressable } from "native-base";
import { Image } from "../../core/images";
import Clipboard from "@react-native-clipboard/clipboard";

// Import SVG icons
import FacebookIcon from "../../assets/svg/facebook.svg";
import XIcon from "../../assets/svg/x.svg";
import LinkedInIcon from "../../assets/svg/linkedin.svg";
import InstagramIcon from "../../assets/svg/instagram.svg";
import ArrowDownIcon from "../../assets/svg/arrow-down.svg";

// Import shared configuration
import { SOCIALS as SHARED_SOCIALS } from "./config";

// Map shared config to React component format
const SOCIALS = SHARED_SOCIALS.map(social => ({
  ...social,
  icon:
    social.id === "facebook"
      ? FacebookIcon
      : social.id === "x"
      ? XIcon
      : social.id === "linkedin"
      ? LinkedInIcon
      : social.id === "instagram"
      ? InstagramIcon
      : FacebookIcon
}));

export interface SocialShareBarProps {
  message: string;
  url: string;
  className?: string;
}

export const SocialShareBar: React.FC<SocialShareBarProps> = ({ message, url }) => {
  const [showInstagramModal, setShowInstagramModal] = useState(false);
  const toast = useToast();

  const copyToClipboard = useCallback((text: string) => {
    try {
      Clipboard.setString(text);
      console.log("Message copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
    }
  }, []);

  const handleSocialClick = useCallback(
    (social: (typeof SOCIALS)[0]) => {
      if (social.name === "Instagram") {
        setShowInstagramModal(true);
      } else {
        void window.open(social.getUrl(message, url), "_blank", "noopener,noreferrer");
      }
    },
    [message, url]
  );

  const handleMoreClick = useCallback(() => {
    setShowInstagramModal(true);
  }, []);

  const handleInstagramShare = () => {
    try {
      copyToClipboard(message);
      toast.show({
        title: "Copied!",
        description: "Message copied to clipboard.",
        duration: 2000
      });
      setShowInstagramModal(false);
    } catch (err) {
      toast.show({
        title: "Error",
        description: "Failed to copy message. Please try again.",
        duration: 3000
      });
    }
  };

  return (
    <>
      <VStack space={4} alignItems="center" mt={4} w="100%">
        <HStack space={3} alignItems="center" justifyContent="center" w="100%">
          {/* Facebook, X, LinkedIn buttons - standalone icons without background */}
          {SOCIALS.slice(0, 3).map(social => (
            <IconButton
              key={social.name}
              variant="ghost"
              size="lg"
              onPress={() => handleSocialClick(social)}
              _pressed={{ opacity: 0.7 }}
              _icon={{
                as: () => <Image source={social.icon} w={6} h={6} style={{ resizeMode: "contain" }} />
              }}
              accessibilityLabel={`Share on ${social.name}`}
            />
          ))}

          {/* More button - styled according to Figma specs */}
          <Pressable onPress={handleMoreClick} _pressed={{ opacity: 0.7 }} accessibilityLabel="More sharing options">
            <HStack
              borderWidth={1}
              borderColor="blue.400"
              borderRadius={8}
              px={4}
              py={2}
              alignItems="center"
              justifyContent="center"
              space={1}
            >
              <Text fontSize="sm" fontWeight="normal" color="blue.400" textAlign="center">
                More
              </Text>
              <Image source={ArrowDownIcon} w={4} h={4} style={{ resizeMode: "contain" }} />
            </HStack>
          </Pressable>
        </HStack>
      </VStack>

      {/* Instagram Modal */}
      <Modal isOpen={showInstagramModal} onClose={() => setShowInstagramModal(false)}>
        <Modal.Content maxW="400px">
          <Modal.Header>Share on Instagram</Modal.Header>
          <Modal.Body>
            <VStack space={4} alignItems="center">
              <Image source={InstagramIcon} w={15} h={15} style={{ resizeMode: "contain" }} />
              <Text textAlign="center">
                Your message has been copied to clipboard. You can now paste it on Instagram!
              </Text>
              <Text variant="xs-grey-500" textAlign="center">
                {SOCIALS.find(s => s.name === "Instagram")?.note}
              </Text>
            </VStack>
          </Modal.Body>
          <Modal.Footer>
            <Button.Group space={2}>
              <Button variant="ghost" onPress={() => setShowInstagramModal(false)}>
                Cancel
              </Button>
              <Button onPress={handleInstagramShare}>Copy Message</Button>
            </Button.Group>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </>
  );
};

export default SocialShareBar;
