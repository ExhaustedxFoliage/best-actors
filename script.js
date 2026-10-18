// Используем делегирование или вешаем событие после полной загрузки
document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("#feedback form") || document.querySelector("form");

    if (!form) {
        console.error("Форма не найдена!");
        return;
    }

    form.addEventListener("submit", function (event) {
        const nameInput = document.getElementById("name");
        const commentInput = document.getElementById("comment");
        const emailInput = document.getElementById("email");
        const movieInput = document.getElementById("movie");

        let isValid = true;

        // Проверяем поле Name
        if (nameInput.value.trim() === "") {
            isValid = false;
            nameInput.classList.add("is-invalid"); // Подсвечиваем красным (Bootstrap класс)
        } else {
            nameInput.classList.remove("is-invalid");
        }
        if (emailInput.value.trim() === "") {
            isValid = false;
            emailInput.classList.add("is-invalid");
        } else {
            emailInput.classList.remove("is-invalid");
        }
        if (commentInput.value.trim() === "") {
            isValid = false;
            commentInput.classList.add("is-invalid");
        } else {
            commentInput.classList.remove("is-invalid");
        }
        if (movieInput.value.trim() === "") {
            isValid = false;
            movieInput.classList.add("is-invalid");
        } else {
            movieInput.classList.remove("is-invalid");
        }
        if (!isValid) {
            event.preventDefault();
            console.log("Форма не прошла валидацию. Отправка отменена.");
        }
    });
});