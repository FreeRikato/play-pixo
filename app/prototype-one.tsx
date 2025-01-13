import { View } from "react-native";
import React from "react";
import styles from "@/styles/global";

export default function PrototypeOne() {
  return (
    <View style={styles.modalContainer}>
      <View style={styles.progress} />
      <View
        style={{
          flex: 1,
          justifyContent: "space-around"
        }}
      >
        <View
          style={{
            flexDirection: "row",
            gap: 75
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
            gap: 75
          }}
        >
          <View style={styles.ball} />
          <View style={styles.ball} />
          <View style={styles.ball} />
          <View style={styles.ball} />
        </View>
      </View>
    </View>
  );
}
