import { View, Text, Dimensions } from "react-native";
import React, { useState } from "react";
import Animated, {
  withSpring,
  useAnimatedStyle,
  useSharedValue,
  useAnimatedReaction,
  runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

const { width, height } = Dimensions.get("window");

const BALL_RADIUS = 30;

const stackDimensions = { stackHeight: height / 6, stackWidth: width / 2 };
const stackPositions = [
  { x: width / 4, y: (3 * height) / 5 },
  { x: width / 4, y: (4 * height) / 5 },
];

interface BallSpringStackProps {
  updateBallCount: (stack: number, change: number) => void;
  n: number;
  numberOfBallStack1: number;
  numberOfBallStack2: number;
}

const BallSpringStackRepeat = ({
  n,
  updateBallCount,
  numberOfBallStack1,
  numberOfBallStack2,
}: BallSpringStackProps) => {
  const ballPosition = useSharedValue({
    x: width / 4 + n * BALL_RADIUS * 2,
    y: (3 * height) / 5,
  });

  const context = useSharedValue({
    x: 0,
    y: 0,
  });

  const ballStackToggle = useSharedValue<number>(0);

  useAnimatedReaction(
    () => ballStackToggle.value,
    (current, previous) => {
      console.log(`Ball toggled from stack ${previous} -> ${current}`);
      if (previous === 0 && current === 1) {
        runOnJS(updateBallCount)(1, 1);
      }
      if (previous === 0 && current === 2) {
        runOnJS(updateBallCount)(2, 1);
      }
      if (previous === 1 && current === 2) {
        runOnJS(updateBallCount)(1, -1);
        runOnJS(updateBallCount)(2, 1);
      }
      if (previous === 2 && current === 1) {
        runOnJS(updateBallCount)(1, 1);
        runOnJS(updateBallCount)(2, -1);
      }
      if (previous === 1 && current === 0) {
        runOnJS(updateBallCount)(1, -1);
      }
      if (previous === 2 && current === 0) {
        runOnJS(updateBallCount)(2, -1);
      }
      if (previous === 1 && current === 1) {
        console.log("NO FUCKING CHANGE IN STACK 1");
        runOnJS(updateBallCount)(1, 0);
      }
      if (previous === 2 && current === 2) {
        console.log("NO FUCKING CHANGE IN STACK 2");
        runOnJS(updateBallCount)(2, 0);
      }
    //   console.log("Number of balls in Stack1 = " + numberOfBallStack1);
    //   console.log("Number of balls in Stack2 = " + numberOfBallStack2);
    },
    [numberOfBallStack1, numberOfBallStack2]
  );

  const PanGesture = Gesture.Pan()
    .onStart(() => {
      context.value = { ...ballPosition.value };
    })
    .onUpdate((event) => {
      ballPosition.value = {
        x: context.value.x + event.translationX,
        y: context.value.y + event.translationY,
      };
    })
    .onEnd(() => {
      for (let i = 0; i < stackPositions.length; i++) {
        const stackX1 = Number(stackPositions[i].x);
        const stackX2 = Number(
          stackPositions[i].x + stackDimensions.stackWidth
        );
        const stackY1 = Number(stackPositions[i].y);
        const stackY2 = Number(
          stackPositions[i].y + stackDimensions.stackHeight
        );
        ballStackToggle.value = 0;

        if (
          i == 0 &&
          ballPosition.value.x > stackX1 &&
          ballPosition.value.x < stackX2 - BALL_RADIUS * 2 &&
          ballPosition.value.y > stackY1 &&
          ballPosition.value.y < stackY2
        ) {
          ballStackToggle.value = 1;
          ballPosition.value = withSpring({
            x: stackX1 + numberOfBallStack1 * BALL_RADIUS * 2,
            y: (stackY1 + stackY2) / 2 - BALL_RADIUS,
          });
          break;
        } else if (
          i == 1 &&
          ballPosition.value.x > stackX1 &&
          ballPosition.value.x < stackX2 &&
          ballPosition.value.y > stackY1 &&
          ballPosition.value.y < stackY2
        ) {
          ballStackToggle.value = 2;
          ballPosition.value = withSpring({
            x: stackX1 + numberOfBallStack2 * BALL_RADIUS * 2,
            y: (stackY1 + stackY2) / 2 - BALL_RADIUS,
          });
      console.log("Number of balls in Stack2 = " + numberOfBallStack2);
          break;
        }
      }
    });

  const reanimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: ballPosition.value.x,
        },
        {
          translateY: ballPosition.value.y,
        },
      ],
    };
  }, []);

  return (
    <View>
      <GestureDetector gesture={PanGesture}>
        <Animated.View
          style={[
            {
              height: BALL_RADIUS * 2,
              aspectRatio: 1,
              borderRadius: BALL_RADIUS,
              backgroundColor: "red",
              position: "absolute",
              alignItems: "center",
              justifyContent: "center",
            },
            reanimatedStyle,
          ]}
        >
          <Text>{n}</Text>
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

export default BallSpringStackRepeat;
