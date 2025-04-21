import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAgeRatingAndCrunchyrollLinkToAnime1745237987612
  implements MigrationInterface
{
  name = 'AddAgeRatingAndCrunchyrollLinkToAnime1745237987612';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."animes_agerating_enum" AS ENUM('G', 'PG', 'PG-13', 'R', 'NC-17', 'R-18')`,
    );
    await queryRunner.query(
      `ALTER TABLE "animes" ADD "ageRating" "public"."animes_agerating_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "animes" ADD "crunchyroll" character varying(255)`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."contributions_dataagerating_enum" AS ENUM('G', 'PG', 'PG-13', 'R', 'NC-17', 'R-18')`,
    );
    await queryRunner.query(
      `ALTER TABLE "contributions" ADD "dataAgerating" "public"."contributions_dataagerating_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "contributions" ADD "dataCrunchyroll" character varying(255)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "contributions" DROP COLUMN "dataCrunchyroll"`,
    );
    await queryRunner.query(
      `ALTER TABLE "contributions" DROP COLUMN "dataAgerating"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."contributions_dataagerating_enum"`,
    );
    await queryRunner.query(`ALTER TABLE "animes" DROP COLUMN "crunchyroll"`);
    await queryRunner.query(`ALTER TABLE "animes" DROP COLUMN "ageRating"`);
    await queryRunner.query(`DROP TYPE "public"."animes_agerating_enum"`);
  }
}
