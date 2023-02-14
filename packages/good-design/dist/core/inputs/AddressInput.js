"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddressInput = exports.isAddressValid = void 0;
const ethers = __importStar(require("ethers"));
const native_base_1 = require("native-base");
const react_1 = __importStar(require("react"));
const react_native_mask_input_1 = require("react-native-mask-input");
const addressMask = (() => {
    const buf = ["0", "x"];
    const len = 42;
    buf.length = len;
    return buf.fill(/[a-f0-9]/i, 2, len);
})();
const isAddressValid = (v) => ethers.utils.isAddress(v);
exports.isAddressValid = isAddressValid;
const AddressInput = ({ address, onChange, ...props }) => {
    const [input, setInput] = (0, react_1.useState)(address || "");
    const mask = addressMask;
    const maskedInputProps = (0, react_native_mask_input_1.useMaskedInputProps)({
        value: input,
        onChangeText: (masked) => {
            setInput(masked);
            onChange(masked);
        },
        mask
    });
    return react_1.default.createElement(native_base_1.Input, { isInvalid: (0, exports.isAddressValid)(input) === false, ...maskedInputProps, ...props });
};
exports.AddressInput = AddressInput;
//# sourceMappingURL=AddressInput.js.map