import { Outlet } from "react-router-dom";
import AppLayout from "./AppLayout";
import ModerationNoticeManager from "../ModerationNoticeManager";

export default function UserAppLayout() {
    return (
        <>
            <ModerationNoticeManager />
            <AppLayout>
                <Outlet />
            </AppLayout>
        </>
    );
}