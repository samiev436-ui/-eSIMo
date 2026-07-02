import { createClient } from "@supabase/supabase-js";
//
const supabase = createClient(
  "https://avldlzjkprmqxnr.supabase.co",
  sb_publishable_M8Tuw2xR292hkdciEpj3tA_OvFdFZ_j
);

// ----------------------
// ДАННЫЕ ДЛЯ АВТОМАТИЧЕСКОГО ИМПОРТА
// ----------------------

const topics = [
  { title: "Намаз", description: "Обязательная молитва мусульманина" },
  { title: "Пост", description: "Пост в месяц Рамадан" },
  { title: "Закят", description: "Обязательная милостыня" },
  { title: "Хадж", description: "Паломничество в Мекку" },
  { title: "Вера", description: "Основы исламской веры" }
];

const ayahs = [
  {
    surah: 1,
    ayah: 1,
    arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
    topic_id: 1
  },
  {
    surah: 1,
    ayah: 2,
    arabic: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
    topic_id: 1
  }
];

const hadiths = [
  {
    title: "Хадис о намазе",
    content: "Первое, за что спросят человека в Судный день — это намаз.",
    topic_id: 1
  }
];

const dua = [
  {
    title: "Дуа о намазе",
    content: "О Аллах, сделай меня из тех, кто совершает молитву.",
    topic_id: 1
  }
];

const tafsir = [
  {
    title: "Тафсир аята о намазе",
    content: "Этот аят подчёркивает важность соблюдения времени молитвы.",
    topic_id: 1
  }
];

const practical = [
  {
    title: "Практический вывод",
    content: "Намаз воспитывает дисциплину и укрепляет связь с Аллахом.",
    topic_id: 1
  }
];

// ----------------------
// ФУНКЦИЯ АВТОМАТИЧЕСКОГО ИМПОРТА
// ----------------------

async function importAll() {
  console.log("Начинаю импорт данных...");

  // Темы
  const t = await supabase.from("topics").insert(topics);
  if (t.error) console.log("Ошибка topics:", t.error.message);

  // Аяты
  const a = await supabase.from("ayahs").insert(ayahs);
  if (a.error) console.log("Ошибка ayahs:", a.error.message);

  // Хадисы
  const h = await supabase.from("hadiths").insert(hadiths);
  if (h.error) console.log("Ошибка hadiths:", h.error.message);

  // Дуа
  const d = await supabase.from("dua").insert(dua);
  if (d.error) console.log("Ошибка dua:", d.error.message);

  // Тафсир
  const ts = await supabase.from("tafsir").insert(tafsir);
  if (ts.error) console.log("Ошибка tafsir:", ts.error.message);

  // Практика
  const p = await supabase.from("practical").insert(practical);
  if (p.error) console.log("Ошибка practical:", p.error.message);

  console.log("Импорт завершён.");
}

importAll();
