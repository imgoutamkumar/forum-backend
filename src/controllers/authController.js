import { loginUser, registerUser } from "../services/authService.js";

export const register = async (req, res) => {
    try {
        const result = await registerUser(req.body);
        const { token } = result.token;
        res.cookie("access_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 15 * 60 * 1000, // 15 min
        });
        return res.status(201).json({
            success: true,
            data: result
        });

    } catch (error) {

        if (error.code === "EMAIL_ALREADY_EXISTS") {
            return res.status(409).json({
                success: false,
                message: "Email already exists"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

export const login = async (req, res) => {
    try {
        const result = await loginUser(req.body);
        const { token } = result.token;
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 60 * 60 * 1000
        });
        const message =
            result.action === "VERIFY_ACCOUNT"
                ? "otp send to your mail"
                : "login successfully";

        return res.status(200).json({
            success: true,
            data: result,
            message: message
        });



    } catch (error) {
        if (error.code === "INVALID_CREDENTIAL") {
            return res.status(409).json({
                success: false,
                message: "invalid credential"
            });
        }
        // if (error.code = "ACCOUNT_NOT_VERIFIED") {
        //     return res.status(403).json({
        //         success: false,
        //         message: "account not verified",
        //         data: {
        //             action: error.meta?.action,
        //             email: error.meta?.email
        //         }
        //     });
        // }

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}