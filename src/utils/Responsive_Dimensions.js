// Place this in your project and use its methods anywhere.

// Responsive_Dimensions.js
import { Dimensions } from "react-native";

const percentageCalculation = (max, val) => max * (val / 100);

const fontCalculation = (height, width, val) => {
  const widthDimension = height > width ? width : height;
  const aspectRatioBasedHeight = (16 / 9) * widthDimension;
  return percentageCalculation(Math.sqrt(Math.pow(aspectRatioBasedHeight, 2) + Math.pow(widthDimension, 2)), val);
};
export const responsiveFontSize = (f) => {
  const { height, width } = Dimensions.get("window");
  return fontCalculation(height, width, f);
};
export const responsiveHeight = (h) => {
  const { height } = Dimensions.get("window");
  return height * (h / 100)
}
export const responsiveWidth = (w) => {
  const { width } = Dimensions.get("window");
  return width * (w / 100)
}

