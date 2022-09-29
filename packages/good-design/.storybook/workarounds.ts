import { Buffer } from 'buffer';
global.Buffer = Buffer; // Workaround because webpack.ProvidePlugin for Buffer breaks webpackFinal configuration in main.js