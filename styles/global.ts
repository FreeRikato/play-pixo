import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  indexText: {
    fontSize: 25,
  },
  modalContainer: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
    margin: 5,
  },
  progress: {
    height: 30,
    width: 300,
    borderRadius: 100,
    backgroundColor: "green",
  },
  ball: {
    height: 50,
    aspectRatio: 1,
    borderRadius: 25,
    backgroundColor: "red",
  },
  emptyball: {
    height: 50,
    aspectRatio: 1,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "black",
  },
});

export default styles;
