import React, { useCallback, useMemo } from "react";
import { View, Text, Dimensions, StyleSheet } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  useAnimatedReaction,
  withSequence,
} from "react-native-reanimated";

// Get the screen dimensions
const { width, height } = Dimensions.get("window");
const SCREEN_WIDTH = width;
const SCREEN_HEIGHT = Dimensions.get("window").height;
const shuffleArray = (array: number[]) => {
  const shuffled = array.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};
// Constants
const CIRCLE_RADIUS = 30; // Radius of the empty circles
const LEFTPADDING = CIRCLE_RADIUS * 1.5; // Padding for the left side of the circles
const BALL_SIZE = 50; // Size of the balls
const H_SPACING = 60; // horizontal spacing for the row
const V_SPACING = 60; // vertical spacing for the column

// Array of circle positions
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

// posX = SCREEN_WIDTH / 3 + indexInType * H_SPACING;
// posY = (3 * SCREEN_HEIGHT) / 4;
const emptyCircles = [
  { x: SCREEN_WIDTH / 4 + 40, y: (3 * SCREEN_HEIGHT) / 4 - 30 },
  { x: SCREEN_WIDTH / 4 + width / 12 + 30, y: (3 * SCREEN_HEIGHT) / 4 - 30 },
  {
    x: SCREEN_WIDTH / 4 + (2 * width) / 12 + 20,
    y: (3 * SCREEN_HEIGHT) / 4 - 30,
  },
  {
    x: SCREEN_WIDTH / 4 + (3 * width) / 12 + 10,
    y: (3 * SCREEN_HEIGHT) / 4 - 30,
  },
  { x: SCREEN_WIDTH / 4 + (4 * width) / 12, y: (3 * SCREEN_HEIGHT) / 4 - 30 },
];
/*
  Initial types for the balls
  - first 5 are horizontal
  - next 5 are vertical
*/
const INITIAL_TYPES = Array.from({ length: 10 }).map((_, i) =>
  i < 5 ? "horizontal" : "vertical"
);

const PrototypeFinal = () => {
  const ballTypes = useSharedValue<string[]>([...INITIAL_TYPES]);

  // Shared values for positions and their "original" (rest) positions
  const positions = Array.from({ length: 10 }, () =>
    useSharedValue({ x: 0, y: 0 })
  );
  const originalPositions = Array.from({ length: 10 }, () =>
    useSharedValue({ x: 0, y: 0 })
  );

  // Track the currently dragged ball
  const draggedBallIndex = useSharedValue<number | null>(null);

  // Layout positions (horizontal/vertical)
  const computeLayoutForTypeAndIndex = useCallback(
    (type: string, indexInType: number) => {
      "worklet";
      let posX = 0;
      let posY = 0;

      if (type === "horizontal") {
        // The balls with horizontal type are placed along the bottom row
        posX = SCREEN_WIDTH / 3 + indexInType * H_SPACING;
        posY = (3 * SCREEN_HEIGHT) / 4;
      } else if (type === "vertical") {
        // The balls with vertical type are in a column below the horizontal row
        posX = (2 * SCREEN_WIDTH) / 3 - 40;
        posY = (3 * SCREEN_HEIGHT) / 4 + indexInType * V_SPACING + 130;
      }

      return { posX, posY };
    },
    []
  );

  useAnimatedReaction(
    () => ballTypes.value,
    (currentTypes, previousTypes) => {
      // Group the ball indices by type
      const horizontalIndices: number[] = [];
      const verticalIndices: number[] = [];

      currentTypes.forEach((t, i) => {
        if (t === "horizontal") {
          horizontalIndices.push(i);
        } else if (t === "vertical") {
          verticalIndices.push(i);
        }
      });

      // Update each group's layout positions
      horizontalIndices.forEach((ballIdx, subIdx) => {
        const { posX, posY } = computeLayoutForTypeAndIndex(
          "horizontal",
          subIdx
        );
        if (!previousTypes) {
          // On mount
          positions[ballIdx].value = { x: posX, y: posY };
        } else {
          // Animate to new position
          positions[ballIdx].value = withSpring({ x: posX, y: posY });
        }
        originalPositions[ballIdx].value = { x: posX, y: posY };
      });

      verticalIndices.forEach((ballIdx, subIdx) => {
        const { posX, posY } = computeLayoutForTypeAndIndex("vertical", subIdx);
        if (!previousTypes) {
          // On mount
          positions[ballIdx].value = { x: posX, y: posY };
        } else {
          positions[ballIdx].value = withSpring({ x: posX, y: posY });
        }
        originalPositions[ballIdx].value = { x: posX, y: posY };
      });
    },
    [computeLayoutForTypeAndIndex]
  );

  // Reorder logic used when a ball is dragged upward
  const reorderOnDragUp = useCallback((draggedIndex: number) => {
    const oldTypes = ballTypes.value.slice();
    oldTypes[draggedIndex] = "top";

    // find topmost vertical index:
    const verticalIndices = oldTypes
      .map((t, i) => (t === "vertical" ? i : -1))
      .filter((i) => i >= 0);

    // If there is at least one vertical ball, make that topmost one "horizontal"
    if (verticalIndices.length > 0) {
      const topVertIndex = verticalIndices[0];
      oldTypes[topVertIndex] = "horizontal";
    }

    ballTypes.value = oldTypes;
  }, []);

  // Build Pan Gesture
  const buildGesture = (idx: number, shuffledIndex: number) => {
    return Gesture.Pan()
      .onStart(() => {
        // Only allow dragging if "horizontal" and no other ball is being dragged
        if (
          ballTypes.value[idx] === "horizontal" &&
          draggedBallIndex.value === null
        ) {
          draggedBallIndex.value = idx;
        }
      })
      .onUpdate((event) => {
        // Only update position if this is the currently dragged ball
        if (draggedBallIndex.value === idx) {
          positions[idx].value = {
            x: event.translationX + originalPositions[idx].value.x,
            y: event.translationY + originalPositions[idx].value.y,
          };
        }
      })
      .onEnd((event) => {
        // Only check final position if this is the currently dragged ball
        if (draggedBallIndex.value === idx) {
          const BallCenterX =
            event.translationX + originalPositions[idx].value.x;
          const BallCenterY =
            event.translationY + originalPositions[idx].value.y;

          let minDistance = Infinity;
          let nearestCircleIndex: number | undefined;
          let nearestCircleCoordinates: { x: number; y: number } | undefined;
          const snapTriggerDistance = CIRCLE_RADIUS * 2.5;

          for (let i = 0; i < circles.length; i++) {
            const dist = Math.hypot(
              circles[i].x + BALL_SIZE / 2 - BallCenterX,
              circles[i].y + BALL_SIZE / 2 - BallCenterY
            );
            if (dist < minDistance) {
              minDistance = dist;
              nearestCircleIndex = i;
              nearestCircleCoordinates = {
                x: circles[i].x + BALL_SIZE / 2 + 5,
                y: circles[i].y + BALL_SIZE / 2 + 5,
              };
            }
          }

          if (
            nearestCircleIndex !== undefined &&
            nearestCircleCoordinates &&
            minDistance < snapTriggerDistance
          ) {
            // If user dragged onto its own circle index
            if (nearestCircleIndex === shuffledIndex) {
              positions[idx].value = withSpring(nearestCircleCoordinates);
              runOnJS(reorderOnDragUp)(idx);
            } else {
              // Animate to circle, then back to original
              positions[idx].value = withSequence(
                withSpring(nearestCircleCoordinates),
                withSpring(originalPositions[idx].value)
              );
            }
          } else {
            // Snap back to original if not close enough
            positions[idx].value = withSpring(originalPositions[idx].value);
          }
          draggedBallIndex.value = null;
        }
      });
  };

  // Ball Component
  const Ball = ({
    index,
    shuffledIndex,
  }: {
    index: number;
    shuffledIndex: number;
  }) => {
    const style = useAnimatedStyle(() => {
      const { x, y } = positions[index].value;
      return {
        transform: [
          { translateX: x - BALL_SIZE / 2 },
          { translateY: y - BALL_SIZE / 2 },
        ],
      };
    });

    const gesture = buildGesture(index, shuffledIndex);

    return (
      <GestureDetector gesture={gesture}>
        <Animated.View
          style={[
            {
              position: "absolute",
              width: BALL_SIZE,
              height: BALL_SIZE,
              borderRadius: BALL_SIZE / 2,
              backgroundColor: "orange",
              alignItems: "center",
              justifyContent: "center",
            },
            style,
          ]}
        >
          <Text>{shuffledIndex}</Text>
        </Animated.View>
      </GestureDetector>
    );
  };

  const shuffledIndices = useMemo(() => {
    const numbers = Array.from({ length: 10 }, (_, i) => i);
    return shuffleArray(numbers);
  }, []);

  return (
    <View style={styles.container}>
      {/* Render the 10 circles */}
      {circles.map((circle, index) => (
        <View
          key={index}
          style={{
            height: CIRCLE_RADIUS * 2,
            width: CIRCLE_RADIUS * 2,
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
      {emptyCircles.map((circle, index) => (
        <View
          key={index}
          style={{
            height: CIRCLE_RADIUS * 2,
            width: CIRCLE_RADIUS * 2,
            borderRadius: CIRCLE_RADIUS,
            borderWidth: 2,
            borderColor: "black",
            position: "absolute",
            left: circle.x,
            top: circle.y,
            alignItems: "center",
            justifyContent: "center",
          }}
        />
      ))}
      {/* Render 10 balls */}
      {Array.from({ length: 10 }).map((_, i) => (
        <Ball key={i} index={i} shuffledIndex={shuffledIndices[i]} />
      ))}
    </View>
  );
};

export default PrototypeFinal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
});

