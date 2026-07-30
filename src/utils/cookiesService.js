const isProduction = process.env.NODE_ENV === 'production';

class CookiesService {
    setAccessToken = (res, value) => {
        res.cookie("accessToken", value, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax",
            maxAge: 60 * 60 * 1000
        })
    }

    setRefreshToken = (res, value) => {
        res.cookie("refreshToken", value, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })
    }

    clearTokens = (res) => {
        res.clearCookie("accessToken", { secure: isProduction, sameSite: isProduction ? "none" : "lax" });
        res.clearCookie("refreshToken", { secure: isProduction, sameSite: isProduction ? "none" : "lax" });
    }
}