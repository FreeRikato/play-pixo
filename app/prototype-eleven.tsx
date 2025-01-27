import React, { useCallback } from 'react';
import { View, Dimensions, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  useAnimatedReaction,
} from 'react-native-reanimated';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

// Just for readability; adjust as needed:
const BALL_SIZE = 50;
const H_SPACING = 60; // horizontal spacing for the row
const V_SPACING = 60; // vertical spacing for the column

/**
 * We track each ball's "type" in a single sharedValue array: 'horizontal' | 'vertical' | 'top'
 *   - 'horizontal' means bottom row
 *   - 'vertical' means right column
 *   - 'top' means the ball has been dragged into the top half
 *
 * The first 5 items (indices 0..4) are initially horizontal.
 * The next 5 items (indices 5..9) are initially vertical.
 */
const INITIAL_TYPES = Array.from({ length: 10 }).map((_, i) =>
  i < 5 ? 'horizontal' : 'vertical'
);

/**
 * For each ball, we keep its center (x,y) in useSharedValue.
 * We also keep the "original" (x0,y0) used as the anchor for drag resets.
 */
const BallExample = () => {
  // Shared array storing the "type" of each ball:
  const ballTypes = useSharedValue<string[]>([...INITIAL_TYPES]);

  // For simpler handling, store x/y for each of the 10 balls in arrays:
  const xValues = Array.from({ length: 10 }).map(() => useSharedValue(0));
  const yValues = Array.from({ length: 10 }).map(() => useSharedValue(0));

  // We'll store each ball's "original" position in separate shared values,
  // so we can spring back if threshold not met.
  const xOriginal = Array.from({ length: 10 }).map(() => useSharedValue(0));
  const yOriginal = Array.from({ length: 10 }).map(() => useSharedValue(0));

  // We define the halfway threshold:
  const THRESHOLD_Y = SCREEN_HEIGHT / 2;

  /**
   * A helper that computes (x0,y0) for a ball based on its 'type' and
   * its index within that type.
   */
  const computeLayoutForTypeAndIndex = useCallback(
    (type: string, indexInType: number) => {
      'worklet';
      let posX = 0;
      let posY = 0;

      if (type === 'horizontal') {
        // We'll place them along the bottom row
        // e.g. y ~ SCREEN_HEIGHT - 80, x spaced by index
        posX = SCREEN_WIDTH / 3 + indexInType * H_SPACING;
        posY = 3 * SCREEN_HEIGHT / 4 ;
      } else if (type === 'vertical') {
        // We'll place them along the right column
        // topmost ball is indexInType=0 => closer to the top
        posX = 2*SCREEN_WIDTH/ 3 - 40 ;
        posY = 3 * SCREEN_HEIGHT / 4 + indexInType * V_SPACING + 60;
      } 

      return { posX, posY };
    },
    []
  );

  /**
   * Re-computes the layout for *all balls* whenever we change the ballTypes array.
   * We'll do this in a useAnimatedReaction so that it runs on the UI thread
   * whenever `ballTypes.value` changes. For each type, we find all indices
   * of that type and reassign x,y with a spring.
   */
  useAnimatedReaction(
    () => ballTypes.value,
    (currentTypes, previousTypes) => {
      // Group the ball indices by type:
      const horizontalIndices: number[] = [];
      const verticalIndices: number[] = [];
      const topIndices: number[] = [];

      currentTypes.forEach((t, i) => {
        if (t === 'horizontal') {
          horizontalIndices.push(i);
        } else if (t === 'vertical') {
          verticalIndices.push(i);
        } else {
          // top
          topIndices.push(i);
        }
      });

      // Now animate them to their new layout positions:
      horizontalIndices.forEach((ballIdx, subIdx) => {
        const { posX, posY } = computeLayoutForTypeAndIndex('horizontal', subIdx);
        // On mount (previousTypes is null), we directly assign:
        if (!previousTypes) {
          xValues[ballIdx].value = posX;
          yValues[ballIdx].value = posY;
        } else {
          xValues[ballIdx].value = withSpring(posX);
          yValues[ballIdx].value = withSpring(posY);
        }
        // Keep "original" in sync so we can snap back if we haven't fully crossed threshold next time:
        xOriginal[ballIdx].value = posX;
        yOriginal[ballIdx].value = posY;
      });

      verticalIndices.forEach((ballIdx, subIdx) => {
        const { posX, posY } = computeLayoutForTypeAndIndex('vertical', subIdx);
        // On mount (previousTypes is null), we directly assign:
        if (!previousTypes) {
          xValues[ballIdx].value = posX;
          yValues[ballIdx].value = posY;
        } else {
          xValues[ballIdx].value = withSpring(posX);
          yValues[ballIdx].value = withSpring(posY);
        }
        xOriginal[ballIdx].value = posX;
        yOriginal[ballIdx].value = posY;
      });

      // For 'top' ones, you could do a special layout or simply
      // do nothing so they stay where they were dropped. For safety:
      topIndices.forEach((ballIdx, subIdx) => {
        // If you want a "fixed row" for top items, you could do:
        // const { posX, posY } = computeLayoutForTypeAndIndex('top', subIdx);
        // xValues[ballIdx].value = withSpring(posX);
        // yValues[ballIdx].value = withSpring(posY);
        // xOriginal[ballIdx].value = posX;
        // yOriginal[ballIdx].value = posY;
        // But if we do nothing, the user-dragged position remains.
      });
    },
    [computeLayoutForTypeAndIndex]
  );

  /**
   * The reorder function (runs on JS thread), modifies ballTypes array:
   *  1. The ball dragged up becomes 'top'.
   *  2. The topmost vertical ball (if any) becomes 'horizontal'.
   */
  const reorderOnDragUp = useCallback((draggedIndex: number) => {
    // copy the old array
    const oldTypes = ballTypes.value.slice();
    // The dragged ball -> 'top'
    oldTypes[draggedIndex] = 'top';

    // find topmost vertical index:
    const verticalIndices = oldTypes
      .map((t, i) => (t === 'vertical' ? i : -1))
      .filter((i) => i >= 0);

    // If there is at least one vertical ball, make the topmost (lowest index) horizontal
    if (verticalIndices.length > 0) {
      const topVertIndex = verticalIndices[0];
      oldTypes[topVertIndex] = 'horizontal';
    }

    // assign new array to shared value
    ballTypes.value = oldTypes;
  }, []);

  /**
   * Build one gesture per ball, but note only horizontal balls are actually
   * draggable. We will conditionally enable the gesture if ball is 'horizontal'.
   */
  const buildGesture = (idx: number) => {
    return Gesture.Pan()
      .onStart(() => {
        // no-op: if we needed, we could store some initial offsets, etc.
      })
      .onUpdate((evt) => {
        // Only allow dragging if currently "horizontal"
        if (ballTypes.value[idx] === 'horizontal') {
          xValues[idx].value = evt.translationX + xOriginal[idx].value;
          yValues[idx].value = evt.translationY + yOriginal[idx].value;
        }
      })
      .onEnd((evt) => {
        if (ballTypes.value[idx] !== 'horizontal') {
          return;
        }
        // Check final position
        const finalY = evt.translationY + yOriginal[idx].value;
        if (finalY < THRESHOLD_Y) {
          // Crossed threshold -> reorder
          runOnJS(reorderOnDragUp)(idx);
        } else {
          // Snap back
          xValues[idx].value = withSpring(xOriginal[idx].value);
          yValues[idx].value = withSpring(yOriginal[idx].value);
        }
      });
  };

  /**
   * Render each ball as an Animated.View with absolute positioning.
   */
  const Ball = ({ index }: { index: number }) => {
    // Animated style
    const style = useAnimatedStyle(() => {
      return {
        position: 'absolute',
        width: BALL_SIZE,
        height: BALL_SIZE,
        borderRadius: BALL_SIZE / 2,
        backgroundColor: 'orange',
        transform: [
          { translateX: xValues[index].value - BALL_SIZE / 2 },
          { translateY: yValues[index].value - BALL_SIZE / 2 },
        ],
      };
    });

    // If the ball is horizontal, we attach a PanGesture; otherwise, we attach no gesture
    const gesture = buildGesture(index);
    const isGestureEnabled = Gesture.Simultaneous(gesture);

    return (
      <GestureDetector gesture={isGestureEnabled}>
        <Animated.View style={style} />
      </GestureDetector>
    );
  };

  /**
   * On mount, we want to place the balls in their initial positions:
   *   - first 5 are horizontal, next 5 are vertical
   * We do it once so that they have a valid "original" position.
   */
  React.useEffect(() => {
    // We can simply trigger the reaction manually by reassigning ballTypes to itself:
    // or directly place them:
    ballTypes.value = [...INITIAL_TYPES];
  }, []);

  return (
    <View style={styles.container}>
      {/* Render 10 balls */}
      {Array.from({ length: 10 }).map((_, i) => (
        <Ball key={i} index={i} />
      ))}
    </View>
  );
};

export default BallExample;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
});
