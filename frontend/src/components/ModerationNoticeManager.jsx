import { useCallback, useEffect, useState } from "react";
import {
    getMyModerationNotices,
} from "../services/moderationNotification.service";
import ModerationNoticeModal from "./ModerationNoticeModal";

export default function ModerationNoticeManager() {
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const fetchNotices = useCallback(async () => {
        try {
            setError(false);

            const result = await getMyModerationNotices();
            setNotices(Array.isArray(result) ? result : []);
        } catch (err) {
            console.error("Failed to fetch moderation notices:", err);
            setError(true);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNotices();
    }, [fetchNotices]);

    const handleAcknowledged = (noticeId) => {
        setNotices((current) =>
            current.filter((notice) => notice.id !== noticeId)
        );
    };

    if (loading || error || notices.length === 0) {
        return null;
    }

    return (
        <ModerationNoticeModal
            notice={notices[0]}
            onAcknowledged={handleAcknowledged}
        />
    );
}