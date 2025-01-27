import { Text, View, TouchableOpacity } from "react-native";
import { Link } from "expo-router";
import styles from "@/styles/global";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 10,
      }}
    >
      <View style={{ flexDirection: "row", gap: 10 }}>
        <View style={{ flexDirection: "column", gap: 10 }}>
          <Link href={"/prototype-one"} asChild>
            <TouchableOpacity>
              <Text style={styles.indexText}>Prototype 1</Text>
            </TouchableOpacity>
          </Link>
          <Link href={"/prototype-two"} asChild>
            <TouchableOpacity>
              <Text style={styles.indexText}>Prototype 2</Text>
            </TouchableOpacity>
          </Link>
          <Link href={"/prototype-three"} asChild>
            <TouchableOpacity>
              <Text style={styles.indexText}>Prototype 3</Text>
            </TouchableOpacity>
          </Link>
          <Link href={"/prototype-four"} asChild>
            <TouchableOpacity>
              <Text style={styles.indexText}>Prototype 4</Text>
            </TouchableOpacity>
          </Link>
          <Link href={"/prototype-five"} asChild>
            <TouchableOpacity>
              <Text style={styles.indexText}>Prototype 5</Text>
            </TouchableOpacity>
          </Link>
          <Link href={"/prototype-six"} asChild>
            <TouchableOpacity>
              <Text style={styles.indexText}>Prototype 6</Text>
            </TouchableOpacity>
          </Link>
        </View>
        <View style={{ flexDirection: "column", gap: 10 }}>
          <Link href={"/prototype-seven"} asChild>
            <TouchableOpacity>
              <Text style={styles.indexText}>Prototype 7</Text>
            </TouchableOpacity>
          </Link>
          <Link href={"/prototype-eight"} asChild>
            <TouchableOpacity>
              <Text style={styles.indexText}>Prototype 8</Text>
            </TouchableOpacity>
          </Link>
          <Link href={"/prototype-nine"} asChild>
            <TouchableOpacity>
              <Text style={styles.indexText}>Prototype 9</Text>
            </TouchableOpacity>
          </Link>
          <Link href={"/prototype-ten"} asChild>
            <TouchableOpacity>
              <Text style={styles.indexText}>Prototype 10</Text>
            </TouchableOpacity>
          </Link>
          <Link href={"/prototype-eleven"} asChild>
            <TouchableOpacity>
              <Text style={styles.indexText}>Prototype 11</Text>
            </TouchableOpacity>
          </Link>
          <Link href={"/prototype-twelve"} asChild>
            <TouchableOpacity>
              <Text style={styles.indexText}>Prototype 12</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
      <Link href={"/prototype-final"} asChild>
        <TouchableOpacity>
          <Text style={styles.indexText}>Prototype Final</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}
