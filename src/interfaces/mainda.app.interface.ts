import {Parent} from "@prisma/client";

export interface TokenPayload {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
}

export type SafeParent = Omit<Parent, 'password' | 'verificationToken' | 'verificationTokenExpires' | 'resetPasswordToken' | 'resetPasswordExpires'>;

export type AuthResponse = {
    parent: SafeParent,
    accessToken: string,
    refreshToken: string
};
