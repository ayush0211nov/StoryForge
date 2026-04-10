import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'CHANGE_THIS_IN_PRODUCTION';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export function signToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
}

export async function getAuthUser(request) {
    try {
        const authHeader = request.headers.get('authorization');
        let token = null;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        }

        if (!token) {
            const cookieStore = await cookies();
            token = cookieStore.get('token')?.value;
        }

        if (!token) return null;

        const decoded = verifyToken(token);
        if (!decoded) return null;

        return decoded;
    } catch (error) {
        return null;
    }
}

export function requireAuth(handler) {
    return async (request, context) => {
        const user = await getAuthUser(request);
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }
        request.user = user;
        return handler(request, context);
    };
}
