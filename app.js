const API_URL = "http://localhost:5000/api";

//  LOGIN
async function login() {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;
  console.log("enter email", email);
  console.log("enter password", password);
  console.log("checking email", document.getElementById("loginEmail"));

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
    console.log("LOGIN RESPONSE ", data);

    if (!response.ok) {
      document.getElementById("loginMsg").innerText = data.message;
      return;
    }

    // TOKEN SAVE
    localStorage.removeItem("token");
    localStorage.setItem("token", data.access_token);

    document.getElementById("loginMsg").innerText =
      "Login successful!";

    // Optional redirect
    window.location.href = "todo.html";

  } catch (error) {
    console.log("LOGIN ERROR ", error);
    document.getElementById("loginMsg").innerText =
      "Something went wrong";
  }
}

//  REGISTER
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

// FETCH TODOS
function fetchTodos() {
  const token = localStorage.getItem("token");

  fetch(`${API_URL}/todos`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
    .then(res => res.json())
    .then(data => {
      const list = document.getElementById("todoList");
      list.innerHTML = "";

      if (!Array.isArray(data)) {
        console.log("Expected array but got ", data);
        return;
      }

      data.forEach(todo => {
        const li = document.createElement("li");
        li.innerText = todo.title;

        li.innerHTML = `
    <div class="todo-container">
        <input type="checkbox" ${todo.completed ? 'checked' : ''} onchange="toggleComplete('${todo._id}', this.checked)"></input>

        <div class="todo-info">
            <span class="type-badge">${todo.type}</span> 
            <strong>${todo.title}</strong>
            <p>${todo.description || ""}</p>
        </div>
    </div>
`;

        //  EDIT BUTTON
        const editBtn = document.createElement("button");
        editBtn.innerText = "Edit";
        editBtn.onclick = () => editTodo(todo._id, todo.title, todo.description);

        // DELETE BUTTON
        const deleteBtn = document.createElement("button");
        deleteBtn.innerText = "Delete";
        deleteBtn.onclick = () => deleteTodo(todo._id);
        li.appendChild(editBtn);
        li.appendChild(deleteBtn);
        list.appendChild(li);
      });
    });
}

// ADD TODO
function addTodo() {
  const token = localStorage.getItem("token");
  const title = document.getElementById("todoInput").value;
  console.log("title", title);
  const description = document.getElementById("descInput").value;
  const type = document.querySelector('input[name="todoType"]:checked').value;

  fetch(`${API_URL}/todos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ title, description, type })
  })
    .then(() => {
      document.getElementById("todoInput").value = "";
      document.getElementById("descInput").value = "";
      document.querySelector('input[name="todoType"]').value = "";
      fetchTodos();
    });
}
//Checkbox toggle function
async function toggleComplete(id, isChecked) {
  const token = localStorage.getItem("token");

  try {
    const response = await fetch(`${API_URL}/todos/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },

      body: JSON.stringify({ completed: isChecked })
    });

  } catch (error) {
    console.error("Network error:", error);
  }
}
// EDIT TODO

async function editTodo(id, oldTitle, oldDescription) {
  const token = localStorage.getItem("token");
  const newTitle = prompt("Edit todo", oldTitle);
  const newDescription = prompt("Edit todo", oldDescription);

  if (!newTitle) return;

  await fetch(`http://localhost:5000/api/todos/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      title: newTitle,
      description: newDescription
    })
  });

  fetchTodos();

}

// DELETE TODO
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

//  LOGOUT
function logout() {
  localStorage.removeItem("token");
  window.location.href = "login.html";
}

//  Protect todo page
if (window.location.pathname.includes("todo.html")) {
  if (!localStorage.getItem("token")) {
    window.location.href = "login.html";
  } else {
    fetchTodos();
  }
}

