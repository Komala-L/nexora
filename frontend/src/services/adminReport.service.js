const API_BASE_URL = "http://localhost:5000/api/v1";

const adminFetch = async (path, options = {}) => {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        credentials: "include",
        ...options,
        headers: {
            Accept: "application/json",
            ...(options.body ? { "Content-Type": "application/json" } : {}),
            ...options.headers,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Admin reports request failed.");
    }

    return data;
};

export const getAdminReports = ({
    page = 1,
    limit = 10,
    search = "",
    status = "",
} = {}) => {
    const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        search,
        status,
    });

    return adminFetch(`/admin/reports?${params.toString()}`);
};

export const updateAdminReport = ({
    reportId,
    status,
    adminNotes = "",
    accountAction = "none",
}) => {
    return adminFetch(
        `/admin/reports/${encodeURIComponent(reportId)}`,
        {
            method: "PATCH",
            body: JSON.stringify({
                status,
                adminNotes,
                accountAction,
            }),
        }
    );
};

export const getAdminReportEvidence = async ({
    reportId,
    evidenceIndex,
}) => {
    const result = await adminFetch(
        `/admin/reports/${encodeURIComponent(reportId)}/evidence/${evidenceIndex}`
    );

    return result.data.evidence;
};