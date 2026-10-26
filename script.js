const noteForm = document.getElementById("noteForm");
const titleInput = document.getElementById("title");
const contentInput = document.getElementById("content");
const saveBtn = document.getElementById("saveBtn");
const statusMessage = document.getElementById("statusMessage");
const listMessage = document.getElementById("listMessage");
const notesList = document.getElementById("notesList");

// Fetch and display all saved notes
async function loadNotes() {
  listMessage.textContent = "Loading notes...";

  try {
    const response = await fetch("/api/notes");

    if (!response.ok) {
      throw new Error("Failed to load notes.");
    }

    const notes = await response.json();
    notesList.replaceChildren();

    if (notes.length === 0) {
      listMessage.textContent =
        "No notes found. Create your first note!";
      return;
    }

    listMessage.textContent = `${notes.length} note(s) saved.`;

    notes.forEach((note) => {
      const card = document.createElement("article");
      card.className = "note-card";

      const heading = document.createElement("h3");
      heading.textContent = note.title;

      const content = document.createElement("p");
      content.className = "note-content";
      content.textContent = note.content;

      const date = document.createElement("small");
      const createdAt = new Date(note.createdAt);

      date.textContent = `Created: ${
        Number.isNaN(createdAt.getTime())
          ? "Unknown date"
          : createdAt.toLocaleString()
      }`;

      card.append(heading, content, date);
      notesList.appendChild(card);
    });
  } catch (error) {
    listMessage.textContent = error.message;
    console.error("Loading notes error:", error);
  }
}

// Submit and save a new note
noteForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const title = titleInput.value.trim();
  const content = contentInput.value.trim();

  statusMessage.textContent = "";
  statusMessage.className = "";

  if (!title || !content) {
    statusMessage.textContent = "Please enter title and content.";
    statusMessage.className = "error";
    return;
  }

  saveBtn.disabled = true;
  saveBtn.textContent = "Saving...";

  try {
    const response = await fetch("/api/notes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ title, content })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to save note.");
    }

    statusMessage.textContent = result.message;
    statusMessage.className = "success";

    noteForm.reset();
    await loadNotes();
  } catch (error) {
    statusMessage.textContent = error.message;
    statusMessage.className = "error";
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = "Save Note";
  }
});

// Load notes when the page opens
loadNotes();
