// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAez2eOxOEILbwJfeZ69UaUjnfn4KD1yEQ",
  authDomain: "todo-app-a0639.firebaseapp.com",
  databaseURL: "https://todo-app-a0639.firebaseio.com",
  projectId: "todo-app-a0639",
  storageBucket: "todo-app-a0639.appspot.com",
  messagingSenderId: "944995734520",
  appId: "1:944995734520:web:5e33512d047ba0b6efbc0d",
  measurementId: "G-8KBY8Z54DR",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();

const auth = firebase.auth();
const rootRef = firebase.database().ref().child("users");
const itemsRootRef = firebase.database().ref().child("items");
let name = document.getElementById("user-name-input");
const signInButton = document.getElementById("signIn");
const haveAccountButton = document.getElementById("have-account");
const signUpButton = document.getElementById("signUp");
const signOutButton = document.getElementById("sign-out");
const loginScreenText = document.getElementById("login-screen-text");
const showPasswordToggle = document.getElementById("show-password");
const currentDateTextField = document.getElementById("current-date");

/*
  Managing User Data, sign-in, sign-out
*/

// Writing user data in database
function writeUserData(name, email) {
  firebase
    .database()
    .ref("users/" + name)
    .set({
      username: name,
      email: email,
    });
}

//Registering new user
function signUp() {
  writeUserData(name.value, email.value);
  const promise = auth.createUserWithEmailAndPassword(
    email.value,
    password.value
  );
  promise.catch((e) => console.log(e.message));
}

// Signing in user
function signIn() {
  let email = document.getElementById("email");
  const password = document.getElementById("password");

  const promise = auth.signInWithEmailAndPassword(email.value, password.value);
  promise.catch((e) => alert(e.message));
  clearFields();
}

// Logging out the user
function signOut() {
  auth.signOut();
  document.getElementById("user-logged-in").style.display = "none";
}

// User Authentication
auth.onAuthStateChanged((user) => {
  if (user) {
    let currentUser = firebase.auth().currentUser;
    let currentUserEmail = currentUser.email;

    // Getting User Data from Firebase
    rootRef.on("child_added", (snap) => {
      let dbUserName = snap.child("username").val();
      let dbEmail = snap.child("email").val();

      if (currentUserEmail == dbEmail) {
        document.getElementById("greet").innerText = `Welcome ${dbUserName}`;
        createNewElementsForEachTodo(currentUserEmail);
        itemsRootRef.on("child_added", (snap) => {
          let itemDescription = snap.child("description").val();
          let itemTitle = snap.child("title").val();
          let itemUser = snap.child("userid").val();
        });
      }
      // Hides the login screen once user is authenticated
      document.getElementById("login-screen").style.display = "none";

      // Take user to a different or home page
      document.getElementById("user-logged-in").style.display = "block";
    });

    // Shows input fields for publishing new todo
    document.getElementById("add-new-todo").addEventListener("click", () => {
      document.getElementById("new-todo-item").style.display = "block";
      let newTodoButton = document.getElementById("new-todo-title");
      newTodoButton.focus();
    });

    const publishNewTodo = document.getElementById("publish-new");
    // Posts new Todo
    publishNewTodo.addEventListener("click", () => {
      postNewTodo(currentUserEmail);
      document.getElementById("new-todo-item").style.display = "none";
    });
  } else {
    // In this case user is not signed in, changes the screen to log-in screen
    document.getElementById("login-screen").style.display = "block";
  }
});

/* 
  Sign in, Sign out and Have account buttons
*/

signUpButton.addEventListener("click", () => {
  signInButton.style.display = "none";
  haveAccountButton.style.display = "inline-block";
  document.getElementById("username").style.display = "block";

  if (email.value !== "" && password.value !== "") {
    signUp();
  } else {
  }
});

haveAccountButton.addEventListener("click", () => {
  signInButton.style.display = "inline-block";
  haveAccountButton.style.display = "none";
  document.getElementById("username").style.display = "none";
  clearFields();
});

signOutButton.addEventListener("click", () => {
  signOut();
  clearFields();
  window.location.reload();
});

/*
  Sidebar navigation 
*/

// Set the width of the side navigation to 250px
function openNav() {
  document.getElementById("mySidenav").style.width = "250px";
}

// Set the width of the side navigation to 0
function closeNav() {
  document.getElementById("mySidenav").style.width = "0";
}

/* 
  TO DO Operations (post, update, remove)
*/

// Creating new Todo item and pushing it to Firebase
function postNewTodo(currentUserEmail) {
  let newTodoTitle = document.getElementById("new-todo-title").value;
  let newTodoDescription = document.getElementById("new-todo-description")
    .value;

  if (newTodoDescription !== "" && newTodoTitle !== "") {
    let key = firebase.database().ref().child("items/").push().key;
    let todo = {
      title: newTodoTitle,
      description: newTodoDescription,
      userid: currentUserEmail,
      key: key,
    };

    let updates = {};
    updates["/items/" + key] = todo;
    firebase.database().ref().update(updates);
    location.reload(); // If page isn't reloaded, duplicate ToDo's will be shown
    createNewElementsForEachTodo(currentUserEmail);
  } else {
    return;
  }
}

// Creating elements for each todo item
function createNewElementsForEachTodo(currentUserEmail) {
  let childKey;
  let todoArray = [];
  firebase
    .database()
    .ref("items/")
    .once("value", (snapshot) => {
      snapshot.forEach((childSnapshot) => {
        childKey = childSnapshot.key;
        childVal = childSnapshot.val();

        if (childVal.userid === currentUserEmail) {
          todoArray.push(Object.values(childVal));
        }
      });

      for (let i = 0; i < todoArray.length; i++) {
        todoDescription = todoArray[i][0];
        todoKey = todoArray[i][1];
        todoTitle = todoArray[i][2];

        // TODO Data
        let parentDiv = document.createElement("div");
        parentDiv.setAttribute("class", "parentDiv");
        parentDiv.setAttribute("data-key", todoKey);

        todoData = document.createElement("div");
        todoData.setAttribute("id", "todo-data");

        title = document.createElement("p");
        title.setAttribute("id", "todo-title");
        title.setAttribute("contenteditable", false);
        title.innerHTML = todoTitle;

        description = document.createElement("p");
        description.setAttribute("id", "todo-description");
        description.setAttribute("contenteditable", false);
        description.innerHTML = todoDescription;

        // TODO Tools (edit and remove buttons / icons)
        todoTools = document.createElement("div");
        todoTools.setAttribute("id", "todo-tools");

        todoEditButton = document.createElement("button");
        todoEditButton.setAttribute("id", "todo-edit-button");
        todoEditButton.setAttribute(
          "onclick",
          "todoEdit(this.parentElement.parentElement, this)"
        );
        editIcon = document.createElement("i");
        editIcon.setAttribute("class", "fa fa-pencil");

        todoDeleteButton = document.createElement("button");
        todoDeleteButton.setAttribute("id", "todo-delete-button");
        todoDeleteButton.setAttribute(
          "onclick",
          "todoDelete(this.parentElement.parentElement)"
        );
        deleteIcon = document.createElement("i");
        deleteIcon.setAttribute("class", "fa fa-trash");

        let container = document.getElementById("container");
        container.appendChild(parentDiv);
        parentDiv.append(todoData);
        todoData.append(title);
        todoData.append(description);

        parentDiv.append(todoTools);
        todoTools.append(todoEditButton);
        todoEditButton.append(editIcon);
        todoTools.append(todoDeleteButton);
        todoDeleteButton.append(deleteIcon);
      }
    });
}

//Editing To Do
function todoEdit(todo, editButton) {
  editButton.setAttribute("id", "todo-edit-button-editing");
  editButton.setAttribute(
    "onclick",
    "finishEditing(this.parentElement.parentElement, this)"
  );

  title = todo.childNodes[0].childNodes[0];
  title.setAttribute("contenteditable", true);
  title.setAttribute("id", "title-editing");
  title.focus();

  description = todo.childNodes[0].childNodes[1];
  description.setAttribute("contenteditable", true);
  description.setAttribute("id", "description-editing");
}

// Applying changes once edit is finished
function finishEditing(todo, editButton) {
  editButton.setAttribute("id", "todo-edit-button");
  editButton.setAttribute(
    "onclick",
    "todoEdit(this.parentElement.parentElement, this)"
  );

  title = todo.childNodes[0].childNodes[0];
  title.setAttribute("contenteditable", false);
  title.setAttribute("id", "todo-title");

  description = todo.childNodes[0].childNodes[1];
  description.setAttribute("contenteditable", false);
  description.setAttribute("id", "todo-description");

  // Updates changed values to Firebase
  let key = todo.getAttribute("data-key");
  let todoObject = {
    title: todo.childNodes[0].childNodes[0].innerHTML,
    description: todo.childNodes[0].childNodes[1].innerHTML,
    key: key,
    userid: childVal.userid,
  };
  let updates = {};
  updates["/items/" + key] = todoObject;
  firebase.database().ref().update(updates);
}

// Deletes a To Do
function todoDelete(todo) {
  key = todo.getAttribute("data-key");
  ToDoToBeRemoved = firebase.database().ref("/items/" + key);
  ToDoToBeRemoved.remove();

  todo.remove(); // removes from html
}

/*
  Other functions that are not related to Firebase nor ToDo's 
*/

// Clears fields after changing screen from register to login and vice versa
function clearFields() {
  email.value = "";
  password.value = "";
  name.value = "";
}
// Show Password Toggle Button
function showPassword() {
  if (password.type === "password") {
    password.type = "text";
  } else {
    password.type = "password";
  }
}

showPasswordToggle.addEventListener("click", () => {
  showPassword();
});

// Date displayed when user is signed in
let date = new Date();
let day = date.getDate();
let monthName = date.toLocaleString("default", { month: "short" });

currentDateTextField.innerText = `${day} ${monthName}`;
