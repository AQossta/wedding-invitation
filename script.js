const API_URL = "https://script.google.com/macros/s/AKfycbxryOpnGk2JPBga65sPg2gKQXlUC4pbDDgFv3KfzTHoRxM83bi2vx6NE9Qjn3TVYjc/exec";

// === 1. МУЗЫКА ===
const music = document.getElementById("bgMusic");
const musicBtn = document.getElementById("musicBtn");

musicBtn.addEventListener("click", () => {
    if (music.paused) {
        music.play();
        musicBtn.innerText = "⏸ Музыканы тоқтату";
    } else {
        music.pause();
        musicBtn.innerText = "▶ Музыканы қосу";
    }
});

// === 2. УПРАВЛЕНИЕ ПОЛЕМ СУПРУГА ===
document.querySelectorAll('input[name="status"]').forEach(radio => {
    radio.addEventListener("change", () => {
        const checkedRadio = document.querySelector('input[name="status"]:checked');
        const spouseBlock = document.getElementById("spouseBlock");
        
        // Показываем поле ввода только если выбрано "Жұбыммен келемін"
        if (checkedRadio && checkedRadio.id === "statusSpouse") {
            spouseBlock.style.display = "block";
        } else {
            spouseBlock.style.display = "none";
            document.getElementById("spouse").value = ""; // Очищаем поле при скрытии
        }
    });
});

// === ТАЙМЕР ОБРАТНОГО ОТСЧЕТА ===

const weddingDate = new Date("2026-08-15T19:00:00");

function updateTimer() {
    const now = new Date();
    const diff = weddingDate - now;

    if (diff <= 0) {
        document.getElementById("days").textContent = "00";
        document.getElementById("hours").textContent = "00";
        document.getElementById("minutes").textContent = "00";
        document.getElementById("seconds").textContent = "00";
        return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    document.getElementById("days").textContent =
        days < 10 ? "0" + days : days;

    document.getElementById("hours").textContent =
        hours < 10 ? "0" + hours : hours;

    document.getElementById("minutes").textContent =
        minutes < 10 ? "0" + minutes : minutes;

    document.getElementById("seconds").textContent =
        seconds < 10 ? "0" + seconds : seconds;
}

updateTimer();
setInterval(updateTimer, 1000);

// === 4. ОТПРАВКА ДАННЫХ В GOOGLE ТАБЛИЦУ (БЕЗ CORS ОШИБОК) ===
document.getElementById("guestForm").addEventListener("submit", async e => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const spouseName = document.getElementById("spouse").value.trim();
    const checkedValue = document.querySelector('input[name="status"]:checked').value;

    // Подготовка данных под формат существующего Google Apps Script
    let status = "no";
    let hasSpouse = "no";

    if (checkedValue === "yes") {
        status = "yes";
    } else if (checkedValue === "spouse") {
        status = "yes";
        hasSpouse = "yes";
    }

    const messageDiv = document.getElementById("message");
    messageDiv.innerText = "Жіберілуде...";
    messageDiv.style.color = "orange";

    // Блокируем кнопку на время отправки
    const submitBtn = e.target.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    try {
        // Используем режим no-cors, чтобы избежать блокировок браузера
        await fetch(API_URL, {
            method: "POST",
            mode: "no-cors", 
            body: JSON.stringify({
                name: name,
                status: status,
                hasSpouse: hasSpouse,
                spouseName: hasSpouse === "yes" ? spouseName : ""
            })
        });

        // В режиме no-cors ответ прочитать нельзя, сразу выводим успех
        messageDiv.innerText = "Рақмет! Жауабыңыз сақталды ❤️";
        messageDiv.style.color = "green";

        // Очистка формы
        e.target.reset();
        document.getElementById("spouseBlock").style.display = "none";

        // Обновляем список гостей через небольшую паузу
        setTimeout(loadGuests, 1200);
    } catch (err) {
        console.error("Ошибка при отправке:", err);
        messageDiv.innerText = "Қате пайда болды. Қайта байқап көріңіз.";
        messageDiv.style.color = "red";
    } finally {
        if (submitBtn) submitBtn.disabled = false;
    }
});

// === 5. ПОЛУЧЕНИЕ И ВЫВОД СПИСКА ГОСТЕЙ ===
function loadGuests() {
    fetch(API_URL)
        .then(res => res.json())
        .then(data => {
            const list = document.getElementById("guestList");
            if (!list) return;
            list.innerHTML = "";

            data.forEach(g => {
                if (g.status === "yes") {
                    const li = document.createElement("li");
                    li.style.margin = "8px 0";
                    
                    if (g.hasSpouse === "yes" && g.spouseName) {
                        li.innerHTML = `✓ <strong>${g.name}</strong> + <strong>${g.spouseName}</strong>`;
                    } else {
                        li.innerHTML = `✓ <strong>${g.name}</strong>`;
                    }
                    
                    list.appendChild(li);
                }
            });
        })
        .catch(err => console.error("Ошибка при получении списка гостей:", err));
}

// Запускаем загрузку списка при открытии сайта
loadGuests();