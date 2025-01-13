import { View } from "react-native";
import React from "react";
import styles from "@/styles/global";
import Ball from "@/components/ball";

export default function PrototypeThree() {
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
          <Ball />
          <Ball />
          <Ball />
          <Ball />
        </View>
      </View>
    </View>
  );
}
