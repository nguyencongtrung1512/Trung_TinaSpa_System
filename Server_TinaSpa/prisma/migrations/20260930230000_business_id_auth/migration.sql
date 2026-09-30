-- Rebuild auth tables theo skill/Role.md (AID / Business ID / note)

DROP TABLE IF EXISTS "UserRole" CASCADE;
DROP TABLE IF EXISTS "Role" CASCADE;
DROP TABLE IF EXISTS "RefreshToken" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;

CREATE TABLE IF NOT EXISTS "BusinessIdCounter" (
    "tableName"   VARCHAR(100) NOT NULL,
    "counterDate" DATE         NOT NULL,
    "lastValue"   INTEGER      NOT NULL,
    CONSTRAINT "PK_BusinessIdCounter" PRIMARY KEY ("tableName", "counterDate")
);

CREATE OR REPLACE FUNCTION "generateBusinessID"(p_table_name TEXT)
RETURNS VARCHAR(14)
LANGUAGE plpgsql
AS $$
DECLARE
    v_date DATE := (NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh')::DATE;
    v_seq  INTEGER;
BEGIN
    INSERT INTO "BusinessIdCounter" ("tableName", "counterDate", "lastValue")
    VALUES (p_table_name, v_date, 1)
    ON CONFLICT ("tableName", "counterDate")
    DO UPDATE SET "lastValue" = "BusinessIdCounter"."lastValue" + 1
    RETURNING "lastValue" INTO v_seq;

    IF v_seq > 999999 THEN
        RAISE EXCEPTION 'Business ID overflow for % on %', p_table_name, v_date;
    END IF;

    RETURN TO_CHAR(v_date, 'YYYYMMDD') || LPAD(v_seq::TEXT, 6, '0');
END;
$$;

CREATE TABLE "User" (
    "userAID"      BIGSERIAL PRIMARY KEY,
    "userID"       VARCHAR(14) NOT NULL DEFAULT "generateBusinessID"('User'),

    "phone"        VARCHAR(20)  NOT NULL,
    "passwordHash" VARCHAR(255) NOT NULL,
    "fullName"     VARCHAR(100) NOT NULL,
    "role"         VARCHAR(20)  NOT NULL DEFAULT 'CUSTOMER',
    "isActive"     BOOLEAN      NOT NULL DEFAULT TRUE,

    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByAID" BIGINT,
    "updatedAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedByAID" BIGINT,

    "note"         TEXT,

    CONSTRAINT "UQ_User_userID" UNIQUE ("userID"),
    CONSTRAINT "UQ_User_phone"  UNIQUE ("phone"),
    CONSTRAINT "CK_User_role"   CHECK ("role" IN ('ADMIN', 'MANAGER', 'STAFF', 'CUSTOMER'))
);
CREATE INDEX "IX_User_role" ON "User" ("role");

CREATE TABLE "RefreshToken" (
    "refreshTokenAID" BIGSERIAL PRIMARY KEY,
    "refreshTokenID"  VARCHAR(14) NOT NULL DEFAULT "generateBusinessID"('RefreshToken'),

    "userAID"         BIGINT       NOT NULL,
    "tokenJti"        VARCHAR(100) NOT NULL,
    "tokenHash"       VARCHAR(255) NOT NULL,
    "expiresAt"       TIMESTAMP(3) NOT NULL,
    "revokedAt"       TIMESTAMP(3),

    "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByAID"    BIGINT,
    "updatedAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedByAID"    BIGINT,

    "note"            TEXT,

    CONSTRAINT "UQ_RefreshToken_refreshTokenID" UNIQUE ("refreshTokenID"),
    CONSTRAINT "UQ_RefreshToken_tokenJti"       UNIQUE ("tokenJti"),
    CONSTRAINT "UQ_RefreshToken_tokenHash"      UNIQUE ("tokenHash"),
    CONSTRAINT "FK_RefreshToken_userAID" FOREIGN KEY ("userAID")
        REFERENCES "User" ("userAID") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "IX_RefreshToken_userAID"   ON "RefreshToken" ("userAID");
CREATE INDEX "IX_RefreshToken_expiresAt" ON "RefreshToken" ("expiresAt");
