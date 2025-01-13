import Animated, {
  useSharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import styles from "@/styles/global";

const Ball = () => {
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
    <GestureDetector gesture={PanGesture}>
      <Animated.View style={[styles.ball, reanimatedStyle]} />
    </GestureDetector>
  );
};

export default Ball;
