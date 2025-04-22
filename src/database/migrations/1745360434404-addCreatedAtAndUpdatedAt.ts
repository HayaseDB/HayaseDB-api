import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCreatedAtAndUpdatedAt1745360434404 implements MigrationInterface {
    name = 'AddCreatedAtAndUpdatedAt1745360434404'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Drop columns if they exist
        await queryRunner.query(`ALTER TABLE "animes" DROP COLUMN IF EXISTS "createdAt"`);
        await queryRunner.query(`ALTER TABLE "animes" DROP COLUMN IF EXISTS "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "contributions" DROP COLUMN IF EXISTS "dataCreatedat"`);
        await queryRunner.query(`ALTER TABLE "contributions" DROP COLUMN IF EXISTS "dataUpdatedat"`);

        // Re-add columns
        await queryRunner.query(`ALTER TABLE "animes" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "animes" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "contributions" ADD "dataCreatedat" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "contributions" ADD "dataUpdatedat" TIMESTAMP NOT NULL DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "contributions" DROP COLUMN "dataUpdatedat"`);
        await queryRunner.query(`ALTER TABLE "contributions" DROP COLUMN "dataCreatedat"`);
        await queryRunner.query(`ALTER TABLE "animes" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "animes" DROP COLUMN "createdAt"`);
    }

}
