import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  LayoutChangeEvent
} from 'react-native';
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
  useAnimatedReaction,
  Layout,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('screen');
const MID_LINE_Y = SCREEN_HEIGHT / 2;
const BALL_SIZE = 50;

// ---------------------------------------------------------------------
// Data Models
// ---------------------------------------------------------------------
type BallData = {
  id: string;
  color: string;
};

type FlyingBallData = {
  id: string;
  color: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
};

// Initial Data for row1 and row2
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

// ---------------------------------------------------------------------
// FlyingBall: Animates from a start (x, y) to an end (x, y)
// ---------------------------------------------------------------------
interface FlyingBallProps extends FlyingBallData {
  onAnimationDone: (ballId: string) => void;
}

const FlyingBall = ({ id, color, startX, startY, endX, endY, onAnimationDone }: FlyingBallProps) => {
  // Shared values for animating x/y
  const x = useSharedValue(startX);
  const y = useSharedValue(startY);

  // When this component mounts, animate from (startX, startY) → (endX, endY)
  useDerivedValue(() => {
    x.value = withSpring(endX, { damping: 5, stiffness: 40 }, (finished) => {
      if (finished) {
        // Once x finishes, check y or wait until y is done
      }
    });
    y.value = withSpring(endY, { damping: 5, stiffness: 40 }, (finished) => {
      if (finished) {
        // Once y finishes, run callback in JS
        runOnJS(onAnimationDone)(id);
      }
    });
  }, []);

  // Animated style
  const animatedStyle = useAnimatedStyle(() => {
    return {
      position: 'absolute',
      width: BALL_SIZE,
      height: BALL_SIZE,
      borderRadius: BALL_SIZE / 2,
      backgroundColor: color,
      justifyContent: 'center',
      alignItems: 'center',
      transform: [
        { translateX: x.value },
        { translateY: y.value },
      ],
    };
  });

  return (
    <Animated.View style={animatedStyle}>
      <Text style={styles.ballText}>{id}</Text>
    </Animated.View>
  );
};

// ---------------------------------------------------------------------
// DraggableBall: For row1
// ---------------------------------------------------------------------
interface DraggableBallProps {
  ball: BallData;
  onDropAboveMidLine: (id: string) => void;
}

const DraggableBall = ({ ball, onDropAboveMidLine }: DraggableBallProps) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY;
    })
    .onEnd(() => {
      // Check if final position crosses midpoint
      if (-translateY.value > MID_LINE_Y / 2) {
        // Then we consider it "above mid line"
        runOnJS(onDropAboveMidLine)(ball.id);
      } else {
        // Snap back
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });

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
      <Animated.View
        style={[
          styles.ball,
          animatedStyle,
          { backgroundColor: ball.color },
        ]}
      >
        <Text style={styles.ballText}>{ball.id}</Text>
      </Animated.View>
    </GestureDetector>
  );
};

// ---------------------------------------------------------------------
// StaticBall: For row2 (vertical stack) or topBalls (if we want them static there)
// ---------------------------------------------------------------------
interface StaticBallProps {
  ball: BallData;
  disabled?: boolean;
  onLayout?: (e: LayoutChangeEvent) => void;
  style?: any;
}

const StaticBall = ({ ball, disabled, onLayout, style }: StaticBallProps) => {
  return (
    <Animated.View
      onLayout={onLayout}
      style={[styles.ball, style, { backgroundColor: ball.color }]}
      // Use Reanimated Layout for re-positioning
      layout={Layout.springify()}
    >
      <Text style={styles.ballText}>{ball.id}</Text>
    </Animated.View>
  );
};

// ---------------------------------------------------------------------
// Main Screen
// ---------------------------------------------------------------------
export default function BallsAnimationExample() {
  // State for top, row1, row2
  const [topBalls, setTopBalls] = useState<BallData[]>([]);
  const [row1, setRow1] = useState<BallData[]>(initialRow1);
  const [row2, setRow2] = useState<BallData[]>(initialRow2);

  // This will hold any in-flight balls
  const [flyingBalls, setFlyingBalls] = useState<FlyingBallData[]>([]);

  // We’ll track the layout (x, y) of each ball in row2 using a dictionary
  // keyed by ball.id
  const row2Positions = useRef<Record<string, { x: number; y: number }>>({}).current;

  // We'll also track the layout width of row1 container so we can place
  // the new ball at the "right end"
  const [row1Width, setRow1Width] = useState(0);

  // Called when a row2 ball is laid out
  const handleRow2Layout = (ballId: string, e: LayoutChangeEvent) => {
    const { x, y } = e.nativeEvent.layout;
    // 'x' and 'y' here are relative to row2 container
    // We also need row2 container's absolute position if we want to do
    // a truly global measure. For simplicity, we assume row2 is roughly at (someX, someY).
    // We'll store them. Possibly adjust if you want exact screen coords.
    row2Positions[ballId] = { x, y };
  };

  // Called when the row1 container is laid out
  const handleRow1ContainerLayout = (e: LayoutChangeEvent) => {
    setRow1Width(e.nativeEvent.layout.width);
  };

  // -------------------------------------------------------------------
  // Dropping the row1 ball above mid line
  // -------------------------------------------------------------------
  const handleDropAboveMidLine = (ballId: string) => {
    // 1) Remove that ball from row1
    const idx = row1.findIndex(b => b.id === ballId);
    if (idx === -1) return;
    const ball = row1[idx];

    const newRow1 = [...row1];
    newRow1.splice(idx, 1);

    // 2) Add that ball to topBalls
    const newTopBalls = [...topBalls, ball];

    // 3) We want the TOPMOST ball from row2 to move into row1’s right-most position
    if (row2.length > 0) {
      // "Top-most" means the first item in row2[] (we could interpret reversed, but let's pick index=0)
      // We'll measure that ball’s layout from row2Positions
      const topBallFromRow2 = row2[0];

      // Remove from row2
      const newRow2 = [...row2];
      newRow2.splice(0, 1);

      // Get that ball's current measured x,y within row2
      const pos = row2Positions[topBallFromRow2.id];
      if (!pos) {
        // If we haven't laid it out yet, fallback to (0,0)
        // or better to do some known offset. We'll just do 0,0 for now
        pos && console.warn(`No layout info for row2 ball ${topBallFromRow2.id}`);
      }

      // We’ll define the final (x, y) in row1.
      // We'll place it at the "rightmost end" of row1, horizontally.
      // For simplicity, let's place it so that it sits just after the last ball. 
      // The x offset might be (row1Width) if we want it at the far right edge of row1 container.
      // The row1 container is at the bottom, so let's do an approximate y offset too.
      // We'll measure row1's top-left, but let's assume row1 is near the bottom 
      // so the final Y is 0 from row1's viewpoint. We only do an x shift.
      
      const finalX = row1Width - BALL_SIZE; // approximate "right edge"
      const finalY = 0;

      // We create a flying ball
      const flying: FlyingBallData = {
        id: topBallFromRow2.id,
        color: topBallFromRow2.color,
        startX: pos ? pos.x : 0,
        startY: pos ? pos.y : 0,
        endX: finalX,
        endY: finalY,
      };

      // Add to flyingBalls
      setFlyingBalls((prev) => [...prev, flying]);

      // Then update row2 state
      setRow2(newRow2);
    }

    // Finally update row1 and topBalls states
    setTopBalls(newTopBalls);
    setRow1(newRow1);
  };

  // -------------------------------------------------------------------
  // onFlyingBallDone: Called when the flying ball finishes its animation
  // We then add a normal ball to row1
  // -------------------------------------------------------------------
  const onFlyingBallDone = (ballId: string) => {
    setFlyingBalls((prev) => prev.filter((fb) => fb.id !== ballId));

    // Insert the new ball into row1
    // Grab color from original data (just for demonstration). 
    // In real scenario, store a dictionary if you want more info.
    const original = [...initialRow1, ...initialRow2].find(b => b.id === ballId);
    if (!original) return;

    setRow1((prev) => [...prev, { id: original.id, color: original.color }]);
  };

  return (
    <View style={styles.container}>
      {/* 
        TOP HALF 
        Just show topBalls in a row or however you like. 
        They are not draggable now, so we’ll use StaticBall for them. 
      */}
      <View style={styles.topHalf}>
        {topBalls.map((ball) => (
          <StaticBall
            key={ball.id}
            ball={ball}
            style={{ marginHorizontal: 8 }}
          />
        ))}
      </View>

      {/* 
        BOTTOM HALF 
        We'll have one horizontal row for row1
        and a vertical stack on the right side for row2
      */}
      <View style={styles.bottomHalf}>
        {/* Row1 horizontally */}
        <View
          style={styles.row1Container}
          onLayout={handleRow1ContainerLayout}
        >
          {row1.map((ball) => {
            return (
              <Animated.View
                key={ball.id}
                style={{ marginHorizontal: 5 }}
                layout={Layout.springify()}
              >
                {/* Draggable Ball */}
                <DraggableBall
                  ball={ball}
                  onDropAboveMidLine={handleDropAboveMidLine}
                />
              </Animated.View>
            );
          })}
        </View>

        {/* Row2 vertically (aligned to the right). 
            We'll position it absolutely or use a side container. 
            For example, let's create a vertical view on the right.
        */}
        <View style={styles.row2Container}>
          {row2.map((ball) => {
            return (
              <StaticBall
                key={ball.id}
                ball={ball}
                onLayout={(e) => handleRow2Layout(ball.id, e)}
                style={{ marginVertical: 5 }}
              />
            );
          })}
        </View>
      </View>

      {/* 
        Render any flying balls absolutely on top. 
        They animate from row2’s position to row1’s rightmost position. 
      */}
      {flyingBalls.map((fb) => {
        return (
          <FlyingBall
            key={`flying-${fb.id}`}
            id={fb.id}
            color={fb.color}
            startX={fb.startX}
            startY={fb.startY + SCREEN_HEIGHT / 2} 
            // ^ row2 is in bottom half, so offset Y by half the screen if needed 
            //   or measure precisely if row2 is truly at the bottom
            endX={fb.endX}
            endY={fb.endY + SCREEN_HEIGHT / 2} 
            // similarly offset
            onAnimationDone={onFlyingBallDone}
          />
        );
      })}
    </View>
  );
}

// ---------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------
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
    padding: 10,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  bottomHalf: {
    flex: 1,
    backgroundColor: '#ccc',
    flexDirection: 'row',
  },
  row1Container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginBottom: 20,
  },
  row2Container: {
    width: BALL_SIZE * 2, // A bit wider than the ball
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 20,
  },
  ball: {
    width: BALL_SIZE,
    height: BALL_SIZE,
    borderRadius: BALL_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ballText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
