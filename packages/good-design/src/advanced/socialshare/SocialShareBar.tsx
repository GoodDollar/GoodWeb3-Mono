import React, { useState } from "react";
import { HStack, IconButton, Text, VStack, Button, Modal } from "native-base";
import { Image } from "../../core/images";

// Import SVG icons
import FacebookIcon from "../../assets/svg/facebook.svg";
import XIcon from "../../assets/svg/x.svg";
import LinkedInIcon from "../../assets/svg/linkedin.svg";
import InstagramIcon from "../../assets/svg/instagram.svg";
import MoreButtonIcon from "../../assets/svg/more-button.svg";

const SOCIALS = [
  {
    name: "Facebook",
    icon: FacebookIcon,
    color: "#1877F2",
    getUrl: (msg: string, url: string) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(msg)}`
  },
  {
    name: "X",
    icon: XIcon,
    color: "#000000",
    getUrl: (msg: string, url: string) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(msg)}&url=${encodeURIComponent(url)}`
  },
  {
    name: "LinkedIn",
    icon: LinkedInIcon,
    color: "#0A66C2",
    getUrl: (msg: string, url: string) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
  },
  {
    name: "Instagram",
    icon: InstagramIcon,
    color: "#E4405F",
    getUrl: () => "https://www.instagram.com/",
    note: "Copy your message and share it on Instagram!"
  }
];

export interface SocialShareBarProps {
  message: string;
  url: string;
  className?: string;
}

export const SocialShareBar: React.FC<SocialShareBarProps> = ({ message, url }) => {
  const [showInstagramModal, setShowInstagramModal] = useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      // You could add a toast notification here
      console.log("Message copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
    }
  };

  const handleSocialClick = (social: (typeof SOCIALS)[0]) => {
    if (social.name === "Instagram") {
      setShowInstagramModal(true);
    } else {
      void window.open(social.getUrl(message, url), "_blank", "noopener,noreferrer");
    }
  };

  const handleInstagramShare = async () => {
    await copyToClipboard(message);
    setShowInstagramModal(false);
    // You could add a success notification here
  };

  return (
    <>
      <VStack space={4} alignItems="center" mt={4} w="100%">
        <HStack space={3} alignItems="center" justifyContent="center" w="100%">
          {/* Facebook, X, LinkedIn buttons */}
          {SOCIALS.slice(0, 3).map(social => (
            <IconButton
              key={social.name}
              variant="ghost"
              size="lg"
              onPress={() => handleSocialClick(social)}
              _pressed={{ opacity: 0.7 }}
              _icon={{
                as: () => (
                  <VStack
                    bg={social.color}
                    borderRadius="full"
                    w="40px"
                    h="40px"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Image source={social.icon} w="20px" h="20px" style={{ resizeMode: "contain" }} />
                  </VStack>
                )
              }}
              accessibilityLabel={`Share on ${social.name}`}
            />
          ))}

          {/* More button */}
          <IconButton
            variant="ghost"
            size="lg"
            onPress={() => setShowInstagramModal(true)}
            _pressed={{ opacity: 0.7 }}
            _icon={{
              as: () => (
                <VStack bg="#EBF8FF" borderRadius="full" w="40px" h="40px" alignItems="center" justifyContent="center">
                  <Image source={MoreButtonIcon} w="20px" h="20px" style={{ resizeMode: "contain" }} />
                </VStack>
              )
            }}
            accessibilityLabel="More sharing options"
          />
        </HStack>
      </VStack>

      {/* Instagram Modal */}
      <Modal isOpen={showInstagramModal} onClose={() => setShowInstagramModal(false)}>
        <Modal.Content maxWidth="400px">
          <Modal.Header>Share on Instagram</Modal.Header>
          <Modal.Body>
            <VStack space={4} alignItems="center">
              <Image source={InstagramIcon} w="60px" h="60px" style={{ resizeMode: "contain" }} />
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
