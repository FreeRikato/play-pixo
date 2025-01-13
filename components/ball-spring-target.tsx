import { View, Text, Dimensions } from "react-native";
import React, { useState } from "react";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

const CIRCLE_RADIUS = 30;
const BALL_RADIUS = 30;
const LEFTPADDING = CIRCLE_RADIUS * 1.5;

const circles = [
  { x: LEFTPADDING + 0, y: height / 3 },
  { x: LEFTPADDING + width / 11, y: height / 3 },
  { x: LEFTPADDING + (2 * width) / 11, y: height / 3 },
  { x: LEFTPADDING + (3 * width) / 11, y: height / 3 },
  { x: LEFTPADDING + (4 * width) / 11, y: height / 3 },
  { x: LEFTPADDING + (5 * width) / 11, y: height / 3 },
  { x: LEFTPADDING + (6 * width) / 11, y: height / 3 },
  { x: LEFTPADDING + (7 * width) / 11, y: height / 3 },
  { x: LEFTPADDING + (8 * width) / 11, y: height / 3 },
  { x: LEFTPADDING + (9 * width) / 11, y: height / 3 },
];

interface BallSpringTargetProps {
  n: number;
}

const BallSpringTarget = ({ n }: BallSpringTargetProps) => {
  const ballPosition = useSharedValue({
    x: width / 2 + 2.5 * (n - 2.5) * CIRCLE_RADIUS,
    y: (3 * height) / 4 - BALL_RADIUS,
    ball: n,
  });

  const context = useSharedValue({ x: 0, y: 0 });
  const ballSnap = useSharedValue(0);

  const [displaySnap, setDisplaySnap] = useState(0);

  useAnimatedReaction(
    () => ballSnap.value,
    (snap, prevSnap) => {
      if (snap !== prevSnap) {
        runOnJS(setDisplaySnap)(snap);
      }
    },
    []
  );

  const PanGesture = Gesture.Pan()
    .onStart(() => {
      context.value = { ...ballPosition.value };
    })
    .onUpdate((event) => {
      ballPosition.value = {
        ...ballPosition.value,
        x: context.value.x + event.translationX,
        y: context.value.y + event.translationY,
      };
    })
    .onEnd(() => {
      let distance;
      let minDistance = Infinity;
      let nearestCircle;
      let nearestCircleCoordinates;
      let snapTriggerDistance = CIRCLE_RADIUS * 2.5;

      for (let i = 0; i < circles.length; i++) {
        let CircleCenterX = circles[i].x;
        let CircleCenterY = circles[i].y;

        let BallCenterX = ballPosition.value.x;
        let BallCenterY = ballPosition.value.y;

        distance = Math.hypot(
          CircleCenterX - BallCenterX,
          CircleCenterY - BallCenterY
        );

        if (distance < minDistance) {
          minDistance = distance;
          nearestCircle = i;
          nearestCircleCoordinates = { x: circles[i].x, y: circles[i].y };
        }
      }

      if (minDistance > snapTriggerDistance) {
        ballSnap.value = -1;
        ballPosition.value = withSpring({
          ...ballPosition.value,
          x: width / 2 + 2.5 * (n - 2.5) * CIRCLE_RADIUS,
          y: (3 * height) / 4 - BALL_RADIUS,
        });
      } else if (
        nearestCircle !== undefined &&
        nearestCircleCoordinates &&
        minDistance < snapTriggerDistance
      ) {
        ballSnap.value = nearestCircle;
        if (ballSnap.value === ballPosition.value.ball) {
          ballPosition.value = withSpring({
            ...ballPosition.value,
            x: nearestCircleCoordinates.x,
            y: nearestCircleCoordinates.y,
          });
        } else {
          ballSnap.value = -1;
          ballPosition.value = withSequence(
            withSpring({
              ...ballPosition.value,
              x: nearestCircleCoordinates.x,
              y: nearestCircleCoordinates.y,
            }),
            withSpring({
              ...ballPosition.value,
              x: width / 2 + 2.5 * (n - 2.5) * CIRCLE_RADIUS,
              y: (3 * height) / 4 - BALL_RADIUS,
            })
          );
        }
      }
    });

  const reanimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: ballPosition.value.x },
        { translateY: ballPosition.value.y },
      ],
    };
  }, []);
  return (
    <GestureDetector gesture={PanGesture}>
      <Animated.View
        style={[
          {
            height: BALL_RADIUS * 2,
            aspectRatio: 1,
            borderRadius: BALL_RADIUS,
            backgroundColor: "red",
            position: "absolute",
            justifyContent: "center",
            alignItems: "center",
          },
          reanimatedStyle,
        ]}
      >
        <Text>{displaySnap}</Text>
      </Animated.View>
    </GestureDetector>
  );
};

export default BallSpringTarget;
