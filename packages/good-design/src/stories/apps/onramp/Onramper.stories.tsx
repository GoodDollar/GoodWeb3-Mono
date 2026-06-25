import React from "react";
import { noop } from "lodash";

import { GdOnramperWidget } from "../../../apps/onramp/GdOnramperWidget";
import { W3Wrapper } from "../../W3Wrapper";

/**
 * GdOnramperWidget - Buy G$ flow with Onramper integration
 *
 * Features:
 * - 3-step progress bar (Buy cUSD → Swap to G$ → Done)
 * - Responsive widget dimensions for all screen sizes
 * - Event tracking (widget_clicked, swap_started, funds_received, swap_completed)
 * - AsyncStorage caching for better performance
 * - Built-in Stepper component with animations
 * - Error handling with modal display
 * - Server-side URL signing for enhanced security
 *
 * Improvements in this version (fix/calculator-styling):
 * - Better event parsing (handles both 'type' and 'title' event fields)
 * - Fixed critical bug: swap lock now resets properly on error
 * - Added progress event emissions for UI updates (funds_received, swap_started, swap_completed)
 * - Server-side URL signing flow via backend /verify/onramper/sign endpoint
 * - Enhanced error handling with proper lock cleanup
 * - Dynamic backend URL detection based on environment (fuse/celo)
 * - Improved event handling with early returns and proper type checking
 */
export const OnramperWidget = {
  args: {
    apiKey: undefined, // Optional: Onramper API key for production use
    selfSwap: false, // If true, user sends swap tx; if false, backend handles it
    withSwap: true // Enable automatic cUSD to G$ swap
  }
};

export default {
  title: "Apps/Onramper",
  component: props => (
    <W3Wrapper withMetaMask={true} env="fuse">
      <div style={{ height: "800px", width: "100%", display: "flex", justifyContent: "center" }}>
        <GdOnramperWidget isTesting={true} onEvents={noop} {...props} />
      </div>
    </W3Wrapper>
  )
};
