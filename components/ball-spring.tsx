import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import styles from "@/styles/global";

const BallSpring = () => {
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
    })
    .onEnd((event) => {
      if (
        Math.abs(event.translationX) < 100 &&
        Math.abs(event.translationY) < 100
      ) {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
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
    <GestureDetector gesture={PanGesture}>
      <Animated.View style={[styles.ball, reanimatedStyle]} />
    </GestureDetector>
  );
};

export default BallSpring;
