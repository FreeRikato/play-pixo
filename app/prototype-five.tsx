import React, { useRef } from "react";
import { StyleSheet, View, Dimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

// CIRCLE_RADIUS is the radius of the empty circle
const CIRCLE_RADIUS = 40;
// BALL_RADIUS is the radius of the ball
const BALL_RADIUS = 20;

// Absolute positioning: Both circles and the draggable ball need to be positioned at very specific coordinates on the screen since it allows to place elements exactly in the desired place relative to their neares positioned ancestor (<View>)
// More importantly, it allows elements to overlap each other, which is necessary for the ball to move freely over the circles

const PrototypeFive = () => {
  // Shared values for the ball's position
  // width/2 and height/2 values represent the exact center of the screen

  /* Centering the Ball
  
  - The goal here is to initally center the draggable ball on the screen. What if we set ball posistion to {x: width/2, y: height/2} => place the top-left corner of the ball at the center of the screen
  - Subtracting BALL_RADIUS from both x and y to adjust the ball's position so that its center align with the center of the screen
  */

  const ballPosition = useSharedValue({
    x: width / 2 - BALL_RADIUS,
    y: height / 2 - BALL_RADIUS,
  });

  /* Positions of the circles

  The objective of this prototype is to place the empty circles on the top left quarter and bottom right quarter*/

  const circles = [
    { x: width / 4, y: height / 4 },
    { x: (3 * width) / 4, y: height / 4 },
    { x: width / 4, y: (3 * height) / 4 },
    { x: (3 * width) / 4, y: (3 * height) / 4 },
  ];

  // Gesture handler for dragging the ball
  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      // Update the ball's position during drag
      // Dragging the ball will trigger an update and on update store the absolute x and y position as shared value
      ballPosition.value = {
        x: event.absoluteX - BALL_RADIUS,
        y: event.absoluteY - BALL_RADIUS,
      };
    })
    .onEnd(() => {
      /* Find the nearest circle and snap the ball to it after the ball is dragged

      - Find the nearest circle
      - To find the nearest circle let's traverse the circle array with its position (x, y)
      - Use distance formula to find the distances between the center of the ball and centers (x1, y1)(x2, y2) of the empty circle.

      DISTANCE FORMULA: sqrt((x2-x1)^2+(y2-y1)^2)

      - The minimum distance will determine the empty circle that is nearest to the ball
      - Use spring animation to snap the ball into center of the nearest empty circle
      */

      let nearestCircle = circles[0];
      let minDistance = Infinity;

      circles.forEach((circle) => {
        const distance = Math.sqrt(
          Math.pow(ballPosition.value.x + BALL_RADIUS - circle.x, 2) +
            Math.pow(ballPosition.value.y + BALL_RADIUS - circle.y, 2)
        );

        if (distance < minDistance) {
          minDistance = distance;
          nearestCircle = circle;
        }
      });

      // Snap the ball to the nearest circle
      ballPosition.value = withSpring({
        x: nearestCircle.x - BALL_RADIUS,
        y: nearestCircle.y - BALL_RADIUS,
      });
    });

  // Animated style for the ball. As the position of the ball is used for the animation, we will use it for the style - translateX and translateY
  const ballAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: ballPosition.value.x },
        { translateY: ballPosition.value.y },
      ],
    };
  });

  return (
    <View style={styles.container}>
      {/* Render the circles */}
      {circles.map((circle, index) => (
        <View
          key={index}
          style={[
            styles.circle,
            { left: circle.x - CIRCLE_RADIUS, top: circle.y - CIRCLE_RADIUS },
          ]}
        />
      ))}

      {/* Render the draggable ball */}
      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.ball, ballAnimatedStyle]} />
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  circle: {
    width: CIRCLE_RADIUS * 2,
    height: CIRCLE_RADIUS * 2,
    borderRadius: CIRCLE_RADIUS,
    borderWidth: 2,
    borderColor: "#000",
    position: "absolute",
  },
  ball: {
    width: BALL_RADIUS * 2,
    height: BALL_RADIUS * 2,
    borderRadius: BALL_RADIUS,
    backgroundColor: "red",
    position: "absolute",
  },
});

export default PrototypeFive;
