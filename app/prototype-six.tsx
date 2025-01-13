import { View, Text, Dimensions } from "react-native";
import React from "react";
import Animated, { useAnimatedStyle } from "react-native-reanimated";

const { width, height } = Dimensions.get("window");
const CIRCLE_RADIUS = 35;
const BALL_RADIUS = 25;
const NUMBER_OF_BALLS = 10;
const NUMBER_OF_DRAGGABLE_BALL = 5;
export default function PrototypeSix() {
  const reanimatedStyle = useAnimatedStyle(() => {
    return {};
  }, []);

  return (
    <View>
      {Array.from({ length: NUMBER_OF_BALLS }, (_, i) => (
        <View
          key={i}
          style={{
            height: CIRCLE_RADIUS * 2,
            aspectRatio: 1,
            borderWidth: 2,
            borderColor: "black",
            borderRadius: CIRCLE_RADIUS,
            position: "absolute",
            top: height / 4,
            left: CIRCLE_RADIUS + (i * width) / (NUMBER_OF_BALLS + 1),
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text>{`${Math.round(height / 4 - CIRCLE_RADIUS)},${Math.round(
            CIRCLE_RADIUS + (i * width) / (NUMBER_OF_BALLS + 1) - BALL_RADIUS
          )}`}</Text>
        </View>
      ))}
      {Array.from({ length: NUMBER_OF_DRAGGABLE_BALL }, (_, i) => (
        <View
          key={i}
          style={{
            height: BALL_RADIUS * 2,
            aspectRatio: 1,
            borderWidth: 2,
            borderColor: "black",
            borderRadius: BALL_RADIUS,
            position: "absolute",
            top: (height * 3) / 4,
            left: width / 8 + (i * width) / (NUMBER_OF_DRAGGABLE_BALL + 1),
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: 10 }}>{`${Math.round(
            (height * 3) / 4 - BALL_RADIUS
          )},${Math.round(
            width / 8 +
              (i * width) / (NUMBER_OF_DRAGGABLE_BALL + 1) -
              BALL_RADIUS
          )}`}</Text>
        </View>
      ))}
    </View>
  );
}
