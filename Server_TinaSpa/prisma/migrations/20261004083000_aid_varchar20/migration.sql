-- AID chuyển từ BIGINT identity sang VARCHAR(20).
-- Mã mới cùng dạng Business ID: YYYYMMDDXXXXXX (14 ký tự, cột cho phép 20).

CREATE TABLE "_UserAidMap" (
    "oldAid" BIGINT PRIMARY KEY,
    "newAid" VARCHAR(20) NOT NULL UNIQUE
);

CREATE TABLE "_RefreshTokenAidMap" (
    "oldAid" BIGINT PRIMARY KEY,
    "newAid" VARCHAR(20) NOT NULL UNIQUE
);

DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT "userAID" FROM "User" ORDER BY "userAID" LOOP
        INSERT INTO "_UserAidMap" ("oldAid", "newAid")
        VALUES (r."userAID", "generateBusinessID"('User'));
    END LOOP;

    FOR r IN SELECT "refreshTokenAID" FROM "RefreshToken" ORDER BY "refreshTokenAID" LOOP
        INSERT INTO "_RefreshTokenAidMap" ("oldAid", "newAid")
        VALUES (r."refreshTokenAID", "generateBusinessID"('RefreshToken'));
    END LOOP;
END $$;

ALTER TABLE "User" ADD COLUMN "userAID_new" VARCHAR(20);
ALTER TABLE "User" ADD COLUMN "createdByAID_new" VARCHAR(20);
ALTER TABLE "User" ADD COLUMN "updatedByAID_new" VARCHAR(20);

UPDATE "User" AS u
SET "userAID_new" = m."newAid"
FROM "_UserAidMap" AS m
WHERE u."userAID" = m."oldAid";

UPDATE "User" AS u
SET "createdByAID_new" = m."newAid"
FROM "_UserAidMap" AS m
WHERE u."createdByAID" = m."oldAid";

UPDATE "User" AS u
SET "updatedByAID_new" = m."newAid"
FROM "_UserAidMap" AS m
WHERE u."updatedByAID" = m."oldAid";

ALTER TABLE "RefreshToken" ADD COLUMN "refreshTokenAID_new" VARCHAR(20);
ALTER TABLE "RefreshToken" ADD COLUMN "userAID_new" VARCHAR(20);
ALTER TABLE "RefreshToken" ADD COLUMN "createdByAID_new" VARCHAR(20);
ALTER TABLE "RefreshToken" ADD COLUMN "updatedByAID_new" VARCHAR(20);

UPDATE "RefreshToken" AS rt
SET "refreshTokenAID_new" = rm."newAid"
FROM "_RefreshTokenAidMap" AS rm
WHERE rt."refreshTokenAID" = rm."oldAid";

UPDATE "RefreshToken" AS rt
SET "userAID_new" = um."newAid"
FROM "_UserAidMap" AS um
WHERE rt."userAID" = um."oldAid";

UPDATE "RefreshToken" AS rt
SET "createdByAID_new" = m."newAid"
FROM "_UserAidMap" AS m
WHERE rt."createdByAID" = m."oldAid";

UPDATE "RefreshToken" AS rt
SET "updatedByAID_new" = m."newAid"
FROM "_UserAidMap" AS m
WHERE rt."updatedByAID" = m."oldAid";

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM "User" WHERE "userAID_new" IS NULL) THEN
        RAISE EXCEPTION 'Backfill userAID failed';
    END IF;

    IF EXISTS (SELECT 1 FROM "RefreshToken" WHERE "refreshTokenAID_new" IS NULL OR "userAID_new" IS NULL) THEN
        RAISE EXCEPTION 'Backfill refreshToken AID failed';
    END IF;
END $$;

ALTER TABLE "RefreshToken" DROP CONSTRAINT "FK_RefreshToken_userAID";
DROP INDEX IF EXISTS "IX_RefreshToken_userAID";

ALTER TABLE "User" DROP CONSTRAINT "User_pkey";
ALTER TABLE "RefreshToken" DROP CONSTRAINT "RefreshToken_pkey";

ALTER TABLE "User" DROP COLUMN "userAID";
ALTER TABLE "User" DROP COLUMN "createdByAID";
ALTER TABLE "User" DROP COLUMN "updatedByAID";

ALTER TABLE "RefreshToken" DROP COLUMN "refreshTokenAID";
ALTER TABLE "RefreshToken" DROP COLUMN "userAID";
ALTER TABLE "RefreshToken" DROP COLUMN "createdByAID";
ALTER TABLE "RefreshToken" DROP COLUMN "updatedByAID";

ALTER TABLE "User" RENAME COLUMN "userAID_new" TO "userAID";
ALTER TABLE "User" RENAME COLUMN "createdByAID_new" TO "createdByAID";
ALTER TABLE "User" RENAME COLUMN "updatedByAID_new" TO "updatedByAID";

ALTER TABLE "RefreshToken" RENAME COLUMN "refreshTokenAID_new" TO "refreshTokenAID";
ALTER TABLE "RefreshToken" RENAME COLUMN "userAID_new" TO "userAID";
ALTER TABLE "RefreshToken" RENAME COLUMN "createdByAID_new" TO "createdByAID";
ALTER TABLE "RefreshToken" RENAME COLUMN "updatedByAID_new" TO "updatedByAID";

ALTER TABLE "User" ALTER COLUMN "userAID" SET NOT NULL;
ALTER TABLE "User" ALTER COLUMN "userAID" SET DEFAULT "generateBusinessID"('User');
ALTER TABLE "User" ADD CONSTRAINT "User_pkey" PRIMARY KEY ("userAID");

ALTER TABLE "RefreshToken" ALTER COLUMN "refreshTokenAID" SET NOT NULL;
ALTER TABLE "RefreshToken" ALTER COLUMN "refreshTokenAID" SET DEFAULT "generateBusinessID"('RefreshToken');
ALTER TABLE "RefreshToken" ALTER COLUMN "userAID" SET NOT NULL;
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("refreshTokenAID");

ALTER TABLE "RefreshToken"
    ADD CONSTRAINT "FK_RefreshToken_userAID"
    FOREIGN KEY ("userAID") REFERENCES "User" ("userAID")
    ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "IX_RefreshToken_userAID" ON "RefreshToken" ("userAID");

DROP SEQUENCE IF EXISTS "User_userAID_seq";
DROP SEQUENCE IF EXISTS "RefreshToken_refreshTokenAID_seq";

DROP TABLE "_UserAidMap";
DROP TABLE "_RefreshTokenAidMap";
