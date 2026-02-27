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



function fetchTodos() {
  const token = localStorage.getItem("token");


  const personalList = document.getElementById("personalList");
  const professionalList = document.getElementById("professionalList");

  personalList.innerHTML = "";
  professionalList.innerHTML = "";

  fetch(`${API_URL}/todos`, {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(data => {
      console.log("data", data);
      if (!Array.isArray(data)) {
        console.log("Expected array but got ", data);
        return;
      }

      data.forEach(todo => {
        const li = document.createElement("li");


        li.innerHTML = `
        <div class="task-container">
            <div class="checkbox">
              <input type="checkbox" ${todo.completed ? 'checked' : ''} onchange="toggleComplete('${todo._id}', this.checked, this)">
              <div class="todo-info">
                  <strong style="${todo.completed}">${todo.title}</strong>
                  <p>${todo.description || ""} </p>
              </div>
              </div>
              <div class="todo-actions"></div>
            </div>`;


        const actionsDiv = li.querySelector(".todo-actions");

        const editBtn = document.createElement("button");

        editBtn.className = "edtBtn";
        editBtn.innerHTML = '<i class="material-icons">edit</i>';
        editBtn.onclick = () => editTodo(todo._id, todo.title, todo.description);

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "dltBtn";
        deleteBtn.innerHTML = '<i class="material-icons">delete</i>';
        deleteBtn.onclick = () => deleteTodo(todo._id);

        actionsDiv.appendChild(editBtn);
        actionsDiv.appendChild(deleteBtn);


        if (todo.type === "Professional") {
          professionalList.appendChild(li);
        } else {
          personalList.appendChild(li);
        }
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
async function toggleComplete(id, isChecked, checkbox) {
  const token = localStorage.getItem("token");

  const title = checkbox.parentElement.querySelector('strong');


  if (isChecked) {
    title.style.textDecoration = "line-through";
  } else {
    title.style.textDecoration = "none";
  }
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
  console.log("new title", newTitle);

  if (!newTitle) return;

  console.log("calling API");


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

