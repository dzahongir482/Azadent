// Sticky Header + Изменение цвета при скролле
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

// Анимация появления блоков (Fade In)
const observerOptions = { threshold: 0.1 };
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

// Плавный скролл по якорям
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// 2. ИНИЦИАЛИЗАЦИЯ SUPABASE
const supabaseUrl = 'https://prlsmoumlgkqjwjqrlsn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBybHNtb3VtbGdrcWp3anFybHNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyNDk2MjgsImV4cCI6MjA5NTgyNTYyOH0.sGH6AQng3_e7fzgVTYcP3Ya_mgXrvJuNCzksPAYxU9Q';

const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true
    },
    global: {
        headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${supabaseAnonKey}`
        }
    }
});

console.log("Supabase успешно инициализирован!");

// 3. ОТПРАВКА ЗАЯВОК В БАЗУ ДАННЫХ (ОБЩАЯ ФУНКЦИЯ)

// Универсальная функция для добавления записи в Supabase с проверкой дубликатов
async function insertAppointment(nameData, phoneData) {
    try {
        const { data, error } = await supabaseClient
            .from('AzaDent')
            .insert([
                { 
                    name: nameData, 
                    phoneNumber: phoneData 
                }
            ]);

        // Если база вернула ошибку
        if (error) {
            // Проверяем, содержит ли код или текст ошибки намек на дубликат (код 23505 или текст duplicate)
            if (error.code === '23505' || error.message.toLowerCase().includes('duplicate')) {
                alert('Ваша заявка уже принята! Мы уже обрабатываем её и перезвоним вам в течение 10 минут.');
                return { success: false, isDuplicate: true };
            }
            throw error; // Если ошибка какая-то другая, пробрасываем её дальше
        }
        
        return { success: true };
    } catch (error) {
        console.error('Ошибка Supabase:', error.message);
        return { success: false, error: error.message };
    }
}

// Отправка обычной формы "Записаться на прием"
// Отправка обычной формы "Записаться на прием"
async function sendForm() {
    const nameInput = document.getElementById('name');
    const phoneInput = document.getElementById('phone');

    if (!nameInput || !phoneInput) return;

    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();

    if (!name || !phone) {
        alert('Пожалуйста, заполните ваше имя и номер телефона!');
        return;
    }

    const result = await insertAppointment(name, phone);

    if (result.success) {
        // Показываем попап успеха ТОЛЬКО если это новая уникальная заявка
        const popup = document.getElementById('popup');
        if (popup) popup.style.display = 'flex';
    } else if (result.isDuplicate) {
        // Если это дубликат, мы уже показали alert внутри insertAppointment, 
        // просто очищаем поля формы для порядка
        nameInput.value = '';
        phoneInput.value = '';
    } else {
        // Если произошла какая-то другая неизвестная ошибка
        alert('Не удалось отправить заявку: ' + result.error);
    }
}
window.sendForm = sendForm;

// Закрытие попапа успешной отправки
function closePopup() {
    const popup = document.getElementById('popup');
    if (popup) popup.style.display = 'none';
    
    if (document.getElementById('name')) document.getElementById('name').value = '';
    if (document.getElementById('phone')) document.getElementById('phone').value = '';
}
window.closePopup = closePopup;

// Интерактивная SVG-карта зубов
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

// Пошаговый Квиз (Калькулятор стоимости)
function nextStep(stepNumber) {
    document.querySelectorAll('.quiz-step').forEach(step => step.classList.remove('active'));
    const nextStepEl = document.getElementById(`step-${stepNumber}`);
    if (nextStepEl) nextStepEl.classList.add('active');
}
window.nextStep = nextStep;

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
window.calculateResult = calculateResult;

// Отправка заявки из Квиза
async function sendQuizLead() {
    const phoneEl = document.getElementById('quiz-phone');
    const resultEl = document.getElementById('calc-result');
    
    if (!phoneEl || !phoneEl.value) { 
        alert("Пожалуйста, введите номер телефона!"); 
        return; 
    }
    
    const phone = phoneEl.value;
    const totalCost = resultEl ? resultEl.innerText : "не определена";
    const quizName = `Квиз (Расчет: ${totalCost} ₽)`;
    
    const result = await insertAppointment(quizName, phone);

    if (result.success) {
        alert('Расчет успешно отправлен! Наш врач свяжется с вами.');
        phoneEl.value = '';
    } else {
        alert('Ошибка при отправке квиза: ' + result.error);
    }
}
window.sendQuizLead = sendQuizLead;

// Выезжающий прайс-лист (Шторка / Drawer)
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

// Логика входа админа с безопасным переключением экранов
async function loginAdmin(email, password) {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email, 
        password: password
    });

    if (error) {
        console.error('Ошибка входа:', error.message);
        alert('Ошибка: ' + error.message);
        return null;
    }

    console.log('Успешный вход!', data);
    
    const loginScreen = document.getElementById('login-screen');
    const dashboard = document.getElementById('dashboard');
    
    // Безопасное переключение: меняем стили, только если элементы реально есть в HTML
    if (loginScreen) loginScreen.style.display = 'none';
    if (dashboard) dashboard.style.display = 'block';
    
    // Сразу же запускаем загрузку данных из таблицы AzaDent
    loadLeads(); 
    
    return data;
}

// Привязка события к форме входа
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const emailInput = document.getElementById('admin-email')?.value || '';
        const passwordInput = document.getElementById('admin-password')?.value || ''; 
        
        if (!emailInput || !passwordInput) {
            alert('Пожалуйста, заполните все поля!');
            return;
        }
        
        console.log('Попытка входа для:', emailInput);
        await loginAdmin(emailInput, passwordInput);
    });
}

// Функция выхода из системы
async function logout() {
    const { error } = await supabaseClient.auth.signOut();
    if (error) {
        console.error('Ошибка при выходе:', error.message);
        return;
    }
    
    const loginScreen = document.getElementById('login-screen');
    const dashboard = document.getElementById('dashboard');
    
    if (loginScreen && dashboard) {
        dashboard.style.display = 'none';
        loginScreen.style.display = 'block';
        
        if (document.getElementById('admin-email')) document.getElementById('admin-email').value = '';
        if (document.getElementById('admin-password')) document.getElementById('admin-password').value = '';
    }
    console.log('Вы успешно вышли из системы');
}
window.logout = logout;

// Логика переключения глазка пароля
const togglePasswordBtn = document.getElementById('toggle-password');
const passwordField = document.getElementById('admin-password');

if (togglePasswordBtn && passwordField) {
    togglePasswordBtn.addEventListener('click', function () {
        const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordField.setAttribute('type', type);
        this.classList.toggle('active');
    });
}

// Загрузка сохраненных заявок в админку (версия без колонки Действие)
async function loadLeads() {
    const leadsBody = document.getElementById('leads-body');
    if (!leadsBody) return;

    // Показываем временный текст, пока данные грузятся
    leadsBody.innerHTML = '<tr><td colspan="3" style="text-align:center;">Загрузка данных...</td></tr>';

    // Запрашиваем данные из правильной таблицы AzaDent
    const { data: leads, error } = await supabaseClient
        .from('AzaDent') 
        .select('*')
        .order('created_at', { ascending: false }); // Сначала новые заявки

    if (error) {
        console.error('Ошибка загрузки заявок:', error.message);
        leadsBody.innerHTML = `<tr><td colspan="3" style="text-align:center; color: #991b1b;">Ошибка: ${error.message}</td></tr>`;
        return;
    }

    // Если в базе данных вообще нет строк
    if (!leads || leads.length === 0) {
        leadsBody.innerHTML = '<tr><td colspan="3" style="text-align:center; color: #6b7280;">Новых заявок пока нет</td></tr>';
        return;
    }

    // Очищаем таблицу перед выводом новых данных
    leadsBody.innerHTML = '';
    
    // Перебираем каждую заявку и создаем строку таблицы (ровно 3 колонки: Имя, Телефон, Статус)
    leads.forEach(lead => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${lead.name || 'Не указано'}</strong></td>
            <td>${lead.phoneNumber || 'Не указано'}</td>
            <td><span class="status-badge" style="background: rgba(16, 185, 129, 0.2); color: #10b981; padding: 4px 8px; border-radius: 4px; font-size: 12px;">Новая</span></td>
        `;
        leadsBody.appendChild(row);
    });
}
window.loadLeads = loadLeads;

// Автоматическая проверка при загрузке страницы admin.html
document.addEventListener('DOMContentLoaded', async () => {
    // Проверяем, находимся ли мы вообще на странице админки (есть ли там таблица)
    const leadsBody = document.getElementById('leads-body');
    if (!leadsBody) return; // Если это обычный индексный сайт, ничего не делаем

    console.log("Админка загружена, проверяем авторизацию...");

    // Спрашиваем у Supabase, залогинен ли админ прямо сейчас
    const { data: { session } } = await supabaseClient.auth.getSession();

    if (session) {
        console.log("Админ уже авторизован, принудительно загружаем заявки!");
        
        // На всякий случай переключаем экраны, если они есть
        const loginScreen = document.getElementById('login-screen');
        const dashboard = document.getElementById('dashboard');
        if (loginScreen) loginScreen.style.display = 'none';
        if (dashboard) dashboard.style.display = 'block';

        // Вызываем загрузку
        loadLeads();
    } else {
        console.log("Админ не авторизован, показываем форму входа.");
    }
});

// Функция для загрузки одного файла в бакет AzaDent_images------------------------------------------------------------------------------------------------------
// Вспомогательная функция отправки файла в бакет AzaDent_images
async function uploadToSupabaseStorage(file, folder) {
    if (!file) return null;
    const fileExt = file.name.split('.').pop();
    // Генерируем уникальное имя файла, чтобы ничего не перезаписать случайно
    const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { data, error } = await supabaseClient.storage
        .from('AzaDent_images')
        .upload(fileName, file);

    if (error) {
        console.error('Ошибка при загрузке картинки в Storage:', error.message);
        return null;
    }

    // Получаем прямую публичную ссылку на картинку
    const { data: { publicUrl } } = supabaseClient.storage
        .from('AzaDent_images')
        .getPublicUrl(fileName);

    return publicUrl;
}

// 1. Функция отправки кейса До/После за выбранного врача
async function handlePortfolioUpload() {
    const doctorId = document.getElementById('adm-portfolio-doctor').value;
    const description = document.getElementById('adm-work-desc').value.trim();
    const fileBefore = document.getElementById('adm-photo-before').files[0];
    const fileAfter = document.getElementById('adm-photo-after').files[0];

    if (!description || !fileBefore || !fileAfter) {
        alert('Пожалуйста, заполните описание и выберите обе фотографии (До и После)!');
        return;
    }

    // Загружаем файлы в папочку 'portfolio' внутри бакета
    const urlBefore = await uploadToSupabaseStorage(fileBefore, 'portfolio');
    const urlAfter = await uploadToSupabaseStorage(fileAfter, 'portfolio');

    if (!urlBefore || !urlAfter) {
        alert('Не удалось загрузить изображения.');
        return;
    }

    // Записываем данные в таблицу portfolio
    const { error } = await supabaseClient
        .from('portfolio')
        .insert([{ 
            doctor_id: doctorId, 
            description: description, 
            image_before_url: urlBefore, 
            image_after_url: urlAfter 
        }]);

    if (error) {
        alert('Ошибка при сохранении в базу: ' + error.message);
    } else {
        alert('Кейс «До/После» успешно опубликован!');
        document.getElementById('portfolio-upload-form').reset();
    }
}

// 2. Функция отправки отзыва за выбранного врача
async function handleReviewUpload() {
    const doctorId = document.getElementById('adm-review-doctor').value;
    const authorName = document.getElementById('adm-review-author').value.trim();
    const reviewText = document.getElementById('adm-review-text').value.trim();
    const fileReview = document.getElementById('adm-photo-review').files[0];

    if (!authorName) {
        alert('Пожалуйста, введите имя пациента!');
        return;
    }

    let urlReview = null;
    if (fileReview) {
        urlReview = await uploadToSupabaseStorage(fileReview, 'reviews');
    }

    // Записываем данные в таблицу reviews
    const { error } = await supabaseClient
        .from('reviews')
        .insert([{ 
            doctor_id: doctorId, 
            author_name: authorName, 
            review_text: reviewText || null, 
            review_image_url: urlReview 
        }]);

    if (error) {
        alert('Ошибка при сохранении отзыва: ' + error.message);
    } else {
        alert('Отзыв успешно опубликован!');
        document.getElementById('review-upload-form').reset();
    }
}

// Делаем функции глобальными, чтобы атрибуты onclick="..." их видели
window.handlePortfolioUpload = handlePortfolioUpload;
window.handleReviewUpload = handleReviewUpload;
//---------------------------------------------------------------------------------------------------------------------------------------------------------