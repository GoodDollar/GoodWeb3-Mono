import { useBreakpointValue } from "native-base";

// ref breakpoints from theme
// base: 0,
// sm: 480,
// md: 610,
// lg: 1010,
// xl: 1280,
// "2xl": 1440

const useScreenSize = () => {
  const isDesktopView = useBreakpointValue({ base: false, lg: true });
  const isTabletView = useBreakpointValue({ base: false, md: true });
  const isSmallTabletView = useBreakpointValue({ base: true, sm: true, md: false });
  const isMobileView = useBreakpointValue({ base: true, sm: false });

  return { isMobileView, isSmallTabletView, isTabletView, isDesktopView };
};

export default useScreenSize;
