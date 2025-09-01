// Utilidades simples
const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);
const todayISO = () => new Date().toISOString().slice(0,10);
const ydayISO = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0,10);
};

// ======= COMPONENTES =======
const HeaderSummary = {
  name: 'HeaderSummary',
  props: { habits: { type: Array, required: true } },
  computed: {
    total() { return this.habits.length; },
    doneToday() { return this.habits.filter(h => h.lastDoneDate === todayISO()).length; },
    completionPct() { return this.total === 0 ? 0 : Math.round((this.doneToday / this.total) * 100); },
    petMood() {
      if (this.completionPct >= 60) return { label: 'Feliz', tone: 'bg-emerald-100 text-emerald-800' };
      if (this.completionPct >= 30) return { label: 'Neutral', tone: 'bg-amber-100 text-amber-800' };
      return { label: 'Triste', tone: 'bg-rose-100 text-rose-800' };
    }
  },
  template: `
    <header class="max-w-5xl mx-auto p-4 sm:p-6">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-3xl sm:text-4xl font-extrabold tracking-tight">PedroDex <span class="text-slate-400 text-xl align-middle">MVP</span></h1>
          <p class="text-slate-600 mt-1">Tu mascota <span class="font-semibold">Pedrito</span> vive de tus hábitos. ¡Hazlo feliz completándolos! 💪</p>
        </div>
        <div class="flex items-center gap-3">
          <div class="px-3 py-1 rounded-full text-sm font-medium bg-slate-200">Hábitos: {{ total }}</div>
          <div class="px-3 py-1 rounded-full text-sm font-medium bg-slate-200">Hoy: {{ doneToday }}/{{ total }}</div>
          <div :class="['px-3 py-1 rounded-full text-sm font-semibold', petMood.tone]">Estado Pedrito: {{ petMood.label }}</div>
        </div>
      </div>

      <div class="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="sm:col-span-2">
          <div class="w-full bg-white rounded-2xl shadow p-4">
            <h2 class="font-bold mb-2">Resumen</h2>
            <div class="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
              <div class="h-3 bg-slate-800" :style="{ width: completionPct + '%' }"></div>
            </div>
            <p class="text-sm text-slate-600 mt-2">Completado hoy: <span class="font-semibold">{{ completionPct }}%</span></p>
            <p class="text-sm mt-1">Consejo: completa al menos 3 hábitos para mantener a Pedrito contento 🐣</p>
          </div>
        </div>
        <div class="bg-white rounded-2xl shadow p-4 flex items-center justify-center border-2 border-dashed border-slate-300">
          <div class="text-center">
            <div class="text-sm text-slate-500">Espacio para la imagen de</div>
            <div class="text-lg font-semibold">Pedrito</div>
            <div class="text-xs text-slate-400 mt-1">(PNG/GIF/SVG en el futuro)</div>
          </div>
        </div>
      </div>
    </header>
  `
};

const HabitForm = {
  name: 'HabitForm',
  emits: ['add-habit'],
  data() {
    return { name: '', type: 'agua' };
  },
  methods: {
    submit() {
      const trimmed = this.name.trim();
      if (!trimmed) return;
      this.$emit('add-habit', { id: uid(), name: trimmed, type: this.type, createdAt: todayISO(), lastDoneDate: null, streak: 0 });
      this.name = '';
      this.type = 'agua';
    }
  },
  template: `
    <div class="bg-white rounded-2xl shadow p-4 sm:p-5">
      <h2 class="font-bold text-lg mb-3">Agregar hábito</h2>
      <div class="flex flex-col sm:flex-row gap-3">
        <input v-model="name" type="text" placeholder="Ej. Tomar agua" class="flex-1 rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-400" />
        <select v-model="type" class="rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-400">
          <option value="agua">💧 Agua</option>
          <option value="comida">🍽️ Comida</option>
          <option value="diversion">🎉 Diversión</option>
          <option value="sueno">🛌 Sueño</option>
          <option value="ejercicio">🏃 Ejercicio</option>
          <option value="otro">✨ Otro</option>
        </select>
        <button @click="submit" class="rounded-xl px-4 py-2 bg-slate-800 text-white font-semibold hover:opacity-90 active:opacity-80">Añadir</button>
      </div>
    </div>
  `
};

const HabitList = {
  name: 'HabitList',
  props: { habits: { type: Array, required: true } },
  emits: ['select-habit'],
  computed: {
    sorted() {
      const t = todayISO();
      return [...this.habits].sort((a,b) => {
        const aDone = a.lastDoneDate === t;
        const bDone = b.lastDoneDate === t;
        if (aDone !== bDone) return aDone ? 1 : -1;
        return (b.streak||0) - (a.streak||0);
      });
    }
  },
  methods: {
    go(h) { this.$emit('select-habit', h.id); },
    today: todayISO,
    icon(type){
      return ({agua:'💧', comida:'🍽️', diversion:'🎉', sueno:'🛌', ejercicio:'🏃', otro:'✨'})[type] || '✨';
    },
    badgeClass(h){
      const base = 'inline-flex items-center text-xs font-semibold rounded-full px-2 py-1';
      return h.lastDoneDate === todayISO()
        ? base + ' bg-emerald-100 text-emerald-800'
        : base + ' bg-rose-100 text-rose-800';
    }
  },
  template: `
    <div class="bg-white rounded-2xl shadow p-4 sm:p-5">
      <h2 class="font-bold text-lg mb-3">Mis hábitos</h2>
      <div v-if="sorted.length === 0" class="text-sm text-slate-500">Aún no tienes hábitos. ¡Agrega uno! 😄</div>
      <ul class="divide-y divide-slate-200">
        <li v-for="h in sorted" :key="h.id" class="py-3 flex items-center justify-between gap-3">
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <span class="text-xl">{{ icon(h.type) }}</span>
              <button @click="go(h)" class="text-left truncate font-medium hover:underline">{{ h.name }}</button>
            </div>
            <div class="text-xs text-slate-500 mt-0.5">Racha: <span class="font-semibold">{{ h.streak }}</span></div>
          </div>
          <span :class="badgeClass(h)">{{ h.lastDoneDate === today() ? 'Hecho hoy' : 'Pendiente' }}</span>
        </li>
      </ul>
    </div>
  `
};

// ======= VISTAS =======
const HomeView = {
  name: 'HomeView',
  components: { HeaderSummary, HabitForm, HabitList },
  data(){ return { habits: [] }; },
  created(){
    this.load();
    if (this.habits.length === 0) {
      this.habits = [
        { id: uid(), name: 'Tomar agua', type: 'agua', createdAt: todayISO(), lastDoneDate: null, streak: 0 },
        { id: uid(), name: 'Comer saludable', type: 'comida', createdAt: todayISO(), lastDoneDate: null, streak: 0 },
        { id: uid(), name: 'Jugar/relajarse', type: 'diversion', createdAt: todayISO(), lastDoneDate: null, streak: 0 },
        { id: uid(), name: 'Dormir 7h', type: 'sueno', createdAt: todayISO(), lastDoneDate: null, streak: 0 },
        { id: uid(), name: 'Ejercicio 20min', type: 'ejercicio', createdAt: todayISO(), lastDoneDate: null, streak: 0 },
      ];
      this.save();
    }
  },
  methods: {
    save(){ localStorage.setItem('pedrodex.habits', JSON.stringify(this.habits)); },
    load(){ try { this.habits = JSON.parse(localStorage.getItem('pedrodex.habits')||'[]'); } catch(e){ this.habits = []; } },
    addHabit(h){ this.habits.push(h); this.save(); },
    selectHabit(id){ this.$router.push({ name: 'habit', params: { id } }); }
  },
  template: `
    <main>
      <HeaderSummary :habits="habits" />
      <section class="max-w-5xl mx-auto p-4 sm:p-6 grid grid-cols-1 gap-4">
        <HabitForm @add-habit="addHabit" />
        <HabitList :habits="habits" @select-habit="selectHabit" />
      </section>
    </main>
  `
};

const HabitDetailView = {
  name: 'HabitDetailView',
  data(){ return { habit: null }; },
  created(){
    const id = this.$route.params.id;
    const list = JSON.parse(localStorage.getItem('pedrodex.habits')||'[]');
    this.habit = list.find(h => h.id === id) || null;
    this._all = list;
  },
  computed: {
    doneToday(){ return this.habit && this.habit.lastDoneDate === todayISO(); },
  },
  methods: {
    back(){ this.$router.push({ name: 'home' }); },
    markDone(){
      if (!this.habit) return;
      if (this.habit.lastDoneDate === todayISO()) return;
      const last = this.habit.lastDoneDate;
      if (last === ydayISO()) this.habit.streak = (this.habit.streak||0) + 1;
      else this.habit.streak = 1;
      this.habit.lastDoneDate = todayISO();
      const idx = this._all.findIndex(h => h.id === this.habit.id);
      if (idx !== -1) this._all[idx] = this.habit;
      localStorage.setItem('pedrodex.habits', JSON.stringify(this._all));
    },
    removeHabit(){
      if (!this.habit) return;
      if (!confirm('¿Eliminar este hábito?')) return;
      const filtered = this._all.filter(h => h.id !== this.habit.id);
      localStorage.setItem('pedrodex.habits', JSON.stringify(filtered));
      this.back();
    },
    icon(type){
      return ({agua:'💧', comida:'🍽️', diversion:'🎉', sueno:'🛌', ejercicio:'🏃', otro:'✨'})[type] || '✨';
    }
  },
  template: `
    <main class="max-w-3xl mx-auto p-4 sm:p-6">
      <button @click="back" class="mb-4 inline-flex items-center gap-2 text-slate-700 hover:underline">← Volver</button>
      <div v-if="!habit" class="bg-white rounded-2xl shadow p-6"><p>No se encontró el hábito.</p></div>
      <div v-else class="bg-white rounded-2xl shadow p-6">
        <div class="flex items-start justify-between gap-4">
          <div>
            <h2 class="text-2xl font-extrabold flex items-center gap-2">{{ icon(habit.type) }} {{ habit.name }}</h2>
            <p class="text-sm text-slate-500 mt-1">Creado: {{ habit.createdAt }}</p>
          </div>
          <button @click="removeHabit" class="text-rose-700 hover:underline">Eliminar</button>
        </div>
        <div class="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="sm:col-span-2">
            <div class="rounded-xl border border-slate-200 p-4">
              <p class="text-sm text-slate-600">Racha actual</p>
              <p class="text-4xl font-black">{{ habit.streak }}</p>
              <p class="text-xs text-slate-500 mt-1">Marca “Hecho hoy” una vez por día para mantener la racha.</p>
              <button @click="markDone" :disabled="doneToday" class="mt-4 rounded-xl px-4 py-2 font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed" :class="doneToday ? 'bg-slate-400' : 'bg-slate-800 hover:opacity-90'">{{ doneToday ? '¡Listo por hoy!' : 'Hecho hoy' }}</button>
            </div>
          </div>
          <div class="rounded-xl border border-dashed border-slate-300 p-4 flex items-center justify-center bg-slate-50">
            <div class="text-center">
              <div class="text-sm text-slate-500">Aquí puede ir un mini</div>
              <div class="text-lg font-semibold">Pedrito</div>
              <div class="text-xs text-slate-400 mt-1">(mood relacionado a este hábito)</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  `
};

// ======= ROUTER =======
const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/habit/:id', name: 'habit', component: HabitDetailView, props: true },
];
const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes,
  scrollBehavior(){ return { top: 0 }; }
});

// ======= APP ROOT =======
const app = Vue.createApp({});
app.component('HeaderSummary', HeaderSummary);
app.component('HabitForm', HabitForm);
app.component('HabitList', HabitList);
app.use(router);
app.mount('#app');
