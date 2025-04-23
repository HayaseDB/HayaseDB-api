import { MigrationInterface, QueryRunner } from "typeorm";

export class NullableTitle1745368711348 implements MigrationInterface {
    name = 'NullableTitle1745368711348'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Remove NOT NULL constraint
        await queryRunner.query(`ALTER TABLE "animes" ALTER COLUMN "title" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "contributions" ALTER COLUMN "dataTitle" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "contributions" ALTER COLUMN "originalAnimeTitle" DROP NOT NULL`);

        // Remove the default value if set (remove 'N/A' fallback)
        await queryRunner.query(`ALTER TABLE "animes" ALTER COLUMN "title" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "contributions" ALTER COLUMN "dataTitle" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "contributions" ALTER COLUMN "originalAnimeTitle" DROP DEFAULT`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert to NOT NULL constraints
        await queryRunner.query(`ALTER TABLE "contributions" ALTER COLUMN "originalAnimeTitle" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "contributions" ALTER COLUMN "dataTitle" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "animes" ALTER COLUMN "title" SET NOT NULL`);

        // Optionally, you could set a default value if needed, but that's not what you're asking for
        // await queryRunner.query(`ALTER TABLE "animes" ALTER COLUMN "title" SET DEFAULT 'N/A'`);
        // await queryRunner.query(`ALTER TABLE "contributions" ALTER COLUMN "dataTitle" SET DEFAULT 'N/A'`);
        // await queryRunner.query(`ALTER TABLE "contributions" ALTER COLUMN "originalAnimeTitle" SET DEFAULT 'N/A'`);
    }
}
