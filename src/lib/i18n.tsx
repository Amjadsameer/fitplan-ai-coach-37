import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type Lang = "en" | "ar";
type Theme = "light" | "dark";

const translations = {
  en: {
    appName: "FitPlan AI",
    tagline: "Your personal nutrition coach",
    login: "Login",
    email: "Email",
    password: "Password",
    rememberMe: "Remember me",
    forgotPassword: "Forgot password?",
    signIn: "Sign in",
    resetPassword: "Reset password",
    resetInstructions: "Enter your email and we'll send a reset link.",
    sendLink: "Send reset link",
    backToLogin: "Back to login",
    home: "Home",
    myPlan: "My Plan",
    progress: "Progress",
    profile: "Profile",
    welcomeBack: "Welcome back",
    currentWeight: "Current weight",
    dailyTarget: "Daily target",
    calories: "Calories",
    protein: "Protein",
    carbs: "Carbs",
    fat: "Fat",
    todaysMeals: "Today's meals",
    waterIntake: "Water intake",
    glasses: "glasses",
    breakfast: "Breakfast",
    lunch: "Lunch",
    dinner: "Dinner",
    snacks: "Snacks",
    markCompleted: "Mark as completed",
    completed: "Completed",
    nutritionPlan: "Nutrition plan",
    weightTracking: "Weight tracking",
    weightHistory: "Weight history",
    addWeight: "Add weight",
    statistics: "Statistics",
    startWeight: "Start",
    currentW: "Current",
    goalW: "Goal",
    lost: "Lost",
    kg: "kg",
    personalInfo: "Personal info",
    height: "Height",
    weight: "Weight",
    goal: "Goal",
    activityLevel: "Activity level",
    language: "Language",
    theme: "Theme",
    notifications: "Notifications",
    mealReminders: "Meal reminders",
    waterReminders: "Water reminders",
    logout: "Logout",
    light: "Light",
    dark: "Dark",
    loseWeight: "Lose weight",
    moderate: "Moderate",
    save: "Save",
    cancel: "Cancel",
    enterWeight: "Enter your weight",
    swap: "Swap meal",
    swapped: "Meal swapped",
    favorites: "Favorites",
    addToFavorites: "Add to favorites",
    removeFromFavorites: "Remove from favorites",
    alternatives: "Alternatives",
    days: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],
    meals: {
      oatmeal: "Oatmeal with berries",
      eggs: "Scrambled eggs & avocado toast",
      chicken: "Grilled chicken & quinoa",
      salmon: "Salmon with vegetables",
      greekYogurt: "Greek yogurt & almonds",
    },
  },
  ar: {
    appName: "فيت بلان AI",
    tagline: "مدربك الشخصي للتغذية",
    login: "تسجيل الدخول",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    rememberMe: "تذكرني",
    forgotPassword: "نسيت كلمة المرور؟",
    signIn: "دخول",
    resetPassword: "إعادة تعيين كلمة المرور",
    resetInstructions: "أدخل بريدك وسنرسل لك رابط إعادة التعيين.",
    sendLink: "إرسال الرابط",
    backToLogin: "العودة لتسجيل الدخول",
    home: "الرئيسية",
    myPlan: "خطتي",
    progress: "التقدم",
    profile: "الملف",
    welcomeBack: "مرحباً بعودتك",
    currentWeight: "الوزن الحالي",
    dailyTarget: "الهدف اليومي",
    calories: "سعرات",
    protein: "بروتين",
    carbs: "كربوهيدرات",
    fat: "دهون",
    todaysMeals: "وجبات اليوم",
    waterIntake: "شرب الماء",
    glasses: "أكواب",
    breakfast: "الفطور",
    lunch: "الغداء",
    dinner: "العشاء",
    snacks: "وجبات خفيفة",
    markCompleted: "وضع علامة مكتمل",
    completed: "مكتمل",
    nutritionPlan: "الخطة الغذائية",
    weightTracking: "تتبع الوزن",
    weightHistory: "سجل الوزن",
    addWeight: "إضافة وزن",
    statistics: "الإحصائيات",
    startWeight: "البداية",
    currentW: "الحالي",
    goalW: "الهدف",
    lost: "خسرت",
    kg: "كجم",
    personalInfo: "المعلومات الشخصية",
    height: "الطول",
    weight: "الوزن",
    goal: "الهدف",
    activityLevel: "مستوى النشاط",
    language: "اللغة",
    theme: "المظهر",
    notifications: "الإشعارات",
    mealReminders: "تذكير الوجبات",
    waterReminders: "تذكير الماء",
    logout: "تسجيل الخروج",
    light: "فاتح",
    dark: "داكن",
    loseWeight: "خسارة الوزن",
    moderate: "معتدل",
    save: "حفظ",
    cancel: "إلغاء",
    enterWeight: "أدخل وزنك",
    swap: "تبديل الوجبة",
    swapped: "تم التبديل",
    favorites: "المفضلة",
    addToFavorites: "إضافة للمفضلة",
    removeFromFavorites: "إزالة من المفضلة",
    alternatives: "بدائل",
    days: ["إثن","ثلا","أرب","خمي","جمع","سبت","أحد"],
    meals: {
      oatmeal: "شوفان مع التوت",
      eggs: "بيض مخفوق وتوست أفوكادو",
      chicken: "دجاج مشوي مع كينوا",
      salmon: "سلمون مع الخضار",
      greekYogurt: "زبادي يوناني ولوز",
    },
  },
};

type Dict = typeof translations.en;

interface AppCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
  t: Dict;
  dir: "ltr" | "rtl";
}

const Ctx = createContext<AppCtx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    const savedLang = (typeof window !== "undefined" && localStorage.getItem("lang")) as Lang | null;
    const savedTheme = (typeof window !== "undefined" && localStorage.getItem("theme")) as Theme | null;
    if (savedLang) setLangState(savedLang);
    if (savedTheme) setThemeState(savedTheme);
    else if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setThemeState("dark");
    }
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    localStorage.setItem("lang", lang);
  }, [lang]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const value = useMemo<AppCtx>(() => ({
    lang,
    setLang: setLangState,
    theme,
    setTheme: setThemeState,
    toggleTheme: () => setThemeState(theme === "light" ? "dark" : "light"),
    t: translations[lang],
    dir: lang === "ar" ? "rtl" : "ltr",
  }), [lang, theme]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
