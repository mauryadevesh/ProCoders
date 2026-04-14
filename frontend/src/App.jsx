import { useEffect, useMemo, useRef, useState } from "react";
import { getDashboard, getSubjects } from "./api";
import Quiz from "./quiz";
import LoginSignup from "./components/LoginSignup";
import "./App.css";

const AUTH_STORAGE_KEY = "smartprep_user";

const loadStoredUser = () => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawUser = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!rawUser) {
      return null;
    }

    const parsedUser = JSON.parse(rawUser);
    if (!parsedUser?.id) {
      return null;
    }

    return parsedUser;
  } catch {
    return null;
  }
};

const C = {
  g: "#FFC570",
  c: "#EFD2B0",
  s: "#547792",
  n: "#1A3263",
  nb: "#0e1f42",
};

const TNR = "'Quicksand', 'Segoe UI', sans-serif";

const styles = {
  intro: (show) => ({
    position: "fixed",
    inset: 0,
    zIndex: 999,
    background: C.n,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    transition: "opacity .6s .1s, visibility .6s .1s",
    opacity: show ? 1 : 0,
    visibility: show ? "visible" : "hidden",
    pointerEvents: show ? "auto" : "none",
  }),
  iline: {
    width: 200,
    height: 3,
    background: `linear-gradient(90deg,transparent,${C.g},transparent)`,
    margin: "0 auto 1.4rem",
  },
  ibrand: {
    fontFamily: TNR,
    fontSize: "clamp(3rem,10vw,6.5rem)",
    fontWeight: 800,
    color: C.c,
    display: "flex",
    gap: "0.03em",
    justifyContent: "center",
    position: "relative",
    zIndex: 2,
  },
  itag: {
    fontFamily: TNR,
    fontSize: 13,
    letterSpacing: "0.22em",
    textTransform: "uppercase",
    color: "rgba(239,210,176,.5)",
    marginTop: "0.9rem",
    position: "relative",
    zIndex: 2,
  },
  ibar: (pct) => ({
    position: "absolute",
    bottom: 0,
    left: 0,
    height: 3,
    width: `${pct}%`,
    background: `linear-gradient(90deg,${C.s},${C.g})`,
    transition: "width 0.05s linear",
  }),
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "0.8rem",
    padding: "0.85rem 5%",
    background: "rgba(255,250,244,.95)",
    borderBottom: "1px solid rgba(84,119,146,.15)",
    position: "sticky",
    top: 0,
    zIndex: 99,
    flexWrap: "wrap",
  },
  logo: {
    fontFamily: TNR,
    fontWeight: 800,
    fontSize: "clamp(24px,2.4vw,34px)",
    color: C.n,
  },
  navLinks: {
    display: "flex",
    gap: "0.6rem",
    alignItems: "center",
    flexWrap: "wrap",
  },
  tabBtn: {
    border: "1px solid rgba(26,50,99,.2)",
    background: "transparent",
    color: C.s,
    borderRadius: 10,
    padding: "0.62rem 1.1rem",
    fontSize: 16,
    fontFamily: TNR,
    cursor: "pointer",
  },
  tabBtnActive: {
    border: "1px solid rgba(26,50,99,.2)",
    background: "rgba(255,197,112,.34)",
    color: C.n,
    borderRadius: 10,
    padding: "0.62rem 1.1rem",
    fontSize: 16,
    fontFamily: TNR,
    fontWeight: 700,
    cursor: "pointer",
  },
  tabBtnDisabled: {
    border: "1px solid rgba(26,50,99,.14)",
    background: "rgba(26,50,99,.06)",
    color: "rgba(26,50,99,.45)",
    borderRadius: 10,
    padding: "0.62rem 1.1rem",
    fontSize: 16,
    fontFamily: TNR,
    cursor: "not-allowed",
  },
  btn: {
    background: C.n,
    color: C.c,
    border: "none",
    padding: "0.72rem 1.35rem",
    borderRadius: 10,
    fontSize: 16,
    fontFamily: TNR,
    cursor: "pointer",
  },
  btng: {
    background: C.g,
    color: C.n,
    border: "none",
    padding: "0.72rem 1.35rem",
    borderRadius: 10,
    fontSize: 16,
    fontFamily: TNR,
    fontWeight: 700,
    cursor: "pointer",
  },
  btngh: {
    background: "transparent",
    border: "1.5px solid rgba(239,210,176,.35)",
    color: C.c,
    padding: "0.72rem 1.35rem",
    borderRadius: 10,
    fontSize: 16,
    fontFamily: TNR,
    cursor: "pointer",
  },
  hero: {
    background: "linear-gradient(145deg, #10264f 0%, #1a3263 56%, #234b7c 100%)",
    padding: "clamp(5rem,10vw,8rem) 6% clamp(4rem,8vw,6.25rem)",
  },
  heroIn: {
    maxWidth: 1200,
    margin: "0 auto",
    display: "grid",
    gap: "3rem",
    alignItems: "center",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    background: "rgba(255,197,112,.12)",
    border: "1px solid rgba(255,197,112,.3)",
    color: C.g,
    fontSize: 13,
    padding: "0.45rem 1.05rem",
    borderRadius: 20,
    marginBottom: "1.2rem",
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    fontFamily: TNR,
  },
  h1: {
    fontFamily: TNR,
    fontSize: "clamp(38px,6.2vw,84px)",
    fontWeight: 800,
    color: C.c,
    lineHeight: 1.12,
    marginBottom: "1rem",
  },
  heroP: {
    fontSize: "clamp(17px,2.1vw,24px)",
    color: "rgba(239,210,176,.7)",
    lineHeight: 1.7,
    marginBottom: "2rem",
    fontFamily: TNR,
  },
  row: {
    display: "flex",
    gap: "0.95rem",
    flexWrap: "wrap",
  },
  card: {
    background: "rgba(255,250,244,.05)",
    border: "1px solid rgba(255,197,112,.2)",
    borderRadius: 18,
    padding: "1.75rem",
  },
  ct: {
    fontFamily: TNR,
    fontSize: 13,
    fontWeight: 800,
    color: C.g,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    marginBottom: "1.1rem",
  },
  bm: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 15,
    color: C.c,
    marginBottom: 6,
    fontFamily: TNR,
  },
  bb: {
    height: 7,
    background: "rgba(255,255,255,.08)",
    borderRadius: 3,
    overflow: "hidden",
  },
  bf: (w) => ({
    height: "100%",
    background: `linear-gradient(90deg,${C.g},#ffdb97)`,
    borderRadius: 3,
    width: `${Math.max(0, Math.min(100, w))}%`,
  }),
  sr: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "1.2rem",
    paddingTop: "1.2rem",
    borderTop: "1px solid rgba(255,197,112,.15)",
  },
  srSm: {
    fontSize: 13,
    color: "rgba(239,210,176,.5)",
    fontFamily: TNR,
  },
  scoreNum: {
    fontFamily: TNR,
    fontSize: "clamp(42px,6vw,72px)",
    fontWeight: 800,
    color: C.g,
  },
  stats: {
    display: "flex",
    flexWrap: "wrap",
    background: C.c,
  },
  stat: {
    flex: 1,
    minWidth: 180,
    textAlign: "center",
    padding: "1.8rem 1.2rem",
    borderRight: "1px solid rgba(26,50,99,.1)",
  },
  statN: {
    fontFamily: TNR,
    fontSize: "clamp(40px,5vw,68px)",
    fontWeight: 800,
    color: C.n,
  },
  statL: {
    fontSize: 14,
    color: C.s,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    marginTop: 6,
    fontFamily: TNR,
  },
  sec: (bg) => ({
    padding: "clamp(4.6rem,8vw,7.2rem) 6%",
    background: bg || "#fffaf4",
  }),
  inn: {
    maxWidth: 1200,
    margin: "0 auto",
  },
  ey: (dark) => ({
    fontSize: 13,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: dark ? C.g : C.s,
    fontWeight: 600,
    marginBottom: "0.5rem",
    fontFamily: TNR,
  }),
  st2: (dark) => ({
    fontFamily: TNR,
    fontSize: "clamp(30px,4.2vw,58px)",
    fontWeight: 800,
    color: dark ? C.c : C.n,
    letterSpacing: "-0.4px",
    marginBottom: "0.8rem",
  }),
  sb: (dark) => ({
    fontSize: "clamp(17px,2vw,23px)",
    color: dark ? "rgba(239,210,176,.55)" : C.s,
    lineHeight: 1.75,
    maxWidth: 760,
    marginBottom: "2.1rem",
    fontFamily: TNR,
  }),
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
    gap: "1.2rem",
  },
  fc: {
    background: "#fff",
    border: "1px solid rgba(84,119,146,.15)",
    borderRadius: 16,
    padding: "1.45rem",
  },
  fcH3: {
    fontFamily: TNR,
    fontSize: "clamp(21px,2.4vw,30px)",
    fontWeight: 800,
    color: C.n,
    marginBottom: "0.45rem",
  },
  fcP: {
    fontSize: "clamp(15px,1.25vw,18px)",
    color: C.s,
    lineHeight: 1.7,
    fontFamily: TNR,
  },
  subjectHeadRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "0.6rem",
    marginBottom: "0.25rem",
    flexWrap: "wrap",
  },
  recBadge: {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: 999,
    border: "1px solid rgba(125,47,28,.28)",
    background: "rgba(239,210,176,.9)",
    color: "#7d2f1c",
    fontSize: 12,
    fontWeight: 700,
    padding: "0.28rem 0.62rem",
    fontFamily: TNR,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  recBadgeQuiet: {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: 999,
    border: "1px solid rgba(84,119,146,.25)",
    background: "rgba(84,119,146,.1)",
    color: C.s,
    fontSize: 12,
    fontWeight: 700,
    padding: "0.28rem 0.62rem",
    fontFamily: TNR,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  recDetails: {
    marginTop: "0.55rem",
  },
  recSummary: {
    cursor: "pointer",
    color: C.n,
    fontSize: 14,
    fontWeight: 700,
    fontFamily: TNR,
    marginBottom: "0.45rem",
  },
  recList: {
    display: "grid",
    gap: "0.7rem",
    marginTop: "0.7rem",
  },
  recCard: {
    border: "1px solid rgba(84,119,146,.18)",
    borderRadius: 10,
    padding: "0.75rem 0.85rem",
    background: "linear-gradient(160deg, #ffffff, #fff8eb)",
    textDecoration: "none",
    display: "grid",
    gap: "0.25rem",
  },
  recTitle: {
    fontFamily: TNR,
    fontSize: 17,
    fontWeight: 700,
    color: C.n,
  },
  recMeta: {
    fontFamily: TNR,
    fontSize: 14,
    color: C.s,
    lineHeight: 1.5,
  },
  recAction: {
    fontFamily: TNR,
    fontSize: 14,
    color: "#7d2f1c",
    fontWeight: 600,
    lineHeight: 1.5,
  },
  steps: {
    display: "flex",
    flexWrap: "wrap",
  },
  step: {
    flex: 1,
    minWidth: 100,
    textAlign: "center",
    padding: "0.4rem",
  },
  sc: {
    width: 58,
    height: 58,
    borderRadius: "50%",
    background: "rgba(255,197,112,.1)",
    border: "1.5px solid rgba(255,197,112,.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 21,
    margin: "0 auto 0.65rem",
  },
  sn2: {
    fontSize: 13,
    color: C.g,
    fontWeight: 600,
    letterSpacing: "0.06em",
    fontFamily: TNR,
  },
  sl: {
    fontSize: 14,
    color: "rgba(239,210,176,.55)",
    marginTop: 2,
    fontFamily: TNR,
  },
  tag: {
    background: "rgba(26,50,99,.08)",
    border: "1px solid rgba(26,50,99,.15)",
    borderRadius: 10,
    padding: "0.45rem 0.95rem",
    fontSize: 15,
    color: C.n,
    fontWeight: 500,
    fontFamily: TNR,
  },
  ctaSec: {
    background: C.n,
    textAlign: "center",
    padding: "clamp(5rem,8vw,7rem) 6%",
  },
  ctaH2: {
    fontFamily: TNR,
    fontSize: "clamp(34px,5vw,62px)",
    fontWeight: 800,
    color: C.c,
    letterSpacing: "-0.4px",
    marginBottom: "0.85rem",
  },
  ctaP: {
    color: "rgba(239,210,176,.5)",
    fontSize: "clamp(17px,2vw,23px)",
    marginBottom: "2rem",
    fontFamily: TNR,
  },
  foot: {
    background: C.nb,
    textAlign: "center",
    padding: "1.4rem",
    fontSize: 14,
    color: "rgba(239,210,176,.3)",
    fontFamily: TNR,
  },
  msgWrap: {
    padding: "0.8rem 5%",
    maxWidth: 1200,
    margin: "0 auto",
  },
};

const LETTERS = ["P", "r", "o", "C", "o", "d", "e", "r", "s"];
const FEATURES = [
  ["Adaptive quiz system", "Topic-based quizzes with difficulty levels, time tracking, and instant feedback."],
  ["Weak area detection", "Auto-categorizes topics as weak, moderate, or strong from your performance."],
  ["Smart recommendations", "Suggests what to practice next based on your lowest-mastery concepts."],
  ["Live dashboard", "Accuracy trends, progress, and concept readiness in one place."],
  ["Placement readiness score", "A single score built from speed, accuracy, and consistency."],
];

const STEPS = [
  ["01", "Pick subject"],
  ["02", "Take quiz"],
  ["03", "Adaptive analysis"],
  ["04", "Weak area focus"],
  ["05", "Improve score"],
  ["06", "Track dashboard"],
];

const STATS = [
  ["10K+", "Practice sessions"],
  ["94%", "Readiness uplift"],
  ["200+", "Question concepts"],
  ["3x", "Faster diagnosis"],
];

const TAGS = [
  "React",
  "FastAPI",
  "MongoDB",
  "Adaptive Selector",
  "Analytics Engine",
  "REST API",
];

function App() {
  const pageRef = useRef(null);
  const [showIntro, setShowIntro] = useState(true);
  const [progressPct, setProgressPct] = useState(0);
  const [visibleLetters, setVisibleLetters] = useState(Array(LETTERS.length).fill(false));
  const [currentUser, setCurrentUser] = useState(loadStoredUser);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [tab, setTab] = useState("home");
  const [subjects, setSubjects] = useState([]);
  const [isSubjectsLoading, setIsSubjectsLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [isDashboardLoading, setIsDashboardLoading] = useState(false);
  const [activeSubject, setActiveSubject] = useState(null);
  const [globalError, setGlobalError] = useState("");
  const [flowNotice, setFlowNotice] = useState("");
  const [scrollY, setScrollY] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  const hasDashboard = Boolean(dashboard);

  useEffect(() => {
    let start = null;
    const durationMs = 2200;
    const step = (ts) => {
      if (!start) {
        start = ts;
      }

      const pct = Math.min(((ts - start) / durationMs) * 100, 100);
      setProgressPct(pct);

      if (pct < 100) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);

    LETTERS.forEach((_, i) => {
      window.setTimeout(() => {
        setVisibleLetters((curr) => {
          const next = [...curr];
          next[i] = true;
          return next;
        });
      }, 450 + (i * 80));
    });

    const hideTimer = window.setTimeout(() => {
      setShowIntro(false);
    }, 2800);

    return () => {
      window.clearTimeout(hideTimer);
    };
  }, []);

  useEffect(() => {
    if (!currentUser?.id) {
      return;
    }

    void loadSubjects();
  }, [currentUser?.id]);

  useEffect(() => {
    let ticking = false;

    const updateScroll = () => {
      const y = window.scrollY || window.pageYOffset || 0;
      const documentElement = document.documentElement;
      const scrollableHeight = Math.max(1, documentElement.scrollHeight - window.innerHeight);

      setScrollY(y);
      setScrollProgress(Math.max(0, Math.min(1, y / scrollableHeight)));
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScroll);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    updateScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    const root = pageRef.current;

    if (!root) {
      return;
    }

    const revealTargets = Array.from(root.querySelectorAll(".smart-reveal"));

    if (!revealTargets.length) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.16,
        rootMargin: "0px 0px -8% 0px",
      },
    );

    revealTargets.forEach((node) => {
      observer.observe(node);
    });

    return () => {
      observer.disconnect();
    };
  }, [tab, isSubjectsLoading, isDashboardLoading, subjects.length, hasDashboard]);

  const latestReadiness = useMemo(() => {
    return Math.round(dashboard?.performance?.readiness_score ?? 0);
  }, [dashboard]);

  const readinessBars = useMemo(() => {
    if (!dashboard?.performance) {
      return [
        ["Aptitude readiness", 78],
        ["Coding readiness", 65],
        ["Interview readiness", 82],
      ];
    }

    const avgTime = dashboard.performance.avg_time ?? 0;
    const speedScore = Math.max(10, Math.min(100, Math.round(100 - (avgTime * 3.2))));

    return [
      ["Readiness score", Math.round(dashboard.performance.readiness_score ?? 0)],
      ["Accuracy", Math.round(dashboard.performance.accuracy ?? 0)],
      ["Speed index", speedScore],
    ];
  }, [dashboard]);

  const loadSubjects = async () => {
    try {
      setGlobalError("");
      setIsSubjectsLoading(true);
      const data = await getSubjects();
      setSubjects(data.subjects || []);
    } catch (err) {
      setGlobalError(err instanceof Error ? err.message : "Unable to load subjects.");
    } finally {
      setIsSubjectsLoading(false);
    }
  };

  const loadDashboard = async (userId = currentUser?.id, options = {}) => {
    const silent = options.silent === true;

    if (!userId) {
      return null;
    }

    try {
      if (!silent) {
        setGlobalError("");
        setIsDashboardLoading(true);
      }

      const data = await getDashboard(userId);
      setDashboard(data);
      return data;
    } catch (err) {
      if (!silent) {
        setGlobalError(err instanceof Error ? err.message : "Unable to load dashboard.");
      }
      return null;
    } finally {
      if (!silent) {
        setIsDashboardLoading(false);
      }
    }
  };

  const handleAuthSuccess = async (user) => {
    if (!user?.id) {
      setGlobalError("Auth succeeded but user details are missing.");
      return;
    }

    setGlobalError("");
    setFlowNotice("");
    setCurrentUser(user);
    setIsAuthOpen(false);
    setTab("subjects");
    setDashboard(null);
    setActiveSubject(null);

    try {
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } catch {
      // No-op when localStorage is unavailable.
    }

    const dashboardData = await loadDashboard(user.id, { silent: true });
    void loadSubjects();

    const attempts = dashboardData?.performance?.attempts ?? 0;
    if (attempts > 0) {
      setTab("dashboard");
      setFlowNotice(`Welcome back ${user.name || user.id}. Continue from your dashboard.`);
      return;
    }

    setTab("subjects");
    setFlowNotice(`Welcome ${user.name || user.id}. Pick a subject to start your first adaptive quiz.`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAuthOpen(false);
    setDashboard(null);
    setSubjects([]);
    setActiveSubject(null);
    setTab("home");
    setGlobalError("");
    setFlowNotice("You have been logged out.");

    try {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
      // No-op when localStorage is unavailable.
    }
  };

  const openAuth = (notice = "") => {
    setGlobalError("");
    setTab("home");
    setIsAuthOpen(true);

    if (notice) {
      setFlowNotice(notice);
    }
  };

  const goHome = () => {
    setTab("home");

    if (!currentUser) {
      setIsAuthOpen(false);
    }
  };

  const goSmartStart = () => {
    if (!currentUser?.id) {
      openAuth("Create an account or login to begin your adaptive prep journey.");
      return;
    }

    if (activeSubject) {
      setTab("quiz");
      setFlowNotice("Continue your active quiz session.");
      return;
    }

    const attempts = dashboard?.performance?.attempts ?? 0;
    if (attempts > 0) {
      void goDashboard();
      return;
    }

    goSubjects();
  };

  const goDashboard = async () => {
    if (!currentUser?.id) {
      openAuth();
      return;
    }

    setTab("dashboard");
    await loadDashboard();
  };

  const goSubjects = () => {
    if (!currentUser?.id) {
      openAuth("Login to unlock subjects and start your quiz.");
      return;
    }

    setTab("subjects");

    if (!dashboard && !isDashboardLoading) {
      void loadDashboard();
    }
  };

  const startSubjectQuiz = (subject) => {
    setGlobalError("");
    setFlowNotice("");
    setActiveSubject(subject);
    setTab("quiz");
  };

  const handleQuizComplete = async () => {
    const dashboardData = await loadDashboard();
    if (dashboardData) {
      setTab("dashboard");
      setFlowNotice("Great work. Your latest quiz insights are ready in the dashboard.");
    }
  };

  const tabStyle = (target) => {
    return tab === target ? styles.tabBtnActive : styles.tabBtn;
  };

  const renderHome = () => {
    const heroLift = Math.min(scrollY * 0.22, 96);
    const statLift = Math.min(scrollY * 0.1, 18);

    return (
      <>
        <div style={styles.hero} className="smart-hero">
          <div style={styles.heroIn} className="smart-hero-grid">
            <div className="smart-reveal smart-hero-copy" style={{ transform: `translate3d(0, ${heroLift * -0.18}px, 0)` }}>
              <div style={styles.badge}>
                <span style={{ width: 6, height: 6, background: C.g, borderRadius: "50%", display: "inline-block" }} />
                AI-powered adaptive learning
              </div>
              <h1 style={styles.h1}>
                Learn smarter.
                <br />
                Get <span style={{ color: C.g }}>placement ready</span>.
              </h1>
              <p style={styles.heroP}>
                SmartPrep AI identifies your weak areas, adapts question flow live, and tracks your readiness with every session.
              </p>
              <div style={styles.row}>
                <button style={styles.btng} onClick={goSmartStart}>Explore subjects</button>
                <button style={styles.btngh} onClick={goDashboard}>Open dashboard</button>
              </div>
              <div className="smart-scroll-cue" style={{ opacity: Math.max(0.26, 1 - (scrollY / 360)) }}>
                <span className="smart-scroll-dot" />
                Scroll to explore more
              </div>
            </div>

            <div className="smart-reveal smart-delay-1 smart-hero-metrics" style={{ transform: `translate3d(0, ${heroLift * 0.14}px, 0)` }}>
              <div style={styles.card} className="smart-glass-card">
                <div style={styles.ct}>Readiness snapshot</div>
                {readinessBars.map(([label, width]) => (
                  <div key={label} style={{ marginBottom: "0.95rem" }}>
                    <div style={styles.bm}>
                      <span>{label}</span>
                      <span style={{ color: C.g }}>{width}%</span>
                    </div>
                    <div style={styles.bb}><div style={styles.bf(width)} /></div>
                  </div>
                ))}
                <div style={styles.sr}>
                  <small style={styles.srSm}>Overall placement score</small>
                  <span style={styles.scoreNum}>
                    {latestReadiness}
                    <span style={{ fontSize: 18, fontWeight: 500, color: "rgba(239,210,176,.4)" }}>%</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ ...styles.stats, transform: `translate3d(0, ${statLift}px, 0)` }} className="smart-stats-strip smart-reveal smart-delay-1">
          {STATS.map(([n, label], i) => (
            <div
              key={label}
              style={{ ...styles.stat, borderRight: i < STATS.length - 1 ? "1px solid rgba(26,50,99,.1)" : "none" }}
              className="smart-stat-card"
            >
              <div style={styles.statN}>{n}</div>
              <div style={styles.statL}>{label}</div>
            </div>
          ))}
        </div>

        <section style={styles.sec()} className="smart-section smart-reveal smart-delay-2">
          <div style={styles.inn}>
            <div style={styles.ey(false)}>Key features</div>
            <div style={styles.st2(false)}>Everything to crack placements</div>
            <div style={styles.sb(false)}>Five intelligent systems to make your prep focused and effective.</div>
            <div style={styles.grid}>
              {FEATURES.map(([title, desc]) => (
                <div key={title} style={styles.fc} className="smart-feature-card">
                  <h3 style={styles.fcH3}>{title}</h3>
                  <p style={styles.fcP}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={styles.sec(C.n)} className="smart-section-dark smart-reveal smart-delay-3">
          <div style={styles.inn}>
            <div style={styles.ey(true)}>System overview</div>
            <div style={styles.st2(true)}>How SmartPrep AI works</div>
            <div style={styles.sb(true)}>A 6-step loop that turns quiz results into personalized practice.</div>
            <div style={styles.steps}>
              {STEPS.map(([num, label], i) => (
                <div key={num} style={{ ...styles.step, position: "relative" }} className="smart-step-card">
                  {i < STEPS.length - 1 ? (
                    <span style={{ position: "absolute", right: -4, top: 16, fontSize: 19, color: "rgba(255,197,112,.3)" }}>
                      &gt;
                    </span>
                  ) : null}
                  <div style={styles.sc}>{num}</div>
                  <div style={styles.sn2}>{num}</div>
                  <div style={styles.sl}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={styles.sec(C.c)} className="smart-reveal smart-delay-4">
          <div style={styles.inn}>
            <div style={styles.ey(false)}>Technology stack</div>
            <div style={styles.st2(false)}>Built with modern tools</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.55rem", marginTop: "0.4rem" }}>
              {TAGS.map((tag) => <span key={tag} style={styles.tag} className="smart-tech-tag">{tag}</span>)}
            </div>
          </div>
        </section>

        <section style={styles.ctaSec} className="smart-cta smart-reveal smart-delay-4">
          <h2 style={styles.ctaH2}>
            Ready to ace your <span style={{ color: C.g }}>placements</span>?
          </h2>
          <p style={styles.ctaP}>Practice daily, adapt faster, and build confidence with clear progress.</p>
          <div style={{ ...styles.row, justifyContent: "center" }}>
            <button style={styles.btng} onClick={goSmartStart}>Start now</button>
            <button style={styles.btngh} onClick={goDashboard}>View dashboard</button>
          </div>
        </section>
      </>
    );
  };

  const renderSubjects = () => {
    const chapterRecommendations = dashboard?.chapter_recommendations || [];

    return (
      <section style={styles.sec()} className="smart-section smart-reveal">
        <div style={styles.inn}>
          <div style={styles.ey(false)}>Subject browser</div>
          <div style={styles.st2(false)}>Choose a subject and begin adaptive practice</div>
          <div style={styles.sb(false)}>Click a subject to launch Live Quiz with easy-to-hard progression.</div>

          <div style={styles.grid}>
            {isSubjectsLoading ? (
              <div style={styles.fc} className="smart-feature-card">
                <h3 style={styles.fcH3}>Loading subjects...</h3>
                <p style={styles.fcP}>Fetching quiz topics from backend.</p>
              </div>
            ) : subjects.length ? (
              subjects.map((subject) => {
                const subjectRecommendations = chapterRecommendations.filter(
                  (item) => item.subject_id === subject.id,
                );

                return (
                  <div key={subject.id} style={styles.fc} className="smart-feature-card smart-subject-card">
                    <div style={styles.subjectHeadRow}>
                      <h3 style={styles.fcH3}>{subject.name}</h3>
                      {subjectRecommendations.length ? (
                        <span style={styles.recBadge}>
                          {subjectRecommendations.length} focus topic{subjectRecommendations.length > 1 ? "s" : ""}
                        </span>
                      ) : (
                        <span style={styles.recBadgeQuiet}>No focus topics</span>
                      )}
                    </div>
                    <p style={styles.fcP}>{subject.description}</p>
                    <button style={styles.btn} onClick={() => startSubjectQuiz(subject)}>Start Subject Quiz</button>
                  </div>
                );
              })
            ) : (
              <div style={styles.fc} className="smart-feature-card">
                <h3 style={styles.fcH3}>No subjects available</h3>
                <p style={styles.fcP}>Try reloading subjects.</p>
                <button style={styles.btn} onClick={() => { void loadSubjects(); }}>Reload</button>
              </div>
            )}
          </div>
        </div>
      </section>
    );
  };

  const renderDashboard = () => {
    if (isDashboardLoading) {
      return (
        <section style={styles.sec()} className="smart-section smart-reveal">
          <div style={styles.inn}>
            <div style={styles.fc} className="smart-feature-card">
              <h3 style={styles.fcH3}>Loading dashboard...</h3>
              <p style={styles.fcP}>Crunching analytics and readiness trends.</p>
            </div>
          </div>
        </section>
      );
    }

    if (!dashboard) {
      return (
        <section style={styles.sec()} className="smart-section smart-reveal">
          <div style={styles.inn}>
            <div style={styles.fc} className="smart-feature-card">
              <h3 style={styles.fcH3}>No dashboard data yet</h3>
              <p style={styles.fcP}>Complete at least one quiz session to generate analytics.</p>
              <button style={styles.btn} onClick={goSubjects}>Go to Subjects</button>
            </div>
          </div>
        </section>
      );
    }

    const weakAreas = dashboard.weak_areas || [];
    const weakTopicsBySubject = dashboard.weak_topics_by_subject || [];
    const strongAreas = dashboard.strong_areas || [];
    const masteryItems = Object.entries(dashboard.concept_mastery || {});
    const topicRecommendations = dashboard.chapter_recommendations || [];
    const recommendationLookup = new Map(
      topicRecommendations.map((item) => [
        `${item.subject_id}::${item.topic || item.concept}`,
        item,
      ]),
    );

    return (
      <section style={styles.sec()} className="smart-section smart-reveal">
        <div style={styles.inn}>
          <div style={styles.ey(false)}>Performance dashboard</div>
          <div style={styles.st2(false)}>Track readiness, mastery, and weak topics by subject</div>
          <div style={styles.sb(false)}>Live stats and topic links update after quiz completion.</div>

          <div style={styles.grid}>
            <div style={styles.fc} className="smart-feature-card">
              <h3 style={styles.fcH3}>Readiness Score</h3>
              <p style={styles.fcP}>{Math.round(dashboard.performance.readiness_score)}%</p>
            </div>
            <div style={styles.fc} className="smart-feature-card">
              <h3 style={styles.fcH3}>Overall Accuracy</h3>
              <p style={styles.fcP}>{Math.round(dashboard.performance.accuracy)}%</p>
            </div>
            <div style={styles.fc} className="smart-feature-card">
              <h3 style={styles.fcH3}>Total Attempts</h3>
              <p style={styles.fcP}>{dashboard.performance.attempts}</p>
            </div>
            <div style={styles.fc} className="smart-feature-card">
              <h3 style={styles.fcH3}>Average Speed</h3>
              <p style={styles.fcP}>{dashboard.performance.avg_time}s</p>
            </div>
          </div>

          <div style={{ ...styles.grid, marginTop: "1rem" }}>
            <div style={styles.fc} className="smart-feature-card">
              <h3 style={styles.fcH3}>Weak Areas</h3>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {weakAreas.length ? weakAreas.map((topic) => <span key={topic} style={styles.tag}>{topic}</span>) : <span style={styles.fcP}>No weak areas yet.</span>}
              </div>
            </div>
            <div style={styles.fc} className="smart-feature-card">
              <h3 style={styles.fcH3}>Strong Areas</h3>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {strongAreas.length ? strongAreas.map((topic) => <span key={topic} style={styles.tag}>{topic}</span>) : <span style={styles.fcP}>No strong areas yet.</span>}
              </div>
            </div>
          </div>

          <div style={{ ...styles.fc, marginTop: "1rem" }} className="smart-feature-card">
            <h3 style={styles.fcH3}>Weak Topics by Subject</h3>
            {weakTopicsBySubject.length ? (
              <div style={{ display: "grid", gap: "0.75rem" }}>
                {weakTopicsBySubject.map((group) => (
                  <div
                    key={group.subject_id}
                    style={{
                      border: "1px solid rgba(84,119,146,.18)",
                      borderRadius: 10,
                      padding: "0.75rem 0.85rem",
                      background: "linear-gradient(160deg, #ffffff, #fff8eb)",
                    }}
                  >
                    <p style={{ ...styles.recTitle, fontSize: 18, margin: 0 }}>{group.subject_name}</p>
                    <div style={{ display: "flex", gap: "0.45rem", flexWrap: "wrap", marginTop: "0.55rem" }}>
                      {group.topics.map((topicItem) => {
                        const recommendation = recommendationLookup.get(
                          `${group.subject_id}::${topicItem.topic}`,
                        );

                        return recommendation ? (
                          <a
                            key={`${group.subject_id}-${topicItem.topic}`}
                            href={recommendation.url}
                            target="_blank"
                            rel="noreferrer"
                            style={{ textDecoration: "none" }}
                            title={`Open ${recommendation.chapter_title}`}
                          >
                            <span style={styles.tag}>{topicItem.topic} ({Math.round(topicItem.mastery)}%)</span>
                          </a>
                        ) : (
                          <span key={`${group.subject_id}-${topicItem.topic}`} style={styles.tag}>
                            {topicItem.topic} ({Math.round(topicItem.mastery)}%)
                          </span>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={styles.fcP}>Complete more attempts to detect weak topics by subject.</p>
            )}
          </div>

          <div style={{ ...styles.fc, marginTop: "1rem" }} className="smart-feature-card">
            <h3 style={styles.fcH3}>Concept Mastery</h3>
            {masteryItems.length ? (
              masteryItems.map(([concept, value]) => (
                <div key={concept} style={{ marginBottom: "0.75rem" }}>
                  <div style={{ ...styles.bm, color: C.n }}>
                    <span>{concept}</span>
                    <span>{Math.round(value)}%</span>
                  </div>
                  <div style={{ ...styles.bb, background: "rgba(84,119,146,.16)" }}>
                    <div style={{ ...styles.bf(value), background: `linear-gradient(90deg,${C.s},${C.g})` }} />
                  </div>
                </div>
              ))
            ) : (
              <p style={styles.fcP}>No concept mastery data yet.</p>
            )}
          </div>

          <div style={{ ...styles.fc, marginTop: "1rem" }} className="smart-feature-card">
            <h3 style={styles.fcH3}>Topic Focus Recommendations</h3>
            <p style={styles.fcP}>{dashboard.revision_message || "Use these links to improve weak topics."}</p>
            {topicRecommendations.length ? (
              <div style={styles.recList}>
                {topicRecommendations.map((item) => {
                  const topicLabel = item.topic || item.concept;
                  return (
                    <a
                      key={`${item.subject_id}-${topicLabel}-${item.url}`}
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      style={styles.recCard}
                      className="smart-recommend-link"
                    >
                      <span style={styles.recTitle}>{item.chapter_title}</span>
                      <span style={styles.recMeta}>{item.subject_name} • {topicLabel}</span>
                      <span style={styles.recMeta}>{item.why}</span>
                      <span style={styles.recAction}>{item.action}</span>
                    </a>
                  );
                })}
              </div>
            ) : (
              <p style={styles.fcP}>No topic recommendations yet. Complete one quiz to generate them.</p>
            )}
          </div>

          <div style={{ marginTop: "1rem", display: "flex", gap: "0.7rem", flexWrap: "wrap" }}>
            <button style={styles.btn} onClick={goSubjects}>Practice More</button>
            <button style={styles.btn} onClick={() => { void loadDashboard(); }}>Refresh Dashboard</button>
          </div>
        </div>
      </section>
    );
  };

  const renderTabContent = () => {
    if (!currentUser) {
      if (isAuthOpen) {
        return <LoginSignup onAuthSuccess={handleAuthSuccess} />;
      }

      return renderHome();
    }

    if (tab === "subjects") {
      return renderSubjects();
    }

    if (tab === "dashboard") {
      return renderDashboard();
    }

    return renderHome();
  };

  const isQuizTab = tab === "quiz" && Boolean(activeSubject);

  return (
    <div className="smart-shell" ref={pageRef}>
      <div style={styles.intro(showIntro)}>
        <div style={{ position: "relative", zIndex: 2, textAlign: "center" }}>
          <div style={styles.iline} />
          <div style={styles.ibrand}>
            {LETTERS.map((letter, i) => (
              <span
                key={letter + i}
                style={{
                  color: i >= 3 ? C.g : C.c,
                  opacity: visibleLetters[i] ? 1 : 0,
                  transform: visibleLetters[i] ? "translateY(0)" : "translateY(36px)",
                  transition: "opacity .5s, transform .5s",
                }}
              >
                {letter}
              </span>
            ))}
          </div>
          <div style={styles.itag}>Adaptive Learning and Placement Readiness</div>
        </div>
        <div style={styles.ibar(progressPct)} />
      </div>

      <div className="smart-scroll-progress" aria-hidden="true">
        <span className="smart-scroll-progress-bar" style={{ transform: `scaleX(${scrollProgress || 0})` }} />
      </div>

      <nav style={styles.nav} className="smart-nav">
        <div style={styles.logo} className="smart-logo">Smart<span style={{ color: C.s }}>Prep</span> AI</div>
        <div style={styles.navLinks}>
          {currentUser ? <span className="user-chip">{currentUser.name || currentUser.id}</span> : null}
          <button
            type="button"
            style={tabStyle("home")}
            className="smart-nav-btn"
            onClick={goHome}
          >
            Home
          </button>
          {currentUser ? (
            <>
              <button type="button" style={tabStyle("subjects")} className="smart-nav-btn" onClick={goSubjects}>Subjects</button>
              <button type="button" style={tabStyle("dashboard")} className="smart-nav-btn" onClick={goDashboard}>Dashboard</button>
              <button type="button" style={styles.tabBtn} className="smart-nav-btn" onClick={handleLogout}>Logout</button>
            </>
          ) : null}
          <button type="button" style={styles.btn} className="smart-nav-cta" onClick={() => {
            goSmartStart();
          }}>Get started</button>
        </div>
      </nav>

      {flowNotice ? (
        <div style={styles.msgWrap}>
          <p className="info-banner">{flowNotice}</p>
        </div>
      ) : null}

      {globalError ? (
        <div style={styles.msgWrap}>
          <p className="error-banner">{globalError}</p>
        </div>
      ) : null}

      {isQuizTab ? (
        <main className="app-shell quiz-layout smart-quiz-layout">
          <section className="app-panel app-panel-wide smart-quiz-panel">
            <header className="quiz-header-strip">
              <div>
                <p className="kicker">Live Quiz Session</p>
                <h2>Adaptive Mode: {activeSubject?.name}</h2>
              </div>
              <div className="quiz-header-actions">
                <button className="ghost-btn" onClick={goSubjects}>Back to Subjects</button>
                <button className="ghost-btn" onClick={() => setTab("home")}>Home</button>
              </div>
            </header>

            <Quiz
              user={currentUser}
              subject={activeSubject}
              onExit={goSubjects}
              onComplete={handleQuizComplete}
            />
          </section>
        </main>
      ) : (
        renderTabContent()
      )}

      <footer style={styles.foot}>
        <span style={{ color: "rgba(255,197,112,.4)" }}>SmartPrep AI</span>
        {" "}
        Adaptive Learning and Placement Readiness
      </footer>
    </div>
  );
}

export default App;
