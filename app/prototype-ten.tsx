import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import {
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  useDerivedValue,
  Layout,
} from 'react-native-reanimated';

// ---------------------------------------------
// Types & Constants
// ---------------------------------------------
type BallData = {
  id: string;
  color: string;
};

/**
 * We'll assume a landscape orientation, but you can adapt as needed.
 * For simplicity, let's get the entire screen height and consider
 * the midpoint as `height / 2`.
 */
const { width, height } = Dimensions.get('screen');
const MID_LINE_Y = height / 2;

// Initial Data for Row 1 (top row at bottom half) and Row 2.
const initialRow1: BallData[] = [
  { id: 'b1', color: '#F94144' },
  { id: 'b2', color: '#F3722C' },
  { id: 'b3', color: '#F8961E' },
  { id: 'b4', color: '#F9C74F' },
  { id: 'b5', color: '#90BE6D' },
];

const initialRow2: BallData[] = [
  { id: 'b6', color: '#43AA8B' },
  { id: 'b7', color: '#4D908E' },
  { id: 'b8', color: '#577590' },
  { id: 'b9', color: '#277DA1' },
  { id: 'b10', color: '#9B5DE5' },
];

// ---------------------------------------------
// A Reusable Draggable Ball
// ---------------------------------------------
/**
 * Each ball will:
 * - Track its translation (x, y) via shared values
 * - Use a Pan gesture
 * - Check if it crossed the MID_LINE_Y on release
 * - If it crosses, we finalize it in the top half
 * - Otherwise, it snaps back to (0,0) with a spring
 */
interface DraggableBallProps {
  ball: BallData;
  onDropAboveMidLine: (id: string) => void; // Notify parent when dropped in top half
  disabled?: boolean;                       // Row 2 balls won't be draggable
}

const Ball = ({ ball, onDropAboveMidLine, disabled }: DraggableBallProps) => {
  // Keep track of drag translation in Reanimated shared values
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  // Pan Gesture
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      // Only move if not disabled
      if (!disabled) {
        translateX.value = event.translationX;
        translateY.value = event.translationY;
      }
    })
    .onEnd(() => {
      if (disabled) return;

      // Check if final y is above mid screen
      const finalY = translateY.value;
      const targetGlobalY = finalY; // Because original position is 0, so final = offset

      console.log(targetGlobalY + height);
      

      if(targetGlobalY + height < 320){
        // This check might vary depending on how you megsure the absolute position
        // Instead, let's do a simpler check: If the ball has moved up more than halfway
        if (Math.abs(translateY.value) > MID_LINE_Y / 2) {
          console.log('crossed the midpoint');
          // Crossed the midpoint, so we'll finalize it above
          runOnJS(onDropAboveMidLine)(ball.id);
          return;
        }
      }

      // If not above mid line, spring back
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
    });

  // Animated style to move the ball
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
      ],
    };
  });

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.ball, animatedStyle, { backgroundColor: ball.color }]}>
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>{ball.id}</Text>
      </Animated.View>
    </GestureDetector>
  );
};

// ---------------------------------------------
// Main Screen
// ---------------------------------------------
export default function BallsAnimationExample() {
  // We track:
  // 1) Balls in the top half: "topBalls" (for demonstration, we just hold them).
  // 2) Row1 (5 balls initially).
  // 3) Row2 (5 balls initially).
  const [topBalls, setTopBalls] = useState<BallData[]>([]);
  const [row1, setRow1] = useState<BallData[]>(initialRow1);
  const [row2, setRow2] = useState<BallData[]>(initialRow2);

  /**
   * Called when a Row1 ball is dropped above mid line.
   * 1) Remove from row1
   * 2) Add to topBalls
   * 3) Move one ball from row2 -> row1 (if available)
   */
  const handleDropAboveMidLine = (id: string) => {
    // Find the ball in row1
    const ballIndex = row1.findIndex((b) => b.id === id);
    if (ballIndex === -1) return;

    // Extract ball from row1
    const ball = row1[ballIndex];
    const newRow1 = [...row1];
    newRow1.splice(ballIndex, 1);

    // Add that ball to topBalls
    const newTopBalls = [...topBalls, ball];

    // Move one ball from row2 to row1 (rightmost position)
    let newRow2 = [...row2];
    if (newRow2.length > 0) {
      const [movedBall] = newRow2.splice(0, 1); // take from the "front" or "end" depending on your preference
      newRow1.push(movedBall);
    }

    setTopBalls(newTopBalls);
    setRow1(newRow1);
    setRow2(newRow2);
  };

  return (
    <View style={styles.container}>
      {/* Top Half - Just display the top balls for demonstration */}
      <View style={styles.topHalf}>
        {topBalls.map((ball) => {
          return (
            <Animated.View
              key={ball.id}
              // Using Reanimated 3's Layout for a spring effect on entrance
              layout={Layout.springify()}
              style={[styles.topBall, { backgroundColor: ball.color }]}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>{ball.id}</Text>
            </Animated.View>
          );
        })}
      </View>

      {/* Bottom Half - Two rows of balls */}
      <View style={styles.bottomHalf}>
        <View style={styles.rowContainer}>
          {row1.map((ball) => {
            return (
              <Animated.View
                key={ball.id}
                style={styles.ballWrapper}
                layout={Layout.springify()} // Animate re-positioning
              >
                <Ball
                  ball={ball}
                  onDropAboveMidLine={handleDropAboveMidLine}
                  disabled={false} // Row1 is draggable
                />
              </Animated.View>
            );
          })}
        </View>

        <View style={styles.rowContainer}>
          {row2.map((ball) => {
            return (
              <Animated.View
                key={ball.id}
                style={styles.ballWrapper}
                layout={Layout.springify()} // Animate re-positioning
              >
                <Ball
                  ball={ball}
                  onDropAboveMidLine={() => {}} // Row2 balls not draggable
                  disabled={true}
                />
              </Animated.View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

// ---------------------------------------------
// Styles
// ---------------------------------------------
const BALL_SIZE = 50;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEE',
  },
  topHalf: {
    flex: 1,
    backgroundColor: '#ddd',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  bottomHalf: {
    flex: 1,
    justifyContent: 'flex-start',
    backgroundColor: '#ccc',
    paddingVertical: 10,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  ballWrapper: {
    margin: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ball: {
    width: BALL_SIZE,
    height: BALL_SIZE,
    borderRadius: BALL_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBall: {
    width: BALL_SIZE,
    height: BALL_SIZE,
    borderRadius: BALL_SIZE / 2,
    margin: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
