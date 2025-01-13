import { View } from "react-native";
import React from "react";
import styles from "@/styles/global";
import BallSpring from "@/components/ball-spring";

export default function PrototypeFour() {
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
            <BallSpring/>
            <BallSpring/>
            <BallSpring/>
            <BallSpring/>
        </View>
      </View>
    </View>
  );
}
