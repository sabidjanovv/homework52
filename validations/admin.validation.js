const Joi = require("joi");

exports.adminValidation = (data) => {
  const schemaAdmin = Joi.object({
    first_name: Joi.string().min(2).max(100).required().messages({
      "string.empty": "First name bo'sh bo'lmasligi kerak",
      "any.required": "First name kiritilishi shart",
      "string.min": "First name kamida 2 ta harfdan iborat bo'lishi kerak",
      "string.max":
        "First name ko'pi bilan 100 ta harfdan iborat bo'lishi kerak",
    }),
    last_name: Joi.string().min(2).max(100).required().messages({
      "string.empty": "Last name bo'sh bo'lmasligi kerak",
      "any.required": "Last name kiritilishi shart",
      "string.min": "Last name kamida 2 ta harfdan iborat bo'lishi kerak",
      "string.max":
        "Last name ko'pi bilan 100 ta harfdan iborat bo'lishi kerak",
    }),
    nick_name: Joi.string().max(50).messages({
      "string.max": "Nick name ko'pi bilan 50 ta harfdan iborat bo'lishi kerak",
    }),
    email: Joi.string().email().required().messages({
      "string.empty": "Email bo'sh bo'lmasligi kerak",
      "any.required": "Email kiritilishi shart",
      "string.email": "Email noto'g'ri formatda",
    }),
    phone: Joi.string()
      .pattern(/^\+998-\d{2}-\d{3}-\d{2}-\d{2}$/)
      .required()
      .messages({
        "string.empty": "Phone bo'sh bo'lmasligi kerak",
        "any.required": "Phone kiritilishi shart",
        "string.pattern.base":
          "Phone raqami +998-XX-XXX-XX-XX formatida bo'lishi kerak",
      }),
    password: Joi.string().min(6).max(20).required().messages({
      "string.empty": "Password bo'sh bo'lmasligi kerak",
      "any.required": "Password kiritilishi shart",
      "string.min": "Password kamida 6 ta belgidan iborat bo'lishi kerak",
      "string.max": "Password ko'pi bilan 20 ta belgidan iborat bo'lishi kerak",
    }),
    info: Joi.string().optional(),
    position: Joi.string().optional(),
    photo: Joi.string().optional(),
    is_expert: Joi.boolean().default(false),
    is_active: Joi.boolean().default(false),
    token: Joi.string(),
    activation_link: Joi.string(),
  });

  return schemaAdmin.validate(data, { abortEarly: false });
};
