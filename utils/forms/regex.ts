export const phoneRegex = new RegExp(/^[6-9]\d{9}$/);
export const otpRegex = new RegExp(/^\d{10}$/);
export const nameRegex = new RegExp(/^[a-zA-Z\s ()_,.\/-]*$/);
export const percentRegex = new RegExp(
  /(^100(\.0{1,2})?$)|(^([1-9]([0-9])?|0)(\.[0-9]{1,2})?$)/g
);
export const urlRegexs = new RegExp(
  "^(https?:\\/\\/)?" + // validate protocol
    "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // validate domain name
    "((\\d{1,3}\\.){3}\\d{1,3}))" + // validate OR ip (v4) address
    "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // validate port and path
    "(\\?[;&a-z\\d%_.~+=-]*)?" + // validate query string
    "(\\#[-a-z\\d_]*)?$",
  "i"
); // validate fragment locator
export const urlRegex = new RegExp(
  "^((http|https)://)[-a-zA-Z0-9@:%._\\+~#?&//=]{2,256}\\.[a-z]{2,6}\\b([-a-zA-Z0-9@:%._\\+~#?&//=]*)$"
);
export const emailRegEx = new RegExp(
  /^\s*[\w\-\+_]+(\.[\w\-\+_]+)*\@[\w\-\+_]+\.[\w\-\+_]+(\.[\w\-\+_]+)*\s*$/
);
export const alphanumericRegex = new RegExp(/^[ A-Za-z0-9_@./#&+-]*$/);
export const alphaSpaceRegex = new RegExp(/^[A-Za-z ]*$/);

export const numRegex = new RegExp(/^\d*$/);
export const gstRegex = new RegExp(
  /^[0-9]{2}[a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}[0-9]{1}[a-zA-Z]{1}[a-z0-9A-Z]{1}$/
);
export const panRegex = new RegExp(/^[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}$/);
export const aadharRegex = new RegExp(/^[123456789]\d{11}$/);

export const ipv4Regex = new RegExp(
  /(([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])/
);

export const ipv6Regex = new RegExp(
  /((([0-9a-fA-F]){1,4})\:){7}([0-9a-fA-F]){1,4}/
);
