import { View } from "react-native";
import React from "react";
import styles from "@/styles/global";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

export default function PrototypeTwo() {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const context = useSharedValue({ x: 0, y: 0 });

  const PanGesture = Gesture.Pan()
    .onStart(() => {
      context.value.x = translateX.value;
      context.value.y = translateY.value;
    })
    .onUpdate((event) => {
      const newX = event.translationX;
      const newY = event.translationY;

      translateX.value = newX + context.value.x;
      translateY.value = newY + context.value.y;
    });

  const reanimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
      ],
    };
  }, []);

  return (
    <View style={styles.modalContainer}>
      <View style={styles.progress} />
      <View
        style={{
          flex: 1,
          justifyContent: "space-around",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            gap: 75,
          }}
        >
          <View style={styles.emptyball} />
          <View style={styles.emptyball} />
          <View style={styles.emptyball} />
          <View style={styles.emptyball} />
        </View>
        <View
          style={{
            flexDirection: "row",
            gap: 75,
          }}
        >
          <GestureDetector gesture={PanGesture}>
            <Animated.View style={[styles.ball, reanimatedStyle]} />
          </GestureDetector>
          <GestureDetector gesture={PanGesture}>
            <Animated.View style={[styles.ball, reanimatedStyle]} />
          </GestureDetector>
          <GestureDetector gesture={PanGesture}>
            <Animated.View style={[styles.ball, reanimatedStyle]} />
          </GestureDetector>
          <GestureDetector gesture={PanGesture}>
            <Animated.View style={[styles.ball, reanimatedStyle]} />
          </GestureDetector>
        </View>
      </View>
    </View>
  );
}
