import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { AntDesign, Feather, MaterialIcons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { Lobster_400Regular } from "@expo-google-fonts/lobster";
import {
  Caveat_400Regular,
  Caveat_500Medium,
  Caveat_600SemiBold,
  Caveat_700Bold,
} from "@expo-google-fonts/caveat";
import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
} from "@expo-google-fonts/nunito";
import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabase("ToDoDB.db");

export default function App() {
  const [todoList, setTodoList] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isEdit, setIsEdit] = useState("");
  const [editText, setEditText] = useState("");
  const [add, setAdd] = useState(false);
  const [isSearch, setIsSearch] = useState(false);
  const [searchText, setSearchText] = useState("");

  const [fontsLoaded] = useFonts({
    Lobster_400Regular,
    Caveat_400Regular,
    Caveat_500Medium,
    Caveat_600SemiBold,
    Caveat_700Bold,
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });

  useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        "CREATE TABLE IF NOT EXISTS todos (id INTEGER PRIMARY KEY AUTOINCREMENT, task TEXT)",
        [],
        () => console.log("Table created successfully"),
        (error) =>
          console.log("Error occurred while creating the table: ", error)
      );
    });

    fetchTodos();
  }, []);

  const fetchTodos = () => {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM todos",
        [],
        (_, { rows }) => setTodoList(rows._array),
        (error) => console.log("Error occurred while fetching todos: ", error)
      );
    });
  };

  const addTodo = () => {
    if (inputText.length > 0) {
      db.transaction((tx) => {
        tx.executeSql(
          "INSERT INTO todos (task) VALUES (?)",
          [inputText],
          () => {
            console.log("Todo added successfully");
            setInputText("");
            fetchTodos();
            setAdd(false);
          },
          (error) => console.log("Error occurred while adding todo: ", error)
        );
      });
    }
  };

  const editTodo = (id) => {
    db.transaction((tx) => {
      tx.executeSql(
        "UPDATE todos SET task = ? WHERE id = ?",
        [editText, id],
        () => {
          console.log("Todo updated successfully");
          setIsEdit("");
          fetchTodos();
        },
        (error) => console.log("Error occurred while updating todo: ", error)
      );
    });
  };

  const deleteTodo = (id) => {
    db.transaction((tx) => {
      tx.executeSql(
        "DELETE FROM todos WHERE id = ?",
        [id],
        () => {
          console.log("Todo deleted successfully");
          fetchTodos();
        },
        (error) => console.log("Error occurred while deleting todo: ", error)
      );
    });
  };

  const search = (text) => {
    db.transaction((tx) => {
      tx.executeSql(
        `SELECT * FROM todos WHERE task LIKE '%${text}%'`,
        [],
        (_, { rows }) => setTodoList(rows._array),
        (error) => console.log("Error occurred while fetching todos: ", error)
      );
      setSearchText("");
    });
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.main}>
        <Text style={styles.header}>TODOs</Text>
        <View style={{ flexDirection: "row" }}>
          <Text
            style={{
              flex: 1,
              fontFamily: "Nunito_800ExtraBold",
              fontSize: 46,
              color: "#7C5295", //"#B491C8",
              paddingBottom: 5,
              paddingTop: 25,
            }}
          >
            Welcome
          </Text>
          <TouchableOpacity
            style={{
              justifyContent: "center",
              marginBottom: 35,
              marginRight: 12,
            }}
            onPress={() => {
              console.log("add");
              setAdd(!add);
              setIsSearch(false);
            }}
            disabled={add}
          >
            <AntDesign
              name="pluscircleo"
              size={24}
              color={add ? "#7C5295" : "#B491C8"}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              justifyContent: "center",
              marginBottom: 35,
            }}
            onPress={() => {
              console.log("search");
              setIsSearch(!isSearch);
              setAdd(false);
            }}
            disabled={isSearch}
          >
            <AntDesign
              name="search1"
              size={24}
              color={isSearch ? "#7C5295" : "#B491C8"}
            />
          </TouchableOpacity>
        </View>
        {add && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Enter task"
              cursorColor={"#7C5295"}
              placeholderTextColor={"#B491C8"}
              value={inputText}
              onChangeText={(text) => setInputText(text)}
            />
            <TouchableOpacity style={styles.button} onPress={addTodo}>
              <Text style={styles.buttonText}>Add Task</Text>
            </TouchableOpacity>
          </>
        )}
        {isSearch && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Search"
              cursorColor={"#7C5295"}
              placeholderTextColor={"#B491C8"}
              // value={inputText}
              onChangeText={(text) => setSearchText(text)}
            />
            <TouchableOpacity
              style={styles.button}
              onPress={() => search(searchText)}
            >
              <Text style={styles.buttonText}>Find ToDo</Text>
            </TouchableOpacity>
          </>
        )}
        <FlatList
          style={styles.list}
          data={todoList}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <LinearGradient
              colors={["#7C529540", "#B491C8"]}
              locations={[0.3602, 0.904]}
              style={styles.todoContainer}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "flex-end",
                }}
              >
                <TouchableOpacity
                  style={{
                    justifyContent: "center",
                    marginRight: 12,
                  }}
                  onPress={() => {
                    if (isEdit === item.id) {
                      editTodo(item.id);
                    } else {
                      setIsEdit(item.id);
                      setEditText(item.task);
                    }
                  }}
                >
                  <Feather
                    name={isEdit === item.id ? "check" : "edit-3"}
                    size={18}
                    color={"#7C5295"}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    justifyContent: "center",
                    marginRight: 12,
                  }}
                  onPress={() => deleteTodo(item.id)}
                >
                  <MaterialIcons
                    name={"delete-outline"}
                    size={20}
                    color={"#7C5295"}
                  />
                </TouchableOpacity>
              </View>
              <View
                style={{
                  paddingTop: 45,
                }}
              >
                {isEdit === item.id ? (
                  <TextInput
                    style={styles.editInput}
                    placeholder={"Update task"}
                    cursorColor={"#7C5295"}
                    value={editText}
                    onChangeText={(text) => {
                      setEditText(text);
                    }}
                  />
                ) : (
                  <Text style={styles.todoText}>{item.task}</Text>
                )}
              </View>
            </LinearGradient>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 35,
    backgroundColor: "#7C529535", //"#F5FCFF",
  },
  main: {
    flex: 1,
    paddingTop: 25,
    padding: 15,
  },
  header: {
    fontSize: 20,
    textAlign: "center",
    marginBottom: 5,
    color: "#7C5295",
    letterSpacing: 1.5,
    fontFamily: "Nunito_800ExtraBold",
  },
  input: {
    height: 45,
    borderColor: "#B491C8",
    color: "#7C5295",
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    fontFamily: "Nunito_800ExtraBold",
  },
  button: {
    backgroundColor: "#B491C880",
    paddingVertical: 10,
    borderRadius: 20,
  },
  buttonText: {
    color: "#7C5295",
    fontSize: 16,
    textAlign: "center",
    fontFamily: "Nunito_800ExtraBold",
  },
  list: {
    marginTop: 20,
  },
  todoContainer: {
    // flexDirection: "row",
    justifyContent: "space-between",
    // alignItems: "center",
    marginBottom: 10,
    backgroundColor: "#7C529520",
    paddingHorizontal: 15,
    // paddingTop: 10,
    paddingVertical: 10,
    borderRadius: 20,
  },
  todoText: {
    fontSize: 18,
    color: "#7C5295",
    paddingVertical: 10,
    fontFamily: "Nunito_800ExtraBold",
  },
  editInput: {
    height: 45,
    borderColor: "#B491C8",
    color: "#7C5295",
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    fontFamily: "Nunito_800ExtraBold",
  },
  editButton: {
    backgroundColor: "#1E90FF",
    padding: 5,
    borderRadius: 3,
    marginRight: 20,
  },
  deleteButton: {
    backgroundColor: "#FF0000",
    padding: 5,
    borderRadius: 3,
  },
  deleteButtonText: {
    color: "#FFF",
    fontSize: 12,
    textAlign: "center",
  },
});
