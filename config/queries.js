// SQL queries used in the application
const queries = {
    selectUserByEmail: `
      SELECT USER_ID
      FROM USER
      WHERE EMAIL = ?
    `,

    insertUser: `
      INSERT INTO USER (EMAIL, CONTACT_NUMBER, CONTACT_NUMBER_AREA_CODE, COUNTRY)
      VALUES (?, ?, ?, ?)
      RETURNING USER_ID
    `,

    updateUser: `
      UPDATE USER
      SET CONTACT_NUMBER = ?,
          CONTACT_NUMBER_AREA_CODE = ?,
          COUNTRY = ?
      WHERE USER_ID = ?
    `,

    insertUserSocials: `
      INSERT INTO USER_SOCIALS (USER_ID, TELEGRAM, DISCORD, TWITTER, INSTAGRAM, FACEBOOK)
      VALUES (?, ?, ?, ?, ?, ?)
    `,

    upsertUserSocials: `
      MERGE INTO USER_SOCIALS AS target
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
      INSERT INTO USER_WALLET_DETAILS (USER_ID, WALLET_ADDRESS, BLOCKCHAIN_ID)
      VALUES (?, ?, ?)
    `,

    upsertUserWalletDetails: `
      MERGE INTO USER_WALLET_DETAILS AS target
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
      INSERT INTO USER_DELETION_AUDIT (USER_ID, DELETE_REQUEST_DATE, CONFIRMED_DATE, DELETION_DATE)
      VALUES (?, ?, ?, ?)
    `,
};

module.exports = queries;
