import { useEffect, useState } from "react";
import {
    X,
    Plus,
    UserRound,
    Heart,
    BriefcaseBusiness,
    GraduationCap,
    Compass,
    Save,
    LoaderCircle,
} from "lucide-react";

import { updateProfile } from "../../services/user.service";

const discoveryOptions = [
    {
        value: "friends",
        label: "Friends",
    },
    {
        value: "professional",
        label: "Professional",
    },
    {
        value: "learning",
        label: "Learning",
    },
];

const EditProfileModal = ({
    user,
    onClose,
    onUpdated,
}) => {
    const [formData, setFormData] = useState({
        name: "",
        bio: "",
        interests: [],
        professional: {
            role: "",
            company: "",
            skills: [],
            industry: "",
        },
        learning: {
            subjects: [],
            learningGoal: "",
        },
        discoveryPreferences: [],
    });

    const [interestInput, setInterestInput] = useState("");
    const [skillInput, setSkillInput] = useState("");
    const [subjectInput, setSubjectInput] = useState("");

    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        setFormData({
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
                subjects:
                    user?.learning?.subjects || [],
                learningGoal:
                    user?.learning?.learningGoal || "",
            },

            discoveryPreferences:
                user?.discoveryPreferences || [],
        });
    }, [user]);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleProfessionalChange = (
        event
    ) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            professional: {
                ...previous.professional,
                [name]: value,
            },
        }));
    };

    const handleLearningChange = (
        event
    ) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            learning: {
                ...previous.learning,
                [name]: value,
            },
        }));
    };

    const addTag = (
        input,
        setInput,
        field,
        max
    ) => {
        const value = input.trim();

        if (!value) {
            return;
        }

        if (formData[field].length >= max) {
            return;
        }

        if (
            formData[field].some(
                (item) =>
                    item.toLowerCase() ===
                    value.toLowerCase()
            )
        ) {
            setInput("");
            return;
        }

        setFormData((previous) => ({
            ...previous,
            [field]: [
                ...previous[field],
                value,
            ],
        }));

        setInput("");
    };

    const addProfessionalSkill = () => {
        const value = skillInput.trim();

        if (!value) {
            return;
        }

        if (
            formData.professional.skills
                .length >= 15
        ) {
            return;
        }

        if (
            formData.professional.skills.some(
                (skill) =>
                    skill.toLowerCase() ===
                    value.toLowerCase()
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
    };

    const addLearningSubject = () => {
        const value = subjectInput.trim();

        if (!value) {
            return;
        }

        if (
            formData.learning.subjects
                .length >= 10
        ) {
            return;
        }

        if (
            formData.learning.subjects.some(
                (subject) =>
                    subject.toLowerCase() ===
                    value.toLowerCase()
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
    };

    const removeTag = (field, index) => {
        setFormData((previous) => ({
            ...previous,
            [field]: previous[field].filter(
                (_, itemIndex) =>
                    itemIndex !== index
            ),
        }));
    };

    const removeSkill = (index) => {
        setFormData((previous) => ({
            ...previous,
            professional: {
                ...previous.professional,
                skills:
                    previous.professional.skills.filter(
                        (_, itemIndex) =>
                            itemIndex !== index
                    ),
            },
        }));
    };

    const removeSubject = (index) => {
        setFormData((previous) => ({
            ...previous,
            learning: {
                ...previous.learning,
                subjects:
                    previous.learning.subjects.filter(
                        (_, itemIndex) =>
                            itemIndex !== index
                    ),
            },
        }));
    };

    const toggleDiscoveryPreference = (
        value
    ) => {
        setFormData((previous) => {
            const exists =
                previous.discoveryPreferences.includes(
                    value
                );

            return {
                ...previous,
                discoveryPreferences: exists
                    ? previous.discoveryPreferences.filter(
                          (item) =>
                              item !== value
                      )
                    : [
                          ...previous.discoveryPreferences,
                          value,
                      ],
            };
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            setIsSaving(true);
            setError("");

            const response =
                await updateProfile(formData);

            const updatedUser =
                response.data?.user;

            if (updatedUser) {
                onUpdated(updatedUser);
            }

            onClose();
        } catch (error) {
            console.error(
                "Failed to update profile:",
                error
            );

            setError(
                error.message ||
                    "Failed to update profile."
            );
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
            onMouseDown={(event) => {
                if (
                    event.target === event.currentTarget &&
                    !isSaving
                ) {
                    onClose();
                }
            }}
        >
            <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
                {/* HEADER */}

                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5 sm:px-7">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-indigo-500">
                            Your profile
                        </p>

                        <h2 className="mt-1 text-xl font-bold text-slate-900">
                            Edit Profile
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Update how you appear across Nexora.
                        </p>
                    </div>

                    <button
                        type="button"
                        disabled={isSaving}
                        onClick={onClose}
                        className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* FORM */}

                <form
                    onSubmit={handleSubmit}
                    className="overflow-y-auto"
                >
                    <div className="space-y-7 p-6 sm:p-7">
                        {/* ERROR */}

                        {error && (
                            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                                {error}
                            </div>
                        )}

                        {/* BASIC INFORMATION */}

                        <section>
                            <div className="mb-4 flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
                                    <UserRound
                                        size={18}
                                        className="text-indigo-600"
                                    />
                                </div>

                                <div>
                                    <h3 className="font-bold text-slate-900">
                                        About you
                                    </h3>

                                    <p className="text-xs text-slate-500">
                                        Tell people a little about yourself.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                                        Name
                                    </label>

                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        maxLength={40}
                                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                                    />

                                    <p className="mt-1 text-right text-xs text-slate-400">
                                        {formData.name.length}/40
                                    </p>
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                                        Bio
                                    </label>

                                    <textarea
                                        name="bio"
                                        value={formData.bio}
                                        onChange={handleChange}
                                        maxLength={150}
                                        rows={4}
                                        placeholder="Tell people a little about yourself..."
                                        className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                                    />

                                    <p className="mt-1 text-right text-xs text-slate-400">
                                        {formData.bio.length}/150
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* INTERESTS */}

                        <section>
                            <div className="mb-4 flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50">
                                    <Heart
                                        size={18}
                                        className="text-violet-600"
                                    />
                                </div>

                                <div>
                                    <h3 className="font-bold text-slate-900">
                                        Interests
                                    </h3>

                                    <p className="text-xs text-slate-500">
                                        Add up to 12 interests.
                                    </p>
                                </div>
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
                                            addTag(
                                                interestInput,
                                                setInterestInput,
                                                "interests",
                                                12
                                            );
                                        }
                                    }}
                                    placeholder="e.g. Photography"
                                    className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        addTag(
                                            interestInput,
                                            setInterestInput,
                                            "interests",
                                            12
                                        )
                                    }
                                    className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white hover:bg-indigo-700"
                                >
                                    <Plus size={16} />
                                    Add
                                </button>
                            </div>

                            <div className="mt-3 flex flex-wrap gap-2">
                                {formData.interests.map(
                                    (interest, index) => (
                                        <span
                                            key={`${interest}-${index}`}
                                            className="inline-flex items-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700"
                                        >
                                            {interest}

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeTag(
                                                        "interests",
                                                        index
                                                    )
                                                }
                                                className="text-indigo-400 hover:text-red-500"
                                            >
                                                <X size={14} />
                                            </button>
                                        </span>
                                    )
                                )}
                            </div>
                        </section>

                        {/* PROFESSIONAL */}

                        <section>
                            <div className="mb-4 flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50">
                                    <BriefcaseBusiness
                                        size={18}
                                        className="text-cyan-600"
                                    />
                                </div>

                                <div>
                                    <h3 className="font-bold text-slate-900">
                                        Professional
                                    </h3>

                                    <p className="text-xs text-slate-500">
                                        Share your professional background.
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                                        Role
                                    </label>

                                    <input
                                        type="text"
                                        name="role"
                                        value={
                                            formData.professional.role
                                        }
                                        onChange={
                                            handleProfessionalChange
                                        }
                                        maxLength={80}
                                        placeholder="e.g. Teacher"
                                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                                        Company
                                    </label>

                                    <input
                                        type="text"
                                        name="company"
                                        value={
                                            formData.professional.company
                                        }
                                        onChange={
                                            handleProfessionalChange
                                        }
                                        maxLength={100}
                                        placeholder="e.g. Organization or workplace"
                                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                                        Industry
                                    </label>

                                    <input
                                        type="text"
                                        name="industry"
                                        value={
                                            formData.professional.industry
                                        }
                                        onChange={
                                            handleProfessionalChange
                                        }
                                        maxLength={80}
                                        placeholder="e.g. Education"
                                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                                    />
                                </div>
                            </div>

                            <div className="mt-4">
                                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
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
                                                addProfessionalSkill();
                                            }
                                        }}
                                        placeholder="e.g. Public Speaking"
                                        className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                                    />

                                    <button
                                        type="button"
                                        onClick={
                                            addProfessionalSkill
                                        }
                                        className="flex items-center gap-1.5 rounded-xl bg-cyan-600 px-4 py-3 text-sm font-bold text-white hover:bg-cyan-700"
                                    >
                                        <Plus size={16} />
                                        Add
                                    </button>
                                </div>

                                <div className="mt-3 flex flex-wrap gap-2">
                                    {formData.professional.skills.map(
                                        (skill, index) => (
                                            <span
                                                key={`${skill}-${index}`}
                                                className="inline-flex items-center gap-2 rounded-xl bg-cyan-50 px-3 py-2 text-sm font-semibold text-cyan-700"
                                            >
                                                {skill}

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeSkill(
                                                            index
                                                        )
                                                    }
                                                    className="text-cyan-400 hover:text-red-500"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </span>
                                        )
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* LEARNING */}

                        <section>
                            <div className="mb-4 flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
                                    <GraduationCap
                                        size={19}
                                        className="text-indigo-600"
                                    />
                                </div>

                                <div>
                                    <h3 className="font-bold text-slate-900">
                                        Learning
                                    </h3>

                                    <p className="text-xs text-slate-500">
                                        Tell Nexora what you're learning.
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                                    Learning goal
                                </label>

                                <textarea
                                    name="learningGoal"
                                    value={
                                        formData.learning
                                            .learningGoal
                                    }
                                    onChange={
                                        handleLearningChange
                                    }
                                    maxLength={150}
                                    rows={3}
                                    placeholder="e.g. Improve my public speaking"
                                    className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                                />

                                <p className="mt-1 text-right text-xs text-slate-400">
                                    {
                                        formData.learning
                                            .learningGoal
                                            .length
                                    }
                                    /150
                                </p>
                            </div>

                            <div className="mt-4">
                                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
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
                                                addLearningSubject();
                                            }
                                        }}
                                        placeholder="e.g. Psychology"
                                        className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                                    />

                                    <button
                                        type="button"
                                        onClick={
                                            addLearningSubject
                                        }
                                        className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white hover:bg-indigo-700"
                                    >
                                        <Plus size={16} />
                                        Add
                                    </button>
                                </div>

                                <div className="mt-3 flex flex-wrap gap-2">
                                    {formData.learning.subjects.map(
                                        (subject, index) => (
                                            <span
                                                key={`${subject}-${index}`}
                                                className="inline-flex items-center gap-2 rounded-xl bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700"
                                            >
                                                {subject}

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeSubject(
                                                            index
                                                        )
                                                    }
                                                    className="text-indigo-400 hover:text-red-500"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </span>
                                        )
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* DISCOVERY */}

                        <section>
                            <div className="mb-4 flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
                                    <Compass
                                        size={18}
                                        className="text-indigo-600"
                                    />
                                </div>

                                <div>
                                    <h3 className="font-bold text-slate-900">
                                        Discovery preferences
                                    </h3>

                                    <p className="text-xs text-slate-500">
                                        Choose what you want to discover on Nexora.
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-3">
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
                                                className={`rounded-xl border px-4 py-3 text-sm font-bold transition ${
                                                    selected
                                                        ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                                                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                                                }`}
                                            >
                                                <span className="mr-2">
                                                    {selected
                                                        ? "✓"
                                                        : "○"}
                                                </span>

                                                {
                                                    option.label
                                                }
                                            </button>
                                        );
                                    }
                                )}
                            </div>

                            <p className="mt-2 text-xs text-slate-400">
                                Select at least one preference.
                            </p>
                        </section>
                    </div>

                    {/* FOOTER */}

                    <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end sm:px-7">
                        <button
                            type="button"
                            disabled={isSaving}
                            onClick={onClose}
                            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={isSaving}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isSaving ? (
                                <>
                                    <LoaderCircle
                                        size={16}
                                        className="animate-spin"
                                    />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save size={16} />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProfileModal;