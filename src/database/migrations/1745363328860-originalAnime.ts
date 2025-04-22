import { MigrationInterface, QueryRunner } from 'typeorm';

export class OriginalAnime1745363328860 implements MigrationInterface {
  name = 'OriginalAnime1745363328860';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "contributions" ADD "originalAnimeBannerimage" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "contributions" ADD "originalAnimeCoverimage" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "contributions" ADD "originalAnimeId" uuid NOT NULL DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(
      `ALTER TABLE "contributions" DROP CONSTRAINT "PK_bde2bbb605a27ae4beeea3f895f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "contributions" ADD CONSTRAINT "PK_5b66590506ded33085c6315f483" PRIMARY KEY ("id", "dataId", "originalAnimeId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "contributions" ADD "originalAnimeTitle" character varying(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "contributions" ADD "originalAnimeGenres" text array`,
    );
    await queryRunner.query(
      `ALTER TABLE "contributions" ADD "originalAnimeDescription" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "contributions" ADD "originalAnimeReleasedate" date`,
    );
    await queryRunner.query(
      `ALTER TABLE "contributions" ADD "originalAnimeStudio" character varying(255)`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."contributions_originalanimestatus_enum" AS ENUM('Airing', 'Completed', 'Upcoming', 'On Hold', 'Cancelled')`,
    );
    await queryRunner.query(
      `ALTER TABLE "contributions" ADD "originalAnimeStatus" "public"."contributions_originalanimestatus_enum"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."contributions_originalanimetype_enum" AS ENUM('Show', 'Movie', 'OVA', 'ONA', 'Special')`,
    );
    await queryRunner.query(
      `ALTER TABLE "contributions" ADD "originalAnimeType" "public"."contributions_originalanimetype_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "contributions" ADD "originalAnimeTrailer" character varying(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "contributions" ADD "originalAnimeAuthor" character varying(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "contributions" ADD "originalAnimeWebsite" character varying(255)`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."contributions_originalanimeagerating_enum" AS ENUM('G', 'PG', 'PG-13', 'R', 'NC-17', 'R-18')`,
    );
    await queryRunner.query(
      `ALTER TABLE "contributions" ADD "originalAnimeAgerating" "public"."contributions_originalanimeagerating_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "contributions" ADD "originalAnimeCrunchyroll" character varying(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "contributions" ADD "originalAnimeCreatedat" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "contributions" ADD "originalAnimeUpdatedat" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "contributions" ADD CONSTRAINT "FK_a7ec0897b4dc599f5cb513e03a6" FOREIGN KEY ("originalAnimeBannerimage") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "contributions" ADD CONSTRAINT "FK_ed45a4a60e86434023826126ee4" FOREIGN KEY ("originalAnimeCoverimage") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "contributions" DROP CONSTRAINT "FK_ed45a4a60e86434023826126ee4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "contributions" DROP CONSTRAINT "FK_a7ec0897b4dc599f5cb513e03a6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "contributions" DROP COLUMN "originalAnimeUpdatedat"`,
    );
    await queryRunner.query(
      `ALTER TABLE "contributions" DROP COLUMN "originalAnimeCreatedat"`,
    );
    await queryRunner.query(
      `ALTER TABLE "contributions" DROP COLUMN "originalAnimeCrunchyroll"`,
    );
    await queryRunner.query(
      `ALTER TABLE "contributions" DROP COLUMN "originalAnimeAgerating"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."contributions_originalanimeagerating_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "contributions" DROP COLUMN "originalAnimeWebsite"`,
    );
    await queryRunner.query(
      `ALTER TABLE "contributions" DROP COLUMN "originalAnimeAuthor"`,
    );
    await queryRunner.query(
      `ALTER TABLE "contributions" DROP COLUMN "originalAnimeTrailer"`,
    );
    await queryRunner.query(
      `ALTER TABLE "contributions" DROP COLUMN "originalAnimeType"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."contributions_originalanimetype_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "contributions" DROP COLUMN "originalAnimeStatus"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."contributions_originalanimestatus_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "contributions" DROP COLUMN "originalAnimeStudio"`,
    );
    await queryRunner.query(
      `ALTER TABLE "contributions" DROP COLUMN "originalAnimeReleasedate"`,
    );
    await queryRunner.query(
      `ALTER TABLE "contributions" DROP COLUMN "originalAnimeDescription"`,
    );
    await queryRunner.query(
      `ALTER TABLE "contributions" DROP COLUMN "originalAnimeGenres"`,
    );
    await queryRunner.query(
      `ALTER TABLE "contributions" DROP COLUMN "originalAnimeTitle"`,
    );
    await queryRunner.query(
      `ALTER TABLE "contributions" DROP CONSTRAINT "PK_5b66590506ded33085c6315f483"`,
    );
    await queryRunner.query(
      `ALTER TABLE "contributions" ADD CONSTRAINT "PK_bde2bbb605a27ae4beeea3f895f" PRIMARY KEY ("id", "dataId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "contributions" DROP COLUMN "originalAnimeId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "contributions" DROP COLUMN "originalAnimeCoverimage"`,
    );
    await queryRunner.query(
      `ALTER TABLE "contributions" DROP COLUMN "originalAnimeBannerimage"`,
    );
  }
}
