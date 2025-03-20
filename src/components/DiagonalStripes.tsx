import React from "react";
import { View } from "react-native";
import Svg, { Defs, Pattern, Rect, Line } from "react-native-svg";

const DiagonalStripes = ({ style }: any) => {
  return (
    <View style={[{ width: "100%", height: "100%" }, style]}>
      <Svg width="100%" height="100%">
        <Defs>
          <Pattern
            id="stripes"
            patternUnits="userSpaceOnUse"
            width="20"
            height="20"
            patternTransform="rotate(45)"
          >
            <Rect width="20" height="10" fill="transparent" />
            <Line
              x1="0"
              y1="0"
              x2="0"
              y2="20"
              stroke="rgba(0, 0, 0, 0.15)"
              strokeWidth="10"
            />
          </Pattern>
        </Defs>
        <Rect width={300} height={300} fill="url(#stripes)" />
      </Svg>
    </View>
  );
};

export default DiagonalStripes;
