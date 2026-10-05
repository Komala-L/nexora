/**
 * Get the user's current browser/device location. 
 */
export const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(
                new Error(
                    "Geolocation is not supported by this browser."
                )
            );

            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const {
                    longitude,
                    latitude,
                } = position.coords;

                resolve({
                    longitude,
                    latitude,
                });
            },
            (error) => {
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        reject(
                            new Error(
                                "Location permission was denied."
                            )
                        );
                        break;

                    case error.POSITION_UNAVAILABLE:
                        reject(
                            new Error(
                                "Your location could not be determined."
                            )
                        );
                        break;

                    case error.TIMEOUT:
                        reject(
                            new Error(
                                "Location request timed out."
                            )
                        );
                        break;

                    default:
                        reject(
                            new Error(
                                "Unable to determine your location."
                            )
                        );
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0,
            }
        );
    });
};