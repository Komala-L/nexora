import { useState } from "react";
import {
    UserRound,
    Heart,
    BriefcaseBusiness,
    GraduationCap,
    Compass,
    Plus,
    X,
    ArrowLeft,
    ArrowRight,
    Check,
    LoaderCircle,
    Sparkles,
    ShieldCheck,
} from "lucide-react";

import { updateProfile } from "../../services/user.service";

const steps = [
    {
        id: 1,
        title: "About You",
        description: "Tell people a little about yourself.",
        icon: UserRound,
    },
    {
        id: 2,
        title: "Interests",
        description: "What are you interested in?",
        icon: Heart,
    },
    {
        id: 3,
        title: "Professional",
        description: "Share your professional background.",
        icon: BriefcaseBusiness,
    },
    {
        id: 4,
        title: "Learning",
        description: "Tell Nexora what you're learning.",
        icon: GraduationCap,
    },
    {
        id: 5,
        title: "Discovery",
        description: "Choose what you want to discover.",
        icon: Compass,
    },
];

const discoveryOptions = [
    {
        value: "friends",
        label: "Friends",
        description: "Meet people with similar interests.",
    },
    {
        value: "professional",
        label: "Professional",
        description: "Build meaningful professional connections.",
    },
    {
        value: "learning",
        label: "Learning",
        description: "Find people to learn and grow with.",
    },
];

const ProfileOnboarding = ({ user, onCompleted, onSkip }) => {
    const [currentStep, setCurrentStep] = useState(1);

    const [formData, setFormData] = useState({
        name: user?.name || "",
        bio: user?.bio || "",
        interests: user?.interests || [],

        professional: {
            role: user?.professional?.role || "",
            company: user?.professional?.company || "",
            skills: user?.professional?.skills || [],
            industry: user?.professional?.industry || "",
        },

        learning: {
            subjects: user?.learning?.subjects || [],
            learningGoal: user?.learning?.learningGoal || "",
        },

        discoveryPreferences: user?.discoveryPreferences || [],
    });

    const [interestInput, setInterestInput] = useState("");
    const [skillInput, setSkillInput] = useState("");
    const [subjectInput, setSubjectInput] = useState("");

    const [error, setError] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    /* ---------------------------------------------------------
       BASIC FIELD UPDATES
    --------------------------------------------------------- */

    const updateBasicField = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const updateProfessionalField = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            professional: {
                ...previous.professional,
                [name]: value,
            },
        }));
    };

    const updateLearningField = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            learning: {
                ...previous.learning,
                [name]: value,
            },
        }));
    };

    /* ---------------------------------------------------------
       INTERESTS
    --------------------------------------------------------- */

    const addInterest = () => {
        const value = interestInput.trim();

        if (!value) return;

        if (formData.interests.length >= 12) {
            setError("You can add up to 12 interests.");
            return;
        }

        if (
            formData.interests.some(
                (item) =>
                    item.toLowerCase() === value.toLowerCase()
            )
        ) {
            setInterestInput("");
            return;
        }

        setFormData((previous) => ({
            ...previous,
            interests: [...previous.interests, value],
        }));

        setInterestInput("");
        setError("");
    };

    const removeInterest = (index) => {
        setFormData((previous) => ({
            ...previous,
            interests: previous.interests.filter(
                (_, itemIndex) => itemIndex !== index
            ),
        }));
    };

    /* ---------------------------------------------------------
       SKILLS
    --------------------------------------------------------- */

    const addSkill = () => {
        const value = skillInput.trim();

        if (!value) return;

        if (formData.professional.skills.length >= 15) {
            setError("You can add up to 15 skills.");
            return;
        }

        if (
            formData.professional.skills.some(
                (item) =>
                    item.toLowerCase() === value.toLowerCase()
            )
        ) {
            setSkillInput("");
            return;
        }

        setFormData((previous) => ({
            ...previous,
            professional: {
                ...previous.professional,
                skills: [
                    ...previous.professional.skills,
                    value,
                ],
            },
        }));

        setSkillInput("");
        setError("");
    };

    const removeSkill = (index) => {
        setFormData((previous) => ({
            ...previous,
            professional: {
                ...previous.professional,
                skills: previous.professional.skills.filter(
                    (_, itemIndex) => itemIndex !== index
                ),
            },
        }));
    };

    /* ---------------------------------------------------------
       SUBJECTS
    --------------------------------------------------------- */

    const addSubject = () => {
        const value = subjectInput.trim();

        if (!value) return;

        if (formData.learning.subjects.length >= 10) {
            setError("You can add up to 10 subjects.");
            return;
        }

        if (
            formData.learning.subjects.some(
                (item) =>
                    item.toLowerCase() === value.toLowerCase()
            )
        ) {
            setSubjectInput("");
            return;
        }

        setFormData((previous) => ({
            ...previous,
            learning: {
                ...previous.learning,
                subjects: [
                    ...previous.learning.subjects,
                    value,
                ],
            },
        }));

        setSubjectInput("");
        setError("");
    };

    const removeSubject = (index) => {
        setFormData((previous) => ({
            ...previous,
            learning: {
                ...previous.learning,
                subjects: previous.learning.subjects.filter(
                    (_, itemIndex) => itemIndex !== index
                ),
            },
        }));
    };

    /* ---------------------------------------------------------
       DISCOVERY
    --------------------------------------------------------- */

    const toggleDiscoveryPreference = (value) => {
        setFormData((previous) => {
            const exists =
                previous.discoveryPreferences.includes(value);

            return {
                ...previous,
                discoveryPreferences: exists
                    ? previous.discoveryPreferences.filter(
                          (item) => item !== value
                      )
                    : [
                          ...previous.discoveryPreferences,
                          value,
                      ],
            };
        });

        setError("");
    };

    /* ---------------------------------------------------------
       VALIDATION
    --------------------------------------------------------- */

    const validateCurrentStep = () => {
        setError("");

        if (currentStep === 1) {
            if (!formData.name.trim()) {
                setError("Please enter your name.");
                return false;
            }

            if (formData.name.trim().length < 3) {
                setError(
                    "Name must be at least 3 characters long."
                );
                return false;
            }
        }

        if (currentStep === 5) {
            if (
                formData.discoveryPreferences.length === 0
            ) {
                setError(
                    "Please select at least one discovery preference."
                );
                return false;
            }
        }

        return true;
    };

    /* ---------------------------------------------------------
       NAVIGATION
    --------------------------------------------------------- */

    const handleNext = () => {
        if (!validateCurrentStep()) {
            return;
        }

        if (currentStep < steps.length) {
            setCurrentStep((previous) => previous + 1);
        }
    };

    const handleBack = () => {
        setError("");

        if (currentStep > 1) {
            setCurrentStep((previous) => previous - 1);
        }
    };

    const handleSkip = async () => {
    if (isSaving) {
        return;
    }

    try {
        setIsSaving(true);
        setError("");

        // Save whatever information the user has entered so far.
        const response = await updateProfile(formData);

        const updatedUser = response.data?.user;

        if (!updatedUser) {
            throw new Error(
                "Your progress was saved, but the updated profile could not be retrieved."
            );
        }

        // Pass the updated user back to the gate.
        onSkip?.(updatedUser);
    } catch (error) {
        console.error(
            "Failed to save profile progress:",
            error
        );

        setError(
            error.message ||
                "Could not save your profile progress. Please try again."
        );
    } finally {
        setIsSaving(false);
    }
};




    /* ---------------------------------------------------------
       COMPLETE PROFILE
    --------------------------------------------------------- */

    const handleComplete = async () => {
        if (!validateCurrentStep()) {
            return;
        }

        try {
            setIsSaving(true);
            setError("");

            const response = await updateProfile(formData);

            const updatedUser = response.data?.user;

            if (!updatedUser) {
                throw new Error(
                    "Profile was saved, but the updated user could not be retrieved."
                );
            }

            onCompleted(updatedUser);
        } catch (error) {
            console.error(
                "Failed to complete profile:",
                error
            );

            setError(
                error.message ||
                    "Failed to complete your profile. Please try again."
            );
        } finally {
            setIsSaving(false);
        }
    };

    const progress =
        (currentStep / steps.length) * 100;

    const CurrentIcon = steps[currentStep - 1].icon;

    const inputClass =
        "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10";

    const textareaClass =
        "w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10";

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#f7f9fc] px-4 py-8 text-slate-900 sm:px-6 lg:py-12">

            {/* -------------------------------------------------
                BACKGROUND DECORATION
            ------------------------------------------------- */}

            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-indigo-200/30 blur-3xl" />

                <div className="absolute -right-40 top-20 h-96 w-96 rounded-full bg-cyan-200/30 blur-3xl" />

                <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-violet-200/20 blur-3xl" />

                <div
                    className="absolute inset-0 opacity-[0.35]"
                    style={{
                        backgroundImage:
                            "radial-gradient(#cbd5e1 0.7px, transparent 0.7px)",
                        backgroundSize: "24px 24px",
                    }}
                />
            </div>

            <div className="relative mx-auto w-full max-w-5xl">

                {/* -------------------------------------------------
                    HEADER
                ------------------------------------------------- */}

                <div className="mb-8 text-center sm:mb-10">

                    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white px-4 py-2 shadow-sm">
                        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 text-xs font-black text-white">
                            N
                        </div>

                        <span className="text-xs font-extrabold tracking-[0.22em] text-indigo-600">
                            NEXORA
                        </span>
                    </div>

                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl lg:text-[42px]">
                        Complete your profile
                    </h1>

                    <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                        Help people discover you based on your
                        interests, goals and professional background.
                    </p>

                    <div className="mx-auto mt-5 flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-500 shadow-sm">
                        <Sparkles
                            size={14}
                            className="text-indigo-500"
                        />
                        Your profile helps Nexora personalize discovery
                    </div>
                </div>

                {/* -------------------------------------------------
                    PROGRESS
                ------------------------------------------------- */}

                <div className="mb-7 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur sm:p-5">

                    <div className="mb-3 flex items-center justify-between text-xs">
                        <div>
                            <span className="font-bold text-slate-800">
                                Step {currentStep}
                            </span>

                            <span className="ml-1 text-slate-400">
                                of {steps.length}
                            </span>
                        </div>

                        <span className="font-semibold text-indigo-600">
                            {Math.round(progress)}% complete
                        </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-indigo-600 via-violet-500 to-cyan-400 transition-all duration-500"
                            style={{
                                width: `${progress}%`,
                            }}
                        />
                    </div>
                </div>

                {/* -------------------------------------------------
                    STEP INDICATORS
                ------------------------------------------------- */}

                <div className="mb-7 hidden grid-cols-5 gap-3 md:grid">

                    {steps.map((step) => {
                        const Icon = step.icon;

                        const isActive =
                            step.id === currentStep;

                        const isCompleted =
                            step.id < currentStep;

                        return (
                            <div
                                key={step.id}
                                className={`group relative overflow-hidden rounded-2xl border p-4 transition-all duration-200 ${
                                    isActive
                                        ? "border-indigo-200 bg-white shadow-md shadow-indigo-100"
                                        : isCompleted
                                        ? "border-cyan-100 bg-cyan-50/60"
                                        : "border-slate-200 bg-white/80"
                                }`}
                            >
                                {isActive && (
                                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-600 to-cyan-400" />
                                )}

                                <div
                                    className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl transition ${
                                        isActive
                                            ? "bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-200"
                                            : isCompleted
                                            ? "bg-cyan-100 text-cyan-600"
                                            : "bg-slate-100 text-slate-400"
                                    }`}
                                >
                                    {isCompleted ? (
                                        <Check size={17} strokeWidth={2.5} />
                                    ) : (
                                        <Icon size={17} />
                                    )}
                                </div>

                                <p
                                    className={`text-xs font-bold ${
                                        isActive
                                            ? "text-indigo-700"
                                            : isCompleted
                                            ? "text-cyan-700"
                                            : "text-slate-600"
                                    }`}
                                >
                                    {step.title}
                                </p>

                                {isActive && (
                                    <p className="mt-1 text-[10px] font-medium text-slate-400">
                                        Current step
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* -------------------------------------------------
                    MOBILE STEP INDICATOR
                ------------------------------------------------- */}

                <div className="mb-5 flex items-center gap-3 md:hidden">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-200">
                        <CurrentIcon size={20} />
                    </div>

                    <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900">
                            {steps[currentStep - 1].title}
                        </p>

                        <p className="text-xs text-slate-500">
                            Step {currentStep} of {steps.length}
                        </p>
                    </div>
                </div>

                {/* -------------------------------------------------
                    MAIN CARD
                ------------------------------------------------- */}

                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_60px_-25px_rgba(15,23,42,0.20)]">

                    {/* CARD HEADER */}

                    <div className="relative overflow-hidden border-b border-slate-100 bg-gradient-to-r from-indigo-50/80 via-white to-cyan-50/70 px-6 py-6 sm:px-8">

                        <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-cyan-200/20 blur-2xl" />

                        <div className="relative flex items-center gap-4">

                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 text-indigo-600 ring-1 ring-indigo-100">
                                <CurrentIcon size={22} />
                            </div>

                            <div>
                                <h2 className="text-xl font-bold text-slate-950">
                                    {steps[currentStep - 1].title}
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    {
                                        steps[currentStep - 1]
                                            .description
                                    }
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* -------------------------------------------------
                        CONTENT
                    ------------------------------------------------- */}

                    <div className="min-h-[390px] px-6 py-7 sm:px-8 sm:py-8">

                        {/* ERROR */}

                        {error && (
                            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3.5 text-sm font-medium text-red-600">
                                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-bold">
                                    !
                                </div>

                                <p>{error}</p>
                            </div>
                        )}

                        {/* =================================================
                            STEP 1 — ABOUT YOU
                        ================================================= */}

                        {currentStep === 1 && (
                            <div className="space-y-7">

                                <div>
                                    <label className="mb-2 block text-sm font-bold text-slate-800">
                                        Name
                                        <span className="ml-1 text-red-400">
                                            *
                                        </span>
                                    </label>

                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={updateBasicField}
                                        maxLength={40}
                                        placeholder="Enter your name"
                                        className={inputClass}
                                    />

                                    <p className="mt-2 text-right text-xs text-slate-400">
                                        {formData.name.length}/40
                                    </p>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-bold text-slate-800">
                                        Bio
                                        <span className="ml-2 text-xs font-medium text-slate-400">
                                            Optional
                                        </span>
                                    </label>

                                    <textarea
                                        name="bio"
                                        value={formData.bio}
                                        onChange={updateBasicField}
                                        maxLength={150}
                                        rows={5}
                                        placeholder="Tell people a little about yourself..."
                                        className={textareaClass}
                                    />

                                    <p className="mt-2 text-right text-xs text-slate-400">
                                        {formData.bio.length}/150
                                    </p>
                                </div>

                                <div className="flex items-center gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
                                        <UserRound size={17} />
                                    </div>

                                    <p className="text-xs leading-5 text-slate-500">
                                        Keep your introduction genuine.
                                        A clear profile helps people know
                                        whether you'd be a good connection.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* =================================================
                            STEP 2 — INTERESTS
                        ================================================= */}

                        {currentStep === 2 && (
                            <div>

                                <div className="mb-5">
                                    <p className="text-sm font-semibold text-slate-700">
                                        Add things you're interested in
                                    </p>

                                    <p className="mt-1 text-xs text-slate-400">
                                        These help Nexora find people with
                                        similar interests.
                                    </p>
                                </div>

                                <div className="flex gap-2">

                                    <input
                                        type="text"
                                        value={interestInput}
                                        onChange={(event) =>
                                            setInterestInput(
                                                event.target.value
                                            )
                                        }
                                        onKeyDown={(event) => {
                                            if (
                                                event.key ===
                                                "Enter"
                                            ) {
                                                event.preventDefault();
                                                addInterest();
                                            }
                                        }}
                                        placeholder="e.g. Photography"
                                        className={`min-w-0 flex-1 ${inputClass}`}
                                    />

                                    <button
                                        type="button"
                                        onClick={addInterest}
                                        className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3 text-sm font-bold text-white shadow-md shadow-indigo-200 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-200"
                                    >
                                        <Plus size={16} />
                                        Add
                                    </button>
                                </div>

                                <div className="mt-6 min-h-24 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-4">

                                    {formData.interests.length === 0 ? (
                                        <div className="flex min-h-16 items-center justify-center text-center">
                                            <p className="text-xs text-slate-400">
                                                Your interests will appear here
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-wrap gap-2">
                                            {formData.interests.map(
                                                (interest, index) => (
                                                    <span
                                                        key={`${interest}-${index}`}
                                                        className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3.5 py-2 text-xs font-bold text-indigo-700"
                                                    >
                                                        {interest}

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                removeInterest(
                                                                    index
                                                                )
                                                            }
                                                            className="rounded-full p-0.5 text-indigo-400 transition hover:bg-red-100 hover:text-red-500"
                                                        >
                                                            <X size={13} />
                                                        </button>
                                                    </span>
                                                )
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="mt-4 flex items-center justify-between">
                                    <p className="text-xs text-slate-400">
                                        Press Enter or click Add.
                                    </p>

                                    <p className="text-xs font-semibold text-slate-500">
                                        {formData.interests.length}/12
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* =================================================
                            STEP 3 — PROFESSIONAL
                        ================================================= */}

                        {currentStep === 3 && (
                            <div className="space-y-6">

                                <div className="grid gap-5 sm:grid-cols-2">

                                    <div>
                                        <label className="mb-2 block text-sm font-bold text-slate-800">
                                            Role
                                        </label>

                                        <input
                                            type="text"
                                            name="role"
                                            value={
                                                formData.professional.role
                                            }
                                            onChange={
                                                updateProfessionalField
                                            }
                                            maxLength={80}
                                            placeholder="e.g. Teacher"
                                            className={inputClass}
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-bold text-slate-800">
                                            Company
                                        </label>

                                        <input
                                            type="text"
                                            name="company"
                                            value={
                                                formData.professional.company
                                            }
                                            onChange={
                                                updateProfessionalField
                                            }
                                            maxLength={100}
                                            placeholder="e.g. Organization or Workplace"
                                            className={inputClass}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-bold text-slate-800">
                                        Industry
                                    </label>

                                    <input
                                        type="text"
                                        name="industry"
                                        value={
                                            formData.professional.industry
                                        }
                                        onChange={
                                            updateProfessionalField
                                        }
                                        maxLength={80}
                                        placeholder="e.g. Education"
                                        className={inputClass}
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-bold text-slate-800">
                                        Skills
                                    </label>

                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={skillInput}
                                            onChange={(event) =>
                                                setSkillInput(
                                                    event.target.value
                                                )
                                            }
                                            onKeyDown={(event) => {
                                                if (
                                                    event.key ===
                                                    "Enter"
                                                ) {
                                                    event.preventDefault();
                                                    addSkill();
                                                }
                                            }}
                                            placeholder="e.g. Public Speaking"
                                            className={`min-w-0 flex-1 ${inputClass}`}
                                        />

                                        <button
                                            type="button"
                                            onClick={addSkill}
                                            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 px-4 py-3 text-sm font-bold text-white shadow-md shadow-cyan-100 transition hover:-translate-y-0.5 hover:shadow-lg"
                                        >
                                            <Plus size={16} />
                                            Add
                                        </button>
                                    </div>

                                    <div className="mt-5 min-h-20">
                                        {formData.professional.skills.length >
                                        0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {formData.professional.skills.map(
                                                    (
                                                        skill,
                                                        index
                                                    ) => (
                                                        <span
                                                            key={`${skill}-${index}`}
                                                            className="inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-cyan-50 px-3.5 py-2 text-xs font-bold text-cyan-700"
                                                        >
                                                            {skill}

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    removeSkill(
                                                                        index
                                                                    )
                                                                }
                                                                className="rounded-full p-0.5 text-cyan-500 transition hover:bg-red-100 hover:text-red-500"
                                                            >
                                                                <X
                                                                    size={
                                                                        13
                                                                    }
                                                                />
                                                            </button>
                                                        </span>
                                                    )
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-xs text-slate-400">
                                                Add the skills you'd like
                                                people to discover you for.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* =================================================
                            STEP 4 — LEARNING
                        ================================================= */}

                        {currentStep === 4 && (
                            <div className="space-y-7">

                                <div>
                                    <label className="mb-2 block text-sm font-bold text-slate-800">
                                        Learning goal
                                    </label>

                                    <textarea
                                        name="learningGoal"
                                        value={
                                            formData.learning
                                                .learningGoal
                                        }
                                        onChange={
                                            updateLearningField
                                        }
                                        maxLength={150}
                                        rows={4}
                                        placeholder="e.g. Improve my public speaking"
                                        className={textareaClass}
                                    />

                                    <p className="mt-2 text-right text-xs text-slate-400">
                                        {
                                            formData.learning
                                                .learningGoal
                                                .length
                                        }
                                        /150
                                    </p>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-bold text-slate-800">
                                        Subjects
                                    </label>

                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={subjectInput}
                                            onChange={(event) =>
                                                setSubjectInput(
                                                    event.target.value
                                                )
                                            }
                                            onKeyDown={(event) => {
                                                if (
                                                    event.key ===
                                                    "Enter"
                                                ) {
                                                    event.preventDefault();
                                                    addSubject();
                                                }
                                            }}
                                            placeholder="e.g. Psychology"
                                            className={`min-w-0 flex-1 ${inputClass}`}
                                        />

                                        <button
                                            type="button"
                                            onClick={addSubject}
                                            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3 text-sm font-bold text-white shadow-md shadow-indigo-200 transition hover:-translate-y-0.5 hover:shadow-lg"
                                        >
                                            <Plus size={16} />
                                            Add
                                        </button>
                                    </div>

                                    <div className="mt-5 min-h-20">
                                        {formData.learning.subjects
                                            .length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {formData.learning.subjects.map(
                                                    (
                                                        subject,
                                                        index
                                                    ) => (
                                                        <span
                                                            key={`${subject}-${index}`}
                                                            className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3.5 py-2 text-xs font-bold text-indigo-700"
                                                        >
                                                            {subject}

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    removeSubject(
                                                                        index
                                                                    )
                                                                }
                                                                className="rounded-full p-0.5 text-indigo-400 transition hover:bg-red-100 hover:text-red-500"
                                                            >
                                                                <X
                                                                    size={
                                                                        13
                                                                    }
                                                                />
                                                            </button>
                                                        </span>
                                                    )
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-xs text-slate-400">
                                                Add subjects you'd like to
                                                learn or explore.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* =================================================
                            STEP 5 — DISCOVERY
                        ================================================= */}

                        {currentStep === 5 && (
                            <div>

                                <div className="mb-6">
                                    <p className="text-sm font-semibold text-slate-700">
                                        What kind of connections are you
                                        looking for?
                                    </p>

                                    <p className="mt-1 text-xs leading-5 text-slate-400">
                                        Select one or more. You can change
                                        these preferences later.
                                    </p>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-3">

                                    {discoveryOptions.map(
                                        (option) => {
                                            const selected =
                                                formData.discoveryPreferences.includes(
                                                    option.value
                                                );

                                            return (
                                                <button
                                                    key={
                                                        option.value
                                                    }
                                                    type="button"
                                                    onClick={() =>
                                                        toggleDiscoveryPreference(
                                                            option.value
                                                        )
                                                    }
                                                    className={`group relative overflow-hidden rounded-2xl border p-5 text-left transition-all duration-200 ${
                                                        selected
                                                            ? "border-indigo-200 bg-gradient-to-br from-indigo-50 to-violet-50 shadow-md shadow-indigo-100"
                                                            : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
                                                    }`}
                                                >

                                                    {selected && (
                                                        <div className="absolute right-0 top-0 h-20 w-20 rounded-full bg-indigo-200/30 blur-2xl" />
                                                    )}

                                                    <div className="relative mb-5 flex items-center justify-between">

                                                        <div
                                                            className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                                                                selected
                                                                    ? "bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-200"
                                                                    : "bg-slate-100 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500"
                                                            }`}
                                                        >
                                                            {option.value ===
                                                            "friends" ? (
                                                                <Heart
                                                                    size={
                                                                        18
                                                                    }
                                                                />
                                                            ) : option.value ===
                                                              "professional" ? (
                                                                <BriefcaseBusiness
                                                                    size={
                                                                        18
                                                                    }
                                                                />
                                                            ) : (
                                                                <GraduationCap
                                                                    size={
                                                                        18
                                                                    }
                                                                />
                                                            )}
                                                        </div>

                                                        <span
                                                            className={`flex h-6 w-6 items-center justify-center rounded-full border text-xs font-bold ${
                                                                selected
                                                                    ? "border-indigo-500 bg-indigo-600 text-white"
                                                                    : "border-slate-200 bg-white text-transparent"
                                                            }`}
                                                        >
                                                            <Check
                                                                size={13}
                                                                strokeWidth={
                                                                    3
                                                                }
                                                            />
                                                        </span>
                                                    </div>

                                                    <div className="relative">
                                                        <p
                                                            className={`text-sm font-bold ${
                                                                selected
                                                                    ? "text-indigo-800"
                                                                    : "text-slate-800"
                                                            }`}
                                                        >
                                                            {
                                                                option.label
                                                            }
                                                        </p>

                                                        <p className="mt-2 text-xs leading-5 text-slate-500">
                                                            {
                                                                option.description
                                                            }
                                                        </p>
                                                    </div>
                                                </button>
                                            );
                                        }
                                    )}
                                </div>

                                <div className="mt-6 flex items-start gap-3 rounded-2xl border border-cyan-100 bg-cyan-50/60 p-4">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-cyan-600 shadow-sm">
                                        <ShieldCheck size={17} />
                                    </div>

                                    <p className="text-xs leading-5 text-slate-500">
                                        Your discovery preferences only help
                                        Nexora personalize who you see.
                                        You can update them anytime from
                                        your profile.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* -------------------------------------------------
                        FOOTER
                    ------------------------------------------------- */}

                    <div className="flex flex-col gap-4 border-t border-slate-100 bg-slate-50/80 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">

                        {/* SKIP */}

                        <button
                            type="button"
                            onClick={handleSkip}
                            disabled={isSaving}
                            className="inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-500 transition hover:bg-white hover:text-slate-800 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-40 sm:justify-start"
                        >
                            Skip for now
                        </button>

                        {/* NAVIGATION */}

                        <div className="flex items-center justify-end gap-3">

                            <button
                                type="button"
                                onClick={handleBack}
                                disabled={
                                    currentStep === 1 ||
                                    isSaving
                                }
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <ArrowLeft size={16} />
                                Back
                            </button>

                            {currentStep < steps.length ? (
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    disabled={isSaving}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-indigo-200 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-200 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    Continue
                                    <ArrowRight size={16} />
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleComplete}
                                    disabled={isSaving}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 px-6 py-3 text-sm font-bold text-white shadow-md shadow-indigo-200 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-200 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {isSaving ? (
                                        <>
                                            <LoaderCircle
                                                size={16}
                                                className="animate-spin"
                                            />
                                            Completing...
                                        </>
                                    ) : (
                                        <>
                                            <Check
                                                size={16}
                                                strokeWidth={2.5}
                                            />
                                            Complete Profile
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* -------------------------------------------------
                    BOTTOM NOTE
                ------------------------------------------------- */}

                <div className="mt-5 text-center">
                    <p className="text-xs text-slate-400">
                        You can update your profile information anytime
                        from your Nexora profile.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ProfileOnboarding;