import { compareValue, hashValue } from "../config/bcrypt.js";
import { deleteUploadedFile } from "../config/cloudinary.js";
import { createJwtToken } from "../config/jwt.js";
import { sendOtpEmail } from "../config/mailer.js";
import prisma from "../config/prisma.js";
import { generateOTP, generateUniqueUsername } from "../utils/helper.js";
import { addMinutes } from "date-fns";
export const registerUser = async (userData) => {

    const { name, email, password } = userData;
    const existingUser = await prisma.user.findUnique({
        where: { email }
    });
    if (existingUser) {
        const error = new Error("EMAIL_ALREADY_EXISTS");
        error.code = "EMAIL_ALREADY_EXISTS";
        throw error;
    }
    const hashedPassword = await hashValue(password);
    const uniqueUsername = generateUniqueUsername(name)
    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            username: uniqueUsername
        }
    });

    const token = createJwtToken(user)
    const { password: _, ...safeUser } = user;
    return { ...safeUser, token: token }

}

export const verifyOTP = async (email, otp) => {
    const record = await prisma.otp.findFirst({
        where: {
            email,
            type: "REGISTER",
            used: false,
        },
        orderBy: { createdAt: "desc" },
    });

    if (!record) throw new Error("OTP not found");

    if (record.expiresAt < new Date()) {
        throw new Error("OTP expired");
    }

    const isValid = await compareValue(otp, record.code);

    if (!isValid) throw new Error("Invalid OTP");

    await prisma.user.update({
        where: { email },
        data: { isVerified: true },
    });

    await prisma.otp.update({
        where: { id: record.id },
        data: { used: true },
    });

    return { message: "User verified successfully" };
}

export const loginUser = async (userData) => {
    const { email, password } = userData;

    const user = await prisma.user.findUnique({
        where: { email }
    });

    if (!user || !(await compareValue(password, user.password))) {
        const error = new Error("INVALID_CREDENTIAL");
        error.code = "INVALID_CREDENTIAL";
        throw error;
    }
    const token = createJwtToken(user)
    const { password: _, ...safeUser } = user;
    return { ...safeUser, token: token }

}

export const resendOTP = async (email, type) => {
    const otp = generateOTP();
    const hashedOTP = await hashValue(otp);
    await prisma.otp.create({
        data: {
            email,
            code: hashedOTP,
            type: type,
            expiresAt: addMinutes(new Date(), 10),
        },
    });
    await sendOtpEmail(email, otp);
    return { message: "OTP resent" };
}

export const getProfileByEmail = async (email) => {
    try {
        const user = await prisma.user.findUnique({
            where: { email: email },
            select: { id: true, email: true, role: true, createdAt: true }
        });
        if (!user) {
            return { status: "failed", message: "User not found" };
        }
        return { status: "success", data: user };
    } catch (error) {
        return { status: "failed", message: "Could not retrieve profile" };
    }
}

export const getProfileById = async (id) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: id },
            select: { id: true, name: true, email: true, role: true, createdAt: true }
        });
        if (!user) {
            return { status: "failed", message: "User not found" };
        }
        return { status: "success", data: user };
    } catch (error) {
        return { status: "failed", message: "Could not retrieve profile" };
    }
}

export const CreateAvatar = async (uploadResult) => {
    // used transaction
    const media = await prisma.media.create({
        data: {
            url: uploadResult.url,
            publicId: uploadResult.publicId,
            type: "AVATAR", // ✅ important
            userId: user.id
        }
    });

    //attach to userId
    await prisma.user.update({
        where: { id: user.id },
        data: {
            avatarId: media.id
        }
    });
}

export const deletePreviousAvatar = async () => {
    const user = await prisma.user.findUnique({
        where: { id: user.id },
        include: { avatar: true }
    });

    if (user?.avatar?.publicId) {
        await deleteUploadedFile(user.avatar.publicId);
    }
}