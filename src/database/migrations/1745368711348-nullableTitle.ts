import { MigrationInterface, QueryRunner } from "typeorm";

export class NullableTitle1745368711348 implements MigrationInterface {
    name = 'NullableTitle1745368711348'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "animes" ALTER COLUMN "title" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "animes" ALTER COLUMN "title" SET DEFAULT NULL`);

        await queryRunner.query(`ALTER TABLE "contributions" ALTER COLUMN "dataTitle" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "contributions" ALTER COLUMN "dataTitle" SET DEFAULT NULL`);

        await queryRunner.query(`ALTER TABLE "contributions" ALTER COLUMN "originalAnimeTitle" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "contributions" ALTER COLUMN "originalAnimeTitle" SET DEFAULT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "contributions" ALTER COLUMN "originalAnimeTitle" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "contributions" ALTER COLUMN "originalAnimeTitle" DROP DEFAULT`);

        await queryRunner.query(`ALTER TABLE "contributions" ALTER COLUMN "dataTitle" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "contributions" ALTER COLUMN "dataTitle" DROP DEFAULT`);

        await queryRunner.query(`ALTER TABLE "animes" ALTER COLUMN "title" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "animes" ALTER COLUMN "title" DROP DEFAULT`);
    }
}
