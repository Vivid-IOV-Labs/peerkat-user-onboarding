const queries = {
  selectUserByEmail: `
      SELECT USER_ID
      FROM NFT_USERS.PII."USER"
      WHERE EMAIL = ?
  `,

  selectAllUsers: 'SELECT * FROM NFT_USERS.PII."USER"',

  countAllUsers: 'SELECT COUNT(*) FROM NFT_USERS.PII."USER"',

  selectAllUserDeleteAudits: 'SELECT * FROM NFT_USERS.PII."USER_DELETION_AUDIT"',

  selectUserByUserId: `
      SELECT *
      FROM NFT_USERS.PII."USER"
      WHERE USER_ID = ?
  `,

  selectUserDeletionRequest: `
      SELECT *
      FROM NFT_USERS.PII."USER_DELETION_AUDIT"
      WHERE USER_ID = ?
  `,

  insertUser: `
      INSERT INTO NFT_USERS.PII."USER" (EMAIL, CONTACT_NUMBER, CONTACT_NUMBER_AREA_CODE, COUNTRY)
      VALUES (?, ?, ?, ?)
  `,

  updateUser: `
      UPDATE NFT_USERS.PII."USER"
      SET CONTACT_NUMBER = ?,
          CONTACT_NUMBER_AREA_CODE = ?,
          COUNTRY = ?
      WHERE USER_ID = ?
  `,

  insertUserSocials: `
      INSERT INTO NFT_USERS.PII."USER_SOCIALS" (USER_ID, TELEGRAM, DISCORD, TWITTER, INSTAGRAM, FACEBOOK)
      VALUES (?, ?, ?, ?, ?, ?)
  `,

  upsertUserSocials: `
      MERGE INTO NFT_USERS.PII."USER_SOCIALS" AS target
      USING (SELECT ? AS USER_ID) AS source
      ON (target.USER_ID = source.USER_ID)
      WHEN MATCHED THEN
          UPDATE SET
              TELEGRAM = ?,
              DISCORD = ?,
              TWITTER = ?,
              INSTAGRAM = ?,
              FACEBOOK = ?
      WHEN NOT MATCHED THEN
          INSERT (USER_ID, TELEGRAM, DISCORD, TWITTER, INSTAGRAM, FACEBOOK)
          VALUES (?, ?, ?, ?, ?, ?)
  `,

  insertUserWalletDetails: `
      INSERT INTO NFT_USERS.PII."USER_WALLET_DETAILS" (USER_ID, WALLET_ADDRESS, BLOCKCHAIN_ID)
      VALUES (?, ?, ?)
  `,

  upsertUserWalletDetails: `
      MERGE INTO NFT_USERS.PII."USER_WALLET_DETAILS" AS target
      USING (SELECT ? AS USER_ID) AS source
      ON (target.USER_ID = source.USER_ID)
      WHEN MATCHED THEN
          UPDATE SET
              WALLET_ADDRESS = ?,
              BLOCKCHAIN_ID = ?
      WHEN NOT MATCHED THEN
          INSERT (USER_ID, WALLET_ADDRESS, BLOCKCHAIN_ID)
          VALUES (?, ?, ?)
  `,

  insertUserDeletionRequest: `
      INSERT INTO NFT_USERS.PII."USER_DELETION_AUDIT" (USER_ID, DELETE_REQUEST_DATE, DATE_CONFIRMED_FOR_REMOVAL, DATE_OF_DELETION)
      VALUES (?, ?, ?, ?)
  `,

  selectConfirmedDeletionRequests: `
      SELECT USER_ID, DATE_CONFIRMED_FOR_REMOVAL
      FROM NFT_USERS.PII."USER_DELETION_AUDIT"
      WHERE DATE_CONFIRMED_FOR_REMOVAL IS NOT NULL
  `,

  updateDeletionRequest: `
      UPDATE NFT_USERS.PII."USER_DELETION_AUDIT"
      SET DATE_OF_DELETION = ?
      WHERE USER_ID = ?
  `,

  deleteUserSocials: `
      DELETE FROM NFT_USERS.PII."USER_SOCIALS"
      WHERE USER_ID = ?
  `,

  deleteUserWalletDetails: `
      DELETE FROM NFT_USERS.PII."USER_WALLET_DETAILS"
      WHERE USER_ID = ?
  `,

  selectLastInsertUserId: `
      SELECT USER_ID
      FROM NFT_USERS.PII."USER"
      ORDER BY USER_ID DESC
      LIMIT 1
  `,

  updateUserSocials: `
      UPDATE NFT_USERS.PII."USER_SOCIALS"
      SET TELEGRAM = ?,
          DISCORD = ?,
          TWITTER = ?,
          INSTAGRAM = ?,
          FACEBOOK = ?
      WHERE USER_ID = ?
  `,

  updateUserWalletDetails: `
      UPDATE NFT_USERS.PII."USER_WALLET_DETAILS"
      SET WALLET_ADDRESS = ?,
          BLOCKCHAIN_ID = ?
      WHERE USER_ID = ?
  `,
};

module.exports = queries;
