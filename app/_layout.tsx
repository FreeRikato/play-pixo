import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  return (
    <GestureHandlerRootView>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="prototype-one" options={{ presentation: "card" }} />
        <Stack.Screen name="prototype-two" options={{ presentation: "card" }} />
        <Stack.Screen
          name="prototype-three"
          options={{ presentation: "card" }}
        />
        <Stack.Screen
          name="prototype-four"
          options={{ presentation: "card" }}
        />
        <Stack.Screen
          name="prototype-five"
          options={{ presentation: "card" }}
        />
        <Stack.Screen name="prototype-six" options={{ presentation: "card" }} />
        <Stack.Screen
          name="prototype-seven"
          options={{ presentation: "card" }}
        />
        <Stack.Screen
          name="prototype-eight"
          options={{ presentation: "card" }}
        />
        <Stack.Screen
          name="prototype-nine"
          options={{ presentation: "card" }}
        />
        <Stack.Screen
          name="prototype-ten"
          options={{ presentation: "card" }}
        />
        <Stack.Screen
          name="prototype-eleven"
          options={{ presentation: "card" }}
        />
        <Stack.Screen
          name="prototype-twelve"
          options={{ presentation: "card" }}
        />
        <Stack.Screen
          name="prototype-final"
          options={{ presentation: "card" }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}
