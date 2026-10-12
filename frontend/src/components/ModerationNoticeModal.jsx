import { useState } from "react";
import {
    acknowledgeModerationNotice,
} from "../services/moderationNotification.service";

const noticeDetails = {
    warning: {
        title: "Official Warning",
        color: "border-amber-400",
        button: "I Understand",
    },
    final_warning: {
        title: "Final Warning",
        color: "border-orange-500",
        button: "I Understand",
    },
    temporary_suspension: {
        title: "Account Temporarily Suspended",
        color: "border-red-500",
        button: "I Understand",
    },
    permanent_ban: {
        title: "Account Permanently Banned",
        color: "border-red-700",
        button: "I Understand",
    },
};

const formatExpiryDate = (date) => {
    return new Date(date).toLocaleString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Kolkata",
    }) + " IST";
};

export default function ModerationNoticeModal({
    notice,
    onAcknowledged,
}) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    if (!notice) return null;

    const details =
        noticeDetails[notice.action] || noticeDetails.warning;

    const handleAcknowledge = async () => {
        if (loading) return;

        try {
            setLoading(true);
            setError("");

            await acknowledgeModerationNotice(notice.id);
            onAcknowledged(notice.id);
        } catch (err) {
            setError(
                err.message || "Unable to acknowledge this notice."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
            <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="moderation-notice-title"
                aria-describedby="moderation-notice-reason"
                className={`w-full max-w-md rounded-2xl border-t-4 ${details.color} bg-white p-6 shadow-2xl`}
            >
                <div className="mb-4 flex items-center gap-3">
                    <div
                        aria-hidden="true"
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-50 text-xl"
                    >
                        ⚠️
                    </div>

                    <h2
                        id="moderation-notice-title"
                        className="text-xl font-bold text-gray-900"
                    >
                        {details.title}
                    </h2>
                </div>

                <p
                    id="moderation-notice-reason"
                    className="whitespace-pre-wrap break-words text-sm leading-6 text-gray-700"
                >
                    {notice.reason}
                </p>

                {notice.expiresAt &&
                    notice.action === "temporary_suspension" && (
                        <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">
                            Suspension ends:{" "}
                            {formatExpiryDate(notice.expiresAt)}
                        </p>
                    )}

                <p className="mt-4 text-xs text-gray-500">
                    Please review Nexora's community guidelines. This
                    notice will remain in your moderation history.
                </p>

                {error && (
                    <p
                        role="alert"
                        aria-live="polite"
                        className="mt-3 break-words text-sm text-red-600"
                    >
                        {error}
                    </p>
                )}

                <button
                    type="button"
                    onClick={handleAcknowledge}
                    disabled={loading}
                    className="mt-6 w-full rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {loading ? "Saving..." : details.button}
                </button>
            </section>
        </div>
    );
}