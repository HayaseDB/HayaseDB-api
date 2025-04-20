import { MigrationInterface, QueryRunner } from "typeorm";

export class Setup1745177077431 implements MigrationInterface {
    name = 'Setup1745177077431'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "media" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "filename" character varying NOT NULL, "filetype" character varying NOT NULL, "fileBuffer" bytea NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "size" integer NOT NULL, "authorId" uuid, CONSTRAINT "PK_f4e0fcac36e050de337b670d8bd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."animes_status_enum" AS ENUM('Airing', 'Completed', 'Upcoming', 'On Hold', 'Cancelled')`);
        await queryRunner.query(`CREATE TYPE "public"."animes_type_enum" AS ENUM('Show', 'Movie', 'OVA', 'ONA', 'Special')`);
        await queryRunner.query(`CREATE TABLE "animes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(255) NOT NULL, "genres" text array, "description" text, "releaseDate" date, "studio" character varying(255), "status" "public"."animes_status_enum", "type" "public"."animes_type_enum", "trailer" character varying(255), "author" character varying(255), "website" character varying(255), "bannerImage" uuid, "coverImage" uuid, CONSTRAINT "PK_16b5c3f560dac36ec440e340545" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."contributions_status_enum" AS ENUM('pending', 'accepted', 'rejected')`);
        await queryRunner.query(`CREATE TYPE "public"."contributions_datastatus_enum" AS ENUM('Airing', 'Completed', 'Upcoming', 'On Hold', 'Cancelled')`);
        await queryRunner.query(`CREATE TYPE "public"."contributions_datatype_enum" AS ENUM('Show', 'Movie', 'OVA', 'ONA', 'Special')`);
        await queryRunner.query(`CREATE TABLE "contributions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" "public"."contributions_status_enum" NOT NULL DEFAULT 'pending', "rejectionComment" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "userId" uuid NOT NULL, "moderatorId" uuid, "animeId" uuid, "dataBannerimage" uuid, "dataCoverimage" uuid, "dataId" uuid NOT NULL DEFAULT uuid_generate_v4(), "dataTitle" character varying(255) NOT NULL, "dataGenres" text array, "dataDescription" text, "dataReleasedate" date, "dataStudio" character varying(255), "dataStatus" "public"."contributions_datastatus_enum", "dataType" "public"."contributions_datatype_enum", "dataTrailer" character varying(255), "dataAuthor" character varying(255), "dataWebsite" character varying(255), CONSTRAINT "PK_bde2bbb605a27ae4beeea3f895f" PRIMARY KEY ("id", "dataId"))`);
        await queryRunner.query(`CREATE TABLE "keys" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "key" character varying NOT NULL, "name" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "requestCount" integer NOT NULL DEFAULT '0', "requestCountTotal" integer NOT NULL DEFAULT '0', "lastUsedAt" TIMESTAMP, "userId" uuid, CONSTRAINT "UQ_407ff00b846bec15cbc741a7641" UNIQUE ("key"), CONSTRAINT "PK_e63d5d51e0192635ab79aa49644" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "pfps" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "data" bytea, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "REL_60385efbab2e77ec06a8035f73" UNIQUE ("userId"), CONSTRAINT "PK_1b59d29aaf2e2c164ea71e09f01" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('admin', 'user', 'moderator')`);
        await queryRunner.query(`CREATE TYPE "public"."users_plan_enum" AS ENUM('free', 'premium', 'enterprise')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "username" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "role" "public"."users_role_enum" NOT NULL DEFAULT 'user', "plan" "public"."users_plan_enum" NOT NULL DEFAULT 'free', "verified" boolean NOT NULL DEFAULT false, "banned" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "media" ADD CONSTRAINT "FK_46a895ee65010e2b94ff317e854" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "animes" ADD CONSTRAINT "FK_0fdb653860508ed2263c5dcab7c" FOREIGN KEY ("bannerImage") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "animes" ADD CONSTRAINT "FK_f3a742f83f8f02741b97d5ec74d" FOREIGN KEY ("coverImage") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "contributions" ADD CONSTRAINT "FK_55141bcc2980d26a4870712f3f4" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "contributions" ADD CONSTRAINT "FK_b27b972799b45e217c5d310c75d" FOREIGN KEY ("moderatorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "contributions" ADD CONSTRAINT "FK_5b1f9b8c026b9e46abfadb3d40b" FOREIGN KEY ("animeId") REFERENCES "animes"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "contributions" ADD CONSTRAINT "FK_bfefaa24a457b2e90141da134d3" FOREIGN KEY ("dataBannerimage") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "contributions" ADD CONSTRAINT "FK_9486f127452830b587e2585146c" FOREIGN KEY ("dataCoverimage") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "keys" ADD CONSTRAINT "FK_d66070b078b2628e8e2138f63e5" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "pfps" ADD CONSTRAINT "FK_60385efbab2e77ec06a8035f733" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pfps" DROP CONSTRAINT "FK_60385efbab2e77ec06a8035f733"`);
        await queryRunner.query(`ALTER TABLE "keys" DROP CONSTRAINT "FK_d66070b078b2628e8e2138f63e5"`);
        await queryRunner.query(`ALTER TABLE "contributions" DROP CONSTRAINT "FK_9486f127452830b587e2585146c"`);
        await queryRunner.query(`ALTER TABLE "contributions" DROP CONSTRAINT "FK_bfefaa24a457b2e90141da134d3"`);
        await queryRunner.query(`ALTER TABLE "contributions" DROP CONSTRAINT "FK_5b1f9b8c026b9e46abfadb3d40b"`);
        await queryRunner.query(`ALTER TABLE "contributions" DROP CONSTRAINT "FK_b27b972799b45e217c5d310c75d"`);
        await queryRunner.query(`ALTER TABLE "contributions" DROP CONSTRAINT "FK_55141bcc2980d26a4870712f3f4"`);
        await queryRunner.query(`ALTER TABLE "animes" DROP CONSTRAINT "FK_f3a742f83f8f02741b97d5ec74d"`);
        await queryRunner.query(`ALTER TABLE "animes" DROP CONSTRAINT "FK_0fdb653860508ed2263c5dcab7c"`);
        await queryRunner.query(`ALTER TABLE "media" DROP CONSTRAINT "FK_46a895ee65010e2b94ff317e854"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_plan_enum"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`DROP TABLE "pfps"`);
        await queryRunner.query(`DROP TABLE "keys"`);
        await queryRunner.query(`DROP TABLE "contributions"`);
        await queryRunner.query(`DROP TYPE "public"."contributions_datatype_enum"`);
        await queryRunner.query(`DROP TYPE "public"."contributions_datastatus_enum"`);
        await queryRunner.query(`DROP TYPE "public"."contributions_status_enum"`);
        await queryRunner.query(`DROP TABLE "animes"`);
        await queryRunner.query(`DROP TYPE "public"."animes_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."animes_status_enum"`);
        await queryRunner.query(`DROP TABLE "media"`);
    }

}
