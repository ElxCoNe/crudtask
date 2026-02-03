import { apiGet, apiPost, apiPatch, apiDelete } from "../core/api.js";
import { clearSession } from "../core/storage.js";
import { requireRole } from "../core/guards.js";

requireRole("admin");

const btnLogout = document.querySelector("#btnLogout");
const btnCreateTask = document.querySelector("#btnCreateTask");
const taskTbody = document.querySelector("#taskTbody");

const modalEl = document.querySelector("#eventModal");
const modal = new bootstrap.Modal(modalEl);

const modalTitle = document.querySelector("#modalTitle");
const form = document.querySelector("#eventForm");
const formError = document.querySelector("#formError");

//MODAL INPUTS
const eventId = document.querySelector("#eventId");
const taskName = document.querySelector("#taskName");
const category = document.querySelector("#category");
const priority = document.querySelector("#priority");
const statusInput = document.querySelector("#statusInput");

btnLogout.addEventListener("click", () => {
    clearSession();
    window.location.href = "../index.html";
});



taskTbody.addEventListener("click", (e) => {
    const editBtn = e.target.closest("button[data-edit]");
    const deleteBtn = e.target.closest("button[data-delete]");

    if (editBtn) {
        const id = editBtn.dataset.edit;
        openEditModal(id);
    }

    if (deleteBtn) {
        const id = deleteBtn.dataset.delete;
        handleDelete(id);
    }
});

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    formError.textContent = "";

    const data = {
        name: taskName.value.trim(),
        category: category.value,
        priority: priority.value.trim(),
        status: statusInput.value.trim(),
    };


    try {
        if (eventId.value) {
            await apiPatch(`/tasks/${eventId.value}`, data);
            Swal.fire("OK", "Evento actualizado.", "success");
        } else {
            await apiPost("/tasks", data);
            Swal.fire("OK", "Evento creado.", "success");
        }

        modal.hide();
        await loadTasks();
    } catch (err) {
        console.error(err);
        Swal.fire("Error", "Server error.", "error");
    }
});


async function openEditModal(id) {
    try {
        const ev = await apiGet(`/tasks/${id}`);

        modalTitle.textContent = "Edit task";
        eventId.value = ev.id;
        taskName.value = ev.name;
        category.value = ev.category;
        priority.value = ev.priority;
        statusInput.value = ev.status;

        formError.textContent = "";
        modal.show();
    } catch (err) {
        console.error(err);
        Swal.fire("Error", "Could not load event.", "error");
    }
}

async function handleDelete(id) {
    const result = await Swal.fire({
        title: "¿Eliminar evento?",
        text: "Esta acción no se puede deshacer.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar"
    });

    if (!result.isConfirmed) return;

    try {
        await apiDelete(`/tasks/${id}`);
        Swal.fire("OK", "Evento eliminado.", "success");
        await loadTasks();
    } catch (err) {
        console.error(err);
        Swal.fire("Error", "No se puede eliminar el evento, contacte con su administrador", "error");
    }
}

async function loadTasks() {
    try {
        const tasks = await apiGet("/tasks");
        renderTasks(tasks);
    } catch (err) {
        console.error(err);
        Swal.fire("Error", "No se pudieron cargar eventos, contacte son el administrador", "error");
    }
}

function renderTasks(tasks) {
    if (!tasks.length) {
        taskTbodyTbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-muted">No se encontraron eventos</td>
            </tr>
        `;
        return;
    }

    taskTbody.innerHTML = tasks
        .map((ev) => `
            <tr>
                <td>${ev.name}</td>
                <td>${ev.category}</td>
                <td>${ev.priority}</td>
                <td class="text-truncate" style="max-width: 260px;">
                    ${ev.status}
                </td>
                <td class="text-end">
                    <button class="btn btn-sm btn-warning" data-edit="${ev.id}">Edit</button>
                    <button class="btn btn-sm btn-danger" data-delete="${ev.id}">Delete</button>
                </td>
            </tr>
        `)
        .join("");
}

loadTasks();



