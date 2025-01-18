import { View, Text, Dimensions } from "react-native";
import BallSpringTargetRepeat from "@/components/ball-spring-target-repeat";

const { width, height } = Dimensions.get("window");

const CIRCLE_RADIUS = 30;
const BALL_RADIUS = 30;

const circles = [
  { x: width/ 2 - (3*CIRCLE_RADIUS) - BALL_RADIUS, y: height / 3 },
  { x: width/ 2 - CIRCLE_RADIUS, y: height / 3 },
  { x: width/ 2 + (3*CIRCLE_RADIUS) - BALL_RADIUS, y: height / 3 },
];

const PrototypeEight = () => {

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
        <BallSpringTargetRepeat 
        key={index} n={index} circles={circles}/>
      ))}
    </View>
  );
};

export default PrototypeEight;