//--------------------------------------------------------------------------------------------------------------------------------------------------------------------------//

//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------//
// 1. Sticky Header + Изменение цвета при скролле
window.addEventListener('scroll', () => {
    const header = document.getElementById('header');
    if (header) {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }
});

// 2. Анимация появления блоков (Fade In)
const observerOptions = { threshold: 0.1 };
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

// 3. Плавный скролл по якорям
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// 4. Функция отправки заявки на сервер Beget
async function sendLead(name, phone) {
    try {
        const response = await fetch('save_lead.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: name, phone: phone }),
        });

        const result = await response.json();

        if (result.status === 'success') {
            const popup = document.getElementById('popup');
            if (popup) popup.style.display = 'flex';
        } else {
            console.error('Ошибка базы данных:', result.message);
            alert('Что-то пошло не так при отправке.');
        }
    } catch (error) {
        console.error('Ошибка соединения:', error);
    }
}

// Закрытие попапа успешной отправки
function closePopup() {
    const popup = document.getElementById('popup');
    if (popup) popup.style.display = 'none';
    
    if (document.getElementById('name')) document.getElementById('name').value = '';
    if (document.getElementById('phone')) document.getElementById('phone').value = '';
}

// 5. Интерактивная SVG-карта зубов
const dentalZones = {
    front: {
        title: "Зона улыбки (Передние зубы)",
        services: [
            { name: "Керамические виниры E-max", price: "от 25 000 ₽" },
            { name: "Отбеливание Zoom 4", price: "15 000 ₽" },
            { name: "Художественная реставрация", price: "от 8 000 ₽" }
        ]
    },
    molars: {
        title: "Жевательный отдел (Коренные)",
        services: [
            { name: "Имплантация под ключ (Osstem)", price: "45 000 ₽" },
            { name: "Лечение глубокого кариеса", price: "от 4 500 ₽" },
            { name: "Коронка из диоксида циркония", price: "18 000 ₽" }
        ]
    },
    gums: {
        title: "Лечение и здоровье десен",
        services: [
            { name: "Комплексная гигиена AirFlow", price: "4 500 ₽" },
            { name: "Вектор-терапия десен", price: "от 9 000 ₽" },
            { name: "Противовоспалительная терапия", price: "3 000 ₽" }
        ]
    }
};

document.querySelectorAll('.tooth-group').forEach(group => {
    group.addEventListener('click', function() {
        const zone = this.getAttribute('data-zone');
        
        document.querySelectorAll('.tooth-group').forEach(g => g.classList.remove('active'));
        document.querySelectorAll(`.tooth-group[data-zone="${zone}"]`).forEach(g => g.classList.add('active'));

        const data = dentalZones[zone];
        const detailsContainer = document.getElementById('zone-details');
        if (data && detailsContainer) {
            let html = `<h3>${data.title}</h3><ul class="services-list">`;
            data.services.forEach(item => {
                html += `<li><span>${item.name}</span> <span>${item.price}</span></li>`;
            });
            html += `</ul>`;
            detailsContainer.innerHTML = html;
        }
    });
});

// 6. Пошаговый Квиз (Калькулятор стоимости)
function nextStep(stepNumber) {
    document.querySelectorAll('.quiz-step').forEach(step => step.classList.remove('active'));
    const nextStepEl = document.getElementById(`step-${stepNumber}`);
    if (nextStepEl) nextStepEl.classList.add('active');
}

function calculateResult() {
    const problem = document.querySelector('input[name="problem"]:checked');
    const material = document.querySelector('input[name="material"]:checked');

    if (!problem || !material) {
        alert("Пожалуйста, выберите варианты в обоих шагах!");
        return;
    }

    const total = parseInt(problem.dataset.price) + parseInt(material.dataset.price);
    const resultEl = document.getElementById('calc-result');
    if (resultEl) {
        resultEl.innerText = total.toLocaleString('ru-RU');
    }
    nextStep(3);
}

function sendQuizLead() {
    const phoneEl = document.getElementById('quiz-phone');
    const resultEl = document.getElementById('calc-result');
    
    if (!phoneEl || !phoneEl.value) { 
        alert("Пожалуйста, введите номер телефона!"); 
        return; 
    }
    
    const phone = phoneEl.value;
    const totalCost = resultEl ? resultEl.innerText : "не определена";
    
    // Передаем в качестве имени детализацию расчета, чтобы ты видел её в админке
    sendLead(`Квиз (Расчет: ${totalCost} ₽)`, phone);
}

// 7. Выезжающий прайс-лист (Шторка / Drawer)
const priceBtn = document.getElementById('price-toggle-btn');
const closeBtn = document.getElementById('close-drawer-btn');
const drawer = document.getElementById('price-drawer');
const overlay = document.getElementById('drawer-overlay');

function toggleDrawer() {
    if (!drawer || !overlay || !priceBtn) return;

    drawer.classList.toggle('open');
    overlay.classList.toggle('show');
    
    if (drawer.classList.contains('open')) {
        priceBtn.textContent = 'Скрыть прайс-лист';
        priceBtn.classList.add('hide-mode');
    } else {
        priceBtn.textContent = 'Показать весь прайс (Ещё)';
        priceBtn.classList.remove('hide-mode');
    }
}

if (priceBtn) priceBtn.addEventListener('click', toggleDrawer);
if (closeBtn) closeBtn.addEventListener('click', toggleDrawer);
if (overlay) overlay.addEventListener('click', toggleDrawer);


// // 8. Защищенный блок Администратора

// Безопасное получение ключей для любого способа сборки
const supabaseUrl = 'https://prlsmoumlgkqjwjqrlsn.supabase.co';
const supabaseAnonKey = 'sb_publishable_KaWXXb56-wn3nHyZLLMDAg_Bh6Ys1X1'; 

// Создаем клиент через глобальный объект окна
export const supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey);

console.log("Supabase успешно инициализирован!");
// --- ИСПРАВЛЕННЫЙ БЛОК АВТОРИЗАЦИИ ---

// 1. Создаем функцию для входа
async function loginAdmin(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
    })

    if (error) {
        console.error('Ошибка входа:', error.message)
        alert('Ошибка: ' + error.message)
        return null
    }

    console.log('Успешный вход!', data)
    return data
}

// 2. Привязываем эту функцию к форме в админке
const loginForm = document.getElementById('login-form')
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault() // Отменяем перезагрузку страницы

        const email = document.getElementById('admin-email').value
        const password = document.getElementById('admin-password').value

        // Теперь вызываем нашу асинхронную функцию
        await loginAdmin(email, password)
    })
}