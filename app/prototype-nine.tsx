import { View, Text, Dimensions } from "react-native";
import React, { useState } from "react";
import BallSpringStack from "@/components/ball-spring-stack";

const { width, height } = Dimensions.get("window");

const stackDimensions = { stackHeight: height / 2, stackWidth: width / 10 };
const stackPositions = [
  { x: width / 10, y: height / 4 },
  { x: (8 * width) / 10, y: height / 4 },
];

const PrototypeNine = () => {

  const [numberOfBallStack1, setNumberOfBallStack1] = useState(0);
  const [numberOfBallStack2, setNumberOfBallStack2] = useState(0);

  const updateBallCount = (stack: number, change: number) => {
    if (stack === 1) {
      setNumberOfBallStack1(numberOfBallStack1 + change);
    }
    if (stack === 2) {
      setNumberOfBallStack2(numberOfBallStack2 + change);
    }
  };

  return (
    <View>
      {stackPositions.map((stack, index) => (
        <View
          key={index}
          style={{
            height: stackDimensions.stackHeight,
            width: stackDimensions.stackWidth,
            borderWidth: 3,
            borderColor: "black",
            left: stack.x,
            top: stack.y,
            position: "absolute",
            borderRadius: width / 40,
          }}
        />
      ))}
      <BallSpringStack n={1} updateBallCount={updateBallCount} numberOfBallStack1={numberOfBallStack1} numberOfBallStack2={numberOfBallStack2}/>
      <BallSpringStack n={2} updateBallCount={updateBallCount} numberOfBallStack1={numberOfBallStack1} numberOfBallStack2={numberOfBallStack2}/>
    </View>
  );
};

export default PrototypeNine;
