import { Link } from "react-router-dom";
import {
    ArrowLeft,
    Compass,
    FileText,
    ShieldCheck,
    Users,
    MessageCircle,
    MapPin,
    Ban,
    UserRound,
    Scale,
} from "lucide-react";
import "./LegalPages.css";

const sections = [
    {
        id: "acceptance",
        icon: FileText,
        title: "1. Acceptance of These Terms",
        content: (
            <>
                <p>
                    These Terms of Service govern your access to and use of
                    Nexora, a platform designed to help people discover
                    others with shared interests, professional goals, and
                    learning interests.
                </p>
                <p>
                    By accessing or using Nexora, you agree to follow these
                    terms and applicable laws. If you do not agree with
                    these terms, do not use the platform.
                </p>
            </>
        ),
    },
    {
        id: "eligibility",
        icon: UserRound,
        title: "2. Eligibility and Accounts",
        content: (
            <>
                <p>When creating and using a Nexora account, you agree to:</p>
                <ul>
                    <li>Provide accurate information to the best of your knowledge.</li>
                    <li>Keep your account credentials private.</li>
                    <li>
                        Notify the Nexora team if you suspect unauthorized
                        access to your account.
                    </li>
                    <li>
                        Use only accounts you are authorized to access.
                    </li>
                    <li>
                        Meet the minimum age requirements that apply to
                        the service and your location.
                    </li>
                </ul>
                <p>
                    Do not impersonate another person or misrepresent your
                    identity, qualifications, interests, or intentions.
                </p>
            </>
        ),
    },
    {
        id: "platform",
        icon: Compass,
        title: "3. Using the Nexora Platform",
        content: (
            <>
                <p>
                    Nexora provides features for discovering profiles,
                    exploring shared interests, sending connection requests,
                    managing connections, and communicating with other users.
                </p>
                <p>
                    You agree to use these features for lawful purposes and
                    in a way that respects other users' choices and privacy.
                    Access to particular features may depend on account
                    status, available functionality, and platform rules.
                </p>
            </>
        ),
    },
    {
        id: "conduct",
        icon: ShieldCheck,
        title: "4. Respectful and Acceptable Conduct",
        content: (
            <>
                <p>You must not use Nexora to:</p>
                <ul>
                    <li>
                        Harass, threaten, intimidate, stalk, or repeatedly
                        contact someone who does not wish to communicate.
                    </li>
                    <li>
                        Share unlawful, abusive, fraudulent, or deliberately
                        misleading content.
                    </li>
                    <li>
                        Impersonate another person or create accounts for
                        deceptive purposes.
                    </li>
                    <li>
                        Collect, publish, or misuse another user's personal
                        information without appropriate authorization.
                    </li>
                    <li>
                        Attempt to bypass access controls, interfere with
                        the platform, or gain unauthorized access to accounts
                        or systems.
                    </li>
                    <li>
                        Use Nexora to distribute spam, scams, malicious
                        content, or unsolicited promotional material in
                        violation of platform rules.
                    </li>
                </ul>
            </>
        ),
    },
    {
        id: "connections",
        icon: Users,
        title: "5. Connection Requests and Interactions",
        content: (
            <>
                <p>
                    Nexora allows users to request and accept connections.
                    Sending a request does not guarantee that another user
                    will accept it or respond.
                </p>
                <p>
                    You must respect another user's decision to decline a
                    request, end a connection, or stop communicating. Do not
                    use alternative accounts or other methods to evade
                    another user's boundaries or platform restrictions.
                </p>
                <p>
                    Users are responsible for exercising their own judgment
                    when deciding whom to connect with and what information
                    to share.
                </p>
            </>
        ),
    },
    {
        id: "messages",
        icon: MessageCircle,
        title: "6. Messages and User Content",
        content: (
            <>
                <p>
                    You are responsible for the content you submit, upload,
                    or send through Nexora, including profile information,
                    messages, and images.
                </p>
                <ul>
                    <li>
                        Do not send threats, harassment, scams, or unlawful
                        material.
                    </li>
                    <li>
                        Do not share another person's private information
                        without an appropriate basis or authorization.
                    </li>
                    <li>
                        Do not send sensitive information to people you do
                        not trust.
                    </li>
                </ul>
                <p>
                    Other participants may retain or capture information
                    you share with them. Do not assume that messages are
                    confidential, end-to-end encrypted, or automatically
                    deleted unless the platform explicitly provides and
                    documents those features.
                </p>
            </>
        ),
    },
    {
        id: "location",
        icon: MapPin,
        title: "7. Location and Discovery",
        content: (
            <>
                <p>
                    Nexora offers location-related discovery features to
                    help users find relevant profiles. Discovery results
                    may depend on location information, profile details,
                    and user preferences.
                </p>
                <p>
                    You must not use Nexora to track, stalk, intimidate,
                    or attempt to identify another user's private location.
                    Do not misuse location-related information or attempt
                    to bypass privacy protections.
                </p>
                <p>
                    Location-based discovery is not a guarantee of another
                    user's identity, safety, availability, or exact
                    whereabouts. Exercise caution when interacting with
                    people you meet through the platform.
                </p>
            </>
        ),
    },
    {
        id: "reports",
        icon: ShieldCheck,
        title: "8. Reports, Evidence, and Moderation",
        content: (
            <>
                <p>
                    Nexora provides a reporting mechanism for users to
                    raise concerns about accounts or behavior.
                </p>
                <p>
                    When submitting a report, provide truthful information
                    and relevant evidence. Do not knowingly submit fabricated
                    evidence or use reporting tools to harass another user.
                </p>
                <p>
                    Authorized administrators may review reports and
                    supporting evidence to assess potential violations and
                    determine appropriate action under applicable platform
                    rules.
                </p>
                <p>
                    Submitting a report does not guarantee a particular
                    outcome. Do not attempt to access administrative
                    information or evidence that you are not authorized
                    to view.
                </p>
            </>
        ),
    },
    {
        id: "suspension",
        icon: Ban,
        title: "9. Restrictions and Account Suspension",
        content: (
            <>
                <p>
                    Where permitted by applicable law, Nexora may restrict,
                    suspend, or terminate an account when there are
                    reasonable grounds to believe that the account has
                    violated these terms, threatens user safety, or is
                    being used for unlawful or abusive activity.
                </p>
                <p>
                    Depending on the circumstances, restrictions may be
                    temporary or permanent. Any review or appeal process
                    will depend on the procedures actually offered by
                    Nexora.
                </p>
                <p>
                    Do not create or use another account to evade an
                    active suspension or other account restriction.
                </p>
            </>
        ),
    },
    {
        id: "third-party",
        icon: Scale,
        title: "10. Third-Party Services",
        content: (
            <>
                <p>
                    Nexora may depend on third-party infrastructure or
                    services to provide certain functionality, such as
                    database hosting, image storage, and delivery.
                </p>
                <p>
                    Third-party services may be subject to their own terms
                    and privacy policies. Nexora's use of these services
                    does not mean that Nexora controls every aspect of
                    their operation.
                </p>
            </>
        ),
    },
    {
        id: "availability",
        icon: FileText,
        title: "11. Availability and Changes",
        content: (
            <>
                <p>
                    Features, availability, and functionality may change
                    as Nexora is maintained and developed. We will aim to
                    maintain the service, but uninterrupted availability
                    cannot be guaranteed.
                </p>
                <p>
                    Where permitted by law, Nexora may update, modify,
                    suspend, or discontinue features when reasonably
                    necessary for maintenance, security, operational
                    requirements, or product development.
                </p>
            </>
        ),
    },
    {
        id: "liability",
        icon: Scale,
        title: "12. Responsibility and Applicable Law",
        content: (
            <>
                <p>
                    You are responsible for your use of Nexora and your
                    interactions with other users. Use appropriate judgment
                    when sharing information or arranging to meet someone
                    you discovered through the platform.
                </p>
                <p>
                    Nothing in these terms is intended to exclude or limit
                    rights or responsibilities that cannot legally be
                    excluded or limited. Any applicable limitations of
                    liability, dispute-resolution provisions, and governing
                    law should be finalized to reflect Nexora's operating
                    arrangements and applicable law.
                </p>
            </>
        ),
    },
    {
        id: "changes-terms",
        icon: FileText,
        title: "13. Changes to These Terms",
        content: (
            <>
                <p>
                    These terms may be revised as Nexora's features,
                    policies, or legal obligations evolve. The published
                    version should identify its effective date.
                </p>
                <p>
                    Where required, users will be notified of material
                    changes through an appropriate communication channel.
                    Continued use of the service will be subject to the
                    updated terms to the extent permitted by applicable law.
                </p>
            </>
        ),
    },
];

function TermsOfService() {
    return (
        <main className="legal-page">
            <header className="legal-header">
                <Link to="/" className="legal-brand">
                    <span className="legal-brand-icon">
                        <Compass size={22} />
                    </span>
                    <span>
                        NEXORA<span className="legal-brand-period">.</span>
                    </span>
                </Link>

                <Link to="/" className="legal-back-link">
                    <ArrowLeft size={16} />
                    Back to home
                </Link>
            </header>

            <section className="legal-hero">
                <div className="legal-hero-icon">
                    <FileText size={28} />
                </div>

                <span className="legal-eyebrow">
                    CLEAR RULES. BETTER CONNECTIONS.
                </span>

                <h1>
                    Terms of <span>Service</span>
                </h1>

                <p>
                    The guidelines and responsibilities that help make
                    Nexora a respectful place to discover people, build
                    connections, and communicate.
                </p>

                <div className="legal-effective-date">
                    <span className="legal-status-dot" />
                    Draft terms · Review before publication
                </div>
            </section>

            <div className="legal-layout">
                <aside className="legal-toc">
                    <h2>On this page</h2>

                    <nav aria-label="Terms of Service sections">
                        {sections.map((section) => (
                            <a
                                key={section.id}
                                href={`#${section.id}`}
                            >
                                {section.title}
                            </a>
                        ))}
                    </nav>
                </aside>

                <article className="legal-content">
                    <div className="legal-notice">
                        <ShieldCheck size={20} />
                        <p>
                            These terms are a draft for Nexora. Review
                            them against your actual platform policies
                            and applicable legal requirements before
                            publishing them as the official terms.
                        </p>
                    </div>

                    <p className="legal-intro">
                        Our goal is to help people discover others with
                        shared interests, professional ambitions, and
                        learning goals. These terms explain the basic
                        responsibilities associated with using Nexora.
                    </p>

                    {sections.map((section) => {
                        const Icon = section.icon;

                        return (
                            <section
                                className="legal-section"
                                id={section.id}
                                key={section.id}
                            >
                                <div className="legal-section-heading">
                                    <span className="legal-section-icon">
                                        <Icon size={20} />
                                    </span>

                                    <h2>{section.title}</h2>
                                </div>

                                <div className="legal-section-body">
                                    {section.content}
                                </div>
                            </section>
                        );
                    })}

                    <section className="legal-contact">
                        <div className="legal-contact-icon">
                            <MessageCircle size={22} />
                        </div>

                        <h2>Questions about these terms?</h2>

                        <p>
                            Contact the Nexora team through the official
                            contact channel provided by the platform.
                            Add a verified contact address before
                            publishing the final terms.
                        </p>

                        <Link to="/" className="legal-home-button">
                            Return to Nexora
                            <ArrowLeft size={16} />
                        </Link>
                    </section>
                </article>
            </div>

            <footer className="legal-footer">
                <Link to="/" className="legal-footer-brand">
                    NEXORA<span>.</span>
                </Link>

                <div className="legal-footer-links">
                    <Link to="/privacy-policy">
                        Privacy Policy
                    </Link>

                    <Link
                        to="/terms-of-service"
                        aria-current="page"
                    >
                        Terms of Service
                    </Link>
                </div>

                <span className="legal-footer-copy">
                    © {new Date().getFullYear()} Nexora
                </span>
            </footer>
        </main>
    );
}

export default TermsOfService;