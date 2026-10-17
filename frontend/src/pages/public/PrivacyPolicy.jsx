import { Link } from "react-router-dom";
import {
    ArrowLeft,
    Compass,
    ShieldCheck,
    MapPin,
    Users,
    MessageCircle,
    Image as ImageIcon,
    LockKeyhole,
    Eye,
    UserRound,
    FileText,
} from "lucide-react";
import "./LegalPages.css";

const sections = [
    {
        id: "information",
        icon: UserRound,
        title: "1. Information We Collect",
        content: (
            <>
                <p>
                    Nexora may process the following information when you use
                    the platform:
                </p>
                <ul>
                    <li>
                        <strong>Account information:</strong> information such
                        as your name, email address, and authentication
                        credentials required to create and access your account.
                    </li>
                    <li>
                        <strong>Profile information:</strong> details you
                        choose to provide, such as your bio, interests,
                        profile image, skills, professional information, and
                        learning goals.
                    </li>
                    <li>
                        <strong>Location information:</strong> location-related
                        data used by Nexora's nearby discovery features, where
                        provided and supported by your settings and the
                        application's functionality.
                    </li>
                    <li>
                        <strong>Platform activity:</strong> information
                        associated with connection requests, accepted
                        connections, conversations, notifications, and
                        interactions with other users.
                    </li>
                    <li>
                        <strong>Reports and evidence:</strong> information
                        you submit when reporting an account or behavior,
                        including screenshots or other supported images.
                    </li>
                </ul>
                <p>
                    The information collected depends on the features you use
                    and the information you choose to submit.
                </p>
            </>
        ),
    },
    {
        id: "usage",
        icon: Eye,
        title: "2. How We Use Your Information",
        content: (
            <>
                <p>Information may be used to:</p>
                <ul>
                    <li>Create and manage your account and profile.</li>
                    <li>
                        Display profiles that match discovery preferences and
                        location-related criteria.
                    </li>
                    <li>
                        Enable connection requests, accepted connections, and
                        messaging between users.
                    </li>
                    <li>
                        Provide notifications and essential platform features.
                    </li>
                    <li>
                        Review user reports and support moderation decisions.
                    </li>
                    <li>
                        Maintain platform functionality, investigate issues,
                        and protect accounts and services against misuse.
                    </li>
                </ul>
                <p>
                    Nexora should use personal information only for purposes
                    that are applicable to the service and permitted by
                    applicable law.
                </p>
            </>
        ),
    },
    {
        id: "location",
        icon: MapPin,
        title: "3. Location and Nearby Discovery",
        content: (
            <>
                <p>
                    Nexora includes location-based discovery to help users
                    find people nearby. Location information can be sensitive,
                    so it should be handled carefully.
                </p>
                <ul>
                    <li>
                        Discovery may use location-related information to
                        determine which profiles are relevant to nearby
                        searches.
                    </li>
                    <li>
                        Nexora's design separates discovery-related location
                        information from a user's underlying location data.
                    </li>
                    <li>
                        The application is designed to avoid exposing a
                        female user's exact location through ordinary profile
                        discovery.
                    </li>
                </ul>
                <p>
                    These design measures are not a guarantee of complete
                    anonymity or protection against every method of
                    identifying someone's location. Avoid sharing precise
                    location details in your bio, messages, or uploaded
                    content if you do not want other users to see them.
                </p>
            </>
        ),
    },
    {
        id: "profiles",
        icon: Users,
        title: "4. Profiles and Connections",
        content: (
            <>
                <p>
                    Nexora allows users to discover profiles, send connection
                    requests, accept requests, and build connections based on
                    shared interests, professional goals, or learning
                    interests.
                </p>
                <p>
                    Information displayed to other users depends on the
                    application's profile and discovery features. Please
                    review your profile before publishing information and
                    share only details you are comfortable making available
                    to other users.
                </p>
            </>
        ),
    },
    {
        id: "messages",
        icon: MessageCircle,
        title: "5. Messages and Communications",
        content: (
            <>
                <p>
                    Nexora supports messaging between connected users.
                    Conversation and message information may be processed to
                    deliver messages and display conversation history.
                </p>
                <p>
                    Messages are not necessarily confidential from the
                    people participating in the conversation. Do not send
                    passwords, financial details, identity documents, or
                    other sensitive information unless you have a clear
                    reason to do so.
                </p>
                <p>
                    Do not assume that messages are end-to-end encrypted or
                    automatically deleted. Such protections should only be
                    claimed when they have been implemented and verified.
                </p>
            </>
        ),
    },
    {
        id: "uploads",
        icon: ImageIcon,
        title: "6. Images and Report Evidence",
        content: (
            <>
                <p>
                    Nexora supports profile images and the submission of
                    image evidence with user reports.
                </p>
                <ul>
                    <li>
                        Profile images may be processed to display your
                        profile.
                    </li>
                    <li>
                        Report evidence may be stored and reviewed by
                        authorized administrators for moderation purposes.
                    </li>
                    <li>
                        Uploaded images may be handled by third-party
                        infrastructure providers used to store and deliver
                        application media.
                    </li>
                </ul>
                <p>
                    Before uploading a screenshot, check whether it contains
                    private messages, phone numbers, email addresses,
                    location details, or other information belonging to
                    someone else. Submit only evidence relevant to your
                    report.
                </p>
            </>
        ),
    },
    {
        id: "sharing",
        icon: LockKeyhole,
        title: "7. Sharing and Third-Party Services",
        content: (
            <>
                <p>
                    Nexora may rely on third-party infrastructure to operate
                    its services, such as database hosting and image storage.
                    Information may be processed by these providers as needed
                    to support the features you use.
                </p>
                <p>
                    Nexora should not share personal information for unrelated
                    purposes without an appropriate legal basis. Information
                    may also need to be disclosed where required by law or
                    through a valid legal process.
                </p>
                <p>
                    The specific providers, processing locations, and
                    applicable terms should be documented as Nexora's
                    deployment and service providers are finalized.
                </p>
            </>
        ),
    },
    {
        id: "security",
        icon: ShieldCheck,
        title: "8. Security",
        content: (
            <>
                <p>
                    Nexora uses application-level measures intended to
                    protect accounts and information, including
                    authentication controls and restricted access to
                    protected features.
                </p>
                <p>
                    No website, application, or storage system can be
                    guaranteed completely secure. Keep your login
                    credentials private and notify the platform
                    administrator if you suspect unauthorized access.
                </p>
            </>
        ),
    },
    {
        id: "retention",
        icon: FileText,
        title: "9. Data Retention",
        content: (
            <>
                <p>
                    Personal information should be retained only for as long
                    as necessary for the purposes for which it was collected,
                    subject to applicable legal requirements and legitimate
                    operational needs.
                </p>
                <p>
                    The exact retention periods for accounts, messages,
                    uploaded images, and report evidence depend on the
                    application's implemented data-management procedures.
                    Do not assume that deleting information from a screen
                    automatically removes every stored copy or backup.
                </p>
            </>
        ),
    },
    {
        id: "choices",
        icon: UserRound,
        title: "10. Your Privacy Choices",
        content: (
            <>
                <p>
                    You can review the information you provide in your
                    profile and use available account settings to manage
                    supported preferences.
                </p>
                <p>
                    Depending on applicable law, you may have rights to
                    request access to, correction of, or deletion of your
                    personal information, or to object to certain processing.
                    Requests may be subject to identity verification and
                    legal exceptions.
                </p>
                <p>
                    If the application does not provide a self-service
                    control for a request, contact the Nexora team using
                    the contact method provided by the platform.
                </p>
            </>
        ),
    },
    {
        id: "children",
        icon: ShieldCheck,
        title: "11. Age Requirements",
        content: (
            <>
                <p>
                    Nexora is intended for users who meet the minimum age
                    requirements specified by the service and applicable
                    law. Do not create an account if you are not eligible
                    to use the platform.
                </p>
                <p>
                    The final published policy should state Nexora's actual
                    minimum age and explain how concerns about an
                    underage account can be reported.
                </p>
            </>
        ),
    },
    {
        id: "changes",
        icon: FileText,
        title: "12. Changes to This Policy",
        content: (
            <>
                <p>
                    This Privacy Policy may be updated as Nexora's features,
                    infrastructure, or legal obligations change. Material
                    changes should be communicated through an appropriate
                    channel where required.
                </p>
                <p>
                    The effective date should be updated whenever a revised
                    policy is published.
                </p>
            </>
        ),
    },
];

function PrivacyPolicy() {
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
                    <ArrowLeftIcon />
                    Back to home
                </Link>
            </header>

            <section className="legal-hero">
                <div className="legal-hero-icon">
                    <ShieldCheck size={28} />
                </div>

                <span className="legal-eyebrow">
                    YOUR PRIVACY MATTERS
                </span>

                <h1>
                    Privacy <span>Policy</span>
                </h1>

                <p>
                    Transparency matters. Learn how Nexora handles
                    information when you discover people, build connections,
                    and communicate on the platform.
                </p>

                <div className="legal-effective-date">
                    <span className="legal-status-dot" />
                    Draft policy · Review before publication
                </div>
            </section>

            <div className="legal-layout">
                <aside className="legal-toc">
                    <h2>On this page</h2>
                    <nav aria-label="Privacy policy sections">
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
                        <p className="legal-intro">
                            Nexora helps people discover others with shared
                            interests, professional goals, and learning
                            interests. This policy describes the categories
                            of information the platform may handle and the
                            privacy considerations associated with its features.
                        </p>
                    </div>

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
                        <h2>Questions about your privacy?</h2>
                        <p>
                            Contact the Nexora team through the official
                            contact channel provided by the platform.
                            Add a verified contact email here before
                            publishing this policy.
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
                    <Link to="/privacy-policy" aria-current="page">
                        Privacy Policy
                    </Link>
                    <Link to="/terms-of-service">
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

function ArrowLeftIcon() {
    return <ArrowLeft size={16} />;
}

export default PrivacyPolicy;