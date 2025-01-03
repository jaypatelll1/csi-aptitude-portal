import React, { useEffect } from 'react';
import axios from 'axios'

import { useSelector } from 'react-redux';



const Token = () => {



    const user = useSelector(state => state.user);
    // console.log('user is ', user);


    useEffect(() => {
        // Function to refresh token
        const handleTokenRefresh = async () => {
            try {



                const response = await axios.post("/api/token", {
                    "id": user.user.id,
                    "email": user.user.email,
                    "name": user.user.name,
                    "role": user.user.role
                });
                // console.log('response is ', response.data);

            } catch (error) {
                console.error('Failed to refresh token', error);
            }
        };

        // Refresh token immediately and then every 30 minutes (30 * 60 * 1000 ms)
        handleTokenRefresh();
        const intervalId = setInterval(handleTokenRefresh, 30 * 60 * 1000); // 30 minutes

        // Cleanup interval on component unmount
        return () => clearInterval(intervalId);
    }, []);





    return (
        <div></div>
    )
}

export default Token