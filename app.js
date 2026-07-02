/* ============================
   HIKMAH HUB — APP.JS
   Главная логика Supabase
============================ */

// Инициализация Supabase
const supabaseUrl = "https://avldlzkjprmqxmbgbclm.supabase.co";
const supabaseKey = "sb_publishable_CQHNtBi_q4PhwAIMkJ-Rxw_DicNz5Yr";
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

console.log("✅ Supabase инициализирован", { supabaseUrl });

/* ============================
   АВТОРИЗАЦИЯ
============================ */

// Регистрация
async function registerUser(email, password) {
    try {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) {
            console.error("❌ Ошибка регистрации:", error);
            return { error };
        }
        console.log("✅ Пользователь зарегистрирован");
        return { data };
    } catch (err) {
        console.error("❌ Критическая ошибка регистрации:", err);
        return { error: err };
    }
}

// Вход
async function loginUser(email, password) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        if (error) {
            console.error("❌ Ошибка входа:", error);
            return { error };
        }
        console.log("✅ Пользователь вошел");
        return { data };
    } catch (err) {
        console.error("❌ Критическая ошибка входа:", err);
        return { error: err };
    }
}

// Выход
async function logoutUser() {
    try {
        await supabase.auth.signOut();
        console.log("✅ Пользователь вышел");
        window.location.href = "login.html";
    } catch (err) {
        console.error("❌ Ошибка выхода:", err);
    }
}

// Получить текущего пользователя
async function getCurrentUser() {
    try {
        const { data } = await supabase.auth.getUser();
        return data.user;
    } catch (err) {
        console.error("❌ Ошибка получения пользователя:", err);
        return null;
    }
}

/* ============================
   ЗАГРУЗКА ТЕМ (courses.html)
============================ */

async function loadCourses() {
    const container = document.getElementById("coursesList");
    if (!container) return;

    try {
        console.log("📥 Загрузка тем из Supabase...");
        
        const { data, error } = await supabase
            .from("topics")
            .select("*")
            .order("title", { ascending: true });

        if (error) {
            console.error("❌ Ошибка Supabase при загрузке тем:", error);
            container.innerHTML = `<p>❌ Ошибка загрузки: ${error.message}</p>`;
            return;
        }

        if (!data || data.length === 0) {
            console.warn("⚠️ Нет тем в базе данных Supabase");
            container.innerHTML = "<p>⚠️ Нет тем в базе данных</p>";
            return;
        }

        console.log(`✅ Загружено ${data.length} тем`);
        container.innerHTML = "";

        data.forEach(topic => {
            const card = document.createElement("a");
            card.href = `topic.html?category=${topic.id}`;
            card.className = "card link";
            card.innerHTML = `
                <h3>${topic.title || "Без названия"}</h3>
                <p>${topic.description || "Нет описания"}</p>
            `;
            container.appendChild(card);
        });

    } catch (err) {
        console.error("❌ Критическая ошибка при загрузке тем:", err);
        container.innerHTML = `<p>❌ Критическая ошибка: ${err.message}</p>`;
    }
}

/* ============================
   ЗАГРУЗКА ОДНОЙ ТЕМЫ (topic.html)
============================ */

async function loadTopicPage() {
    const params = new URLSearchParams(window.location.search);
    const category = params.get("category");

    if (!category) {
        console.warn("⚠️ Не найден параметр категории");
        return;
    }

    try {
        console.log(`📥 Загрузка темы: ${category}`);

        // Загружаем тему
        const { data: topic, error: topicError } = await supabase
            .from("topics")
            .select("*")
            .eq("id", category)
            .single();

        if (topicError) {
            console.error("❌ Ошибка загрузки темы:", topicError);
            if (document.getElementById("topicTitle")) {
                document.getElementById("topicTitle").textContent = "❌ Ошибка загрузки";
            }
            return;
        }

        if (!topic) {
            console.warn("⚠️ Тема не найдена:", category);
            if (document.getElementById("topicTitle")) {
                document.getElementById("topicTitle").textContent = "❌ Тема не найдена";
            }
            return;
        }

        console.log("✅ Тема загружена:", topic);

        if (document.getElementById("topicTitle")) {
            document.getElementById("topicTitle").textContent = topic.title;
        }
        if (document.getElementById("topicDescription")) {
            document.getElementById("topicDescription").textContent = topic.description;
        }

        // Загружаем материалы
        loadSection("ayahs", "ayahList", category);
        loadSection("hadiths", "hadithList", category);
        loadSection("dua", "duaList", category);
        loadSection("tafsir", "tafsirList", category);
        loadSection("practical", "practicalList", category);

        loadRelatedTopics(category);

    } catch (err) {
        console.error("❌ Критическая ошибка при загрузке страницы темы:", err);
        if (document.getElementById("topicTitle")) {
            document.getElementById("topicTitle").textContent = "❌ Критическая ошибка";
        }
    }
}

// Универсальная загрузка разделов
async function loadSection(table, elementId, category) {
    const container = document.getElementById(elementId);
    if (!container) return;

    try {
        const { data, error } = await supabase
            .from(table)
            .select("*")
            .eq("topic_id", category);

        if (error) {
            console.error(`❌ Ошибка загрузки ${table}:`, error);
            return;
        }

        console.log(`✅ ${table}: загружено ${data?.length || 0} элементов`);

        container.innerHTML = "";
        
        if (!data || data.length === 0) {
            container.innerHTML = `<p>Нет содержимого для этого раздела</p>`;
            return;
        }

        data.forEach(item => {
            const div = document.createElement("div");
            div.className = "item";
            div.innerHTML = `
                <h4>${item.title || "Без названия"}</h4>
                <p>${item.content || item.text || "Нет содержимого"}</p>
            `;
            container.appendChild(div);
        });

    } catch (err) {
        console.error(`❌ Критическая ошибка загрузки ${table}:`, err);
    }
}

// Загружаем связанные темы
async function loadRelatedTopics(currentTopicId) {
    const container = document.getElementById("relatedTopics");
    if (!container) return;

    try {
        const { data, error } = await supabase
            .from("topics")
            .select("*")
            .neq("id", currentTopicId)
            .limit(5);

        if (error) {
            console.error("❌ Ошибка загрузки связанных тем:", error);
            return;
        }

        console.log(`✅ Загружено ${data?.length || 0} связанных тем`);

        if (!data || data.length === 0) return;

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

    } catch (err) {
        console.error("❌ Критическая ошибка при загрузке связанных тем:", err);
    }
}

/* ============================
   ИНИЦИАЛИЗАЦИЯ
============================ */

document.addEventListener("DOMContentLoaded", () => {
    console.log("🚀 Страница загружена");
    
    // Загружаем тему, если находимся на page topic.html
    if (window.location.pathname.includes("topic.html")) {
        loadTopicPage();
    async function autoImportAyahs() {
    // Проверяем, есть ли аяты в базе
    const { data: existingAyahs, error: checkError } = await supabase
        .from("ayahs")
        .select("id")
        .limit(1);

    if (checkError) {
        console.error("Ошибка проверки таблицы:", checkError);
        return;
    }

    // Если таблица НЕ пустая — выходим
    if (existingAyahs && existingAyahs.length > 0) {
        console.log("Аяты уже загружены — импорт не требуется.");
        return;
    }

    console.log("Начинаю автоматический импорт всех аятов...");

    // Загружаем Коран из API
    const response = await fetch("https://api.alquran.cloud/v1/quran/ar.alafasy");
    const quran = await response.json();

    // Импортируем аяты по суре
    for (const surah of quran.data.surahs) {
        for (const ayah of surah.ayahs) {
            const { error: insertError } = await supabase
                .from("ayahs")
                .insert({
                    surah: surah.number,
                    ayah: ayah.numberInSurah,
                    arabic: ayah.text,
                    translation: null,
                    transcription: null,
                    audio_url: ayah.audio
                });

            if (insertError) {
                console.error("Ошибка вставки аята:", insertError);
            }
        }
    }

    console.log("Импорт завершён!");
}
async function autoImportHadiths() {
  const { data: existingHadiths, error: checkError } = await supabase
    .from("hadiths")
    .select("id")
    .limit(1);

  if (checkError) {
    console.error("Ошибка проверки таблицы hadiths:", checkError);
    return;
  }

  if (existingHadiths && existingHadiths.length > 0) {
    console.log("Хадисы уже загружены — импорт не требуется.");
    return;
  }

  console.log("Начинаю импорт хадисов...");

  const response = await fetch("https://hadithapi.com/api/books/bukhari?apiKey=YOUR_API_KEY");
  const json = await response.json();

  for (const h of json.data.hadiths) {
    const { error: insertError } = await supabase
      .from("hadiths")
      .insert({
        source: "Bukhari",
        number: h.hadithNumber,
        arabic: h.hadithArabic,
        translation: h.hadithEnglish
      });

    if (insertError) {
      console.error("Ошибка вставки хадиса:", insertError);
    }
  }

  console.log("Импорт хадисов завершён.");
}
async function autoImportDua() {
  const { data: existingDua, error: checkError } = await supabase
    .from("dua")
    .select("id")
    .limit(1);

  if (checkError) {
    console.error("Ошибка проверки таблицы dua:", checkError);
    return;
  }

  if (existingDua && existingDua.length > 0) {
    console.log("Дуа уже загружены — импорт не требуется.");
    return;
  }

  console.log("Начинаю импорт дуа...");

  const response = await fetch("https://your-domain.com/data/dua.json");
  const duas = await response.json();

  for (const d of duas) {
    const { error: insertError } = await supabase
      .from("dua")
      .insert({
        arabic: d.arabic,
        translation: d.translation,
        description: d.description
      });

    if (insertError) {
      console.error("Ошибка вставки дуа:", insertError);
    }
  }

  console.log("Импорт дуа завершён.");
}
async function autoImportTafsir() {
  const { data: existingTafsir, error: checkError } = await supabase
    .from("tafsir")
    .select("id")
    .limit(1);

  if (checkError) {
    console.error("Ошибка проверки таблицы tafsir:", checkError);
    return;
  }

  if (existingTafsir && existingTafsir.length > 0) {
    console.log("Тафсир уже загружен — импорт не требуется.");
    return;
  }

  console.log("Начинаю импорт тафсира...");

  const response = await fetch("https://your-domain.com/data/tafsir.json");
  const tafsirData = await response.json();

  for (const t of tafsirData) {
    const { error: insertError } = await supabase
      .from("tafsir")
      .insert({
        ayah_id: t.ayah_id,
        text: t.text,
        source: t.source
      });

    if (insertError) {
      console.error("Ошибка вставки тафсира:", insertError);
    }
  }

  console.log("Импорт тафсира завершён.");
}
(async () => {
  await autoImportAyahs();
  await autoImportHadiths();
  await autoImportDua();
  await autoImportTafsir();
})();
async function loadTopicFull(topicId) {
    // Загружаем саму тему
    const { data: topic } = await supabase
        .from("topics")
        .select("*")
        .eq("id", topicId)
        .single();

    // Аяты
    const { data: ayahLinks } = await supabase
        .from("topic_ayahs")
        .select("ayahs(*)")
        .eq("topic_id", topicId);

    // Хадисы
    const { data: hadithLinks } = await supabase
        .from("topic_hadiths")
        .select("hadiths(*)")
        .eq("topic_id", topicId);

    // Дуа
    const { data: duaLinks } = await supabase
        .from("topic_dua")
        .select("dua(*)")
        .eq("topic_id", topicId);

    // Тафсир
    const { data: tafsirLinks } = await supabase
        .from("topic_tafsir")
        .select("tafsir(*)")
        .eq("topic_id", topicId);

    return {
        topic,
        ayahs: ayahLinks?.map(x => x.ayahs) || [],
        hadiths: hadithLinks?.map(x => x.hadiths) || [],
        duas: duaLinks?.map(x => x.dua) || [],
        tafsir: tafsirLinks?.map(x => x.tafsir) || []
    };
}
const full = await loadTopicFull(topicId);

document.querySelector("#title").innerText = full.topic.title;

full.ayahs.forEach(a => {
    addAyahBlock(a.arabic, a.translation, a.audio_url);
});

full.hadiths.forEach(h => {
    addHadithBlock(h.arabic, h.translation);
});

full.duas.forEach(d => {
    addDuaBlock(d.arabic, d.translation);
});

full.tafsir.forEach(t => {
    addTafsirBlock(t.text, t.source);
});
