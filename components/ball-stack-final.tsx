import React from 'react';
import { StyleSheet } from 'react-native';
import { Gesture, GestureDetector, PanGesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming
} from 'react-native-reanimated';

type Props = {
  id: string;
  color: string;
  insideStack: Animated.SharedValue<string[]>;
  lastIndices: Animated.SharedValue<Record<string, number>>;
  boxLayout: React.MutableRefObject<{ x: number; y: number; width: number; height: number }>;
};

export default function Ball({ id, color, insideStack, lastIndices, boxLayout }: Props) {
  // x/y for the ball’s center
  const translateX = useSharedValue(200);
  const translateY = useSharedValue(200);

  // Check if final drop is inside box
  const isInsideBox = (x: number, y: number) => {
    const b = boxLayout.current;
    return x >= b.x && x <= b.x + b.width && y >= b.y && y <= b.y + b.height;
  };

  // Helper to get Y position given stack index
  const snapToIndex = (index: number) => {
    'worklet';
    const b = boxLayout.current;
    const ballHeight = 50;
    const offset = 10; // margin from top inside the box
    const finalX = b.x + b.width / 2; // center horizontally
    const finalY = b.y + offset + index * ballHeight;
    translateX.value = withTiming(finalX);
    translateY.value = withTiming(finalY);
  };

  // Move ball outside (just place somewhere arbitrary)
  const moveOutside = () => {
    'worklet';
    translateX.value = withTiming(200);
    translateY.value = withTiming(500);
  };

  // Insert ball into the stack at index
  // Shifts everything below if needed
  const insertBall = (arr: string[], ballId: string, idx: number) => {
    const newArr = [...arr];
    newArr.splice(idx, 0, ballId);
    return newArr;
  };

  // Remove ball from stack
  const removeBall = (arr: string[], ballId: string) => {
    return arr.filter((item) => item !== ballId);
  };

  // On drag end
  const pan = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = e.translationX + e.x;
      translateY.value = e.translationY + e.y;
    })
    .onEnd((e) => {
      const finalX = e.translationX + e.x;
      const finalY = e.translationY + e.y;
      if (isInsideBox(finalX, finalY)) {
        // The ball is dropped inside
        // 1) remove from current stack if present
        let stack = removeBall(insideStack.value, id);
        // 2) see if it had a lastIndex
        const oldIndex = lastIndices.value[id] ?? -1;
        // if that old index is within 0..stack.length, 
        // we try to reinsert there. Otherwise we put it on top (index 0).
        let newIndex = oldIndex >= 0 && oldIndex <= stack.length ? oldIndex : 0;
        // Insert
        stack = insertBall(stack, id, newIndex);
        // Update shared values
        insideStack.value = stack;
        lastIndices.value[id] = newIndex;
        // Snap to its new position
        snapToIndex(newIndex);
        // Also fix up the lastIndices of all other balls in the stack
        // so they match their actual index
        stack.forEach((ballId, i) => {
          lastIndices.value[ballId] = i;
        });
      } else {
        // Dropped outside
        // remove from stack
        let stack = removeBall(insideStack.value, id);
        insideStack.value = stack;
        lastIndices.value[id] = -1;
        moveOutside();
        // shift everyone above the removed ball down an index
        stack.forEach((ballId, i) => {
          lastIndices.value[ballId] = i;
        });
      }
    });

  // Animate the style
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value - 25 }, // center the 50x50 ball
      { translateY: translateY.value - 25 },
    ]
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.ball, animatedStyle, { backgroundColor: color }]} />
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  ball: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
  },
});
