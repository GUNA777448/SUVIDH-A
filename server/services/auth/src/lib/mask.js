function maskMobile(mobile) {
  if (!mobile || mobile.length < 4) {
    return "****";
  }

  const visible = mobile.slice(-4);
  return `******${visible}`;
}

function maskEmail(email) {
  if (!email || !email.includes("@")) {
    return "***";
  }

  const [name, domain] = email.split("@");
  const visible = name.slice(0, 2);
  const hidden = "*".repeat(Math.max(1, name.length - 2));
  return `${visible}${hidden}@${domain}`;
}

function maskAadhar(aadhar) {
  if (!aadhar || aadhar.length < 4) {
    return null;
  }

  return `********${aadhar.slice(-4)}`;
}

function toSafeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: maskEmail(user.email),
    mobile: maskMobile(user.mobile),
    aadhar: maskAadhar(user.aadhar),
    created_at: user.created_at,
    updated_at: user.updated_at,
  };
}

module.exports = { toSafeUser };
