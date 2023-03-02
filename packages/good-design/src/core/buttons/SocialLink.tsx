import React from "react";
import { Link } from "native-base";
import { Image } from "../images";

const SocialsLink: React.FC<{ network: string; logo: string; url: string }> = ({ network, logo, url }) => (
  <Link href={url} style={{ width: "auto" }}>
    <Image src={logo} alt={`${network} logo`} w="6" h="6" style={{ resizeMode: "contain" }} />
  </Link>
);

export default SocialsLink;
