function loadForm() {
    const t = document.getElementById("type").value;
    let html = "";

    if (t === "visitor") {
        html = `
            <div class="input-group fade">
                <label>Name</label>
                <input id="name" placeholder="Enter your name">
            </div>
            <div class="input-group fade">
                <label>Phone Number</label>
                <input id="phone" placeholder="Enter phone number">
            </div>
        `;
    }

    else if (t === "student") {
        html = `
            <div class="input-group fade">
                <label>Name</label>
                <input id="name" placeholder="Enter your name">
            </div>
            <div class="input-group fade">
                <label>USN</label>
                <input id="usn" placeholder="Enter USN (e.g., 1BI21CS001)">
            </div>
            <div class="input-group fade">
                <label>Branch</label>
                <input id="branch" placeholder="CSE / ECE / MECH ...">
            </div>
        `;
    }

    else if (t === "faculty") {
        html = `
            <div class="input-group fade">
                <label>Name</label>
                <input id="name" placeholder="Enter your name">
            </div>
            <div class="input-group fade">
                <label>Employee ID</label>
                <input id="empid" placeholder="Enter Employee ID">
            </div>
            <div class="input-group fade">
                <label>Department</label>
                <input id="branch" placeholder="CSE / ECE / MECH ...">
            </div>
        `;
    }

    document.getElementById("form-area").innerHTML = html;
}

document.getElementById("type").addEventListener("change", loadForm);
loadForm();

function loginUser() {
    const type = document.getElementById("type").value;
    const form = document.getElementById("form-area");

    // Basic validation
    const inputs = form.querySelectorAll("input");
    for (let inp of inputs) {
        if (inp.value.trim() === "") {
            alert("Please fill out all fields.");
            return;
        }
    }

    // Save data
    let data = { type };

    inputs.forEach(inp => { data[inp.id] = inp.value; });

    // Visitor = temporary (session only)
    if (type === "visitor") {
        sessionStorage.setItem("user", JSON.stringify(data));
    }
    // Student & Faculty = permanent
    else {
        localStorage.setItem(data.usn || data.empid, JSON.stringify(data));
        sessionStorage.setItem("user", JSON.stringify(data));
    }

    // Redirect
    window.location.href = "index.html";
}
