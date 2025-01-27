import { View, Text, Dimensions } from "react-native";
import BallSpringTarget from "@/components/ball-spring-target";

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

const PrototypeSeven = () => {

  return (
    <View>
      <View>
        {circles.map((circle, index) => (
          <View
            key={index}
            style={{
              height: CIRCLE_RADIUS * 2,
              aspectRatio: 1,
              borderRadius: CIRCLE_RADIUS,
              borderWidth: 2,
              borderColor: "black",
              position: "absolute",
              left: circle.x,
              top: circle.y,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text>{index}</Text>
          </View>
        ))}
      </View>
      {Array.from({ length: 5 }, (_, index) => (
        <BallSpringTarget 
        key={index} n={index} />
      ))}
    </View>
  );
};

export default PrototypeSeven;
