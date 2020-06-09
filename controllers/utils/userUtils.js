encrypt = async target => {
  const bcrypt = require("bcrypt");
  const saltRounds = 6;
  const encryptedTarget = await bcrypt.hash(target, saltRounds);
  return encryptedTarget;
};

compareEncryptedString = (plainTextString, encryptedString) => {
  const bcrypt = require("bcrypt");
  return bcrypt.compare(plainTextString, encryptedString);
};

generateJWTToken = async (data, options = {}) => {
  const jwt = require("jsonwebtoken");
  const token = jwt.sign(data, process.env.SECRET, options);
  return token;
};

validateToken = async token => {
  const jwt = require("jsonwebtoken");
  return await jwt.verify(token, process.env.SECRET);
};

mail = async (id, email, token) => {
  const transporter = require("../../config/mailConfig");
  const mailOptions = {
    from: '"No Contestar" no_contestar@tecnofep.com.ve',
    to: email,
    subject: "Reinicio de contraseña",
    html: `<a href="${process.env.CLIENT_URL}/${id}/${encodeURIComponent(
      token
    )}">Resetear contraseña</a>`
  };
  const mailSent = transporter.sendMail(mailOptions);
  return mailSent;
};

generateResetPasswordToken = async () => {
  const crypto = require("crypto");
  const cryptoToken = crypto.randomBytes(32).toString("hex");
  const resetPasswordTokenInfo = {
    data: cryptoToken,
    exp: Math.floor(Date.now() / 1000) + 60 * 60
  };

  const JWTTokenForDatabase = await generateJWTToken(resetPasswordTokenInfo);
  const encryptedToken = await encrypt(cryptoToken);
  return { JWTTokenForDatabase, encryptedToken };
};

compareExpirationTime = (currentDate, tokenDate) => {
  return currentDate > tokenDate;
};

module.exports = {
  encrypt,
  compareEncryptedString,
  generateJWTToken,
  validateToken,
  mail,
  generateResetPasswordToken
};
