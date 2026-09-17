import { useEffect, useState } from "react";
import {
    Bell,
    Check,
    CheckCheck,
    UserPlus,
    UserCheck,
    UserX,
    MessageCircle,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import {
    getNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
} from "../../services/notification.service.js";


const Notifications = () => {
    const { user, isLoading: authLoading } = useAuth();

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [markingAll, setMarkingAll] = useState(false);


    useEffect(() => {
        if (authLoading || !user) {
            return;
        }

        const fetchNotifications = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await getNotifications();

                setNotifications(
                    data.data?.notifications || []
                );
            } catch (error) {
                setError(
                    error.message ||
                    "Failed to load notifications"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, [authLoading, user]);


    const getNotificationIcon = (type) => {
        switch (type) {
            case "connection_request":
                return (
                    <UserPlus
                        size={20}
                        className="text-indigo-600"
                    />
                );

            case "connection_accepted":
                return (
                    <UserCheck
                        size={20}
                        className="text-emerald-600"
                    />
                );

            case "connection_rejected":
                return (
                    <UserX
                        size={20}
                        className="text-red-500"
                    />
                );

            case "message":
                return (
                    <MessageCircle
                        size={20}
                        className="text-indigo-600"
                    />
                );

            default:
                return (
                    <Bell
                        size={20}
                        className="text-indigo-600"
                    />
                );
        }
    };


    const getNotificationText = (notification) => {
        const senderName =
            notification.sender?.name || "Someone";

        switch (notification.type) {
            case "connection_request":
                return (
                    <>
                        <span className="font-semibold text-slate-900">
                            {senderName}
                        </span>{" "}
                        sent you a connection request.
                    </>
                );

            case "connection_accepted":
                return (
                    <>
                        <span className="font-semibold text-slate-900">
                            {senderName}
                        </span>{" "}
                        accepted your connection request.
                    </>
                );

            case "connection_rejected":
                return (
                    <>
                        <span className="font-semibold text-slate-900">
                            {senderName}
                        </span>{" "}
                        rejected your connection request.
                    </>
                );

            case "message":
                return (
                    <>
                        <span className="font-semibold text-slate-900">
                            {senderName}
                        </span>{" "}
                        sent you a message.
                    </>
                );

            default:
                return "You have a new notification.";
        }
    };


    const formatNotificationTime = (createdAt) => {
        if (!createdAt) {
            return "";
        }

        const date = new Date(createdAt);

        if (Number.isNaN(date.getTime())) {
            return "";
        }

        return date.toLocaleString([], {
            dateStyle: "medium",
            timeStyle: "short",
        });
    };


    const handleMarkAsRead = async (notificationId) => {
        try {
            await markNotificationAsRead(
                notificationId
            );

            setNotifications((currentNotifications) =>
                currentNotifications.map(
                    (notification) =>
                        notification._id ===
                        notificationId
                            ? {
                                ...notification,
                                read: true,
                            }
                            : notification
                )
            );

            window.dispatchEvent(
                new Event("notificationsUpdated")
            );

        } catch (error) {
            setError(
                error.message ||
                "Failed to mark notification as read"
            );
        }
    };


    const handleMarkAllAsRead = async () => {
        try {
            setMarkingAll(true);
            setError("");

            await markAllNotificationsAsRead();

            setNotifications((currentNotifications) =>
                currentNotifications.map(
                    (notification) => ({
                        ...notification,
                        read: true,
                    })
                )
            );

            window.dispatchEvent(
                new Event("notificationsUpdated")
            );

        } catch (error) {
            setError(
                error.message ||
                "Failed to mark all notifications as read"
            );
        } finally {
            setMarkingAll(false);
        }
    };

    const unreadCount = notifications.filter(
        (notification) => !notification.read
    ).length;


    return (
        <div className="mx-auto w-full max-w-4xl">

            {/* Header */}
            <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        Notifications
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Stay updated with your connections and messages.
                    </p>
                </div>

                {!loading && unreadCount > 0 && (
                    <button
                        type="button"
                        onClick={handleMarkAllAsRead}
                        disabled={markingAll}
                        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <CheckCheck size={17} />

                        {markingAll
                            ? "Marking..."
                            : "Mark all as read"}
                    </button>
                )}
            </div>


            {/* Error */}
            {error && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4">
                    <p className="text-sm text-red-600">
                        {error}
                    </p>
                </div>
            )}


            {/* Loading */}
            {(authLoading || loading) && (
                <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white py-16 shadow-sm">
                    <p className="text-sm text-slate-500">
                        Loading notifications...
                    </p>
                </div>
            )}


            {/* Empty State */}
            {!loading &&
                !error &&
                notifications.length === 0 && (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-16 shadow-sm">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50">
                            <Bell
                                size={26}
                                className="text-indigo-600"
                            />
                        </div>

                        <h2 className="mt-4 text-lg font-semibold text-slate-900">
                            No notifications yet
                        </h2>

                        <p className="mt-1 text-center text-sm text-slate-500">
                            You'll see connection and message updates here.
                        </p>
                    </div>
                )}


            {/* Notifications */}
            {!loading &&
                !error &&
                notifications.length > 0 && (
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        {notifications.map(
                            (notification) => (
                                <div
                                    key={notification._id}
                                    className={`flex items-start gap-4 border-b border-slate-100 p-4 transition last:border-b-0 ${
                                        notification.read
                                            ? "bg-white"
                                            : "bg-indigo-50/50"
                                    }`}
                                >

                                    {/* Sender Avatar */}
                                    <div className="relative shrink-0">
                                        <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-indigo-100 font-semibold text-indigo-700">
                                            {notification.sender?.profilePic?.url ? (
                                                <img
                                                    src={
                                                        notification
                                                            .sender
                                                            .profilePic
                                                            .url
                                                    }
                                                    alt={
                                                        notification
                                                            .sender
                                                            ?.name ||
                                                        "User"
                                                    }
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                notification
                                                    .sender
                                                    ?.name
                                                    ?.charAt(0)
                                                    .toUpperCase() ||
                                                "U"
                                            )}
                                        </div>

                                        <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-white shadow-sm">
                                            {getNotificationIcon(
                                                notification.type
                                            )}
                                        </div>
                                    </div>


                                    {/* Notification Content */}
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm leading-6 text-slate-600">
                                            {getNotificationText(
                                                notification
                                            )}
                                        </p>

                                        <p className="mt-1 text-xs text-slate-400">
                                            {formatNotificationTime(
                                                notification.createdAt
                                            )}
                                        </p>
                                    </div>


                                    {/* Read Action */}
                                    {!notification.read && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleMarkAsRead(
                                                    notification._id
                                                )
                                            }
                                            title="Mark as read"
                                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-indigo-600"
                                        >
                                            <Check size={17} />
                                        </button>
                                    )}
                                </div>
                            )
                        )}
                    </div>
                )}
        </div>
    );
};

export default Notifications;