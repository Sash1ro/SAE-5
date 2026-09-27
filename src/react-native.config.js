module.exports = {
  dependencies: {
    "onnxruntime-react-native": {
      platforms: {
        android: {
          sourceDir: "./android",
          packageImportPath:
            "import ai.onnxruntime.reactnative.OnnxruntimePackage;",
          packageInstance: "new OnnxruntimePackage()",
        },
      },
    },
  },
};
