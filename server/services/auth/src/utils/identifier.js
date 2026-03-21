const IDENTIFIER_TYPE = {
  MOBILE: "M",
  AADHAR: "A",
  CONSUMER: "C",
};

function validateIdentifier(identifierType, identifierValue) {
  if (!Object.values(IDENTIFIER_TYPE).includes(identifierType)) {
    return "identifierType must be one of M, A, C";
  }

  if (
    identifierType === IDENTIFIER_TYPE.MOBILE &&
    !/^\d{10}$/.test(identifierValue)
  ) {
    return "For M identifierType, identifierValue must be 10 digits";
  }

  if (
    identifierType === IDENTIFIER_TYPE.AADHAR &&
    !/^\d{12}$/.test(identifierValue)
  ) {
    return "For A identifierType, identifierValue must be 12 digits";
  }

  if (
    identifierType === IDENTIFIER_TYPE.CONSUMER &&
    !/^\d{8}$/.test(identifierValue)
  ) {
    return "For C identifierType, identifierValue must be 8 digits";
  }

  return null;
}

function getUserLookupClause(identifierType, identifierValue) {
  if (identifierType === IDENTIFIER_TYPE.MOBILE) {
    return { mobile: identifierValue };
  }

  if (identifierType === IDENTIFIER_TYPE.AADHAR) {
    return { aadhar: identifierValue };
  }

  return { consumerId: identifierValue };
}

module.exports = {
  IDENTIFIER_TYPE,
  validateIdentifier,
  getUserLookupClause,
};
