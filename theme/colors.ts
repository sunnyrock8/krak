import { Color } from "../utils/Color";

export const colorsHex = {
  primary: "#AEEA8F",
  secondary: "#CB8FEA",
  text: "#0A1504",
  white: "#F6FDF2",
};

export const colors = {
  primary: Color.fromHex(colorsHex.primary),
  secondary: Color.fromHex(colorsHex.secondary),
  text: Color.fromHex(colorsHex.text),
  white: Color.fromHex(colorsHex.white),
};
