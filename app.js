const API_URL = "http://localhost:5000/api";

// 🔐 LOGIN
async function login() {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;
  console.log("enter email",email);
  console.log("enter password",password);
  console.log("checking email",document.getElementById("loginEmail"));


  try {
    const response = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: email,
        password: password
      })
    });

    const data = await response.json();
    console.log("LOGIN RESPONSE 👉", data);


     if (!response.ok) {
      document.getElementById("loginMsg").innerText = data.message;
      return;
    }

    // if (!response.ok) {
    //   document.getElementById("loginMsg").innerText = data.message;
    //   return;
    // }
    // console.log("data",data);

    // ✅ TOKEN SAVE
    localStorage.removeItem("token");
    localStorage.setItem("token", data.access_token);
    // console.log("TOKEN SAVED 👉", data.token);
    

    document.getElementById("loginMsg").innerText =
      "Login successful!";

    // Optional redirect
     window.location.href = "todo.html";

  } catch (error) {
    console.log("LOGIN ERROR 👉", error);
    document.getElementById("loginMsg").innerText =
      "Something went wrong";
  }
}




// 📝 REGISTER
function register() {
  const name = document.getElementById("regName").value;
  const email = document.getElementById("regEmail").value;
  const password = document.getElementById("regPassword").value;

  fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password })
  })
  .then(res => res.json())
  .then(data => {
    document.getElementById("registerMsg").innerText = data.message;
  });
}

// 📥 FETCH TODOS
function fetchTodos() {
  const token = localStorage.getItem("token");
  // console.log("token",token);


  fetch(`${API_URL}/todos`, {
    headers: { 
      Authorization: `Bearer ${token}`
     }
  })
  .then(res => res.json())
  .then(data => {
    const list = document.getElementById("todoList");
    list.innerHTML = "";

      // console.log("List",list);


    if (!Array.isArray(data)) {
  console.log("Expected array but got 👉", data);
  return;
}

    data.forEach(todo => {
      const li = document.createElement("li");
      li.innerText = todo.title;

      // ✅ TEXT
      // const text = document.createElement("span");
      // text.innerText = todo.title ;
      // span.setAttribute("data-id", todo._id);


    // ✅ EDIT BUTTON
      const editBtn = document.createElement("button");
      editBtn.innerText = "Edit";
      editBtn.onclick = () => editTodo(todo._id, todo.title);

    // ✅ DELETE BUTTON
      const deleteBtn = document.createElement("button");
      deleteBtn.innerText = "Delete";
      deleteBtn.onclick = () => deleteTodo(todo._id);


      //li.appendChild(text);
      li.appendChild(editBtn);
      li.appendChild(deleteBtn);

    list.appendChild(li);
    });
  }); 
}



// ➕ ADD TODO
function addTodo() {
  const token = localStorage.getItem("token");
  const title = document.getElementById("todoInput").value;
  console.log("title",title);

  fetch(`${API_URL}/todos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ title })
  })
  .then(() => {
    document.getElementById("todoInput").value = "";
    fetchTodos();
  });
}

// EDIT TODO

async function editTodo(id, oldTitle) {
  const token = localStorage.getItem("token");
  const newTitle = prompt("Edit todo", oldTitle);

  if (!newTitle) return;

  await fetch(`http://localhost:5000/api/todos/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ title: newTitle })
  });
  console.log("before calling  loadtodos");

  fetchTodos();
  // console.log("after calling  loadtodos");

  }

// // DELETE TODO
async function deleteTodo(id) {
  const token = localStorage.getItem("token");

  await fetch(`http://localhost:5000/api/todos/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  fetchTodos();

   
}

// 🚪 LOGOUT
function logout() {
  localStorage.removeItem("token");
  window.location.href = "login.html";
}

// 🔒 Protect todo page
if (window.location.pathname.includes("todo.html")) {
  if (!localStorage.getItem("token")) {
    window.location.href = "login.html";
  } else {
    fetchTodos();
  }
}

