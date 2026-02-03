import { apiGet, apiPost } from "../core/api.js";

const form = document.querySelector("#registerForm");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = form.name.value.trim();
    const email = form.email.value.trim().toLowerCase();
    const password = form.password.value;
    const password2 = form.password2.value;
    const role = "user";

    if (password !== password2){
        await Swal.fire("Error", "Contraseñas no coinciden", "error");
        return;
    }

    try {
        const existing = await apiGet(`/users?email=${encodeURIComponent(email)}`);
        if (existing.length > 0) {
            await Swal.fire("Error", "El email ya se encuentra registrado", "error");
            return;
        }

        await apiPost("/users", { name, email, password, password2, role });
        

        await Swal.fire("Success", "Cuenta creada con exito!", "success");
        window.location.href = "../index.html";
    } catch (err) {
        console.error(err);
        await Swal.fire("Error", "Error en el servidor, vuelve a intentarlo", "error");
    }
});
