const setTokenCookies = (
  res,
  accessToken,
  refreshToken,
  newRefreshTokenExp
) => {
  // Set Cookie for Access Token
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });

  // Set Cookie for Refresh Token
  const refreshTokenmaxAge =
    (newRefreshTokenExp - Math.floor(Date.now() / 1000)) * 1000;
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: refreshTokenmaxAge,
  });
};

module.exports = setTokenCookies;
