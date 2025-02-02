import { View } from "react-native";
import { Children } from "../types/Children";

export const Spacer = ({
  size,
  direction,
  children = null,
}: {
  size: number;
  direction: "top" | "bottom" | "left" | "right";
  children?: Children | null;
}) => {
  return (
    <View
      style={{
        [`margin${direction[0].toUpperCase() + direction.slice(1)}`]: size,
      }}
    >
      {children}
    </View>
  );
};
