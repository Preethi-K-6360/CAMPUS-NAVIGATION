function loginUser() {
  const type = document.getElementById("type").value;
  const data = { type };
  data.name = document.getElementById("name").value || "";
  if (type === "visitor") {
    data.phone = document.getElementById("phone").value || "";
  }
  if (type === "student") {
    data.usn = document.getElementById("usn").value || "";
    data.branch = document.getElementById("branch").value || "";
  }
  if (type === "faculty") {
    data.emp = document.getElementById("emp").value || "";
    data.branch = document.getElementById("branch").value || "";
  }
  // Save to localStorage (permanent)
  localStorage.setItem("user", JSON.stringify(data));

  // Set session (for current login)
  sessionStorage.setItem("logged_in", "yes");

  // Go to navigation map
  window.location.href = "index.html";
}
