import json
import os
import webbrowser

DB_FILE = "users.json"

# Load database if exists
if os.path.exists(DB_FILE):
    with open(DB_FILE, "r") as f:
        users = json.load(f)
else:
    users = {"students": {}, "faculty": {}}

def save_db():
    with open(DB_FILE, "w") as f:
        json.dump(users, f, indent=4)

def open_navigation_page():
    # OPEN YOUR FRONTEND PROJECT
    webbrowser.open("index.html")     # Opens your campus navigation UI

def main_menu():
    print("\n--- Welcome to BIET ---")
    print("1. Visitor")
    print("2. Student")
    print("3. Faculty")
    ch = input("Enter your choice: ")

    if ch == "1":
        visitor()
    elif ch == "2":
        student()
    elif ch == "3":
        faculty()
    else:
        print("Invalid choice")

def visitor():
    print("\n--- Visitor Login ---")
    name = input("Enter name: ")
    phone = input("Enter phone: ")
    print(f"\nWelcome {name}! (Visitor)")
    print("Visitor data stored temporarily.")
    open_navigation_page()

def student():
    print("\n--- Student Login ---")
    usn = input("Enter USN: ")

    if usn in users["students"]:
        u = users["students"][usn]
        print(f"\nWelcome back {u['name']} ({u['branch']})!")
    else:
        print("\nYou are not registered. Enter details:")
        name = input("Enter name: ")
        branch = input("Enter branch: ")
        users["students"][usn] = {"name": name, "branch": branch}
        save_db()
        print("\nRegistration completed.")

    open_navigation_page()

def faculty():
    print("\n--- Faculty Login ---")
    emp = input("Enter Employee ID: ")

    if emp in users["faculty"]:
        u = users["faculty"][emp]
        print(f"\nWelcome back {u['name']} ({u['branch']})!")
    else:
        print("\nYou are not registered. Enter details:")
        name = input("Enter name: ")
        branch = input("Enter branch: ")
        users["faculty"][emp] = {"name": name, "branch": branch}
        save_db()
        print("Registration completed.")

    open_navigation_page()

while True:
    main_menu()
    again = input("\nDo you want to login again? (yes/no): ").lower()
    if again != "yes":
        break

print("\nThank you for using BIET Login System!")
