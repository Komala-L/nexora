export const hasLocation = (user) => {
    return Boolean(
        user?.locationDetails?.city
    );
};