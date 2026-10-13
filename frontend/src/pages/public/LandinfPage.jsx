import { lazy, Suspense, useState } from "react";
import { Link } from "react-router-dom";
import {
    ArrowDown,
    ArrowRight,
    Compass,
    GraduationCap,
    Heart,
    Menu,
    ShieldCheck,
    Sparkles,
    Users,
    X,
} from "lucide-react";
import { motion } from "framer-motion";
import "./LandingPage.css";

const Hero3D = lazy(
    () => import("../../components/landing/Hero3D")
);

const features = [
    {
        icon: Compass,
        number: "01",
        title: "Discover beyond your circle",
        description:
            "Find people nearby who share your interests, ambitions, and curiosity.",
        accent: "violet",
    },
    {
        icon: Users,
        number: "02",
        title: "Build meaningful connections",
        description:
            "Meet potential friends, professional connections, and learning partners.",
        accent: "cyan",
    },
    {
        icon: ShieldCheck,
        number: "03",
        title: "Your privacy comes first",
        description:
            "Explore at your own pace with privacy-conscious discovery and connection controls.",
        accent: "pink",
    },
];

const connectionTypes = [
    {
        icon: Heart,
        title: "Friends",
        description: "Meet people who share your interests and energy.",
    },
    {
        icon: Sparkles,
        title: "Professional",
        description: "Connect with people who inspire your next step.",
    },
    {
        icon: GraduationCap,
        title: "Learning partners",
        description: "Find people to learn, build, and grow alongside.",
    },
];

function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const closeMenu = () => setMenuOpen(false);

    return (
        <header className="landing-header">
            <nav className="landing-nav">
                <Link
                    to="/"
                    className="landing-brand"
                    onClick={closeMenu}
                >
                    <span className="brand-mark">
                        <Compass size={23} strokeWidth={1.8} />
                    </span>
                    <span>NEXORA<span className="brand-period">.</span></span>
                </Link>

                <button
                    className="mobile-menu-toggle"
                    type="button"
                    aria-label={menuOpen ? "Close menu" : "Open menu"}
                    aria-expanded={menuOpen}
                    onClick={() => setMenuOpen(!menuOpen)}
                >
                    {menuOpen ? <X /> : <Menu />}
                </button>

                <div
                    className={`landing-nav-links ${
                        menuOpen ? "is-open" : ""
                    }`}
                >
                    <a href="#home" onClick={closeMenu}>Home</a>
                    <a href="#features" onClick={closeMenu}>Features</a>
                    <a href="#connections" onClick={closeMenu}>Connections</a>
                    <a href="#about" onClick={closeMenu}>About</a>

                    <div className="landing-nav-actions">
                        <Link
                            to="/login"
                            className="landing-login"
                            onClick={closeMenu}
                        >
                            Log in
                        </Link>
                        <Link
                            to="/register"
                            className="landing-register"
                            onClick={closeMenu}
                        >
                            Get started <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>
            </nav>
        </header>
    );
}

function LandingPage() {
    return (
        <main className="nexora-landing">
            <Navbar />

            <section className="landing-hero" id="home">
                <div className="hero-grid" aria-hidden="true" />
                <div className="hero-glow hero-glow-one" aria-hidden="true" />
                <div className="hero-glow hero-glow-two" aria-hidden="true" />

                <div className="hero-content">
                    <motion.div
                        className="hero-eyebrow"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="eyebrow-pulse" />
                        YOUR WORLD, A LITTLE CLOSER
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.75, delay: 0.1 }}
                    >
                        Your next connection
                        <br />
                        is <span>closer than you think.</span>
                    </motion.h1>

                    <motion.p
                        className="hero-description"
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.75, delay: 0.2 }}
                    >
                        Discover people who share your interests, your
                        ambitions, and your next big idea. Your orbit
                        starts here.
                    </motion.p>

                    <motion.div
                        className="hero-actions"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.75, delay: 0.3 }}
                    >
                        <Link
                            to="/register"
                            className="hero-primary-button"
                        >
                            Start connecting <ArrowRight size={18} />
                        </Link>

                        <a
                            href="#features"
                            className="hero-secondary-button"
                        >
                            Explore Nexora <ArrowDown size={16} />
                        </a>
                    </motion.div>

                    <motion.div
                        className="hero-trust-note"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                    >
                        <ShieldCheck size={15} />
                        Discover at your pace. Connect on your terms.
                    </motion.div>
                </div>

                <motion.div
                    className="hero-visual"
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.1, delay: 0.15 }}
                >
                    <div className="visual-top-label">
                        <span className="live-dot" />
                        YOUR CONNECTION UNIVERSE
                    </div>

                    <Suspense
                        fallback={
                            <div className="hero-3d-fallback">
                                <div className="fallback-orbit">
                                    <div className="fallback-core">
                                        N
                                    </div>
                                </div>
                            </div>
                        }
                    >
                        <Hero3D />
                    </Suspense>

                    <div className="visual-caption">
                        <span className="caption-icon">
                            <Users size={17} />
                        </span>
                        <span>
                            <strong>Every connection starts somewhere.</strong>
                            <small>Find your people. Expand your orbit.</small>
                        </span>
                    </div>

                    <div className="floating-label floating-label-top">
                        <span className="floating-label-dot violet-dot" />
                        Shared interests
                    </div>

                    <div className="floating-label floating-label-bottom">
                        <span className="floating-label-dot cyan-dot" />
                        New possibilities
                    </div>
                </motion.div>

                <a className="hero-scroll" href="#features">
                    <span>SCROLL TO EXPLORE</span>
                    <ArrowDown size={14} />
                </a>
            </section>

            <section className="landing-features" id="features">
                <div className="section-heading">
                    <span className="section-kicker">THE NEXORA DIFFERENCE</span>
                    <h2>
                        More than a connection.
                        <br />
                        <span>A world of possibilities.</span>
                    </h2>
                    <p>
                        The right people can change how you learn,
                        create, and see the world.
                    </p>
                </div>

                <div className="feature-grid">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;

                        return (
                            <motion.article
                                key={feature.number}
                                className={`feature-card feature-${feature.accent}`}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.2 }}
                                transition={{
                                    duration: 0.55,
                                    delay: index * 0.12,
                                }}
                            >
                                <div className="feature-card-top">
                                    <span className="feature-icon">
                                        <Icon size={23} />
                                    </span>
                                    <span className="feature-number">
                                        {feature.number}
                                    </span>
                                </div>
                                <h3>{feature.title}</h3>
                                <p>{feature.description}</p>
                                <a href="#connections" className="feature-link">
                                    Discover more <ArrowRight size={15} />
                                </a>
                            </motion.article>
                        );
                    })}
                </div>
            </section>

            <section className="landing-connections" id="connections">
                <div className="connection-heading">
                    <span className="section-kicker">YOUR ORBIT, YOUR WAY</span>
                    <h2>
                        Different paths.
                        <br />
                        <span>One place to connect.</span>
                    </h2>
                    <p>
                        Whatever brings you here, there's room for
                        your next connection.
                    </p>
                </div>

                <div className="connection-grid">
                    {connectionTypes.map((type, index) => {
                        const Icon = type.icon;

                        return (
                            <motion.article
                                className="connection-card"
                                key={type.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{
                                    duration: 0.5,
                                    delay: index * 0.12,
                                }}
                            >
                                <span className="connection-icon">
                                    <Icon size={25} />
                                </span>
                                <h3>{type.title}</h3>
                                <p>{type.description}</p>
                            </motion.article>
                        );
                    })}
                </div>
            </section>

            <section className="landing-about" id="about">
                <div className="about-orbit" aria-hidden="true">
                    <div className="about-orbit-ring" />
                    <div className="about-orbit-core">
                        <Compass size={44} />
                    </div>
                    <span className="about-orbit-node node-one" />
                    <span className="about-orbit-node node-two" />
                    <span className="about-orbit-node node-three" />
                </div>

                <div className="about-content">
                    <span className="section-kicker">EXPAND YOUR ORBIT</span>
                    <h2>
                        The next chapter
                        <br />
                        could start with <span>hello.</span>
                    </h2>
                    <p>
                        Start discovering people around you, explore
                        shared interests, and open the door to
                        possibilities you haven't met yet.
                    </p>
                    <Link
                        to="/register"
                        className="hero-primary-button"
                    >
                        Find your people <ArrowRight size={18} />
                    </Link>
                </div>
            </section>

            <footer className="landing-footer">
                <Link to="/" className="landing-brand">
                    <span className="brand-mark">
                        <Compass size={21} />
                    </span>
                    <span>NEXORA<span className="brand-period">.</span></span>
                </Link>

                <p>Expand your orbit. Discover your people.</p>

                <div className="footer-links">
                    <Link to="/login">Log in</Link>
                    <Link to="/register">Create account</Link>
                </div>

                <span className="footer-copyright">
                    © {new Date().getFullYear()} Nexora
                </span>
            </footer>
        </main>
    );
}

export default LandingPage;