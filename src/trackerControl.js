const { createApp, ref, computed } = Vue;
const { createRouter, createWebHashHistory } = VueRouter;

// -------------------------
// Header con botón reset
// -------------------------
const HeaderSummary = {
  props: ["habits", "onReset"],
  setup(props) {
    const total = computed(() => props.habits.length);
    const doneToday = computed(
      () => props.habits.filter((h) => h.doneToday).length
    );
    return { total, doneToday, props };
  },
  template: `
    <header class="text-center p-6 bg-gradient-to-r from-fuchsia-600 to-violet-700 text-white shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-2 rounded-b-2xl">
      <div class="flex flex-col items-center md:items-start">
        <h1 class="text-4xl font-extrabold tracking-wider drop-shadow-neon">Pedrito || Tu mascota favorita </h1>
        <p v-if="total > 0" class="mt-2 text-fuchsia-200 font-medium">
          Has cumplido {{ doneToday }}/{{ total }} hábitos hoy
        </p>
        <p v-else class="mt-2 text-fuchsia-200 font-medium">
          Agrega tus primeros hábitos y ayuda a Pedrito 
        </p>
      </div>
      <button @click="props.onReset"
        class="bg-violet-500 hover:bg-violet-600 text-white px-4 py-2 rounded-xl transition shadow-lg">
        Reiniciar datos
      </button>
    </header>
  `,
};

// -------------------------
// Lista de hábitos
// -------------------------
const HabitList = {
  props: ["habits"],
  template: `
    <div class="bg-gray-800 p-4 rounded-2xl shadow-lg flex flex-col gap-2">
      <h2 class="text-lg font-semibold mb-2 text-fuchsia-400">Hábitos</h2>
      <ul class="space-y-2">
        <li v-for="habit in habits" :key="habit.id"
            class="flex justify-between items-center p-2 border border-gray-700 rounded-lg cursor-pointer hover:bg-gray-700 transition"
            @click="$router.push('/habit/' + habit.id)">
          <span class="text-gray-200">{{ habit.name }} ({{ habit.category }})</span>
          <span v-if="habit.doneToday" class="text-lime-400 font-bold">✓</span>
        </li>
      </ul>
    </div>
  `,
};

// -------------------------
// Formulario
// -------------------------
const HabitForm = {
  emits: ["add-habit"],
  setup(props, { emit }) {
    const newHabit = ref("");
    const newCategory = ref("agua");
    const submit = () => {
      if (!newHabit.value.trim()) return;
      emit("add-habit", {
        name: newHabit.value.trim(),
        category: newCategory.value,
      });
      newHabit.value = "";
      newCategory.value = "agua";
    };
    return { newHabit, newCategory, submit };
  },
  template: `
  <div class="bg-gray-800 p-4 rounded-2xl shadow-lg">
    <h2 class="text-lg font-semibold mb-2 text-fuchsia-400">Nuevo hábito</h2>
    <div class="flex flex-col sm:flex-row sm:flex-wrap gap-2">
      <input v-model="newHabit"
        type="text"
        placeholder="Ej: Tomar agua"
        class="flex-1 border border-gray-700 bg-gray-900 text-gray-200 p-2 rounded-lg focus:outline-none focus:ring focus:ring-fuchsia-500 w-full sm:w-auto"/>
      <select v-model="newCategory" class="border border-gray-700 bg-gray-900 text-gray-200 p-2 rounded-lg w-full sm:w-auto">
        <option value="agua">Agua</option>
        <option value="comida">Comida</option>
        <option value="sueño">Sueño</option>
        <option value="ejercicio">Ejercicio</option>
        <option value="diversion">Diversión</option>
      </select>
      <button @click="submit"
        class="bg-fuchsia-500 text-white px-3 py-2 rounded-xl hover:bg-fuchsia-600 transition w-full sm:w-auto shadow-lg">
        Agregar
      </button>
    </div>
  </div>
  `,
};

// -------------------------
// Barras de necesidades
// -------------------------
const NeedsBars = {
  props: ["habits"],
  setup(props) {
    const categories = ["agua", "comida", "sueño", "ejercicio", "diversion"];

    const progress = computed(() => {
      let result = {};
      categories.forEach((cat) => {
        const total = props.habits.filter((h) => h.category === cat).length;
        const done = props.habits.filter(
          (h) => h.category === cat && h.doneToday
        ).length;
        result[cat] = total > 0 ? Math.round((done / total) * 100) : 0;
      });
      return result;
    });

    return { progress, categories };
  },
  template: `
    <div class="bg-gray-800 p-4 rounded-2xl shadow-lg flex flex-col gap-2">
      <h2 class="text-lg font-semibold mb-2 text-fuchsia-400">Necesidades de Pedrito</h2>
      <div v-for="cat in categories" :key="cat" class="mb-2">
        <p class="capitalize text-gray-200">{{ cat }}</p>
        <div class="w-full bg-gray-700 h-4 rounded-lg overflow-hidden">
          <div class="h-4 bg-gradient-to-r from-cyan-400 to-fuchsia-500 transition-all" :style="{ width: progress[cat] + '%' }"></div>
        </div>
        <p class="text-sm text-fuchsia-400">{{ progress[cat] }}%</p>
      </div>
    </div>
  `,
};

// -------------------------
// Visual de Pedrito
// -------------------------
const PetDisplay = {
  props: ["habits"],
  setup(props) {
    const mood = computed(() => {
      if (!props.habits.length) return "neutral";
      const done = props.habits.filter((h) => h.doneToday).length;
      const percent = (done / props.habits.length) * 100;
      if (percent === 100) return "happy";
      if (percent >= 50) return "neutral";
      return "sad";
    });
    return { mood };
  },
  template: `
    <div class="flex flex-col items-center justify-center bg-gray-800 p-8 rounded-2xl shadow-lg w-full h-80">
      <img v-if="mood==='happy'" src="assets/Feliz.png" alt="Pedrito feliz" class="h-40 mb-4 drop-shadow-neon"/>
      <img v-else-if="mood==='neutral'" src="assets/neutral.png" alt="Pedrito neutral" class="h-40 mb-4 drop-shadow-neon"/>
      <img v-else src="assets/Troste.png" alt="Pedrito triste" class="h-40 mb-4 drop-shadow-neon"/>

      <p class="font-semibold text-lg text-fuchsia-400">Soy Pedrito, tu mascota virtual</p>
      <p v-if="mood==='happy'" class="text-lime-400 mt-2">¡Cumpliste todo hoy! Que buena socio</p>
      <p v-else-if="mood==='neutral'" class="text-cyan-400 mt-2">Vamos bien, hagale pues</p>
      <p v-else class="text-red-400 mt-2">Ole me tienes olvidado, haz tus habitos pues!</p>
    </div>
  `,
};

// -------------------------
// Vista principal
// -------------------------
const HomeView = {
  components: { HeaderSummary, HabitList, HabitForm, PetDisplay, NeedsBars },
  setup() {
    const habits = ref(
      JSON.parse(localStorage.getItem("pedrodex.habits") || "[]")
    );

    const saveHabits = () => {
      localStorage.setItem("pedrodex.habits", JSON.stringify(habits.value));
    };

    const addHabit = ({ name, category }) => {
      habits.value.push({ id: Date.now(), name, category, doneToday: false });
      saveHabits();
    };

    const resetHabits = () => {
      if (confirm("¿Seguro que quieres reiniciar todos los datos?")) {
        habits.value = [];
        saveHabits();
      }
    };

    return { habits, addHabit, resetHabits };
  },
  template: `
    <div class="bg-gray-900 min-h-screen">
      <HeaderSummary :habits="habits" :onReset="resetHabits" />
      <main class="grid grid-cols-1 lg:grid-cols-4 gap-4 p-4">
        <HabitList :habits="habits" class="lg:col-span-1"/>
        <PetDisplay :habits="habits" class="lg:col-span-2"/>
        <HabitForm @add-habit="addHabit" class="lg:col-span-1"/>
        <NeedsBars :habits="habits" class="lg:col-span-4"/>
      </main>
    </div>
  `,
};

// -------------------------
// Detalle de hábito
// -------------------------
const HabitDetail = {
  props: ["id"],
  setup(props) {
    const habits = ref(
      JSON.parse(localStorage.getItem("pedrodex.habits") || "[]")
    );
    const habit = computed(() => habits.value.find((h) => h.id == props.id));

    const toggleDone = () => {
      if (!habit.value) return;
      habit.value.doneToday = !habit.value.doneToday;
      localStorage.setItem("pedrodex.habits", JSON.stringify(habits.value));
    };

    return { habit, toggleDone };
  },
  template: `
    <div class="p-4 bg-gray-900 min-h-screen text-gray-200">
      <router-link to="/" class="text-fuchsia-400 underline">← Volver</router-link>
      <div v-if="habit" class="mt-4 bg-gray-800 p-6 rounded-2xl shadow-lg">
        <h2 class="text-xl font-bold mb-2 text-fuchsia-400">{{ habit.name }} ({{ habit.category }})</h2>
        <p>Estado hoy: 
          <span :class="habit.doneToday ? 'text-lime-400' : 'text-red-400'">
            {{ habit.doneToday ? 'Completado' : 'Pendiente' }}
          </span>
        </p>
        <button @click="toggleDone"
          class="mt-4 bg-fuchsia-500 text-white px-4 py-2 rounded-xl hover:bg-fuchsia-600 transition shadow-lg">
          {{ habit.doneToday ? 'Desmarcar' : 'Marcar como hecho' }}
        </button>
      </div>
      <div v-else>
        <p>Hábito no encontrado.</p>
      </div>
    </div>
  `,
};

// -------------------------
// Router
// -------------------------
const routes = [
  { path: "/", component: HomeView },
  { path: "/habit/:id", component: HabitDetail, props: true },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

// -------------------------
// App
// -------------------------
const app = createApp({});
app.use(router);
app.mount("#app");
