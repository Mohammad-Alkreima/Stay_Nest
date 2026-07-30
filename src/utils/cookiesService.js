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

    getAccessToken = (req) => {
        return req.cookies["accessToken"]
    }

    getRefreshToken = (req) => {
        return req.cookies["refreshToken"]
    }

    clearData = (res, key) => {
        res.clearCookie(key, { secure: isProduction, sameSite: isProduction ? "none" : "lax" })
    }

    clearTokens = (res) => {
        this.clearData(res, "accessToken");
        this.clearData(res, "refreshToken");
    }
}

module.exports = new CookiesService();
