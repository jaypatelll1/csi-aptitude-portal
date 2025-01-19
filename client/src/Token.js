import React, { useEffect } from 'react';
import axios from 'axios'
import { useSelector } from 'react-redux';

const Token = () => {
    const user = useSelector(state => state.user);
    useEffect(() => {
        const handleTokenRefresh = async () => {
            let API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
            try {
                const response = await axios.post(`${API_BASE_URL}/api/token`, {
                    "id": user.user.id,
                    "email": user.user.email,
                    "name": user.user.name,
                    "role": user.user.role
                }, {
                    withCredentials: true,  // Make sure the cookie is sent with the request
                });
            
               

            } catch (error) {
                console.error('Failed to refresh token', error);
            }
        };

        handleTokenRefresh();
        const intervalId = setInterval(handleTokenRefresh, 1 * 60 * 1000); // 30 minutes
        return () => clearInterval(intervalId);
    }, []);

    return (
        <div></div>
    )
}

export default Token