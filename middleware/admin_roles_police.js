const { to } = require("../helpers/to_promise");
const myJwt = require("../services/jwt_service");
module.exports = function (roles) {
  return async function (req, res, next) {
    try {
      const authorization = req.headers.authorization;
      if (!authorization) {
        return res.status(403).send({ message: "Token berilmagan" });
      }
      const bearer = authorization.split(" ")[0];
      const token = authorization.split(" ")[1];

      if (bearer != "Bearer" || !token) {
        return res.status(403).send({ message: "Token noto'g'ri" });
      }
      const [error, decodedToken] = await to(myJwt.verifyAccessToken(token));
      if (error) {
        return res.status(403).send({ message: error.message });
      }
      req.admin = decodedToken;
      const { is_expert, admin_roles } = decodedToken;
      let hasRole = false;
      admin_roles.forEach((admin_role) => {
        if (roles.includes(admin_role)) hasRole = true;
      });

      if (!is_expert && !hasRole) {
        return res.status(403).send({ message: "Sizda bunday huquq yo'q" });
      }
      next();
    } catch (error) {
      console.log(error);
      res.status(403).send({ message: "Admin ro'yxatdan o'tmagan" });
    }
  };
};
