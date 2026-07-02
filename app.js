/* ============================
   HIKMAH HUB — ЧИСТЫЙ APP.JS
   БЕЗ ИМПОРТА, БЕЗ КОНФЛИКТОВ
============================ */

// Инициализация Supabase
const supabaseUrl = "https://avldlzkjprmqxmbgbclm.supabase.co";
const supabaseKey = "sb_publishable_CQHNtBi_q4PhwAIMkJ-Rxw_DicNz5Yr";
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

console.log("✅ Supabase подключён");

/* ============================
   АВТОРИЗАЦИЯ
============================ */

// Регистрация
async function registerUser(email, password) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    return { data, error };
}

// Вход
async function loginUser(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });
    return { data, error };
}

// Выход
async function logoutUser() {
    await supabase.auth.signOut();
    window.location.href = "login.html";
}

// Получить текущего пользователя
async function getCurrentUser() {
    const { data } = await supabase.auth.getUser();
    return data.user;
}

/* ============================
   ЗАГРУЗКА ТЕМ (courses.html)
============================ */

async function loadCourses() {
    const container = document.getElementById("coursesList");
    if (!container) return;

    container.innerHTML = "<p>⏳ Загрузка тем...</p>";

    const { data, error } = await supabase
        .from("topics")
        .select("*")
        .order("title", { ascending: true });

    if (error) {
        container.innerHTML = `<p>❌ Ошибка: ${error.message}</p>`;
        return;
    }

    container.innerHTML = "";

    data.forEach(topic => {
        const card = document.createElement("a");
        card.href = `topic.html?category=${topic.id}`;
        card.className = "card link";
        card.innerHTML = `
            <h3>${topic.title}</h3>
            <p>${topic.description || ""}</p>
        `;
        container.appendChild(card);
    });
}

/* ============================
   ЗАГРУЗКА ОДНОЙ ТЕМЫ (topic.html)
============================ */

async function loadTopicPage() {
    const params = new URLSearchParams(window.location.search);
    const category = params.get("category");

    if (!category) return;

    // Загружаем тему
    const { data: topic, error: topicError } = await supabase
        .from("topics")
        .select("*")
        .eq("id", category)
        .single();

    if (topicError || !topic) {
        document.getElementById("topicTitle").textContent = "❌ Ошибка загрузки темы";
        return;
    }

    document.getElementById("topicTitle").textContent = topic.title;
    document.getElementById("topicDescription").textContent = topic.description || "";

    // Загружаем разделы
    loadSection("ayahs", "ayahList", category);
    loadSection("hadiths", "hadithList", category);
    loadSection("dua", "duaList", category);
    loadSection("tafsir", "tafsirList", category);
    loadSection("practical", "practicalList", category);

    loadRelatedTopics(category);
}

// Универсальная загрузка разделов
async function loadSection(table, elementId, category) {
    const container = document.getElementById(elementId);
    if (!container) return;

    const { data, error } = await supabase
        .from(table)
        .select("*")
        .eq("topic_id", category);

    if (error) {
        container.innerHTML = `<p>❌ Ошибка: ${error.message}</p>`;
        return;
    }

    container.innerHTML = "";

    if (!data || data.length === 0) {
        container.innerHTML = "<p>Нет данных</p>";
        return;
    }

    data.forEach(item => {
        const div = document.createElement("div");
        div.className = "block";
        div.innerHTML = `
            <h4>${item.title || ""}</h4>
            <p>${item.content || item.text || item.translation || ""}</p>
        `;
        container.appendChild(div);
    });
}

// Связанные темы
async function loadRelatedTopics(currentTopicId) {
    const container = document.getElementById("relatedTopics");
    if (!container) return;

    const { data, error } = await supabase
        .from("topics")
        .select("*")
        .neq("id", currentTopicId)
        .limit(6);

    if (error) {
        container.innerHTML = `<p>❌ Ошибка: ${error.message}</p>`;
        return;
    }

    container.innerHTML = "";

    data.forEach(topic => {
        const card = document.createElement("a");
        card.href = `topic.html?category=${topic.id}`;
        card.className = "card link";
        card.innerHTML = `
            <h3>${topic.title}</h3>
            <p>${topic.description}</p>
        `;
        container.appendChild(card);
    });
}

/* ============================
   КОНТАКТЫ (contact.html)
============================ */

async function sendMessage(email, message) {
    const { error } = await supabase
        .from("messages")
        .insert([{ email, message }]);

    return { error };
}
