import React from "react";
import Converter from "../../../core/web3/Converter";
import { NativeBaseProvider, theme } from "../../../theme";

/**
 * Converter (G$ Calculator) - cUSD to G$ conversion calculator
 *
 * This story showcases the improved styling for better text readability:
 * - Enhanced font sizes and weights for better hierarchy
 * - Improved color contrast with goodGrey palette
 * - Better visual separation between elements
 * - Clearer currency unit labels
 *
 * Improvements in this version:
 * - Input text: fontSize changed from "6" to "2xl" for better readability
 * - Input color: Added "goodGrey.800" for proper contrast
 * - Title text: fontSize "sm" with fontWeight "500" and color "goodGrey.600"
 * - Currency unit: fontSize "md" with fontWeight "600" for better emphasis
 * - Overall improved visual hierarchy and readability
 */
export default {
  title: "Core/Web3/Converter",
  component: Converter,
  decorators: [
    (Story: any) => (
      <NativeBaseProvider theme={theme} config={{ suppressColorAccessibilityWarning: true }}>
        <div style={{ padding: "20px", maxWidth: "400px", margin: "0 auto" }}>
          <Story />
        </div>
      </NativeBaseProvider>
    )
  ],
  argTypes: {
    gdPrice: {
      control: { type: "number", min: 0.0001, max: 1, step: 0.0001 },
      description: "G$ price in USD (e.g., 0.01 means 1 G$ = $0.01)"
    }
  }
};

// Basic converter with default G$ price
export const Default = {
  args: {
    gdPrice: 0.01 // 1 G$ = $0.01 USD
  }
};

// Converter with higher G$ price
export const HigherPrice = {
  args: {
    gdPrice: 0.05 // 1 G$ = $0.05 USD
  }
};

// Converter with lower G$ price
export const LowerPrice = {
  args: {
    gdPrice: 0.005 // 1 G$ = $0.005 USD
  }
};

// Interactive example showing the styling improvements
export const InteractiveCalculator = {
  render: (args: any) => {
    return (
      <div style={{ width: "100%", padding: "20px" }}>
        <h3 style={{ marginBottom: "20px", color: "#333" }}>G$ Calculator - Improved Styling</h3>
        <p style={{ marginBottom: "20px", color: "#666", fontSize: "14px" }}>
          Try typing different amounts to see the conversion in action. Notice the improved text readability with better
          font sizes, weights, and color contrast.
        </p>
        <Converter {...args} />
        <div style={{ marginTop: "20px", padding: "15px", backgroundColor: "#f5f5f5", borderRadius: "8px" }}>
          <h4 style={{ marginBottom: "10px", fontSize: "14px", fontWeight: "600" }}>Styling Improvements:</h4>
          <ul style={{ fontSize: "13px", color: "#555", lineHeight: "1.8" }}>
            <li>✓ Larger input text (2xl) for better readability</li>
            <li>✓ Proper color contrast (goodGrey.800 on inputs)</li>
            <li>✓ Clearer labels (sm size, 500 weight)</li>
            <li>✓ Better currency unit emphasis (md size, 600 weight)</li>
            <li>✓ Improved visual hierarchy throughout</li>
          </ul>
        </div>
      </div>
    );
  },
  args: {
    gdPrice: 0.01
  }
};
