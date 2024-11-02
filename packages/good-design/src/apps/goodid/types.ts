export type RedTentProps = {
  onVideo: (base64: string, extension: string) => Promise<void>;
  onDone: (error?: Error | boolean) => Promise<void>;
  onError?: (error: Error | undefined) => void;
  availableOffers: any;
  withNavBar: boolean;
  containerStyles?: any;
  headerStyles?: any;
  videoInstructStyles?: any;
};
