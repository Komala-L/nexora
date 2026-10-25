import { useEffect, useState } from "react";
import {
    getAdminReports,
    updateAdminReport,
    getAdminReportEvidence,
} from "../../services/adminReport.service";

const PAGE_SIZE = 10;

const STATUS_OPTIONS = [
    { value: "", label: "All reports" },
    { value: "pending", label: "Pending" },
    { value: "reviewing", label: "Under review" },
    { value: "resolved", label: "Resolved" },
    { value: "dismissed", label: "Dismissed" },
];

const STATUS_STYLES = {
    pending: "bg-amber-50 text-amber-700",
    reviewing: "bg-blue-50 text-blue-700",
    resolved: "bg-emerald-50 text-emerald-700",
    dismissed: "bg-slate-100 text-slate-600",
};

const REASON_LABELS = {
    harassment: "Harassment",
    spam: "Spam",
    fake_profile: "Fake profile",
    inappropriate_content: "Inappropriate content",
    scam: "Scam",
    other: "Other",
};

const formatDate = (date) => {
    if (!date) return "—";

    const parsed = new Date(date);

    return Number.isNaN(parsed.getTime())
        ? "—"
        : parsed.toLocaleString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
          });
};

const getInitials = (name = "") =>
    name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? "")
        .join("") || "?";

const AdminReports = () => {
    const [reports, setReports] = useState([]);
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [page, setPage] = useState(1);
    const [totalReports, setTotalReports] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedReport, setSelectedReport] = useState(null);
    const [saving, setSaving] = useState(false);
    const [actionError, setActionError] = useState("");
    const [adminNotes, setAdminNotes] = useState("");
    const [reloadKey, setReloadKey] = useState(0);
    const [accountAction, setAccountAction] = useState("none");
    const [evidenceIndex, setEvidenceIndex] = useState(null);
    const [evidenceImage, setEvidenceImage] = useState(null);
    const [evidenceLoading, setEvidenceLoading] = useState(false);
    const [evidenceError, setEvidenceError] = useState("");

    useEffect(() => {
        const timer = window.setTimeout(() => {
            setPage(1);
            setSearch(searchInput.trim());
        }, 300);

        return () => window.clearTimeout(timer);
    }, [searchInput]);

    useEffect(() => {
        let cancelled = false;

        const loadReports = async () => {
            setLoading(true);
            setError("");

            try {
                const response = await getAdminReports({
                    page,
                    limit: PAGE_SIZE,
                    search,
                    status,
                });

                if (cancelled) return;

                const payload = response?.data ?? {};
                const pagination = payload.pagination ?? {};

                setReports(
                    Array.isArray(payload.reports) ? payload.reports : []
                );
                setTotalReports(Number(pagination.totalReports ?? 0));
                setTotalPages(Number(pagination.totalPages ?? 0));

            } catch (err) {
                if (!cancelled) {
                    setReports([]);
                    setTotalReports(0);
                    setTotalPages(0);
                    setError(err.message || "Unable to load reports.");
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        loadReports();

        return () => {
            cancelled = true;
        };
    }, [page, search, status, reloadKey]);

    const handleStatusFilter = (value) => {
        setStatus(value);
        setPage(1);
        setSelectedReport(null);
    };

    const openReport = (report) => {
        setSelectedReport(report);
        setAdminNotes(report.adminNotes ?? "");
        setAccountAction("none");
        setActionError("");
    };

    const handleUpdate = async (nextStatus) => {
        if (!selectedReport || saving) return;

        setSaving(true);
        setActionError("");

        try {
            await updateAdminReport({
                reportId: selectedReport._id,
                status: nextStatus,
                adminNotes,
                accountAction: nextStatus === "resolved" ? accountAction : "none",
            });

            setSelectedReport(null);

            const response = await getAdminReports({
                page,
                limit: PAGE_SIZE,
                search,
                status,
            });

            const payload = response?.data ?? {};
            const pagination = payload.pagination ?? {};

            setReports(
                Array.isArray(payload.reports) ? payload.reports : []
            );
            setTotalReports(Number(pagination.totalReports ?? 0));
            setTotalPages(Number(pagination.totalPages ?? 0));
        } catch (err) {
            setActionError(
                err.message || "Unable to update this report."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleViewEvidence = async (report, index) => {
        setEvidenceIndex(index);   
        setEvidenceImage(null);
        setEvidenceError("");
        setEvidenceLoading(true);

        try {
            const evidence = await getAdminReportEvidence({
                reportId: report._id,
                evidenceIndex: index,
            });

            setEvidenceImage(evidence);
        } catch (err) {
            setEvidenceError(
                err.message || "Unable to load this evidence image."
            );
        } finally {
            setEvidenceLoading(false);
        }
    };

    const startIndex = totalReports === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
    const endIndex = Math.min(page * PAGE_SIZE, totalReports);

    return (
        <>
            <div className="w-full p-5 sm:p-6 lg:p-8 space-y-6 p-4">
                <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                    <div className="grid gap-3 md:grid-cols-[1fr_220px]">
                        <label className="block">
                            <span className="mb-2 block text-sm font-semibold">
                                Search reports
                            </span>
                            <input
                                type="search"
                                value={searchInput}
                                onChange={(event) => setSearchInput(event.target.value)}
                                placeholder="Search reason, user name, email or notes..."
                                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                            />
                        </label>

                        <label className="block">
                            <span className="mb-2 block text-sm font-semibold">
                                Filter by status
                            </span>
                            <select
                                value={status}
                                onChange={(event) => handleStatusFilter(event.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                            >
                                {STATUS_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>
                </section>

                {error && (
                    <div
                        role="alert"
                        className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between"
                    >
                        <span>{error}</span>
                        <button
                            type="button"
                            onClick={() => setReloadKey((current) => current + 1)}
                            className="font-semibold underline"
                        >
                            Retry
                        </button>
                    </div>
                )}

                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-1 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="font-semibold">Submitted reports</h2>
                        <p className="text-sm text-slate-500">
                            Newest reports appear first
                        </p>
                    </div>

                    {loading ? (
                        <div className="space-y-4 p-6" aria-live="polite">
                            <p className="text-sm text-slate-500">Loading reports...</p>
                            {[1, 2, 3].map((item) => (
                                <div
                                    key={item}
                                    className="h-14 animate-pulse rounded-xl bg-slate-100"
                                />
                            ))}
                        </div>
                    ) : error ? (
                        <div className="p-10 text-center text-sm text-slate-500">
                            Reports could not be loaded. Use Retry above.
                        </div>
                    ) : reports.length === 0 ? (
                        <div className="px-6 py-16 text-center">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-2xl text-indigo-600">
                                ⚑
                            </div>
                            <h3 className="mt-4 font-semibold">No reports found</h3>
                            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                                There are no reports matching your search and filters.
                                New user submissions will appear here.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[850px] text-left text-sm">
                                    <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                                        <tr>
                                            <th className="px-5 py-4">Reported user</th>
                                            <th className="px-5 py-4">Reporter</th>
                                            <th className="px-5 py-4">Reason</th>
                                            <th className="px-5 py-4">Submitted</th>
                                            <th className="px-5 py-4">Status</th>
                                            <th className="px-5 py-4">Action</th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-slate-100">
                                        {reports.map((report) => (
                                            <tr
                                                key={report._id}
                                                className="transition hover:bg-slate-50/70"
                                            >
                                                <td className="px-5 py-4">
                                                    <p className="font-semibold">
                                                        {report.reportedUser?.name ?? "Deleted user"}
                                                    </p>
                                                    <p className="mt-1 text-xs text-slate-500">
                                                        {report.reportedUser?.email ?? "—"}
                                                    </p>
                                                </td>

                                                <td className="px-5 py-4">
                                                    <p className="font-medium">
                                                        {report.reporter?.name ?? "Deleted user"}
                                                    </p>
                                                    <p className="mt-1 text-xs text-slate-500">
                                                        {report.reporter?.email ?? "—"}
                                                    </p>
                                                </td>

                                                <td className="px-5 py-4">
                                                    {REASON_LABELS[report.reason] ?? report.reason}
                                                </td>

                                                <td className="whitespace-nowrap px-5 py-4 text-slate-500">
                                                    {formatDate(report.createdAt)}
                                                </td>

                                                <td className="px-5 py-4">
                                                    <span
                                                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                                                            STATUS_STYLES[report.status] ??
                                                            "bg-slate-100 text-slate-600"
                                                        }`}
                                                    >
                                                        {report.status}
                                                    </span>
                                                </td>

                                                <td className="px-5 py-4">
                                                    <button
                                                        type="button"
                                                        onClick={() => openReport(report)}
                                                        className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-indigo-700 transition hover:border-indigo-200 hover:bg-indigo-50"
                                                    >
                                                        Review report
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-sm text-slate-500">
                                    Showing {startIndex}–{endIndex} of{" "}
                                    {totalReports.toLocaleString("en-IN")} reports
                                </p>

                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        disabled={page <= 1 || loading}
                                        onClick={() => setPage((current) => current - 1)}
                                        className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        Previous
                                    </button>

                                    <span className="text-sm text-slate-500">
                                        {page} / {Math.max(1, totalPages)}
                                    </span>

                                    <button
                                        type="button"
                                        disabled={page >= totalPages || loading || totalPages === 0}
                                        onClick={() => setPage((current) => current + 1)}
                                        className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </section>
            </div>

            {/* Screenshot evidence viewer */}
            {evidenceIndex !== null && (
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 p-4"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            setEvidenceIndex(null);
                            setEvidenceImage(null);
                            setEvidenceError("");
                        }
                    }}
                >
                    <section
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="evidence-viewer-title"
                        className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl"
                    >
                        <div className="flex items-center justify-between border-b border-slate-100 p-4">
                            <h3 id="evidence-viewer-title" className="font-semibold">
                                Screenshot {evidenceIndex + 1}
                            </h3>

                            <button
                                type="button"
                                onClick={() => {
                                    setEvidenceIndex(null);
                                    setEvidenceImage(null);
                                    setEvidenceError("");
                                }}
                                className="rounded-lg px-3 py-2 text-slate-500 hover:bg-slate-100"
                                aria-label="Close evidence viewer"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="flex min-h-64 items-center justify-center bg-slate-50 p-4">
                            {evidenceLoading ? (
                                <p className="text-sm text-slate-500">
                                    Loading screenshot...
                                </p>
                            ) : evidenceError ? (
                                <p role="alert" className="text-sm text-red-600">
                                    {evidenceError}
                                </p>
                            ) : evidenceImage?.url ? (
                                <img
                                    src={evidenceImage.url}
                                    alt={`Report evidence ${evidenceIndex + 1}`}
                                    className="max-h-[70vh] max-w-full rounded-lg object-contain"
                                    referrerPolicy="no-referrer"
                                />
                            ) : (
                                <p className="text-sm text-slate-500">
                                    No screenshot available.
                                </p>
                            )}
                        </div>
                    </section>
                </div>
            )}

            {/* Report review modal */}
            {selectedReport && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget && !saving) {
                            setSelectedReport(null);
                        }
                    }}
                >
                    <section
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="report-dialog-title"
                        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
                    >
                        <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-5 sm:p-6">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">
                                    Report review
                                </p>
                                <h2
                                    id="report-dialog-title"
                                    className="mt-2 text-xl font-bold"
                                >
                                    Report details
                                </h2>
                                <p className="mt-1 text-xs text-slate-500">
                                    ID: {selectedReport._id}
                                </p>
                            </div>

                            <button
                                type="button"
                                disabled={saving}
                                onClick={() => setSelectedReport(null)}
                                aria-label="Close report details"
                                className="rounded-lg px-3 py-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-5 p-5 sm:p-6">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="rounded-xl bg-slate-50 p-4">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Reported user
                                    </p>
                                    <p className="mt-2 font-semibold">
                                        {selectedReport.reportedUser?.name ?? "Deleted user"}
                                    </p>
                                    <p className="mt-1 break-all text-sm text-slate-500">
                                        {selectedReport.reportedUser?.email ?? "—"}
                                    </p>
                                </div>

                                <div className="rounded-xl bg-slate-50 p-4">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Submitted by
                                    </p>
                                    <p className="mt-2 font-semibold">
                                        {selectedReport.reporter?.name ?? "Deleted user"}
                                    </p>
                                    <p className="mt-1 break-all text-sm text-slate-500">
                                        {selectedReport.reporter?.email ?? "—"}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <p className="text-sm font-semibold">Reason</p>
                                <p className="mt-1 text-sm text-slate-600">
                                    {REASON_LABELS[selectedReport.reason] ?? selectedReport.reason}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm font-semibold">Description</p>
                                <p className="mt-2 whitespace-pre-wrap rounded-xl border border-slate-100 p-4 text-sm leading-6 text-slate-600">
                                    {selectedReport.description || "No additional description provided."}
                                </p>
                            </div>

                            {/* REPORT EVIDENCE */}
                            <div>
                                <div className="flex items-center justify-between gap-3">
                                    <p className="text-sm font-semibold">Screenshot evidence</p>
                                    <span className="text-xs text-slate-500">
                                        {selectedReport.evidence?.length ?? 0} attached
                                    </span>
                                </div>

                                {!selectedReport.evidence?.length ? (
                                    <p className="mt-2 rounded-xl bg-amber-50 p-4 text-sm text-amber-700">
                                        No evidence images are attached to this report.
                                    </p>
                                ) : (
                                    <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                                        {selectedReport.evidence.map((item, index) => (
                                            <button
                                                key={item._id ?? `${selectedReport._id}-${index}`}
                                                type="button"
                                                disabled={saving}
                                                onClick={() => handleViewEvidence(selectedReport, index)}
                                                className="rounded-xl border border-slate-200 p-3 text-left transition hover:border-indigo-300 hover:bg-indigo-50/50 disabled:opacity-50"
                                            >
                                                <span className="block text-sm font-semibold text-indigo-700">
                                                    View screenshot {index + 1}
                                                </span>
                                                <span className="mt-1 block text-xs text-slate-500">
                                                    {item.format ? item.format.toUpperCase() : "Image"}
                                                    {item.bytes
                                                        ? ` · ${(item.bytes / 1024).toFixed(0)} KB`
                                                        : ""}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label htmlFor="account-action" className="text-sm font-semibold">
                                    Account action
                                </label>

                                <select
                                    id="account-action"
                                    value={accountAction}
                                    onChange={(event) => setAccountAction(event.target.value)}
                                    disabled={saving || Boolean(selectedReport.actionAppliedAt)}
                                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 disabled:opacity-60"
                                >
                                    <option value="none">No action</option>
                                    <option value="warning">Apply progressive warning</option>
                                    <option value="temporary_suspension">
                                        Temporary suspension — 7 days
                                    </option>
                                    <option value="permanent_ban">Permanent ban</option>
                                </select>

                                <p className="mt-2 text-xs leading-5 text-slate-500">
                                    Account actions are applied only when you resolve the report.
                                    The backend records confirmed violations and prevents duplicate
                                    actions on the same report.
                                </p>

                                {selectedReport.actionAppliedAt && (
                                    <p className="mt-2 text-sm font-medium text-amber-700">
                                        An account action has already been applied to this report.
                                    </p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="admin-report-notes" className="text-sm font-semibold">
                                    Internal admin notes
                                </label>
                                <textarea
                                    id="admin-report-notes"
                                    value={adminNotes}
                                    onChange={(event) => setAdminNotes(event.target.value)}
                                    maxLength={1000}
                                    rows={4}
                                    placeholder="Document the review and decision..."
                                    className="mt-2 w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                                />
                                <p className="mt-1 text-right text-xs text-slate-400">
                                    {adminNotes.length}/1000
                                </p>
                            </div>

                            {actionError && (
                                <p
                                    role="alert"
                                    className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
                                >
                                    {actionError}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 p-5 sm:p-6">
                            <button
                                type="button"
                                disabled={saving}
                                onClick={() => setSelectedReport(null)}
                                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                disabled={saving}
                                onClick={() => handleUpdate("dismissed")}
                                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 disabled:opacity-50"
                            >
                                Dismiss
                            </button>

                            <button
                                type="button"
                                disabled={saving}
                                onClick={() => handleUpdate("reviewing")}
                                className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                                Mark reviewing
                            </button>

                            <button
                                type="button"
                                disabled={saving}
                                onClick={() => handleUpdate("resolved")}
                                className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                            >
                                {saving
                                    ? "Saving..."
                                    : accountAction === "none"
                                    ? "Resolve report"
                                    : "Resolve & apply action"}
                            </button>
                        </div>

                        {saving && (
                            <p
                                aria-live="polite"
                                className="px-6 pb-4 text-right text-xs text-slate-500"
                            >
                                Saving report review...
                            </p>
                        )}
                    </section>
                </div>
            )}
        </>
    );
};

export default AdminReports;