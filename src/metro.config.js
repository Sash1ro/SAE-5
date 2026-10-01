//allow the application to read .onnx/.wasm files in web or mobile

const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);
config.resolver.assetExts.push("onnx");
config.resolver.assetExts.push("wasm");

module.exports = config;
