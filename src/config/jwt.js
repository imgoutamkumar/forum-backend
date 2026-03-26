import jwt from 'jsonwebtoken'

const getSecretKey = () => {
    const secretKey = process.env.JWT_SECRET;
    if (!secretKey) {
        throw new Error("JWT_SECRET not defined");
    }
    return secretKey;
};

export const createJwtToken = (userData) => {
    const payload = {
        userId: userData.id,
        role: userData.role,
        email: userData.email
    }
    const token = jwt.sign(
        payload,
        getSecretKey(),
        {
            algorithm: "HS256",
            expiresIn: "5h"
        })
    return token
}


export const verifyJwtToken = (token) => {
    try {
        return jwt.verify(token, getSecretKey());
    }
    catch (error) {
        return null;
    }
}

